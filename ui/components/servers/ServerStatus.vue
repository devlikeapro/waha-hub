<script setup>
import {dashboard} from "../../services/utils";
import {useI18n} from 'vue-i18n';

const { t } = useI18n();
const props = defineProps(['server'])
const store = useServerStore()
const isNewVersionAvailable = computed(() => {
  return props.server.version?.version !== store.latestVersion
})
</script>

<template>
  <div class="p-3 flex flex-column gap-2">
    <div class="flex gap-2">
      <div>
        {{ t('servers.status') }}
      </div>
      <div class="flex flex-column gap-1">
        <div>
          <ServerConnectionIcon class="mr-1" :connected="server.connected"></ServerConnectionIcon>
          <span> <b>
            <template v-if="server.connected">
            {{ t('servers.statusConnected') }}
            </template>
            <template v-else>
            {{ t('servers.disconnected') }}
            </template>
          </b> </span>
        </div>
      </div>
    </div>

    <div class="flex gap-1">
      <div>
        {{ t('servers.apiUrl') }}
      </div>
      <div>
        <a :href="server.connection?.url" target="_blank" class="ml-2">{{ server.connection?.url }}
          <i class="pi pi-external-link"></i>
        </a>
      </div>
    </div>

    <div class="flex gap-1">
      <div>
        {{ t('servers.dashboardUrl') }}
      </div>
      <div>
        <a :href="dashboard(server.connection?.url)" target="_blank" class="ml-2">{{ dashboard(server.connection?.url) }}
          <i class="pi pi-external-link"></i>
        </a>
      </div>
    </div>

    <div class="flex gap-2">
      <div>
        {{ t('servers.engine') }}
      </div>
      <div>
        <code>
          {{ server.version?.engine }}
        </code>
      </div>
    </div>

    <div class="flex gap-2">
      <div>
        {{ t('servers.version') }}
      </div>
      <div>
        <code
            :class="{
            'text-orange-400': isNewVersionAvailable,
          }"
        >
          {{ server.version?.version }}
        </code>
        <template v-if="!isNewVersionAvailable">
            <span class="text-green-500 font-medium ml-2">
              <i class="pi text-green-500 pi-check-circle"></i>
              {{ t('servers.upToDate') }}
            </span>
        </template>
      </div>
    </div>

    <div class="flex gap-2">
      <div>
        {{ t('servers.uptime') }}
      </div>
      <div v-if="server.status">
        <ServerUptime
            :status="server.status"
        />
      </div>
    </div>

    <InlineMessage
        v-if="isNewVersionAvailable"
        severity="info">
      {{ t('servers.newVersionAvailable') }}
      <span class="text-900 font-medium">
              <a href="https://waha.devlike.pro/docs/overview/changelog/" target="_blank">
                {{ store.latestVersion }}
                <i class="pi pi-external-link"></i>
              </a>
              </span>
      {{ t('servers.versionAvailable') }}
    </InlineMessage>
  </div>

</template>

<style scoped lang="scss">

</style>
