<script setup>
import {onBeforeMount} from 'vue';
import {useServerStore} from "../stores/useServerStore";
import {computed} from "../.nuxt/imports";


const store = useServerStore()
const notConnectedServers = computed(() => {
  return store.servers.filter(server => server.connected === false)
})
const connectedServers = computed(() => store.servers.filter(server => server.connected === true))
const serversRequireUpdates = computed(() => store.servers.filter(s => store.latestVersion && s.version && s.version.version !== store.latestVersion))
const badSessions = computed(() => store.allSessions.filter(s => s.status !== "WORKING" && s.status !== "STOPPED"))
const workingSessions = computed(() => store.allSessions.filter(s => s.status === "WORKING"))
const stoppedSessions = computed(() => store.allSessions.filter(s => s.status === "STOPPED"))

onBeforeMount(() => {
  store.refresh()
});
</script>

<template>
  <div class="grid">
    <div class="col-12 lg:col-6 xl:col-4">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-900 font-medium mb-3">Sessions</span>
            <div class="text-900 font-medium text-xl">{{ store.allSessions.length }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-green-50 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-whatsapp text-green-500 text-xl"></i>
          </div>
        </div>
        <span class="text-green-500 font-medium">{{ workingSessions.length }}</span>
        <span class="text-500"> working</span>
        <template v-if="badSessions.length > 0">
          <span class="text-500">, </span>
          <span class="text-orange-400 font-medium">{{ badSessions.length }}</span>
          <span class="text-500"> requires attention</span>
        </template>
        <template v-if="stoppedSessions.length >0">
          <span class="text-500">, </span>
          <span class="text-gray-400 font-medium">{{ stoppedSessions.length }}</span>
          <span class="text-500"> stopped</span>
        </template>
      </div>
    </div>

    <div class="col-12 lg:col-6 xl:col-4">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-900 font-medium mb-3">Servers</span>
            <span class="text-900 font-medium text-xl">
              <span> {{ store.servers.length }}</span>
            </span>
          </div>
          <div class="flex align-items-center justify-content-center bg-purple-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-server text-purple-500 text-xl"></i>
          </div>
        </div>
        <div>
          <template v-if="notConnectedServers.length > 0">
            <span class="text-red-500 font-medium">{{ notConnectedServers.length }}</span>
            <span class="text-900"> not connected</span>
            <span> / </span>
          </template>
          <span class="text-green-500 font-medium">{{ connectedServers.length }}</span>
          <span class="text-500"> connected</span>
        </div>
      </div>
    </div>

    <div class="col-12 lg:col-6 xl:col-4">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-900 font-medium mb-3">
                Latest Version
            </span>
            <div>
              <Skeleton v-if="!store.latestVersion" width="4rem"></Skeleton>
              <span v-else class="text-900 font-medium text-xl">
              <a href="https://waha.devlike.pro/docs/overview/changelog/" target="_blank">
                {{ store.latestVersion }}
                <i class="pi pi-external-link"></i>
              </a>
              </span>
            </div>
          </div>
          <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-cloud-download text-cyan-500 text-xl"></i>
          </div>
        </div>
        <template v-if="serversRequireUpdates.length > 0">
          <span class="text-orange-400 font-medium">{{ serversRequireUpdates.length }}</span>
          <span class="text-500"> servers ready for updates</span>
        </template>
        <template v-else>
          <span class="text-green-500 font-medium">
            <i class="pi text-green-500 pi-check-circle"></i>
            Up to date
          </span>
        </template>
      </div>
    </div>

    <div class="col-12">
      <div class="card">
        <ServerTable></ServerTable>
      </div>
    </div>

    <div class="col-12">
      <div class="card">
        <SessionTable></SessionTable>
      </div>
    </div>
  </div>
</template>
