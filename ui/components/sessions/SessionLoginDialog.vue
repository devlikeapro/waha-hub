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

const QR_TAB_INDEX = 0;
const CODE_TAB_INDEX = 1;
const PASSKEY_TAB_INDEX = 2;
const activeIndex = ref(0);

// Detect the extension at the dialog level so the "not detected + install"
// prompt can sit outside BlockUI on the Passkey tab — visible before the
// session asks for a passkey, so operators can install early.
const {
  isChrome,
  isFirefox,
  available: extensionAvailable,
  check: checkExtension,
} = usePasskeyExtension(props.session.server.id);

onMounted(() => {
  checkExtension();
});

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
      await nextTick(); // let the dialog/tabs render before switching to it
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
      <TabPanel>
        <template #header>
          <i class="pi pi-key mr-2"></i>
          {{ t('sessions.passkey.tab') }}
        </template>
        <!-- Always rendered so the steps are visible up front, but inert until
             the session actually asks for a passkey. -->
        <Message
          v-if="session.status !== 'PASSKEY_REQUIRED'"
          severity="warn"
          :closable="false"
        >
          <i18n-t keypath="sessions.passkey.scanFirst" tag="span">
            <template #scanQR>
              <a href="#" class="passkey-tab-link" @click.prevent="activeIndex = QR_TAB_INDEX">
                <i class="pi pi-qrcode mr-1"></i>{{ t('sessions.scanQRTab') }}
              </a>
            </template>
            <template #enterCode>
              <a href="#" class="passkey-tab-link" @click.prevent="activeIndex = CODE_TAB_INDEX">
                <i class="pi pi-send mr-1"></i>{{ t('sessions.enterCodeTab') }}
              </a>
            </template>
            <template #passkey>
              <a href="#" class="passkey-tab-link" @click.prevent="activeIndex = PASSKEY_TAB_INDEX">
                <i class="pi pi-key mr-1"></i>{{ t('sessions.passkey.tab') }}
              </a>
            </template>
          </i18n-t>
        </Message>
        <!-- Install prompt kept outside BlockUI so operators can install the
             extension early, before the session is ready for a passkey. -->
        <template v-if="extensionAvailable === false && (isChrome || isFirefox)">
          <Message severity="info" :closable="false">
            {{ t('sessions.passkey.extensionNotDetected') }}
          </Message>
          <div class="flex justify-content-center mb-3">
            <PasskeyExtensionButtons :server-id="session.server.id"/>
          </div>
        </template>
        <BlockUI :blocked="session.status !== 'PASSKEY_REQUIRED'" class="py-3">
          <PasskeySteps
              :session="session"
              :preview="session.status !== 'PASSKEY_REQUIRED'"
          ></PasskeySteps>
        </BlockUI>
      </TabPanel>
    </TabView>
  </Dialog>

</template>

<style scoped lang="scss">
.passkey-tab-link {
  font-weight: 700;
  text-decoration: underline;
  white-space: nowrap;
  cursor: pointer;
}
</style>
