<script setup>
import { useI18n } from "vue-i18n";
import { sleep } from "../../services/utils";

const { t } = useI18n();

// WAHA Passkey Assistant extension. Stateless: it only signs a WebAuthn
// challenge on the whatsapp.com origin and hands back the assertion; this
// page still owns fetching the challenge and submitting the result (same as
// the manual flow).
//
// Two browser families, two bridges:
// - Chrome/Chromium (bergpinheiro/waha-passkey-extension): a page calls
//   chrome.runtime.sendMessage(EXTENSION_ID, ...) directly, exposed via the
//   extension's externally_connectable.
// - Firefox (bergpinheiro/waha-passkey-extension-firefox): Firefox doesn't
//   support that for web pages, so its content script bridges via
//   window.postMessage instead (no extension ID needed on this side).
// Detection (ping) is shared app-wide via usePasskeyExtension — it already ran when the
// dashboard loaded (see PasskeyExtensionBanner.vue), so extensionAvailable is normally
// already resolved by the time this step shows up.
const store = useServerStore();
const toast = useToast();
// preview = the session hasn't asked for a passkey yet, so the steps below the
// dialog show blocked as a preview. In that mode we skip fetching a challenge
// (the server would reject it) and just render the whole flow at once.
const props = defineProps({
  session: Object,
  preview: { type: Boolean, default: false },
});

const {
  isChrome,
  isFirefox,
  available: extensionAvailable,
  check: checkExtension,
  EXTENSION_ID,
} = usePasskeyExtension(props.session.server.id);

const pasted = ref("");
const submitting = ref(false);
const submitError = ref("");
const submitted = ref(false);
const copied = ref(false);
const showManual = ref(false);

const signingWithExtension = ref(false);

const confirmationCode = ref(null);
const confirming = ref(false);
const confirmed = ref(false);

const {
  data: challenge,
  pending,
  error,
  refresh: refreshChallenge,
} = useAsyncData(
  `session-passkey-${props.session.server.id}-${props.session.name}`,
  async () => {
    await sleep(300);
    return await store.getPasskeyChallenge(props.session.server.id, props.session.name);
  },
  { immediate: false }
);

onMounted(() => {
  checkExtension();
  if (!props.preview) refreshChallenge();
});

// Once the session actually needs a passkey, drop out of preview and fetch the
// real challenge.
watch(
  () => props.preview,
  (preview) => {
    if (!preview && !challenge.value) refreshChallenge();
  }
);

function signWithExtension(challengeValue) {
  if (window.chrome?.runtime?.sendMessage) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        EXTENSION_ID.value,
        { type: "waha-passkey-sign", challenge: challengeValue },
        (resp) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          if (!resp?.ok) return reject(new Error(resp?.error || t("sessions.passkey.errorSignFailed")));
          resolve(resp.assertion);
        }
      );
    });
  }
  // Firefox
  return callFirefoxExtension("waha-passkey-sign", challengeValue).then((data) => data.assertion);
}

// Firefox bridge: bergpinheiro/waha-passkey-extension-firefox's content
// script listens for this exact postMessage shape and relays it to the
// extension's background, then posts the response back the same way. No
// extension ID needed here — window.postMessage to our own window is picked
// up by whichever compatible content script is present.
function callFirefoxExtension(type, challenge, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const requestId = (crypto.randomUUID && crypto.randomUUID()) || String(Math.random());
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(t("sessions.passkey.errorNoResponse")));
    }, timeoutMs);
    function onMessage(event) {
      if (event.source !== window) return;
      const data = event.data;
      if (data?.source !== "waha-passkey-extension" || data.requestId !== requestId) return;
      cleanup();
      if (!data.ok) return reject(new Error(data.error || t("sessions.passkey.errorSignFailed")));
      resolve(data);
    }
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
    }
    window.addEventListener("message", onMessage);
    window.postMessage({ source: "waha-passkey-page", requestId, type, challenge }, window.location.origin);
  });
}

async function signAndSubmitWithExtension() {
  submitError.value = "";
  signingWithExtension.value = true;
  try {
    const assertion = await signWithExtension(challenge.value);
    await submitAssertion(assertion);
  } catch (e) {
    submitError.value = e?.message || String(e);
  } finally {
    signingWithExtension.value = false;
  }
}

// The script the operator pastes into the web.whatsapp.com DevTools console —
// manual fallback for when the extension isn't installed. Runs
// navigator.credentials.get on the whatsapp.com origin (the only place the
// browser allows rpId=whatsapp.com), behind a click for the user gesture.
// Localized labels are injected as JSON string literals so translations with
// quotes/special chars can't break the generated script.
const script = computed(() => {
  if (!challenge.value) return "";
  const opts = JSON.stringify(challenge.value);
  const L = {
    sign: JSON.stringify(t("sessions.passkey.scriptButtonSign")),
    signing: JSON.stringify(t("sessions.passkey.scriptSigning")),
    result: JSON.stringify(t("sessions.passkey.scriptResult")),
    done: JSON.stringify(t("sessions.passkey.scriptDone")),
  };
  return `(async () => {
  const optionsJSON = ${opts};
  const pk = PublicKeyCredential.parseRequestOptionsFromJSON(optionsJSON);
  const btn = document.createElement('button');
  btn.textContent = ${L.sign};
  btn.style.cssText = 'position:fixed;top:24px;left:24px;z-index:2147483647;padding:16px 24px;font-size:16px;background:#25D366;color:#fff;border:0;border-radius:8px;cursor:pointer';
  document.body.appendChild(btn);
  btn.onclick = async () => {
    btn.textContent = ${L.signing};
    try {
      const cred = await navigator.credentials.get({ publicKey: pk });
      const result = JSON.stringify(cred.toJSON());
      try { await navigator.clipboard.writeText(result); } catch (e) {}
      console.log('%c' + ${L.result}, 'color:#25D366;font-weight:bold');
      console.log(result);
      btn.textContent = ${L.done};
    } catch (e) {
      btn.textContent = '❌ ' + (e && e.message || e);
      btn.style.background = '#c0392b';
    }
  };
})();`;
});

async function copyScript() {
  // No challenge yet → nothing to copy; explain why instead of silently failing.
  if (!script.value) {
    toast.add({
      severity: "warn",
      summary: t("sessions.passkey.tab"),
      detail: t("sessions.passkey.noChallenge"),
      life: 6000,
    });
    return;
  }
  try {
    await navigator.clipboard.writeText(script.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (e) {
    /* ignore */
  }
}

async function submitAssertion(assertion) {
  submitting.value = true;
  try {
    await store.submitPasskey(props.session.server.id, props.session.name, assertion);
    submitted.value = true;
    pollPasskeyConfirmation();
  } catch (e) {
    submitError.value =
      e?.cause?.response?.data?.message || e?.message || String(e);
  } finally {
    submitting.value = false;
  }
}

// The manual confirmation-code case is rare — most pairings auto-confirm
// server-side right after the assertion is submitted, without any extra step.
// Poll briefly for a pending code instead of adding a new webhook/websocket
// dependency just for this corner case.
async function pollPasskeyConfirmation(attempts = 8, intervalMs = 1000) {
  for (let i = 0; i < attempts; i++) {
    await sleep(intervalMs);
    try {
      const confirmation = await store.getPasskeyConfirmation(
        props.session.server.id,
        props.session.name,
      );
      if (confirmation?.code) {
        confirmationCode.value = confirmation.code;
        return;
      }
    } catch (e) {
      return; // best-effort — give up quietly
    }
  }
}

async function confirmPasskeyCode() {
  confirming.value = true;
  try {
    await store.confirmPasskey(props.session.server.id, props.session.name);
    confirmed.value = true;
    confirmationCode.value = null;
  } catch (e) {
    submitError.value =
      e?.cause?.response?.data?.message || e?.message || String(e);
  } finally {
    confirming.value = false;
  }
}

async function submitPasted() {
  submitError.value = "";
  try {
    const assertion = JSON.parse(pasted.value.trim());
    await submitAssertion(assertion);
  } catch (e) {
    submitError.value = e?.message || String(e);
  }
}
</script>

<template>
  <div style="min-width: 22rem; max-width: 42rem; margin: 0 auto">
    <Message v-if="!preview" severity="warn" :closable="false">
      {{ t("sessions.passkey.requires") }}
    </Message>

    <ProgressBar
      v-if="pending && !preview"
      mode="indeterminate"
      style="height: 3px"
    ></ProgressBar>
    <pre
      v-else-if="error && !preview"
      style="color: red; white-space: pre-wrap"
    >{{ error.cause?.response?.data?.message || error }}</pre>

    <template v-else-if="challenge || preview">
      <Message v-if="submitError" severity="error" :closable="false">{{
        submitError
      }}</Message>
      <Message v-if="submitted && !confirmationCode" severity="success" :closable="false">
        {{ t("sessions.passkey.submitted") }}
      </Message>

      <template v-if="confirmationCode && !confirmed">
        <Message severity="warn" :closable="false">
          {{ t("sessions.passkey.confirmHint") }}
        </Message>
        <p style="font-size: 1.5rem; font-weight: bold; letter-spacing: 0.1em; text-align: center">
          {{ confirmationCode }}
        </p>
        <Button
          :label="t('sessions.passkey.confirmCode')"
          icon="pi pi-check"
          :loading="confirming"
          @click="confirmPasskeyCode"
        />
      </template>

      <Message v-if="confirmed" severity="success" :closable="false">
        {{ t("sessions.passkey.confirmed") }}
      </Message>

      <template v-if="!submitted">
        <!-- Preview: show the one-click extension button so the whole flow is
             visible at once. It's inert here (the dialog blocks it). -->
        <Button
          v-if="preview"
          :label="t('sessions.passkey.signWithPasskey')"
          icon="pi pi-key"
        />
        <template v-else-if="extensionAvailable === true">
          <p>{{ t("sessions.passkey.extensionDetected") }}</p>
          <Button
            :label="t('sessions.passkey.signWithPasskey')"
            icon="pi pi-key"
            :loading="signingWithExtension || submitting"
            @click="signAndSubmitWithExtension"
          />
          <div class="mt-3">
            <a href="#" class="text-sm" @click.prevent="showManual = !showManual">
              {{ showManual ? t("sessions.passkey.manualHide") : t("sessions.passkey.manualShow") }}
            </a>
          </div>
        </template>
        <template v-else-if="extensionAvailable === false && (isChrome || isFirefox)">
          <!-- Install prompt lives above BlockUI (SessionLoginDialog) so it shows
               before the session is ready; here we only offer the manual fallback. -->
          <div class="mt-3">
            <a href="#" class="text-sm" @click.prevent="showManual = !showManual">
              {{ showManual ? t("sessions.passkey.manualHide") : t("sessions.passkey.manualShow") }}
            </a>
          </div>
        </template>
        <p v-else-if="extensionAvailable === false">
          {{ t("sessions.passkey.noInstallNeeded") }}
        </p>

        <template v-if="!preview && (showManual || (extensionAvailable === false && !isChrome && !isFirefox))">
          <ol style="line-height: 1.8; padding-left: 1.2rem">
            <li v-html="t('sessions.passkey.manualStep1')"></li>
            <li v-html="t('sessions.passkey.manualStep2')"></li>
            <li v-html="t('sessions.passkey.manualStep3')"></li>
            <li v-html="t('sessions.passkey.manualStep4')"></li>
            <li v-html="t('sessions.passkey.manualStep5')"></li>
          </ol>

          <Button
            :label="copied ? t('sessions.passkey.copied') : t('sessions.passkey.copyScript')"
            :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
            severity="secondary"
            @click="copyScript"
            class="mb-3"
          />

          <label class="block mb-1 mt-2">{{ t("sessions.passkey.resultLabel") }}</label>
          <Textarea
            v-model="pasted"
            rows="4"
            class="w-full"
            placeholder='{"id":"...","rawId":"...","type":"public-key","response":{...}}'
          />

          <Button
            :label="t('sessions.passkey.send')"
            icon="pi pi-send"
            :loading="submitting"
            :disabled="!pasted"
            @click="submitPasted"
            class="mt-2"
          />
        </template>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss"></style>
