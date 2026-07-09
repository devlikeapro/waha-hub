<script setup>
import SessionHeader from "./SessionHeader.vue";
import QRImage from "./QRImage.vue";
import PairingCodeSteps from "./PairingCodeSteps.vue";
import ScanQRCodeGuide from "./ScanQRCodeGuide.vue";
import PasskeySteps from "./PasskeySteps.vue";
import PasskeyExtensionBanner from "@/components/PasskeyExtensionBanner.vue";

const visible = defineModel("visible");
const props = defineProps(['session'])
const { t } = useI18n();

const PASSKEY_TAB_INDEX = 2;
const activeIndex = ref(0);

watch(
  () => props.session.status,
  async (status) => {
    if (status === "WORKING") {
      // Pairing finished — nothing left to do here.
      visible.value = false;
      return;
    }
    if (status === "PASSKEY_REQUIRED") {
      // Jump straight to the Passkey tab, whether the dialog was already
      // open (e.g. on the QR tab) or is about to be opened by SessionLogin.
      await nextTick(); // let the v-if'd tab render before switching to it
      activeIndex.value = PASSKEY_TAB_INDEX;
    }
  },
  { immediate: true },
);

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
    <PasskeyExtensionBanner :server-id="session.server.id"></PasskeyExtensionBanner>
    <TabView v-model:activeIndex="activeIndex">
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
      <TabPanel v-if="session.status === 'PASSKEY_REQUIRED'">
        <template #header>
          <i class="pi pi-key mr-2"></i>
          {{ t('sessions.passkey.tab') }}
        </template>
        <PasskeySteps :session="session"></PasskeySteps>
      </TabPanel>
    </TabView>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
