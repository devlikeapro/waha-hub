<script setup>
const props = defineProps({
  chat: Object,
  me: Object,
  mePicture: Object,
  fetching: Boolean,
  fetch: Function,
  isGows: { type: Boolean, default: false },
})

const emit = defineEmits(['start-voice-call', 'start-video-call'])

import ContactChip from "../sessions/ContactChip.vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>

<template>
  <div class="chat-header my-2">
    <div class="flex align-items-center gap-2">
      <ContactChip
          :id="chat.id"
          :name="chat.name"
          :image="chat.picture"
      />
      <div v-if="isGows" class="flex gap-1">
        <Button
            v-tooltip.top="t('chat.calls.callVoice')"
            icon="pi pi-phone"
            severity="success"
            text
            rounded
            @click="emit('start-voice-call')"
        />
        <Button
            v-tooltip.top="t('chat.calls.callVideo')"
            icon="pi pi-video"
            severity="info"
            text
            rounded
            @click="emit('start-video-call')"
        />
      </div>
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
