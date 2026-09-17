<script setup>
import { useI18n } from 'vue-i18n';
import ApiKeyList from './ApiKeyList.vue';

const { t } = useI18n();
const visible = defineModel('visible');
const server = defineModel('server');

</script>

<template>
  <Dialog :dismissableMask="true"
    v-model:visible="visible"
    :modal="true"
    class="p-fluid"
    maximizable
    style="min-width: 50%;"
    :header="t('apiKeys.title')"
  >
    <ApiKeyList :server="server" />

    <template #footer>
      <div></div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
</style>
