<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useProxyApi } from "../../../composables/useProxyApi";
import {
  bold,
  detailFor,
  useProxyCheck,
} from "../../../composables/useProxyCheck";
import ProxyCheckStep from "./ProxyCheckStep.vue";

// One GET or HEAD request through the proxy to an editable url - "server" (any site) and "whatsapp" rows
const props = defineProps({
  server: String,
  sessionName: { type: String, default: null },
  proxy: Object,
  index: Number,
  running: Boolean,
  // i18n suffix: server | whatsapp
  kind: String,
  defaultUrl: String,
});
const { t } = useI18n();
const api = useProxyApi(props);
const METHODS = ["HEAD", "GET"];
const url = ref(props.defaultUrl);
const method = ref(METHODS[0]);

function body() {
  const request = { url: url.value, method: method.value };
  if (props.proxy?.server) {
    request.proxy = props.proxy;
  }
  return request;
}

const check = useProxyCheck("http", api, body);
const { status, request, response, showDetails } = check;

const detail = computed(() =>
  detailFor(t, check, props.kind, (result) =>
    t(`sessions.proxyChecks.${props.kind}Ok`, {
      url: bold(result.url),
      ms: bold(`${result.latency} ms`),
      status: bold(result.status),
    })
  )
);

/**
 * Back to the defaults, on reopen; Run only clears the results
 */
function reset() {
  url.value = props.defaultUrl;
  method.value = METHODS[0];
  check.clear();
}

defineExpose({
  key: props.kind,
  run: check.run,
  clear: check.clear,
  reset: reset,
  cancel: check.cancel,
  status,
});
</script>

<template>
  <ProxyCheckStep
    :index="index"
    :title="`sessions.proxyChecks.${kind}`"
    :status="status"
    :detail="detail"
    :request="request"
    :response="response"
    v-model:show-details="showDetails"
  >
    <template #controls>
      <Dropdown
        v-model="method"
        :options="METHODS"
        class="w-auto p-inputtext-sm"
        :disabled="running"
      />
      <InputText
        v-model.trim="url"
        class="p-inputtext-sm flex-1"
        style="min-width: 0"
        :disabled="running"
      />
    </template>
  </ProxyCheckStep>
</template>

<style scoped lang="scss"></style>
