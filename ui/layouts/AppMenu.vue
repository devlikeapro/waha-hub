<script setup>
import {ref} from 'vue';
import AppMenuItem from './AppMenuItem.vue';
const { t } = useI18n()

const model = ref([
  {
    label: t('menu.home'),
    items: [
      {label: t('menu.dashboard') , icon: 'pi pi-fw pi-home', to: '/'},
      {label: t('menu.workers'), icon: 'pi pi-fw pi-server', to: '/workers'},
      {label: t('menu.sessions'), icon: 'pi pi-fw pi-whatsapp', to: '/sessions'},
      {label: t('menu.eventMonitor'), icon: 'pi pi-fw pi-eye', to: '/event-monitor'},
    ],
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
