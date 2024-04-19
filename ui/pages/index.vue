<script setup>
import {onBeforeMount, onMounted} from 'vue';
import {useServerStore} from "../stores/useServerStore";
import {computed} from "../.nuxt/imports";
import {useAsyncData} from "nuxt/app";


const store = useServerStore()
const notConnectedServers = computed(() => {
  return store.servers.filter(server => server.connected === false)
})
const connectedServers = computed(() => store.servers.filter(server => server.connected === true))
const serversRequireUpdates = computed(() => store.servers.filter(s => store.latestVersion && s.version && s.version.version !== store.latestVersion))
const badSessions = computed(() => store.allSessions.filter(s => s.status !== "WORKING" && s.status !== "STOPPED"))

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
        <template v-if="badSessions.length > 0">
          <span class="text-orange-400 font-medium">{{ badSessions.length }}</span>
          <span class="text-500"> requires attention</span>
        </template>
        <template v-else>
          <span class="text-green-500 font-medium">{{ store.allSessions.length }}</span>
          <span class="text-500"> working</span>
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
            <span class="block text-900 font-medium mb-3">Latest Version</span>
            <div>
              <Skeleton v-if="!store.latestVersion" width="4rem"></Skeleton>
              <span v-else class="text-900 font-medium text-xl">{{ store.latestVersion }}</span>
            </div>
          </div>
          <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-cloud-download text-cyan-500 text-xl"></i>
          </div>
        </div>
        <template v-if="serversRequireUpdates.length > 0">
          <span class="text-orange-400 font-medium">{{ serversRequireUpdates.length }}</span>
          <span class="text-500"> require updates</span>
        </template>
        <template v-else>
          <span class="text-green-500 font-medium">Up to date</span>
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
