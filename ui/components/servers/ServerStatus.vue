<script setup>
import {dashboard} from "../../services/utils";

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
        Status:
      </div>
      <div class="flex flex-column gap-1">
        <div>
          <ServerConnectionIcon class="mr-1" :connected="server.connected"></ServerConnectionIcon>
          <span> <b>
            <template v-if="server.connected">
            Connected
            </template>
            <template v-else>
            Disconnected
            </template>
          </b> </span>
        </div>
      </div>
    </div>

    <div class="flex gap-1">
      <div>
        API URL:
      </div>
      <div>
        <a :href="server.connection?.url" target="_blank" class="ml-2">{{ server.connection?.url }}
          <i class="pi pi-external-link"></i>
        </a>
      </div>
    </div>

    <div class="flex gap-1">
      <div>
        Dashboard URL:
      </div>
      <div>
        <a :href="dashboard(server.connection?.url)" target="_blank" class="ml-2">{{ dashboard(server.connection?.url) }}
          <i class="pi pi-external-link"></i>
        </a>
      </div>
    </div>

    <div class="flex gap-2">
      <div>
        Engine:
      </div>
      <div>
        <code>
          {{ server.version?.engine }}
        </code>
      </div>
    </div>

    <div class="flex gap-2">
      <div>
        Version:
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
              Up to date
            </span>
        </template>
      </div>
    </div>

    <div class="flex gap-2">
      <div>
        Uptime:
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
      There's a new
      <span class="text-900 font-medium">
              <a href="https://waha.devlike.pro/docs/overview/changelog/" target="_blank">
                {{ store.latestVersion }}
                <i class="pi pi-external-link"></i>
              </a>
              </span>
      version available!
    </InlineMessage>
  </div>

</template>

<style scoped lang="scss">

</style>
