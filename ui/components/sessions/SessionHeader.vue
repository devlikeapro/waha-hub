<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  session: Object,
  refresh: Boolean,
})
const store = useServerStore()
const {refreshing} = storeToRefs(store)

const server = computed(
    () => {
      if (props.session.server.id) {
        return props.session.server
      }
      return store.getServer(props.session.server)
    }
)
async function refreshServers() {
  await store.refresh()
}

async function copySessionName(event) {
  await navigator.clipboard.writeText(props.session?.name || '');
  if (event && event.preventDefault) {
    event.preventDefault();
  }
}

</script>

<template>
  <div class="p-dialog-title flex gap-2 align-items-center">
    <i class="pi pi-whatsapp"></i>
        <span>
          {{ session?.name }}
        </span>
        <Button
            text=""
            v-tooltip.focus.bottom="{ value: t('sessions.copiedToClipboard') }"
            :tabindex="0"
            icon="pi pi-copy"
            severity="secondary"
            @click="copySessionName($event)">
        </Button>
    <SessionStatusTag
        :status="session.status"
    ></SessionStatusTag>
    <div>
      <span>(</span>
      <ServerConnectionIcon :connected="server.connected"></ServerConnectionIcon>
      <span class="ml-1">{{ server.name }} </span>
      <span>)</span>
    </div>
    <button
        v-tooltip.top="t('sessions.refresh')"
        v-if="refresh"
        @click="refreshServers()" class="p-link layout-topbar-button" :disabled="refreshing">
      <i class="pi pi-refresh"></i>
    </button>
    <RefreshIcon :refreshing="refreshing"/>
  </div>
</template>

<style scoped lang="scss">

</style>
