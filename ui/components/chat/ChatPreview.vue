<script setup>
import ContactChip from "../sessions/ContactChip.vue";
import MessageAck from "./MessageAck.vue";
import ChatLabels from "./ChatLabels.vue";

const props = defineProps({
  id: String,
  name: String,
  picture: String,
  message: Object,
  serverId: String,
  sessionName: String,
})
// limit to 20 symbols
const limit = 60
const textPreview = computed(() => {
  const text = props.message?.body
  if (!text) return ''
  return props.message?.body?.length > limit ? props.message.body.slice(0, limit) + '...' : props.message.body
})

</script>

<template>
  <div class="flex align-items-center gap-2 flex-wrap">
    <ContactChip
        :id="props.id"
        :name="props.name"
        :image="props.picture"
    />
    <ChatLabels
        :serverId="serverId"
        :sessionName="sessionName"
        :chatId="props.id"
    />
  </div>
  <div class="flex gap-1 mt-1">
    <MessageAck v-if="textPreview && message.fromMe" :ack="message.ack" class="pb-2"/>
    {{ textPreview }}
  </div>
</template>

<style scoped lang="scss">

</style>