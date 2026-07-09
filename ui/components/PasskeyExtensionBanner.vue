<script setup>
import { useI18n } from "vue-i18n";

const props = defineProps({
  // Resolve the per-instance extension config (ID / Firefox URL) for this server.
  // null → app-wide defaults (no server context).
  serverId: { type: [String, Number], default: null },
  // Non-closable banners (e.g. the Passkey step) stay put and ignore the saved
  // "dismissed" flag so the operator always keeps both install links at hand.
  closable: { type: Boolean, default: true },
});

const { t } = useI18n();
const DISMISS_KEY = "passkey-extension-banner-dismissed";

const runtimeConfig = useRuntimeConfig();
const baseUrl = runtimeConfig.app?.baseURL || "/";

const { isFirefox, available, check, CHROME_STORE_URL, FIREFOX_STORE_URL } =
  usePasskeyExtension(props.serverId);
const dismissed = ref(localStorage.getItem(DISMISS_KEY) === "1");

onMounted(() => {
  check();
});

function dismiss() {
  dismissed.value = true;
  localStorage.setItem(DISMISS_KEY, "1");
}

// Show once we've confirmed the extension is missing (available === false, not
// null/still-checking) — on any browser, since we offer both store links.
// A closable banner also respects the saved dismissed flag; a pinned one doesn't.
const show = computed(
  () => available.value === false && (!props.closable || !dismissed.value),
);

// Offer both stores, but lead with the one matching the current browser.
const stores = computed(() => {
  const chrome = {
    key: "chrome",
    url: CHROME_STORE_URL.value,
    label: t("sessions.passkey.installChrome"),
    icon: `${baseUrl}icons/browsers/chrome.svg`,
    color: "#4285F4",
  };
  const firefox = {
    key: "firefox",
    url: FIREFOX_STORE_URL.value,
    label: t("sessions.passkey.installFirefox"),
    icon: `${baseUrl}icons/browsers/firefox.svg`,
    color: "#FF7139",
  };
  return isFirefox ? [firefox, chrome] : [chrome, firefox];
});
</script>

<template>
  <Message v-if="show" severity="info" @close="dismiss" :closable="closable">
    <div class="passkey-banner flex flex-column">
      <span>{{ t("sessions.passkey.bannerRecommend") }}</span>
      <div class="passkey-banner-actions">
        <a
          v-for="store in stores"
          :key="store.key"
          :href="store.url"
          target="_blank"
          rel="noopener"
          class="passkey-store-btn"
          :style="{ backgroundColor: store.color }"
        >
          <img :src="store.icon" :alt="store.label" class="passkey-store-btn-icon"/>
          <span>{{ store.label }}</span>
        </a>
      </div>
    </div>
  </Message>
</template>

<style scoped lang="scss">
.passkey-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.passkey-banner-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.passkey-store-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(1.08);
  }
}

.passkey-store-btn-icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
