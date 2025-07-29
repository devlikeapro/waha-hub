<script setup>
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
</script>

<template>
  <ul class="pl-4">
    <li>
      <i18n-t keypath="sessions.guide.qr.openWhatsApp">
        <template v-slot:app>
          <b>WhatsApp</b>
        </template>
      </i18n-t>
    </li>
    <li>
      <i18n-t keypath="sessions.guide.qr.tapMoreOptions">
        <template v-slot:options>
          <b>{{ t('whatsapp.MoreOptions') }}</b> <i class="pi pi-ellipsis-v"></i>
        </template>
        <template v-slot:settings>
          <b>{{ t('whatsapp.Settings') }}</b> <i class="pi pi-cog"></i>
        </template>
      </i18n-t>
    </li>
    <li>
      <i18n-t keypath="sessions.guide.qr.tapLinkedDevices">
        <template v-slot:linkedDevices>
          <b>{{ t('whatsapp.LinkedDevices') }}</b>
        </template>
        <template v-slot:linkDevice>
          <b>{{ t('whatsapp.LinkADevice') }}</b>
        </template>
      </i18n-t>
    </li>
    <li>
      <i18n-t keypath="sessions.guide.qr.pointPhone">
        <template v-slot:qrCode>
          <b>{{ t('sessions.qr') }}</b>
        </template>
      </i18n-t>
    </li>
  </ul>
</template>

<style scoped lang="scss">

</style>
