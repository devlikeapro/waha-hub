<script setup>
import { useI18n } from "vue-i18n";
import JsonDataViewer from "../../common/JsonDataViewer.vue";
import StatusIcon from "../../common/StatusIcon.vue";
import ToggleLink from "../../common/ToggleLink.vue";

const { t } = useI18n();

// Layout of one check row: number + title (+ controls), status line, the Details toggle with the description
// and the request/response, then the body slot (progress)
defineProps({
  index: Number,
  // i18n key of the title; the description is the same key with the "Description" suffix
  title: String,
  status: String,
  // HTML, already escaped by the check
  detail: String,
  request: Object,
  response: Object,
});
const showDetails = defineModel("showDetails", { type: Boolean });

async function copy(event, data) {
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  event.preventDefault();
}
</script>

<template>
  <Divider />
  <div>
    <div class="flex align-items-center gap-2">
      <b class="white-space-nowrap">{{ index }}. {{ t(title) }}</b>
      <slot name="controls"></slot>
    </div>
    <div class="mt-2 flex align-items-center gap-2">
      <StatusIcon :status="status" />
      <span
        style="word-break: break-word"
        :class="{
          'text-green-500': status === 'ok',
          'text-pink-500': status === 'fail',
        }"
        v-html="detail"
      ></span>
    </div>
    <div class="mt-1 text-sm">
      <ToggleLink
        v-model="showDetails"
        :label="t('sessions.proxyChecks.details')"
      />
    </div>
    <div v-if="showDetails" class="mt-2">
      <div class="text-500 mb-2" style="white-space: pre-line">
        {{ t(`${title}Description`) }}
      </div>
      <!-- Heading + copy button, like the Send Request tab -->
      <div class="flex align-items-center">
        <span class="font-semibold">{{
          t("sessions.proxyChecks.request")
        }}</span>
        <Button
          rounded
          text
          size="small"
          v-tooltip.focus.bottom="{ value: t('ui.copiedToClipboard') }"
          icon="pi pi-copy"
          severity="secondary"
          @click="copy($event, request)"
        />
      </div>
      <JsonDataViewer :data="request" :deep="4" :copy-button="false" />
      <div class="flex align-items-center mt-2">
        <span class="font-semibold">{{
          t("sessions.proxyChecks.response")
        }}</span>
        <Button
          rounded
          text
          size="small"
          v-tooltip.focus.bottom="{ value: t('ui.copiedToClipboard') }"
          icon="pi pi-copy"
          severity="secondary"
          :disabled="!response"
          @click="copy($event, response)"
        />
      </div>
      <JsonDataViewer
        v-if="response"
        :data="response"
        :deep="4"
        :copy-button="false"
      />
      <div v-else class="text-500 text-sm">
        {{ t("sessions.proxyChecks.noResponse") }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss"></style>
