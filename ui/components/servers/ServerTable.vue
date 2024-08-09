<script setup>
import {ref, onBeforeMount} from 'vue';
import {useToast} from 'primevue/usetoast';
import {FilterMatchMode} from "primevue/api";
import {useConfirm} from "primevue/useconfirm";
import lodash from "lodash";
import {useAsyncData} from "nuxt/app";
import {useRouter} from "vue-router";

const confirmPopup = useConfirm();
const router = useRouter();
const store = useServerStore()
const req = useShowToastOnResult()

const {servers, refreshing} = storeToRefs(store)
const server = ref({connection: {}}
);
const serverDialog = ref(false)
const serverControlDialog = ref(false)

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

function rowClick(event) {
  openServerControl(event.data)
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
  confirmPopup.require({
    target: event.target,
    message: `Disconnect '${server.name}?'`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Disconnect',
    accept: () => {
      return req(
          store.deleteServer(server.id),
          "Disconnected",
          "Failed to disconnect server",
      )
    },
    reject: () => {
    }
  });
}

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
      Servers
      </span>
        <RefreshIcon :refreshing="refreshing"/>
      </h5>
    </div>

    <div>
      <button @click="refreshServers" class="p-link layout-topbar-button" :disabled="refreshing">
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
      @row-click="rowClick"
      class="p-datatable--clickable"
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
    <template #empty> No servers found</template>
    <template #loading> Loading servers...</template>


    <Column field="name" header="Name">
      <template #body="{ data }">
        {{ data.name }}
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
          <code>
            {{ data.version.engine }}
          </code>
          <code> (</code>
          <code :class="{'text-orange-400': data.version.version !==store.latestVersion}">
            {{ data.version.version }}
          </code>
          <code>)</code>
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
          <Button icon="pi pi-pencil" severity="success" rounded outlined @click="editServer(data)"/>
          <ConfirmPopup></ConfirmPopup>
          <Button icon="pi pi-times" severity="warning" rounded outlined @click="confirmDeleteServer($event, data)"/>
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
</template>

<style lang="scss">
</style>
