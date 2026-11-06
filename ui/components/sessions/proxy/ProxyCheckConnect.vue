<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useProxyApi } from "../../../composables/useProxyApi";
import {
  bold,
  detailFor,
  useProxyCheck,
} from "../../../composables/useProxyCheck";
import ProxyCheckStep from "./ProxyCheckStep.vue";

const props = defineProps({
  server: String,
  sessionName: { type: String, default: null },
  proxy: Object,
  index: Number,
  // The proxy as configured (from the config check), shown instead of the resolved ip
  proxyUrl: { type: String, default: null },
});
const { t } = useI18n();
const api = useProxyApi(props);

function body() {
  if (props.proxy?.server) {
    return { proxy: props.proxy };
  }
  return {};
}

const check = useProxyCheck("connect", api, body);
const { status, request, response, showDetails } = check;

const detail = computed(() =>
  detailFor(t, check, "connect", (result) =>
    t("sessions.proxyChecks.connectOk", {
      address: bold(props.proxyUrl ?? `${result.address}:${result.port}`),
      ms: bold(`${result.latency} ms`),
    })
  )
);

defineExpose({
  key: "connect",
  run: check.run,
  clear: check.clear,
  reset: check.clear,
  cancel: check.cancel,
  status,
});
</script>

<template>
  <ProxyCheckStep
    :index="index"
    title="sessions.proxyChecks.connect"
    :status="status"
    :detail="detail"
    :request="request"
    :response="response"
    v-model:show-details="showDetails"
  />
</template>

<style scoped lang="scss"></style>
