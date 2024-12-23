<script setup>
import ContactChip from "../sessions/ContactChip.vue";
import MessageAck from "./MessageAck.vue";

const props = defineProps({
  id: String,
  name: String,
  picture: String,
  message: Object,
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
  <ContactChip
      :id="props.name || props.id"
      :image="props.picture"
  />
  <div class="flex gap-1 mt-1">
    <MessageAck v-if="textPreview" :ack="message.ack" class="pb-2"/>
    {{ textPreview }}
  </div>
</template>

<style scoped lang="scss">

</style>