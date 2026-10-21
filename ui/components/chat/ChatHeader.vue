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
import GroupInfoDialog from "./GroupInfoDialog.vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const isGroup = computed(() => !!props.chat?.id?.endsWith('@g.us'))
const showGroupInfo = ref(false)

function openGroupInfo() {
  if (!isGroup.value) return
  showGroupInfo.value = true
}
</script>

<template>
  <div class="chat-header my-2">
    <div class="chat-header-contact flex align-items-center gap-2 flex-wrap">
      <div
          :class="{ 'cursor-pointer': isGroup }"
          v-tooltip.bottom="isGroup ? t('chat.group.info') : undefined"
          @click="openGroupInfo"
      >
        <ContactChip
            :id="chat.id"
            :name="chat.name"
            :image="chat.picture"
        />
      </div>
      <GroupInfoDialog
          v-if="isGroup"
          v-model:visible="showGroupInfo"
          :chat="chat"
          :serverId="serverId"
          :sessionName="sessionName"
      />
      <ChatLabels
          :serverId="serverId"
          :sessionName="sessionName"
          :chatId="chat.id"
          editable
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