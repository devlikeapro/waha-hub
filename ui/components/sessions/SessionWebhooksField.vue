<script setup>
const webhooks = defineModel("webhooks");
const props = defineProps({
  disabled: Boolean,
})

function add() {
  webhooks.value.push(
      {
        url: "https://httpbin.org/post",
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

    <template v-if="webhooks.length === 0">
      <div class="text-300 text-center">
        No webhooks configured
      </div>
    </template>
    <template v-else>
      <SessionWebhook
          v-for="(webhook, index) in webhooks"
          v-model:webhook="webhooks[index]"
          :index="index"
          @remove="remove(index)"
          :disabled="disabled"
      ></SessionWebhook>
    </template>
    <div>
      <Button
          label="Add Webhook"
          icon="pi pi-plus"
          text=""
          @click="add"
          severity="secondary"
          :disabled="disabled"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">


</style>
