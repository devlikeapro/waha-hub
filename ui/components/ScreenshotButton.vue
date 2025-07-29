<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps(['session']);

const op = ref(null);
const screenshot = ref(null)

const toggle = (event) => {
  op.value.toggle(event);
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
      @click="toggle"
      rounded
      outlined
      severity="help"
  />
  <OverlayPanel ref="op" appendTo="body" :showCloseIcon="true">
    <div class="" style="min-width:20rem;">
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
    </div>
  </OverlayPanel>
</template>

<style scoped lang="scss">

</style>
