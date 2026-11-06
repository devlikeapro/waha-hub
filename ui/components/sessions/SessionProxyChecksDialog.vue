<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import StatusIcon from "../common/StatusIcon.vue";
import ProxyCheckConfig from "./proxy/ProxyCheckConfig.vue";
import ProxyCheckConnect from "./proxy/ProxyCheckConnect.vue";
import ProxyCheckExitIp from "./proxy/ProxyCheckExitIp.vue";
import ProxyCheckHttp from "./proxy/ProxyCheckHttp.vue";
import ProxyCheckWebSocket from "./proxy/ProxyCheckWebSocket.vue";
import SessionProxyFields from "./SessionProxyFields.vue";

const { t } = useI18n();

const visible = defineModel("visible");
const props = defineProps({
  server: String,
  // null for a session that is not created yet - the /api/proxy endpoints are used then
  sessionName: { type: String, default: null },
  // The proxy as typed in the form, null when the toggle is off
  proxy: Object,
  // Show the proxy inputs inside the modal - to check any proxy from a worker, with no session involved
  editable: { type: Boolean, default: false },
  // Shown in the header, the session name by default
  subject: { type: String, default: null },
  // Start the checks as soon as the modal opens
  autoRun: { type: Boolean, default: true },
});

// The proxy the checks run with: the one typed into the modal when editable, else the one from the session form
const proxyForm = ref({ ...props.proxy });
const proxyConfig = computed(() =>
  props.editable ? proxyForm.value : props.proxy
);

// The checks, in the order they run (template order)
const checkConfig = ref(null);
const checkConnect = ref(null);
const checkServer = ref(null);
const checkWhatsApp = ref(null);
const checkExitIp = ref(null);
const checkWsIdle = ref(null);
const checkWsLong = ref(null);

function checks() {
  return [
    checkConfig,
    checkConnect,
    checkServer,
    checkWhatsApp,
    checkExitIp,
    checkWsIdle,
    checkWsLong,
  ]
    .map((check) => check.value)
    .filter(Boolean);
}

const running = ref(false);
const stopped = ref(false);
// A run still waiting on the server (the WebSocket checks take minutes) must not touch a newer one
let runId = 0;

/**
 * The dialog renders its content on the next tick, the checks exist only after that
 */
async function open() {
  await nextTick();
  reset();
  // Nothing to run yet when the proxy is typed into the modal
  if (props.autoRun && !props.editable) {
    runAll();
  }
}

// onMounted: the table mounts the modal already visible
onMounted(() => {
  if (visible.value) open();
});
watch(visible, (value) => {
  if (value) open();
});

/**
 * Clean slate, the typed proxy included; a run still waiting on the server is abandoned
 */
function reset() {
  runId += 1;
  running.value = false;
  stopped.value = false;
  proxyForm.value = { ...props.proxy };
  checks().forEach((check) => check.reset());
}

/**
 * The server finishes the current probe on its own, the modal just stops listening
 */
function stop() {
  runId += 1;
  running.value = false;
  stopped.value = true;
  checks().forEach((check) => check.cancel());
}

async function runAll() {
  const id = ++runId;
  // Results only - the urls and durations typed into the rows stay
  checks().forEach((check) => check.clear());
  running.value = true;
  stopped.value = false;
  try {
    for (const check of checks()) {
      const finished = await check.run();
      if (id !== runId || !finished) return;
      // No proxy to check (422), no session, no rights - nothing else can run
      if (check.key === "config" && check.status === "fail") return;
    }
  } finally {
    if (id === runId) running.value = false;
  }
}

// Overall verdict under the run button
const summary = computed(() => {
  const statuses = checks().map((check) => check.status);
  if (running.value || statuses.includes("running")) {
    return { status: "running", text: "sessions.proxyChecks.summaryRunning" };
  }
  // 422 from the config check says why in one line (no proxy on the session, no proxy in the body)
  const config = checkConfig.value;
  if (config?.status === "fail" && config.httpStatus === 422) {
    return { status: "fail", label: config.error };
  }
  if (statuses.includes("fail")) {
    return { status: "fail", text: "sessions.proxyChecks.summaryFail" };
  }
  if (statuses.length > 0 && statuses.every((status) => status === "ok")) {
    return { status: "ok", text: "sessions.proxyChecks.summaryOk" };
  }
  if (stopped.value) {
    return { status: "pending", text: "sessions.proxyChecks.summaryStopped" };
  }
  return { status: "pending", text: "sessions.proxyChecks.summaryNotRun" };
});

function hide() {
  visible.value = false;
}
</script>

<template>
  <Dialog
    :dismissableMask="true"
    v-model:visible="visible"
    :modal="true"
    class="p-fluid"
    style="min-width: 25%; max-width: 50%"
    maximizable
  >
    <template #header>
      <h3>
        🌐 {{ t("sessions.proxyChecks") }}
        <template v-if="subject ?? sessionName">
          - {{ subject ?? sessionName }}
        </template>
      </h3>
    </template>

    <p class="text-500 mt-0" style="white-space: pre-line">
      {{
        t(
          editable
            ? "sessions.proxyChecks.aboutWorker"
            : "sessions.proxyChecks.about"
        )
      }}
    </p>
    <div v-if="editable" class="card mb-3">
      <SessionProxyFields v-model:proxy="proxyForm" :disabled="running" />
    </div>
    <!-- w-auto: p-fluid stretches buttons to the full line -->
    <div class="flex justify-content-center gap-2 mb-3">
      <Button
        :label="t('sessions.proxyChecks.run')"
        icon="pi pi-play"
        severity="success"
        class="w-auto"
        :disabled="running || (editable && !proxyForm.server)"
        @click="runAll"
      />
      <Button
        :label="t('sessions.proxyChecks.stop')"
        icon="pi pi-stop"
        severity="secondary"
        outlined
        class="w-auto"
        :disabled="!running"
        @click="stop"
      />
    </div>
    <div class="flex justify-content-center align-items-center gap-2 mb-3">
      <StatusIcon :status="summary.status" />
      <span
        :class="{
          'text-green-500': summary.status === 'ok',
          'text-pink-500': summary.status === 'fail',
        }"
        >{{ summary.label ?? t(summary.text) }}</span
      >
    </div>

    <ProxyCheckConfig
      ref="checkConfig"
      :index="1"
      :server="server"
      :session-name="sessionName"
      :proxy="proxyConfig"
    />
    <ProxyCheckConnect
      ref="checkConnect"
      :index="2"
      :server="server"
      :session-name="sessionName"
      :proxy="proxyConfig"
      :proxy-url="checkConfig?.data?.url ?? null"
    />
    <ProxyCheckHttp
      ref="checkServer"
      :index="3"
      kind="server"
      default-url="https://www.google.com/"
      :server="server"
      :session-name="sessionName"
      :proxy="proxyConfig"
      :running="running"
    />
    <ProxyCheckHttp
      ref="checkWhatsApp"
      :index="4"
      kind="whatsapp"
      default-url="https://web.whatsapp.com/"
      :server="server"
      :session-name="sessionName"
      :proxy="proxyConfig"
      :running="running"
    />
    <ProxyCheckExitIp
      ref="checkExitIp"
      :index="5"
      :server="server"
      :session-name="sessionName"
      :proxy="proxyConfig"
      :running="running"
    />
    <ProxyCheckWebSocket
      ref="checkWsIdle"
      :index="6"
      kind="wsIdle"
      :default-duration="40"
      :default-ping-interval="0"
      :server="server"
      :session-name="sessionName"
      :proxy="proxyConfig"
      :running="running"
    />
    <ProxyCheckWebSocket
      ref="checkWsLong"
      :index="7"
      kind="wsLong"
      :default-duration="300"
      :default-ping-interval="30"
      :server="server"
      :session-name="sessionName"
      :proxy="proxyConfig"
      :running="running"
    />

    <template #footer>
      <Button
        :label="t('common.close')"
        icon="pi pi-times"
        text
        severity="secondary"
        @click="hide"
      />
    </template>
  </Dialog>
</template>

<style scoped lang="scss"></style>
