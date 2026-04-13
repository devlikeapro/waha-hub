<script setup>
import ChatMediaAttachment from "./ChatMediaAttachment.vue"
import {useI18n} from "vue-i18n"

const {t} = useI18n()

const props = defineProps({
  disabled: Boolean,
  sendText: Function,
  sendMedia: Function,
})

const loading = ref(false)
const text = ref('')
const attachments = ref([]) // { type, file, previewUrl }
const sendProgress = ref(null) // { current, total }

const hasAttachments = computed(() => attachments.value.length > 0)
const allAudio = computed(() => hasAttachments.value && attachments.value.every(a => a.type === 'audio'))
const captionDisabled = computed(() => allAudio.value)

const sendDisabled = computed(() =>
    props.disabled || loading.value || (!hasAttachments.value && !text.value)
)

//
// File picker
//
const fileInputRef = ref(null)
const pickerType = ref(null)

const menuRef = ref(null)
const menuItems = computed(() => [
  {
    label: t('chat.send.attach.image'),
    icon: 'pi pi-image',
    command: () => openPicker('image', 'image/*'),
  },
  {
    label: t('chat.send.attach.video'),
    icon: 'pi pi-video',
    command: () => openPicker('video', 'video/*'),
  },
  {
    label: t('chat.send.attach.audio'),
    icon: 'pi pi-microphone',
    command: () => openPicker('audio', 'audio/*'),
  },
  {
    label: t('chat.send.attach.file'),
    icon: 'pi pi-file',
    command: () => openPicker('file', '*/*'),
  },
])

function openPicker(type, accept) {
  pickerType.value = type
  fileInputRef.value.accept = accept
  fileInputRef.value.click()
}

function onFilesChanged(event) {
  const files = [...event.target.files]
  event.target.value = ''
  for (const file of files) {
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    attachments.value.push({ type: pickerType.value, file: file, previewUrl: previewUrl })
  }
}

function removeAttachment(index) {
  const att = attachments.value[index]
  if (att.previewUrl) URL.revokeObjectURL(att.previewUrl)
  attachments.value.splice(index, 1)
}

//
// Sending
//
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function send() {
  if (hasAttachments.value) {
    await sendAttachments()
  } else {
    await sendTextMessage()
  }
}

async function sendTextMessage() {
  loading.value = true
  try {
    await props.sendText(text.value)
    text.value = ''
  } finally {
    loading.value = false
  }
}

async function sendAttachments() {
  loading.value = true
  const total = attachments.value.length
  try {
    for (let i = 0; i < total; i++) {
      sendProgress.value = { current: i + 1, total: total }
      const att = attachments.value[i]
      const base64 = await fileToBase64(att.file)
      const caption = (i === 0 && !captionDisabled.value) ? text.value : undefined
      await props.sendMedia(att.type, att.file, base64, caption)
    }
    attachments.value.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl) })
    attachments.value = []
    text.value = ''
  } finally {
    sendProgress.value = null
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-column" style="width: 100%">
    <!-- Attachment previews -->
    <div v-if="hasAttachments" class="flex flex-wrap gap-2 mb-2">
      <ChatMediaAttachment
          v-for="(att, i) in attachments"
          :key="i"
          :attachment="att"
          @remove="removeAttachment(i)"
      />
    </div>

    <div class="flex align-items-center" style="width: 100%; gap: 0.5rem">
      <!-- Text / caption input with clip button overlaid inside on the right -->
      <div style="flex: 1; position: relative">
        <Textarea
            v-model="text"
            rows="2"
            :disabled="captionDisabled"
            :placeholder="captionDisabled ? t('chat.send.placeholder.noAudioCaption') : (hasAttachments ? t('chat.send.placeholder.caption') : '')"
            @keydown.enter.ctrl="send"
            style="width: 100%; padding-right: 2.5rem"
        />
        <Button
            icon="pi pi-paperclip"
            text
            rounded
            size="small"
            :disabled="disabled"
            @click="menuRef.toggle($event)"
            style="position: absolute; right: 0.25rem; top: 50%; transform: translateY(-50%)"
        />
        <Menu ref="menuRef" :model="menuItems" popup/>
        <input ref="fileInputRef" type="file" multiple style="display: none" @change="onFilesChanged"/>
      </div>

      <!-- Send button + progress -->
      <div class="flex flex-column align-items-center" style="gap: 2px">
        <Button
            @click="send"
            :disabled="sendDisabled"
            :loading="loading"
            icon="pi pi-send"
            class="p-button-success"
        />
        <small v-if="sendProgress && sendProgress.total > 1" class="text-color-secondary" style="font-size: 0.7rem; white-space: nowrap">
          {{ t('chat.send.progress', { current: sendProgress.current, total: sendProgress.total }) }}
        </small>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
