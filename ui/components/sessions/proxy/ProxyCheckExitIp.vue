<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useProxyApi } from "../../../composables/useProxyApi";
import {
  bold,
  detailFor,
  ipLink,
  useProxyCheck,
} from "../../../composables/useProxyCheck";
import IntegerInput from "../../common/IntegerInput.vue";
import StatusIcon from "../../common/StatusIcon.vue";
import ProxyCheckStep from "./ProxyCheckStep.vue";

const DEFAULT_URL = "https://ifconfig.me/ip";
const DEFAULT_COUNT = 3;
const DEFAULT_INTERVAL_S = 30;
const COUNT_MAX = 10;
const INTERVAL_MAX_S = 600;

// Reads the exit IP a few times, some seconds apart - a rotating proxy shows up as a changed IP
const props = defineProps({
  server: String,
  sessionName: { type: String, default: null },
  proxy: Object,
  index: Number,
  running: Boolean,
});
const { t } = useI18n();
const api = useProxyApi(props);
const url = ref(DEFAULT_URL);
const count = ref(DEFAULT_COUNT);
const interval = ref(DEFAULT_INTERVAL_S);

// The reads done so far, whether the pause before the next one is on and how much of it is left (ms)
const samples = ref([]);
const waiting = ref(false);
const remaining = ref(0);
let ticker = null;

function stopTicker() {
  if (ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}

/**
 * Counts the pause down, for the sentence next to the status icon
 */
function pause(ms) {
  stopTicker();
  const until = Date.now() + ms;
  remaining.value = ms;
  ticker = setInterval(() => {
    remaining.value = Math.max(0, until - Date.now());
  }, 200);
  return new Promise((resolve) =>
    setTimeout(() => {
      stopTicker();
      resolve();
    }, ms)
  );
}

onBeforeUnmount(stopTicker);

function body() {
  const request = { url: url.value };
  if (props.proxy?.server) {
    request.proxy = props.proxy;
  }
  return request;
}

/**
 * One exit-ip probe per read; a failed read fails the check with its own error, a changed IP with "changed"
 */
async function execute(request, cancelled) {
  samples.value = [];
  waiting.value = false;
  const responses = [];
  const stop = { data: null, response: responses };
  for (let i = 0; i < count.value; i++) {
    if (i > 0) {
      waiting.value = true;
      await pause(interval.value * 1000);
      waiting.value = false;
      if (cancelled()) return stop;
    }
    const result = await api.call("exitIp", request);
    if (cancelled()) return stop;
    responses.push(result);
    samples.value = [...samples.value, result];
    if (result?.ok === false) return { data: result, response: responses };
  }
  const ips = samples.value.map((sample) => sample.ip);
  const same = ips.every((ip) => ip === ips[0]);
  return {
    data: { ok: same, changed: !same, ip: ips[0], ips: ips },
    response: responses,
  };
}

const check = useProxyCheck("exitIp", api, body, execute);
const { status, data, request, response, showDetails } = check;

const detail = computed(() => {
  if (status.value === "fail" && data.value?.changed) {
    return t("sessions.proxyChecks.exitIpChanged");
  }
  if (status.value === "running" && waiting.value) {
    return t("sessions.proxyChecks.exitIpWaiting", {
      n: bold(samples.value.length + 1),
      total: bold(count.value),
      s: bold(
        t("sessions.proxyChecks.seconds", {
          s: Math.ceil(remaining.value / 1000),
        })
      ),
    });
  }
  return detailFor(
    t,
    check,
    "exitIp",
    () => t("sessions.proxyChecks.exitIpOk"),
    () => ({ n: bold(samples.value.length + 1), total: bold(count.value) })
  );
});

// Under the row: [ip] [20 s] [ip] [20 s] [ip] - a read, the pause, the next read
const steps = computed(() => {
  const items = [];
  for (let i = 0; i < count.value; i++) {
    items.push({ read: i });
    if (i < count.value - 1) items.push({ pause: i });
  }
  return items;
});

function stepStatus(item) {
  const done = samples.value.length;
  if (item.pause !== undefined) {
    if (done > item.pause + 1) return "ok";
    if (done === item.pause + 1 && waiting.value) return "running";
    return "pending";
  }
  // A read that failed on its own; once two reads disagree every read is red, none of the IPs is the "right" one
  const sample = samples.value[item.read];
  if (sample) {
    if (sample.ok === false) return "fail";
    const first = samples.value[0].ip;
    return samples.value.every((read) => read.ip === first) ? "ok" : "fail";
  }
  if (status.value === "running" && item.read === done && !waiting.value) {
    return "running";
  }
  return "pending";
}

/**
 * The pause in progress counts down, the others show the interval
 */
function stepLabel(item) {
  if (item.pause !== undefined) {
    let s = interval.value;
    if (stepStatus(item) === "running") {
      s = Math.ceil(remaining.value / 1000);
    }
    return t("sessions.proxyChecks.seconds", { s: s });
  }
  // A dash keeps the marker in place until the read lands
  const ip = samples.value[item.read]?.ip;
  return ip ? ipLink(ip) : "&mdash;";
}

function clear() {
  stopTicker();
  samples.value = [];
  waiting.value = false;
  check.clear();
}

function cancel() {
  stopTicker();
  waiting.value = false;
  check.cancel();
}

/**
 * Back to the defaults, on reopen; Run only clears the results
 */
function reset() {
  url.value = DEFAULT_URL;
  count.value = DEFAULT_COUNT;
  interval.value = DEFAULT_INTERVAL_S;
  clear();
}

defineExpose({
  key: "exitIp",
  run: check.run,
  clear: clear,
  reset: reset,
  cancel: cancel,
  status,
});
</script>

<template>
  <ProxyCheckStep
    :index="index"
    title="sessions.proxyChecks.exitIp"
    :status="status"
    :detail="detail"
    :request="request"
    :response="response"
    v-model:show-details="showDetails"
  >
    <template #controls>
      <InputText
        v-model.trim="url"
        class="p-inputtext-sm flex-1"
        style="min-width: 0"
        :disabled="running"
      />
      <IntegerInput
        v-model="count"
        v-tooltip="t('sessions.proxyChecks.exitIpCount')"
        :min="2"
        :max="COUNT_MAX"
        class="w-auto p-inputtext-sm"
        :inputStyle="{ width: '3.5rem' }"
        :disabled="running"
      />
      <IntegerInput
        v-model="interval"
        v-tooltip="t('sessions.proxyChecks.exitIpInterval')"
        :min="1"
        :max="INTERVAL_MAX_S"
        suffix=" s"
        class="w-auto p-inputtext-sm"
        :inputStyle="{ width: '4.5rem' }"
        :disabled="running"
      />
    </template>
    <Timeline :value="steps" layout="horizontal" align="top" class="mt-2">
      <template #marker="{ item }">
        <StatusIcon :status="stepStatus(item)" />
      </template>
      <template #content="{ item }">
        <span
          class="text-sm white-space-nowrap"
          v-html="stepLabel(item)"
        ></span>
      </template>
    </Timeline>
  </ProxyCheckStep>
</template>

<style scoped lang="scss"></style>
