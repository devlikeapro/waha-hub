<script setup>
import { useI18n } from 'vue-i18n';
import SessionHeader from './sessions/SessionHeader.vue';

const { t } = useI18n();
const props = defineProps(['session']);

const visible = ref(false);
const screenshot = ref(null)

const open = () => {
  visible.value = true;
};

const refreshScreenshot = () => {
  screenshot.value.refresh()
}
const disabled = computed(() => {
  if (props.session.status === "STOPPED") {
    return true
  }
  return false
})

</script>

<template>
  <Button
      v-tooltip.top="t('screenshot.screenshotQR')"
      :disabled="disabled"
      type="button"
      icon="pi pi-camera"
      @click="open"
      rounded
      outlined
      severity="help"
  />
  <Dialog
      v-model:visible="visible"
      :modal="true"
      :dismissableMask="true"
      style="min-width: 22rem; max-width: 90vw"
  >
    <template #header>
      <SessionHeader
          :session="session"
      ></SessionHeader>
    </template>
    <div class="flex justify-content-center align-items-center">
      <h5 class="m-0">{{ t('screenshot.screenshot') }}</h5>
      <RefreshButton @click="refreshScreenshot"></RefreshButton>
    </div>
    <div class="m-auto w-full">
      <SessionScreenshot
          ref="screenshot"
          :session="session"
      ></SessionScreenshot>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">

</style>
