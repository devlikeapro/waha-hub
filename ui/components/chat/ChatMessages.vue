<script setup>
import {sleep} from "../../services/utils";

const props = defineProps({
  messages: Array,
})
const scroll = ref(null)

async function scrollToBottom() {
  await sleep(10)
  if (scroll.value) {
    scroll.value.scrollTop = scroll.value.scrollHeight
  }
}

watch(() => props.messages, scrollToBottom)
</script>

<template>
  <div class="my-2 pb-3" style="width: 100%; height: 100%; overflow: auto;" ref="scroll">
    <div class="flex flex-column gap-2">
      <template v-for="message in messages">
        <div :class="{'flex justify-content-end': message.fromMe}" v-if="message.body">
          <ChatMessage :key="message.key" :message="message"/>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>