<script setup>
const props = defineProps({
  ack: Number
})
const Ack = {
  // red pi-exclamation-circle
  ERROR: -1,
  // pi-clock
  PENDING: 0,
  // one pi-check
  SERVER: 1,
  // double pi-check
  DEVICE: 2,
  // blue double pi-check
  READ: 3,
  //blue pi-microphone
  PLAYED: 4,
}
const iClass = computed(() => {
  switch (props.ack) {
    case Ack.ERROR:
      return 'pi-exclamation-circle'
    case Ack.PENDING:
      return 'pi-clock'
    case Ack.SERVER:
      return 'pi-check'
    case Ack.DEVICE:
      return 'pi-check'
    case Ack.READ:
      return 'pi-check'
    case Ack.PLAYED:
      return 'pi-microphone'
  }
})
const iStyle = computed(() => {
  switch (props.ack) {
    case Ack.ERROR:
      return 'color: red'
    case Ack.PENDING:
      return 'color: blue'
    case Ack.SERVER:
      return ''
    case Ack.DEVICE:
      return ''
    case Ack.READ:
      return 'color: blue'
    case Ack.PLAYED:
      return 'color: blue'
  }
})

</script>

<template>
  <div class="flex">
    <i class="pi" :class="iClass" :style="iStyle"></i>
    <i
        v-if="ack===Ack.READ || ack === Ack.DEVICE" class="pi" :class="iClass" :style="iStyle"
        style="margin-left: -0.7rem"
    ></i>
  </div>
</template>

<style scoped lang="scss">

</style>