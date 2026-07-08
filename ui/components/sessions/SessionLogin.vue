<script setup>
import SessionLoginDialog from "./SessionLoginDialog.vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const props = defineProps(['session']);
const showDialog = ref(false);

// Surface the login dialog automatically as soon as passkey confirmation is
// needed — regardless of what the operator was doing (e.g. watching the QR
// via the separate Screenshot button, which has no passkey awareness of its
// own). SessionLoginDialog.vue switches itself to the Passkey tab.
watch(
  () => props.session.status,
  (status) => {
    if (status === "PASSKEY_REQUIRED") {
      showDialog.value = true;
    }
  },
);

</script>

<template>
  <Button
      icon="pi pi-sign-in"
      v-tooltip.top="t('sessions.login')"
      severity=""
      rounded
      outlined
      @click="showDialog = true"
      :disabled="!['SCAN_QR_CODE', 'PASSKEY_REQUIRED'].includes(session.status)"
  />
  <SessionLoginDialog
      v-model:visible="showDialog"
      :session="session"
  />
</template>

<style scoped lang="scss">

</style>
