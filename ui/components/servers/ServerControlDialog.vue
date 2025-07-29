<script setup>
import {useI18n} from 'vue-i18n';

const { t } = useI18n();
const visible = defineModel("visible");
const props = defineProps(['server'])

</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      class="p-fluid"
      style="max-width: 100%; min-width: 50%"
      :header="t('servers.server')"
  >
    <h4>{{ server.name }}</h4>
    <ServerStatus :server="props.server"></ServerStatus>

    <h4>{{ t('servers.variables') }}</h4>
    <ServerVariablesTable :server="props.server"></ServerVariablesTable>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
