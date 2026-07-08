<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const DISMISS_KEY = "passkey-extension-banner-dismissed";

// App-wide banner: no single server context, so this uses the default extension
// ID / Firefox URL. The per-session Passkey step resolves the server-configured
// values (WAHA_DASHBOARD_PASSKEY_EXTENSION_*) when it runs.
const { isChrome, isFirefox, available, check, CHROME_STORE_URL, FIREFOX_STORE_URL } = usePasskeyExtension();
const dismissed = ref(localStorage.getItem(DISMISS_KEY) === "1");

onMounted(() => {
  check();
});

function dismiss() {
  dismissed.value = true;
  localStorage.setItem(DISMISS_KEY, "1");
}

// Chrome and Firefox both have a published extension; only show once we've
// actually confirmed it's missing (available === false, not null/still-checking).
const show = computed(() => (isChrome || isFirefox) && available.value === false && !dismissed.value);
const storeUrl = computed(() => (isFirefox ? FIREFOX_STORE_URL.value : CHROME_STORE_URL.value));
</script>

<template>
  <Message v-if="show" severity="info" @close="dismiss" :closable="true" class="m-3">
    {{ t("sessions.passkey.bannerRecommend") }}
    <a :href="storeUrl" target="_blank" rel="noopener" class="font-bold ml-2">
      {{ t("sessions.passkey.installExtension") }}
    </a>
  </Message>
</template>
