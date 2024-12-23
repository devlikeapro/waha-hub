<script setup>
import MessageAck from "./MessageAck.vue";

const props = defineProps({
  message: Object,
})
const Ack = {
  ERROR: -1,
  PENDING: 0,
  SERVER: 1,
  DEVICE: 2,
  READ: 3,
  PLAYED: 4,
}

</script>


<template>
  <Chip>
    <div class="p-2">
      <!-- Replace /n to <br> -->
      <p v-html="message.body.replace(/\n/g, '<br>')"></p>
    </div>
    <!-- ack at the bottom of div-->
    <div class="flex flex-column justify-content-end" style="height: 100%">
      <MessageAck :ack="message.ack" class="pb-2"/>
    </div>
  </Chip>
</template>

<style scoped lang="scss">

</style>