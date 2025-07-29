<script setup>
import SessionLoginDialog from "./SessionLoginDialog.vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const props = defineProps(['session']);
const showDialog = ref(false);

</script>

<template>
  <Button
      icon="pi pi-sign-in"
      v-tooltip.top="t('sessions.login')"
      severity=""
      rounded
      outlined
      @click="showDialog = true"
      :disabled="session.status!=='SCAN_QR_CODE'"
  />
  <SessionLoginDialog
      v-model:visible="showDialog"
      :session="session"
  />
</template>

<style scoped lang="scss">

</style>
