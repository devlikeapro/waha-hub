<script setup>
import SessionHeader from "./SessionHeader.vue";
import QRImage from "./QRImage.vue";
import PairingCodeSteps from "./PairingCodeSteps.vue";
import ScanQRCodeGuide from "./ScanQRCodeGuide.vue";

const visible = defineModel("visible");
const props = defineProps(['session'])
const { t } = useI18n();

</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      class="p-fluid"
      maximizable
  >
    <template #header>
      <SessionHeader
          :session="session"
      ></SessionHeader>
    </template>
    <TabView>
      <TabPanel>
        <template #header>
          <i class="pi pi-qrcode mr-2"></i>
          {{ t('sessions.scanQRTab') }}
        </template>
        <i18n-t keypath="sessions.scanQRCode" tag="p">
          <template v-slot:qr>
            <b>{{ t('sessions.qr') }}</b>
          </template>
        </i18n-t>
        <ScanQRCodeGuide/>
        <div>
          <QRImage :session="session"></QRImage>
        </div>
      </TabPanel>
      <TabPanel>
        <template #header>
          <i class="pi pi-send mr-2"></i>
          {{ t('sessions.enterCodeTab') }}
        </template>
        <p v-html="t('sessions.enterPhoneNumber')" class="m-0"></p>
        <div>
          <PairingCodeSteps :session="session"></PairingCodeSteps>
        </div>
      </TabPanel>
    </TabView>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
