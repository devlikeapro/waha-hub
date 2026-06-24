<script setup>

import {sleep} from "../../services/utils";
import ChatMessages from "./ChatMessages.vue";
import ChatHeader from "./ChatHeader.vue";
import ChatList from "./ChatList.vue";
import ChatInputFooter from "./ChatInputFooter.vue";
import ChatCallManager from "./ChatCallManager.vue";
import {ClientStatus, WebSocketClient} from "../../services/WebSocketService";
import {ref, computed} from "vue";
import WebSocketStatus from "../events/WebSocketStatus.vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n();

const visible = defineModel("visible");
const session = defineModel("session");

const toast = useToast();
const store = useServerStore()
const mergeOverview = ref(true)
const chats = ref([])
const pending = ref(false)
const chatsOffset = ref(0)
const loadingMoreChats = ref(false)

async function refreshChats() {
  chatsOffset.value = 0
  pending.value = true
  try {
    const data = await store.getChatsOverview(
        session.value.server.id,
        session.value.name,
        10,
        undefined,
        mergeOverview.value,
    )
    chats.value = data || []
  } finally {
    pending.value = false
  }
}

async function loadMoreChats() {
  if (loadingMoreChats.value) return
  loadingMoreChats.value = true
  try {
    const nextOffset = chatsOffset.value + 10
    const data = await store.getChatsOverview(
        session.value.server.id,
        session.value.name,
        10,
        nextOffset,
        mergeOverview.value,
    )
    if (data && data.length > 0) {
      chatsOffset.value = nextOffset
      chats.value = [...chats.value, ...data]
    }
  } finally {
    loadingMoreChats.value = false
  }
}

const selectedChat = ref(null)
const messages = ref([])

const profilePicture = ref(null)
watch(selectedChat, () => {
  if (!selectedChat.value) {
    return
  }
  fetchMessages()
})
const fetchingMessages = ref(false)
const loadingEarly = ref(false)
const hasEarlierMessages = ref(true)
const limit = ref(20)
const offset = ref(0)

let client = null
const clientStatus = ref(ClientStatus.DISCONNECTED)
const callManager = ref(null)

const isGows = computed(() => {
  if (!session.value?.server?.id) {
    return false
  }
  const server = store.getServer(session.value.server.id)
  return server?.version?.engine === 'GOWS'
})

function startClient() {
  const server = store.getServer(session.value.server.id)
  const listenEvents = [
    'message.any',
    'call.received',
    'call.ringing',
    'call.connecting',
    'call.accepted',
    'call.active',
    'call.ended',
    'call.rejected',
  ]
  client = new WebSocketClient(server, listenEvents, session.value.name)
  client.connect()
  clientStatus.value = ClientStatus.CONNECTING
  client.on("open", () => {
    clientStatus.value = ClientStatus.CONNECTED
  })
  client.on("close", () => {
    clientStatus.value = ClientStatus.DISCONNECTED
    restartClient()
  })
  client.on("error", () => {
    clientStatus.value = ClientStatus.ERROR
    restartClient()
  })
  client.on("event", handleEvent)
}

async function handleEvent(event) {
  if (event?.event?.startsWith('call.')) {
    callManager.value?.handleEvent(event)
    if (!['call.received', 'call.ringing', 'call.connecting', 'call.active'].includes(event.event)) {
      return
    }
  }
  await sleep(1000)
  const chatId = selectedChat.value?.id
  if (!chatId) {
    return
  }
  if (event.payload.from === chatId || event.payload.to === chatId) {
    fetchMessages()
  }
  refreshChats()
}

function restartClient() {
}

function stopClient() {
  client?.stop()
  client = null
  clientStatus.value = ClientStatus.DISCONNECTED
  callManager.value?.resetCallState()
}


function fetchMessages() {
  offset.value = 0
  hasEarlierMessages.value = true
  fetchingMessages.value = true
  store.getChatsMessages(
      session.value.server.id,
      session.value.name,
      selectedChat.value.id,
      limit.value,
      0,
      false,
      mergeOverview.value,
  ).then((data) => {
    messages.value = data.reverse()
  }).finally(() => {
        fetchingMessages.value = false
      }
  )
}

async function loadEarlyMessages() {
  if (loadingEarly.value) return
  loadingEarly.value = true
  try {
    const nextOffset = offset.value + limit.value
    const data = await store.getChatsMessages(
        session.value.server.id,
        session.value.name,
        selectedChat.value.id,
        limit.value,
        nextOffset,
        false,
        mergeOverview.value,
    )
    if (data.length > 0) {
      offset.value = nextOffset
      messages.value = [...data.reverse(), ...messages.value]
    } else {
      hasEarlierMessages.value = false
    }
  } finally {
    loadingEarly.value = false
  }
}

function onMergeToggle(value) {
  mergeOverview.value = value
  refreshChats()
}

function initializeDialog() {
  if (!session.value?.server?.id || !session.value?.name) {
    return;
  }
  mergeOverview.value = true
  stopClient()
  startClient()
  refreshChats()

  if (!session.value?.me?.id) {
    profilePicture.value = null
    return
  }
  store.getProfilePicture(session.value.server.id, session.value.name, session.value.me.id).then((data) => {
    profilePicture.value = data.profilePictureURL
  })
}

watch(
    () => [visible.value, session.value?.server?.id, session.value?.name],
    ([isVisible, serverId, sessionName], [wasVisible, previousServerId, previousSessionName] = []) => {
      if (!isVisible) {
        selectedChat.value = null
        messages.value = []
        stopClient()
        return
      }

      const becameVisible = !wasVisible && isVisible
      const sessionChangedWhileOpen =
          wasVisible && isVisible && (serverId !== previousServerId || sessionName !== previousSessionName)

      if (becameVisible || sessionChangedWhileOpen) {
        initializeDialog()
      }
    }
)

function clickOnChat(chat) {
  selectedChat.value = chat
}

async function sendMedia(type, file, base64, caption) {
  if (!selectedChat.value) return
  const mediaFile = { data: base64, mimetype: file.type, filename: file.name }
  try {
    if (type === 'image') {
      await store.sendImage(session.value.server.id, session.value.name, selectedChat.value.id, mediaFile, caption)
    } else if (type === 'video') {
      await store.sendVideo(session.value.server.id, session.value.name, selectedChat.value.id, mediaFile, caption)
    } else if (type === 'audio') {
      await store.sendVoice(session.value.server.id, session.value.name, selectedChat.value.id, mediaFile)
    } else {
      await store.sendFile(session.value.server.id, session.value.name, selectedChat.value.id, mediaFile, caption)
    }
    await sleep(1000)
    fetchMessages()
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('chat.sendFailedTitle'),
      detail: e?.message || String(e),
      life: 5000,
    })
    throw e
  }
}

async function sendText(text) {
  if (!selectedChat.value) {
    return
  }
  try {
    await store.readChatMessages(
        session.value.server.id,
        session.value.name,
        selectedChat.value.id,
    )
  } catch (e) {
    console.warn('Failed to mark chat as read before sending text', e)
    toast.add({
      severity: 'warn',
      summary: t('chat.readFailedTitle'),
      detail: t('chat.readFailedDescription'),
      life: 4000,
    })
  }
  try {
    await store.sendText(session.value.server.id, session.value.name, selectedChat.value.id, text)
    await sleep(1000)
    fetchMessages()
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('chat.sendFailedTitle'),
      detail: e?.message || String(e),
      life: 5000,
    })
    throw e
  }
}

const showPromo = ref(false)

function startVoiceCall() {
  callManager.value?.startOutgoing(false)
}

function startVideoCall() {
  callManager.value?.startOutgoing(true)
}
</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      maximizable
      style="width: 90%; height: 90%;"
  >
    <template #header>
      <div>

        <SessionHeader
            :session="session"
        ></SessionHeader>
      </div>
    </template>
    <div class="pb-3 flex">
      <div class="flex align-items-center gap-1">
        <SessionChip
            v-if="session.me"
            :session="session"
            :image="profilePicture"
        >
        </SessionChip>
        <WebSocketStatus :status="clientStatus"></WebSocketStatus>
      </div>
      <div class="m-auto pb-2">
        <div class="text-center">
          <a href="#" @click="showPromo = true">
            <b>{{ t('chat.aboutChatUI') }}</b>
          </a>
        </div>
        <ChatPromo
            style="max-width:50em"
            v-if="showPromo"
            @close="showPromo = false"
        ></ChatPromo>
      </div>
    </div>

    <Splitter style="max-height: 90%">
      <SplitterPanel :size=30 class="flex items-center justify-center">
        <ChatList
            :chats="chats"
            :pending="pending"
            :merge="mergeOverview"
            :loadMoreChats="loadMoreChats"
            :loadingMoreChats="loadingMoreChats"
            @click-on-chat="clickOnChat"
            @refresh-chats="refreshChats"
            @update:merge="onMergeToggle"
        ></ChatList>
      </SplitterPanel>
      <SplitterPanel :size=70 class="flex flex-column gap-2 justify-content-between p-2">
        <ChatCallManager
            ref="callManager"
            :server-id="session.server.id"
            :session-name="session.name"
            :is-gows="isGows"
            :selected-chat="selectedChat"
        />
        <div class="flex flex-column justify-content-between" style="height: 100%">
          <template v-if="selectedChat">
            <ChatHeader
                :chat="selectedChat"
                :me="session.me"
                :mePicture="profilePicture"
                :fetch="fetchMessages"
                :fetching="fetchingMessages"
                :is-gows="isGows"
                @start-voice-call="startVoiceCall"
                @start-video-call="startVideoCall"
            >
            </ChatHeader>
            <hr>

            <ChatMessages
                :messages="messages"
                :loadEarlier="loadEarlyMessages"
                :loadingEarlier="loadingEarly"
                :hasEarlierMessages="hasEarlierMessages"
                :serverId="session.server.id"
                :sessionName="session.name"
            ></ChatMessages>

            <ChatInputFooter
                :disabled="!selectedChat || fetchingMessages"
                :sendText="sendText"
                :sendMedia="sendMedia"
            />
          </template>
        </div>
      </SplitterPanel>
    </Splitter>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
