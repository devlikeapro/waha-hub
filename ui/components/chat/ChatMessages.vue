<script setup>
import {sleep} from "../../services/utils";

const props = defineProps({
  messages: Array,
  loadEarlier: Function,
  loadingEarlier: Boolean,
  hasEarlierMessages: Boolean,
  serverId: String,
  sessionName: String,
})
const scroll = ref(null)
const isLoadingEarlier = ref(false)

async function scrollToBottom() {
  await sleep(10)
  if (scroll.value) {
    scroll.value.scrollTop = scroll.value.scrollHeight
  }
}

watch(() => props.messages, async () => {
  if (isLoadingEarlier.value) return
  scrollToBottom()
})

async function handleLoadEarlier() {
  if (!props.loadEarlier || isLoadingEarlier.value) return
  const container = scroll.value
  const oldScrollHeight = container.scrollHeight
  isLoadingEarlier.value = true
  await props.loadEarlier()
  await nextTick()
  await sleep(10)
  if (container) {
    container.scrollTop = container.scrollHeight - oldScrollHeight
  }
  isLoadingEarlier.value = false
}
</script>

<template>
  <div class="my-2 pb-3" style="width: 100%; height: 100%; overflow: auto;" ref="scroll">
    <div class="flex flex-column gap-2">
      <div class="flex justify-content-center py-2">
        <Button
            v-tooltip.bottom="!hasEarlierMessages ? $t('chat.noMoreMessages') : undefined"
            :label="$t('chat.loadMoreMessages')"
            icon="pi pi-arrow-up"
            size="small"
            outlined
            :loading="loadingEarlier || isLoadingEarlier"
            @click="handleLoadEarlier"
        />
      </div>
      <template v-for="message in messages">
        <div>
          <ChatMessage
              :key="message.id"
              :message="message"
              :serverId="serverId"
              :sessionName="sessionName"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
