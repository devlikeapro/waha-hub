<script setup>
import {onMounted} from 'vue';
import {useServerStore} from "../stores/useServerStore";


const store = useServerStore()


</script>

<template>
  <div class="grid">
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-900 font-medium mb-3">Servers</span>
            <span class="text-900 font-medium text-xl">
              <span> {{ store.servers.length }}</span>
              <span> / </span>
              <span class="text-green-500"> {{ store.connectedServers.length }} </span>
              <template v-if="store.notConnectedServers.length > 0">
                <span> / </span>
                <span class="text-red-500"> {{ store.notConnectedServers.length }} </span>
              </template>
            </span>
          </div>
          <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-server text-blue-500 text-xl"></i>
          </div>
        </div>
        <template v-if="store.notConnectedServers.length > 0">
          <span class="text-red-500 font-medium">{{ store.notConnectedServers.length }}</span>
          <span class="text-500"> not connected</span>
        </template>
        <template v-else>
          <span class="text-green-500 font-medium">{{ store.connectedServers.length }}</span>
          <span class="text-500"> connected</span>
        </template>
      </div>
    </div>

    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Revenue</span>
            <div class="text-900 font-medium text-xl">$2.100</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-orange-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-map-marker text-orange-500 text-xl"></i>
          </div>
        </div>
        <span class="text-green-500 font-medium">%52+ </span>
        <span class="text-500">since last week</span>
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Customers</span>
            <div class="text-900 font-medium text-xl">28441</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-inbox text-cyan-500 text-xl"></i>
          </div>
        </div>
        <span class="text-green-500 font-medium">520 </span>
        <span class="text-500">newly registered</span>
      </div>
    </div>

    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Comments</span>
            <div class="text-900 font-medium text-xl">152 Unread</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-purple-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-comment text-purple-500 text-xl"></i>
          </div>
        </div>
        <span class="text-green-500 font-medium">85 </span>
        <span class="text-500">responded</span>
      </div>
    </div>

    <div class="col-12">
      <div class="card">
        <ServerTable></ServerTable>
      </div>
    </div>
  </div>
</template>
