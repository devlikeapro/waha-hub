<script setup>
const webhooks = defineModel("webhooks");

function add() {
  webhooks.value.push(
      {
        url: "https://",
        events: ["session.status", "message", "message.reaction"],
        hmac: {
          key: null,
        },
        retries: {
          delaySeconds: 2,
          attempts: 15,
        }
      }
  )
}

function remove(index) {
  webhooks.value.splice(index, 1)
}
</script>

<template>
  <div class="flex flex-column gap-2">
    <div>
      <label>Webhooks</label>
    </div>
    <div>
      <Button
          label="Add Webhook"
          icon="pi pi-plus"
          text=""
          @click="add"
          severity="secondary"
      />
    </div>

    <template v-if="webhooks.length === 0">
      <div class="text-300 text-center">
        No webhooks configured
      </div>
    </template>
    <template v-else>
      <SessionWebhook
          v-for="(webhook, index) in webhooks"
          v-model:webhook="webhooks[index]"
          @remove="remove(index)"
      ></SessionWebhook>
    </template>

  </div>
</template>

<style scoped lang="scss">


</style>
