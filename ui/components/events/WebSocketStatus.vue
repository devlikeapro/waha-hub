<script setup>
import {ClientStatus} from "../../services/WebSocketService";

const props = defineProps(['status'])
const severity = computed(() => {
  switch (props.status) {
    case ClientStatus.CONNECTING:
      return 'warning'
    case ClientStatus.CONNECTED:
      return 'success'
    case ClientStatus.DISCONNECTED:
      return 'secondary'
    case ClientStatus.ERROR:
      return 'danger'
    default:
      return 'warn'
  }
})

</script>

<template>
  <div>
    <Tag :value="status" :severity="severity"/>
  </div>
</template>

<style scoped lang="scss">

</style>