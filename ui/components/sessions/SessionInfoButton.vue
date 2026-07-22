<script setup>
import {useI18n} from 'vue-i18n';
import SessionInfo from "./SessionInfo.vue";

const {t} = useI18n();
const props = defineProps(['session']);

const op = ref(null);
const info = ref(null)

const toggle = (event) => {
  op.value.toggle(event);
};

const refreshInfo = () => {
  info.value?.refresh()
}
</script>

<template>
  <Button
      v-tooltip.top="t('sessions.info')"
      type="button"
      icon="pi pi-id-card"
      @click="toggle"
      rounded
      outlined
      severity="secondary"
  />
  <OverlayPanel ref="op" appendTo="body" :showCloseIcon="true" @show="refreshInfo">
    <div style="min-width: 20rem; max-width: 40rem; max-height: 70vh; overflow: auto;">
      <SessionInfo
          ref="info"
          :session="session"
      ></SessionInfo>
    </div>
  </OverlayPanel>
</template>

<style scoped lang="scss">

</style>
