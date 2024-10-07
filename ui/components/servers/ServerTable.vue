<script setup>
import {ref, onBeforeMount} from 'vue';
import {FilterMatchMode} from "primevue/api";
import {useConfirm} from "primevue/useconfirm";
import lodash from "lodash";
import {useAsyncData} from "nuxt/app";
import {dashboard} from "../../services/utils";


const confirm = useConfirm();
const store = useServerStore()
const req = useShowToastOnResult()

const {servers, refreshing} = storeToRefs(store)
const server = ref({connection: {}}
);
const serverDialog = ref(false)
const serverControlDialog = ref(false)
const forceRestart = ref(false)

const dt = ref(null);
const filters = ref({});
const loading = ref(null);

onBeforeMount(() => {
  initFilters()
});


const initFilters = () => {
  filters.value = {
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
  };
};

function openNew() {
  server.value = {
    connection: {}
  };
  serverDialog.value = true;
}

function openServerControl(selected) {
  server.value = lodash.cloneDeep(selected);
  serverControlDialog.value = true;
}

function editServer(selected) {
  server.value = lodash.cloneDeep(selected);
  serverDialog.value = true;
}

function confirmDeleteServer(event, server) {
  confirm.require({
    group: "popup",
    target: event.target,
    message: `Disconnect '${server.name}' worker?`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Disconnect',
    accept: () => {
      return req(
          store.deleteServer(server.id),
          "Disconnected",
          "Failed to disconnect worker",
      )
    },
    reject: () => {
    }
  });
}

const confirmRestart = (server) => {
  confirm.require({
    group: "restart",
    message: server.name,
    header: `Restart '${server.name}' server?`,
    icon: 'pi pi-replay',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Restart',
    accept: async () => {
      await req(
          store.stopServer(server, forceRestart.value),
          `Restarting...`,
          `Failed to restart worker`,
          server.name,
          server.name,
      )
    },
    reject: () => {
    }
  });
};

function refreshServers() {
  useAsyncData('store', async () => await store.refresh())
}

</script>

<template>
  <div class="flex justify-content-between">
    <div>
      <h5 class="flex align-items-center gap-1">
        <i class="pi pi-server"></i>
        <span class="mr-1">
      Workers
      </span>
        <RefreshIcon :refreshing="refreshing"/>
      </h5>
    </div>

    <div>
      <button
          v-tooltip.top="'Refresh'"
          @click="refreshServers" class="p-link layout-topbar-button" :disabled="refreshing">
        <i class="pi pi-refresh"></i>
      </button>
    </div>
  </div>

  <DataTable
      :value="servers.length > 0 ? servers : []"
      :paginator="true"
      :rows="10"
      dataKey="id"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="menu"
      :loading="loading"
      :filters="filters"
      :globalFilterFields="['name', 'id', 'connection.url']"
      showGridlines
      style="white-space: nowrap;"
  >

    <template #header>
      <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-0">
        <Button label="Connect" icon="pi pi-link" severity="success" @click="openNew"/>
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search"/>
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" style="width: 100%"/>
        </IconField>
      </div>
    </template>
    <template #empty> No workers found</template>
    <template #loading> Loading workers...</template>


    <Column field="name" header="Name">
      <template #body="{ data }">
        <div>
          {{ data.name }}
          <i
              v-if="data.status?.worker?.id && data.status?.worker?.id !== data.name"
              v-tooltip='`Worker ID does not match. Rename the worker to match it.\n\n👉 Worker ID: ${ data.status?.worker?.id }`'
              class="pi pi-info-circle text-orange-400"
          ></i>
        </div>
      </template>
    </Column>

    <Column header="API">
      <template #body="{ data }">
        <div>
          <ServerConnectionIcon :connected="data.connected"></ServerConnectionIcon>
          <a
              class="ml-1"
              :href="data.connection.url" target="_blank">
            {{ data.connection.url }}
          </a>
        </div>
      </template>
    </Column>

    <Column header="Info">
      <template #body="{ data }">
        <Skeleton v-if="data.connected === undefined" width="9rem"></Skeleton>
        <ServerConnectionIcon v-else-if="data.connected===false" :connected="data.connected"></ServerConnectionIcon>
        <template v-else>
          <ServerInfoColumn
              :server="data"
          >
          </ServerInfoColumn>
        </template>
      </template>
    </Column>

    <Column header="Sessions">
      <template #body="{ data }">
        <div class="flex gap-1">
          <Skeleton
              v-if="data.connected===undefined"
              width="10rem">
          </Skeleton>
          <ServerConnectionIcon v-if="data.connected===false" :connected="data.connected"></ServerConnectionIcon>
          <ServerSessionSummary
              :sessions="store.sessions.get(data.id)"
          ></ServerSessionSummary>
        </div>
      </template>
    </Column>

    <Column>
      <template #body="{data}">
        <div class="flex flex-row gap-2 justify-content-end">
          <Button
              :disabled="!data.connected"
              v-tooltip.top="'Worker Info'"
              icon="pi pi-info" severity="help" rounded outlined @click="openServerControl(data)"
          />
          <Button
              v-tooltip.top="'Edit Worker'"
              icon="pi pi-pencil" severity="success" rounded outlined @click="editServer(data)"/>
          <Button
              icon="pi pi-replay"
              v-tooltip.top="'Restart Worker'"
              severity="warning"
              rounded outlined
              @click="confirmRestart(data)"
          />
          <Button
              v-tooltip.top="'Disconnect Worker'"
              icon="pi pi-times" severity="danger" rounded outlined @click="confirmDeleteServer($event, data)"/>
        </div>
      </template>
    </Column>
  </DataTable>
  <ServerDialog
      v-model:visible="serverDialog"
      v-model:server="server"
  ></ServerDialog>
  <ServerControlDialog
      v-model:visible="serverControlDialog"
      v-model:server="server"
  >
  </ServerControlDialog>
  <ConfirmPopup group="popup"></ConfirmPopup>
  <ConfirmDialog group="restart">
    <template #message="slotProps">
      <div>
        <p>
          You're going to restart <b>{{ slotProps.message.message }}</b> server.
        </p>
        <p>
          It'll call <code>POST api/server/stop</code>,
          but if you're using Docker
          <br>
          and followed
          <a href="https://waha.devlike.pro/docs/how-to/install/" target="_blank"><b>🔧 Install & Update</b></a> guide,
          Docker will start a new container.
        </p>

        <div>
          <p>
            By default it will gracefully stop the server, but you can force restart.
          </p>
          <ToggleButton
              v-model="forceRestart"
              id="forceRestart"
              onLabel="Force Restart On"
              offLabel="Force Restart Off"
          >
            <template #icon>
              <i class="pi pi-replay mr-2"/>
            </template>
          </ToggleButton>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<style lang="scss">
</style>
