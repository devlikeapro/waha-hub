<script setup>
const visible = defineModel("visible");
const props = defineProps(['server'])

</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      class="p-fluid"
      style="max-width: 100%; min-width: 50%"
      header='Server'
  >
    <h4>{{ server.name }}</h4>
    <ServerStatus :server="props.server"></ServerStatus>

    <h4>Variables</h4>
    <ServerVariablesTable :server="props.server"></ServerVariablesTable>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
