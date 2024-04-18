<script setup>
const webhook = defineModel("webhook");

</script>

<template>
  <Fieldset legend="Header">
    {{ webhook.url}}
  </Fieldset>
</template>

<style scoped lang="scss">

</style>
