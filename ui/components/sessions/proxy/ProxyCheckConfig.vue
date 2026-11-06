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
  // The proxy as typed in the form, null to check the saved config
  proxy: Object,
  index: Number,
});
const { t } = useI18n();
const api = useProxyApi(props);

function body() {
  if (props.proxy?.server) {
    return { proxy: props.proxy };
  }
  return {};
}

const check = useProxyCheck("info", api, body);
const { status, data, error, httpStatus, request, response, showDetails } =
  check;

// Where the proxy comes from is worth a mention only when it is the environment, not the form or the session
const detail = computed(() =>
  detailFor(t, check, "info", (result) => {
    if (result.source === "environment") {
      return t("sessions.proxyChecks.infoOkEnvironment", {
        url: bold(result.url),
      });
    }
    return t("sessions.proxyChecks.infoOk", { url: bold(result.url) });
  })
);

defineExpose({
  key: "config",
  run: check.run,
  clear: check.clear,
  reset: check.clear,
  cancel: check.cancel,
  status,
  data,
  error,
  httpStatus,
});
</script>

<template>
  <ProxyCheckStep
    :index="index"
    title="sessions.proxyChecks.config"
    :status="status"
    :detail="detail"
    :request="request"
    :response="response"
    v-model:show-details="showDetails"
  />
</template>

<style scoped lang="scss"></style>
