<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const webhooks = defineModel("webhooks");
const props = defineProps({
  disabled: Boolean,
})

function add() {
  const webhook = {
    url: "https://httpbin.org/post",
    events: ["session.status", "message"],
    hmac: {
      key: null,
    },
    retries: {
      delaySeconds: 2,
      attempts: 15,
      policy: "exponential",
    },
    customHeaders: null,
  }
  // push at start
  webhooks.value.push(webhook)

}

function remove(index) {
  webhooks.value.splice(index, 1)
}
</script>

<template>
  <div class="flex flex-column gap-2">
    <div class="flex justify-content-between align-items-center w-full">
      <h5>{{ t('sessions.webhooks.title') }}</h5>
      <div class="pr-2">
        <Button
            v-tooltip.top="t('sessions.webhooks.addWebhook')"
            :label="t('sessions.webhooks.webhook')"
            text
            icon="pi pi-plus"
            severity="success"
            @click="add"
        />
      </div>
    </div>

    <template v-if="webhooks.length === 0">
      <div class="text-300 text-center">
        {{ t('sessions.webhooks.noWebhooksConfigured') }}
      </div>
    </template>
    <template v-else>
      <SessionWebhook
          v-for="(webhook, index) in webhooks"
          v-model:webhook="webhooks[index]"
          :index="index"
          :total="webhooks.length"
          @remove="remove(index)"
          :disabled="disabled"
      ></SessionWebhook>
    </template>
  </div>
</template>

<style scoped lang="scss">


</style>
