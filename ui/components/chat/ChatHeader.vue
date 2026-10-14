<script setup>
const props = defineProps({
  chat: Object,
  serverId: String,
  sessionName: String,
  me: Object,
  mePicture: Object,
  fetching: Boolean,
  fetch: Function,
})

import ContactChip from "../sessions/ContactChip.vue";
import ChatLabels from "./ChatLabels.vue";
</script>

<template>
  <div class="chat-header my-2">
    <div class="flex align-items-center gap-2 flex-wrap">
      <ContactChip
          :id="chat.id"
          :name="chat.name"
          :image="chat.picture"
      />
      <ChatLabels
          :serverId="serverId"
          :sessionName="sessionName"
          :chatId="chat.id"
      />
    </div>
    <div class="flex justify-content-center align-items-center">
      <RefreshButton
          @click="fetch"
          :refreshing="fetching"
      />
    </div>
    <div class="flex justify-content-end align-items-center">
      <ContactChip
          :name="me?.pushName || me?.id"
          :image="mePicture"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
}
</style>