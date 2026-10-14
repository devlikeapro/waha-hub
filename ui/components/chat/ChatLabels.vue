<script setup>
const props = defineProps({
  serverId: String,
  sessionName: String,
  chatId: String,
})

const store = useServerStore()
const labels = ref([])

// Labels are keyed by @lid, so resolve the phone number first
async function resolveLid(chatId) {
  if (!chatId.endsWith('@c.us')) {
    return chatId
  }
  const result = await store.findLIDByPhoneNumber(props.serverId, props.sessionName, chatId)
  return result?.lid || chatId
}

async function fetchLabels() {
  labels.value = []
  if (!props.serverId || !props.chatId) {
    return
  }
  try {
    const chatId = await resolveLid(props.chatId)
    labels.value = await store.getChatLabels(props.serverId, props.sessionName, chatId) || []
  } catch (e) {
    console.warn('Failed to fetch chat labels', props.chatId, e)
  }
}

watch(() => props.chatId, fetchLabels, {immediate: true})
</script>

<template>
  <Tag
      v-for="label in labels"
      :key="label.id"
      :value="label.name"
      :style="{background: 'transparent', border: '2px solid ' + label.colorHex, color: label.colorHex}"
      v-tooltip.top="'id: ' + label.id"
  />
</template>
