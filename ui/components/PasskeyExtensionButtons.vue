<script setup>
import { useI18n } from "vue-i18n";

// Branded Chrome/Firefox install buttons for the WAHA Passkey extension, shared
// by the app banner (PasskeyExtensionBanner) and the Passkey step so both offer
// the same two stores with the same look, leading with the current browser.
const props = defineProps({
  // Resolve the per-instance extension config (ID / Firefox URL) for this server.
  // null → app-wide defaults (no server context).
  serverId: { type: [String, Number], default: null },
});

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const baseUrl = runtimeConfig.app?.baseURL || "/";

const { isFirefox, CHROME_STORE_URL, FIREFOX_STORE_URL } = usePasskeyExtension(props.serverId);

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
  <div class="passkey-store-buttons">
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
</template>

<style scoped lang="scss">
.passkey-store-buttons {
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
