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

const { available, check } = usePasskeyExtension(props.serverId);
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
</script>

<template>
  <Message v-if="show" severity="info" @close="dismiss" :closable="closable">
    <div class="passkey-banner flex flex-column">
      <span v-html="t('sessions.passkey.bannerRecommend')"></span>
      <PasskeyExtensionButtons :server-id="serverId"/>
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
</style>
