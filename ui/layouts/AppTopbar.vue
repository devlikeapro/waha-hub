<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue';
import {useLayout} from './composables/layout';
import {useRouter} from 'vue-router';
import {useAsyncData} from "nuxt/app";
import {useServerStore} from "../stores/useServerStore";
import LanguageSelector from "../components/LanguageSelector.vue";

const { t } = useI18n();

const {layoutConfig, onMenuToggle} = useLayout();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const store = useServerStore();

onMounted(() => {
  bindOutsideClickListener();
});
onBeforeUnmount(() => {
  unbindOutsideClickListener();
});
const logoUrl = computed(() => {
  return `/dashboard/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value;
};

const onSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push('/utilities/documentation');
};

const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value
  };
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false;
      }
    };

    document.addEventListener('click', outsideClickListener.value);
  }
};

const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener);
    outsideClickListener.value = null;
  }
};

const isOutsideClicked = (event) => {
  if (!topbarMenuActive.value) return;
  const sidebarEl = document.querySelector('.layout-topbar-menu');
  const topbarEl = document.querySelector('.layout-topbar-menu-button');

  return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

function refreshServers() {
  useAsyncData('store', async () => await store.refresh())
}

function eventMonitor(){
  router.push('/event-monitor')
}

const languageSelector = ref(null);

const toggleLanguageSelector = (event) => {
  languageSelector.value.toggle(event);
};

const {refreshing} = storeToRefs(store)
</script>

<template>
  <div class="layout-topbar">
    <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
      <i class="pi pi-bars"></i>
    </button>

    <router-link to="/" class="layout-topbar-logo">
      <img class="mb-1" :src="logoUrl" alt="logo"/>
      <span>{{ t('topbar.logo') }}</span>
    </router-link>


    <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
      <i class="pi pi-ellipsis-v"></i>
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <button
          class="p-link layout-topbar-button"
          v-tooltip.bottom="t('topbar.language')"
          @click="toggleLanguageSelector($event)"
      >
        <i class="pi pi-globe" style="color: #38bdf8" ></i>
        <span>{{ t('topbar.language') }}</span>
      </button>
      <LanguageSelector ref="languageSelector" />
      <router-link
          to="/event-monitor"
          v-tooltip.bottom="t('menu.eventMonitor')"
          class="p-link layout-topbar-button">
        <i class="pi pi-eye" style="color: #459e74" ></i>
        <span>{{ t('menu.eventMonitor') }}</span>
      </router-link>
      <div class="m-auto">
        <RefreshIcon :refreshing="refreshing"/>
      </div>
      <button
          v-tooltip.bottom="t('topbar.refresh')"
          @click="refreshServers" class="p-link layout-topbar-button" :disabled="refreshing">
        <i class="pi pi-refresh"></i>
        <span>{{ t('topbar.refresh') }}</span>
      </button>
      <!--      <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">-->
      <!--        <i class="pi pi-user"></i>-->
      <!--        <span>Profile</span>-->
      <!--      </button>-->
      <!--            <button @click="onSettingsClick()" class="p-link layout-topbar-button">-->
      <!--                <i class="pi pi-cog"></i>-->
      <!--                <span>Settings</span>-->
      <!--            </button>-->
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
