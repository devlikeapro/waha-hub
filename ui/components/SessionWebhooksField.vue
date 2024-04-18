<script setup>
const webhooks = defineModel("webhooks");

function add() {
  webhooks.value.push({url: "http://"})
}
</script>

<template>
  <div class="flex align-items-center">
    <label>Webhooks</label>
    <Button icon="pi pi-plus" text="" @click="add" severity="secondary"/>
  </div>

  <template v-if="webhooks.length === 0">
    <span class="text-300">
      No webhooks configured
    </span>
  </template>
  <template v-else>
    <SessionWebhook
        class="mb-2"
        v-for="(webhook, index) in webhooks"
        v-model:webhook="webhooks[index]"></SessionWebhook>
  </template>
</template>

<style scoped lang="scss">


</style>
