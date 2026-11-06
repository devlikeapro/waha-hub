<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useProxyApi } from "../../../composables/useProxyApi";
import {
  bold,
  detailFor,
  seconds,
  useProxyCheck,
} from "../../../composables/useProxyCheck";
import IntegerInput from "../../common/IntegerInput.vue";
import StatusIcon from "../../common/StatusIcon.vue";
import ProxyCheckStep from "./ProxyCheckStep.vue";

const DEFAULT_URL = "wss://echo.websocket.org";
const DURATION_MAX_S = 600;

// Holds a WebSocket through the proxy - "wsIdle" (no ping) and "wsLong" (with keepalive) rows
const props = defineProps({
  server: String,
  sessionName: { type: String, default: null },
  proxy: Object,
  index: Number,
  running: Boolean,
  // i18n suffix: wsIdle | wsLong
  kind: String,
  // seconds; pingInterval 0 = nothing is sent, the connection stays idle
  defaultDuration: Number,
  defaultPingInterval: Number,
});
const { t } = useI18n();
const api = useProxyApi(props);
const url = ref(DEFAULT_URL);
const duration = ref(props.defaultDuration);
const pingInterval = ref(props.defaultPingInterval);

function body() {
  const request = {
    url: url.value,
    duration: duration.value * 1000,
    pingInterval: pingInterval.value * 1000,
  };
  if (props.proxy?.server) {
    request.proxy = props.proxy;
  }
  return request;
}

const check = useProxyCheck("websocket", api, body);
const { status, data, request, response, showDetails } = check;

// Count-up while the connection is held, in ms
const elapsed = ref(0);
let ticker = null;

function startTicker() {
  stopTicker();
  elapsed.value = 0;
  const started = Date.now();
  ticker = setInterval(() => {
    elapsed.value = Date.now() - started;
  }, 200);
}

function stopTicker() {
  if (ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}

onBeforeUnmount(stopTicker);

async function run() {
  startTicker();
  const finished = await check.run();
  if (finished) {
    stopTicker();
  }
  return finished;
}

function cancel() {
  stopTicker();
  check.cancel();
}

function clear() {
  stopTicker();
  check.clear();
}

/**
 * Back to the defaults, on reopen; Run only clears the results
 */
function reset() {
  url.value = DEFAULT_URL;
  duration.value = props.defaultDuration;
  pingInterval.value = props.defaultPingInterval;
  clear();
}

const detail = computed(() =>
  detailFor(
    t,
    check,
    props.kind,
    (result) =>
      t(`sessions.proxyChecks.${props.kind}Ok`, {
        s: bold(
          t("sessions.proxyChecks.seconds", { s: seconds(result.duration) })
        ),
      }),
    () => ({
      s: bold(t("sessions.proxyChecks.seconds", { s: seconds(elapsed.value) })),
    })
  )
);

// Milestones under the row: connected, half way, the end - read off the count-up while running, off the time
// alive once the probe answered
const milestones = computed(() => {
  const half = Math.round(duration.value / 2);
  return [...new Set([0, half, duration.value])];
});

function milestoneStatus(index) {
  const marks = milestones.value;
  const ms = marks[index] * 1000;
  const previous = index === 0 ? 0 : marks[index - 1] * 1000;
  switch (status.value) {
    case "running": {
      if (elapsed.value >= ms) return "ok";
      return elapsed.value >= previous ? "running" : "pending";
    }
    case "ok":
      return "ok";
    case "fail": {
      // The milestone the connection died in is the failed one, the later ones never started;
      // no duration at all means the handshake failed, so even "connected" is red
      const alive = data.value?.duration;
      if (alive === null || alive === undefined) {
        return index === 0 ? "fail" : "pending";
      }
      if (alive >= ms) return "ok";
      return alive >= previous ? "fail" : "pending";
    }
    default:
      return status.value;
  }
}

/**
 * The milestone being approached counts up from the live elapsed time, the others show their mark
 */
function milestoneLabel(index) {
  let s = milestones.value[index];
  if (milestoneStatus(index) === "running") {
    s = seconds(elapsed.value);
  }
  return t("sessions.proxyChecks.seconds", { s: s });
}

defineExpose({
  key: props.kind,
  run: run,
  clear: clear,
  reset: reset,
  cancel: cancel,
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
      <InputText
        v-model.trim="url"
        class="p-inputtext-sm flex-1"
        style="min-width: 0"
        :disabled="running"
      />
      <IntegerInput
        v-model="duration"
        v-tooltip="t('sessions.proxyChecks.wsDuration')"
        :min="1"
        :max="DURATION_MAX_S"
        suffix=" s"
        class="w-auto p-inputtext-sm"
        :inputStyle="{ width: '4.5rem' }"
        :disabled="running"
      />
      <IntegerInput
        v-model="pingInterval"
        v-tooltip="t('sessions.proxyChecks.wsPingInterval')"
        :min="0"
        :max="DURATION_MAX_S"
        suffix=" s"
        class="w-auto p-inputtext-sm"
        :inputStyle="{ width: '4.5rem' }"
        :disabled="running"
      />
    </template>
    <Timeline :value="milestones" layout="horizontal" align="top" class="mt-2">
      <template #marker="{ index: milestone }">
        <StatusIcon :status="milestoneStatus(milestone)" />
      </template>
      <template #content="{ index: milestone }">
        <span class="text-sm white-space-nowrap">{{
          milestoneLabel(milestone)
        }}</span>
      </template>
    </Timeline>
  </ProxyCheckStep>
</template>

<style scoped lang="scss"></style>
