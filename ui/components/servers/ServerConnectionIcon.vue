<script setup>
import StatusIcon from "../common/StatusIcon.vue";

// undefined = still checking, true = connected, false = not connected
const props = defineProps(['connected'])

function status() {
  if (props.connected === undefined) return 'running'
  return props.connected ? 'ok' : 'fail'
}
</script>

<template>
  <StatusIcon :status="status()"/>
</template>

<style scoped lang="scss">

</style>
