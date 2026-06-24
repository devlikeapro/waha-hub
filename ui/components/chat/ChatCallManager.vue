<script setup>
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {acquireCallMedia, completeVoipCall, describeMediaError, prepareVoipCall} from '../../services/calls/webrtc'

const props = defineProps({
  serverId: { type: String, required: true },
  sessionName: { type: String, required: true },
  isGows: { type: Boolean, default: false },
  selectedChat: { type: Object, default: null },
})

const {t} = useI18n()
const toast = useToast()
const store = useServerStore()

const incomingCall = ref(null)
const activeCall = ref(null)
const openConnection = ref(null)
const processing = ref(false)
const callLabel = ref('')
const remoteAudio = ref(null)
const remoteVideo = ref(null)

const showIncoming = computed(() => !!incomingCall.value && !activeCall.value)
const showActiveBar = computed(() => !!activeCall.value)

function bindRemoteMedia(stream) {
  if (remoteAudio.value) {
    remoteAudio.value.srcObject = stream
    void remoteAudio.value.play().catch(() => {
      toast.add({
        severity: 'warn',
        summary: t('chat.calls.inProgress'),
        detail: t('chat.calls.autoplayBlocked'),
        life: 8000,
      })
    })
  }
  if (remoteVideo.value && stream.getVideoTracks().length > 0) {
    remoteVideo.value.srcObject = stream
    void remoteVideo.value.play().catch(() => {})
  }
}

function cleanupConnection() {
  openConnection.value?.close()
  openConnection.value = null
  if (remoteAudio.value) {
    remoteAudio.value.srcObject = null
  }
  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null
  }
}

function resetCallState() {
  cleanupConnection()
  incomingCall.value = null
  activeCall.value = null
  callLabel.value = ''
  processing.value = false
}

function updateIncomingCall(payload) {
  if (activeCall.value) {
    return
  }
  const next = {
    id: payload.id,
    from: payload.from,
    isVideo: !!payload.isVideo,
  }
  if (!incomingCall.value) {
    incomingCall.value = next
  } else if (
      sameCallId(incomingCall.value.id, next.id) ||
      sameCallPeer(incomingCall.value.from, next.from)
  ) {
    incomingCall.value = {
      ...incomingCall.value,
      ...next,
      from: next.from || incomingCall.value.from,
    }
  } else {
    return
  }
  callLabel.value = incomingCall.value.from || incomingCall.value.id
}

function sameCallId(a, b) {
  return !!a && !!b && String(a).toUpperCase() === String(b).toUpperCase()
}

function sameCallPeer(a, b) {
  if (!a || !b) {
    return false
  }
  const left = String(a).split('@')[0]
  const right = String(b).split('@')[0]
  return left === right || String(a) === String(b)
}

function matchesTrackedCall(payload) {
  const id = payload?.id
  if (!id) {
    return false
  }
  if (sameCallId(activeCall.value?.id, id) || sameCallId(incomingCall.value?.id, id)) {
    return true
  }
  const peer = payload?.from
  if (activeCall.value && sameCallPeer(activeCall.value.from, peer)) {
    return true
  }
  if (incomingCall.value && sameCallPeer(incomingCall.value.from, peer)) {
    return true
  }
  return false
}

async function waitForCallActive(callId, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const state = await store.getCallState(props.serverId, props.sessionName)
      if (
          state?.active &&
          sameCallId(state.call_id, callId) &&
          (state.status === 'active' || state.event === 'call.active')
      ) {
        return state
      }
    } catch {
      // ignore polling errors
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return null
}

async function finalizeCallConnection(callId) {
  const state = await waitForCallActive(callId)
  if (!activeCall.value || !sameCallId(activeCall.value.id, callId)) {
    return
  }
  if (state?.call_id) {
    activeCall.value.id = state.call_id
  }
  if (activeCall.value.status !== 'active') {
    activeCall.value.status = state ? 'active' : 'connected'
  }
}

async function resolveActiveCallId(preferredId) {
  try {
    const state = await store.getCallState(props.serverId, props.sessionName)
    if (state?.active && state.call_id) {
      return state.call_id
    }
  } catch {
    // ignore
  }
  return preferredId
}

function parseActiveCallId(error) {
  const message = String(error?.message || error?.response?.data?.message || error || '')
  const match = message.match(/active call is ([A-Fa-f0-9]+)/i)
  return match?.[1] || null
}

async function exchangeWebRTC(callId, sdpOffer) {
  try {
    return await store.exchangeCallWebRTC(
        props.serverId,
        props.sessionName,
        callId,
        sdpOffer,
    )
  } catch (error) {
    const activeId = parseActiveCallId(error)
    if (activeId && activeId !== callId) {
      return store.exchangeCallWebRTC(
          props.serverId,
          props.sessionName,
          activeId,
          sdpOffer,
      )
    }
    throw error
  }
}

async function connectWebRTC(callId, isVideo = false, localStream = null) {
  const prepared = await prepareVoipCall(isVideo, localStream)
  try {
    const resolvedId = await resolveActiveCallId(callId)
    const conn = await completeVoipCall(prepared, (sdpOffer) =>
        exchangeWebRTC(resolvedId, sdpOffer),
    )
    openConnection.value = conn
    conn.pc.addEventListener('track', () => bindRemoteMedia(conn.remoteStream))
    bindRemoteMedia(conn.remoteStream)
    return resolvedId
  } catch (error) {
    prepared.close()
    throw error
  }
}

function callErrorDetail(error) {
  const key = describeMediaError(error)
  if (key !== 'unknown') {
    return t(`chat.calls.${key}`)
  }
  return error?.message || String(error)
}

function handleEvent(event) {
  if (!props.isGows) {
    return
  }
  const name = event?.event
  const payload = event?.payload
  if (!name || !payload) {
    return
  }

  if (name === 'call.received' || name === 'call.ringing' || name === 'call.connecting') {
    updateIncomingCall({
      id: payload.id,
      from: payload.from,
      isVideo: !!payload.isVideo,
    })
    return
  }

  if (name === 'call.active' || name === 'call.accepted') {
    if (matchesTrackedCall(payload)) {
      if (
          incomingCall.value &&
          (sameCallId(incomingCall.value.id, payload.id) ||
              sameCallPeer(incomingCall.value.from, payload.from))
      ) {
        incomingCall.value = null
      }
      if (!activeCall.value) {
        activeCall.value = {
          id: payload.id,
          from: payload.from,
          isVideo: !!payload.isVideo,
          direction: payload.direction || 'inbound',
          status: 'active',
        }
        callLabel.value = payload.from || payload.id
      } else {
        activeCall.value.status = 'active'
        if (payload.id) {
          activeCall.value.id = payload.id
        }
      }
    }
    return
  }

  if (name === 'call.ended') {
    if (matchesTrackedCall(payload)) {
      resetCallState()
    }
    return
  }

  if (name === 'call.rejected') {
    if (incomingCall.value && matchesTrackedCall(payload)) {
      resetCallState()
    }
    return
  }
}

async function acceptIncoming() {
  if (!incomingCall.value || processing.value) {
    return
  }
  processing.value = true
  const call = incomingCall.value
  let localStream = null
  let accepted = false
  try {
    localStream = await acquireCallMedia(call.isVideo)

    await store.acceptCall(props.serverId, props.sessionName, call.id)
    accepted = true
    incomingCall.value = null
    callLabel.value = call.from || call.id

    const resolvedId = await resolveActiveCallId(call.id)
    activeCall.value = {
      id: resolvedId,
      from: call.from,
      isVideo: call.isVideo,
      direction: 'inbound',
      status: 'connecting',
    }
    const connectedId = await connectWebRTC(resolvedId, call.isVideo, localStream)
    localStream = null
    activeCall.value.id = connectedId
    if (activeCall.value.status !== 'active') {
      activeCall.value.status = 'connecting'
    }
    void finalizeCallConnection(connectedId)
  } catch (e) {
    localStream?.getTracks().forEach((track) => track.stop())
    const message = callErrorDetail(e)
    if (/claimed/i.test(message)) {
      incomingCall.value = null
      processing.value = false
      toast.add({
        severity: 'warn',
        summary: t('chat.calls.acceptFailed'),
        detail: message,
        life: 6000,
      })
      return
    }
    if (accepted) {
      const endId = activeCall.value?.id || call.id
      try {
        await store.endCall(props.serverId, props.sessionName, endId)
      } catch {
        // ignore
      }
      resetCallState()
    } else {
      incomingCall.value = call
      processing.value = false
    }
    toast.add({
      severity: 'error',
      summary: t('chat.calls.acceptFailed'),
      detail: callErrorDetail(e),
      life: 8000,
    })
    return
  } finally {
    processing.value = false
  }
}

async function rejectIncoming() {
  if (!incomingCall.value || processing.value) {
    return
  }
  processing.value = true
  const call = incomingCall.value
  try {
    await store.rejectCall(props.serverId, props.sessionName, call.from, call.id)
    resetCallState()
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('chat.calls.rejectFailed'),
      detail: e?.message || String(e),
      life: 6000,
    })
  } finally {
    processing.value = false
  }
}

async function startOutgoing(video = false) {
  if (!props.isGows || !props.selectedChat?.id || processing.value || activeCall.value) {
    return
  }
  processing.value = true
  let localStream = null
  let callId = null
  try {
    localStream = await acquireCallMedia(video)
    const result = await store.startCall(
        props.serverId,
        props.sessionName,
        props.selectedChat.id,
        video,
    )
    callId = result.call_id
    activeCall.value = {
      id: callId,
      from: props.selectedChat.id,
      isVideo: video,
      direction: 'outbound',
      status: 'connecting',
    }
    callLabel.value = props.selectedChat.name || props.selectedChat.id
    const resolvedId = await connectWebRTC(callId, video, localStream)
    localStream = null
    activeCall.value.id = resolvedId
    activeCall.value.status = 'connecting'
    void finalizeCallConnection(resolvedId)
  } catch (e) {
    localStream?.getTracks().forEach((track) => track.stop())
    if (callId) {
      try {
        await store.endCall(props.serverId, props.sessionName, callId)
      } catch {
        // ignore
      }
    }
    resetCallState()
    toast.add({
      severity: 'error',
      summary: t('chat.calls.startFailed'),
      detail: callErrorDetail(e),
      life: 8000,
    })
  } finally {
    processing.value = false
  }
}

async function hangUp() {
  if (!activeCall.value || processing.value) {
    return
  }
  processing.value = true
  const callId = activeCall.value.id
  try {
    await store.endCall(props.serverId, props.sessionName, callId)
  } catch (e) {
    toast.add({
      severity: 'warn',
      summary: t('chat.calls.endFailed'),
      detail: e?.message || String(e),
      life: 5000,
    })
  } finally {
    resetCallState()
  }
}

watch(
    () => [props.serverName, props.serverId],
    () => resetCallState(),
)

onBeforeUnmount(() => {
  resetCallState()
})

defineExpose({
  handleEvent,
  startOutgoing,
  hangUp,
  resetCallState,
  hasActiveCall: () => !!activeCall.value,
})
</script>

<template>
  <div v-if="isGows">
    <Dialog
        v-model:visible="showIncoming"
        :modal="true"
        :closable="false"
        :header="t('chat.calls.incomingTitle')"
        style="width: 24rem"
    >
      <div class="flex flex-column gap-3 align-items-center py-2">
        <i class="pi pi-phone text-4xl text-primary"></i>
        <div class="text-center">
          <div class="font-semibold">{{ callLabel }}</div>
          <div class="text-sm text-color-secondary">
            {{ incomingCall?.isVideo ? t('chat.calls.videoCall') : t('chat.calls.voiceCall') }}
          </div>
          <div class="text-xs text-color-secondary mt-2">
            {{ t('chat.calls.micHint') }}
          </div>
        </div>
        <div class="flex gap-2 w-full justify-content-center">
          <Button
              :label="t('chat.calls.reject')"
              severity="danger"
              icon="pi pi-times"
              :loading="processing"
              @click="rejectIncoming"
          />
          <Button
              :label="t('chat.calls.accept')"
              severity="success"
              icon="pi pi-phone"
              :loading="processing"
              @click="acceptIncoming"
          />
        </div>
      </div>
    </Dialog>

    <div
        v-if="showActiveBar"
        class="call-active-bar flex align-items-center justify-content-between gap-3 p-3 mb-2 border-round"
    >
      <div class="flex align-items-center gap-2">
        <i class="pi pi-phone text-green-500"></i>
        <div>
          <div class="font-semibold">{{ callLabel }}</div>
          <div class="text-sm text-color-secondary">
            {{
              activeCall?.status === 'connecting'
                  ? t('chat.calls.connecting')
                  : t('chat.calls.inProgress')
            }}
          </div>
        </div>
      </div>
      <Button
          :label="t('chat.calls.hangUp')"
          severity="danger"
          icon="pi pi-phone"
          :loading="processing"
          @click="hangUp"
      />
    </div>

    <audio ref="remoteAudio" autoplay playsinline class="hidden"></audio>
    <video
        v-show="activeCall?.isVideo"
        ref="remoteVideo"
        autoplay
        playsinline
        class="call-remote-video border-round mb-2"
    ></video>
  </div>
</template>

<style scoped lang="scss">
.call-active-bar {
  background: var(--surface-hover);
  border: 1px solid var(--surface-border);
}

.call-remote-video {
  width: 100%;
  max-height: 240px;
  background: #000;
  object-fit: cover;
}

.hidden {
  display: none;
}
</style>
