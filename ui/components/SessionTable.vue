<script setup>
import {ref, onBeforeMount} from 'vue';
import {useToast} from 'primevue/usetoast';
import {FilterMatchMode, FilterOperator} from "primevue/api";
import {useConfirm} from "primevue/useconfirm";
import {useServerStore} from "../stores/useServerStore";
import lodash from "lodash";
import {useAsyncData} from "nuxt/app";
import {SessionStatuses} from "../service/Session";

const toast = useToast();
const confirmPopup = useConfirm();

const store = useServerStore()
const {allSessions, refreshing, servers} = storeToRefs(store)
const sessions = allSessions

const session = ref({
  config: {
    webhooks: [],
  },
})
const sessionDialog = ref(false)
const sessionDialogMode = ref(undefined)
const sessionControlDialog = ref(false)

const dt = ref(null);
const filters = ref({});
const loading = ref(null);

onBeforeMount(() => {
  initFilters()
});


const initFilters = () => {
  filters.value = {
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    status: {value: null, matchMode: FilterMatchMode.EQUALS},
    'server.id': {value: null, matchMode: FilterMatchMode.EQUALS},
    name: {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]},
  };
};

function openNew() {
  // Get first connected server
  const server = servers.value.find(s => s.connected)
  if (!server) {
    toast.add({
      severity: 'error',
      summary: 'No connected server',
      detail: 'Please connect to a server first',
      life: 3000
    });
    return
  }

  session.value = {
    server: server.id,
    // Generate UUID
    name: 'session_' + Math.random().toString(36).substring(7),
    config: {
      webhooks: [
        {
          url: "https://",
          events: ["session.status", "message", "message.reaction"],
          hmac: {
            key: null,
          },
          retries: {
            delaySeconds: 2,
            attempts: 15,
          }
        }
      ],
    },
  };
  sessionDialogMode.value = "new"
  sessionDialog.value = true;
}


function showSessionConfig(selected) {
  session.value = lodash.cloneDeep({
    name: selected.name,
    status: selected.status,
    server: selected.server.id,
    config: selected.config,
  });
  sessionDialogMode.value = "view"
  sessionDialog.value = true;
}

function startSession(selected) {
  session.value = lodash.cloneDeep({
    name: selected.name,
    status: selected.status,
    server: selected.server.id,
    config: selected.config,
  });
  sessionDialogMode.value = "start"
  sessionDialog.value = true;
}

function confirmStopSession(event, session) {
  confirmPopup.require({
    target: event.target,
    message: `Stop '${session.name}' session?\n`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Stop',
    accept: async () => {
      await store.stopSession(session.server.id, session.name, false)
      toast.add({severity: 'success', summary: 'Stopped', detail: '', life: 3000});
    },
    reject: () => {
    }
  });
}

function confirmLogoutSession(event, session) {
  confirmPopup.require({
    target: event.target,
    message: `Logout '${session.name}' session?\n`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Logout',
    accept: async () => {
      await store.logoutSession(session.server.id, session.name)
      toast.add({severity: 'success', summary: 'Logged out', detail: '', life: 3000});
    },
    reject: () => {
    }
  });
}

function refreshServers() {
  useAsyncData('store', async () => await store.refresh())
}

function clearFilter() {
  initFilters()
}

function rowClick(event) {
  openSessionControl(event.data)
}

function openSessionControl(data) {
  sessionControlDialog.value = true;
  session.value = data
}

const globalFilterFields = [
  'name',
  'me.id',
]

</script>

<template>
  <div class="flex justify-content-between">
    <div>
      <h5 class="flex align-items-center gap-1">
        <i class="pi pi-whatsapp"></i>
        <span class="mr-1">
      Sessions
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
      :value="sessions.length > 0 ? sessions : []"
      :paginator="true"
      :rows="20"
      :dataKey="(data) => `${data.name}-${data.server.id}-${data.status}`"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="row"
      :loading="loading"
      :globalFilterFields="globalFilterFields"
      @row-click="rowClick"
      showGridlines
      class="p-datatable--clickable"
  >

    <template #header>
      <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-0">
        <div class="flex gap-2">
          <Button label="Start New" icon="pi pi-plus" severity="success" @click="openNew"/>
        </div>
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search"/>
          <InputText v-model="filters['global'].value" placeholder="Search by name or phone number" style="width: 100%"/>
        </IconField>
      </div>
    </template>
    <template #empty> No sessions found</template>
    <template #loading> Loading sessions...</template>

    <Column field="name" header="Name" sortable>
      <template #body="{ data }">
        <div class="flex gap-2 align-items-center">
          <Button icon="pi pi-info" severity="secondary" rounded outlined @click="openSessionControl(data)"/>
          <span> {{ data.name }} </span>
        </div>
      </template>
    </Column>

    <Column field="status" header="Status" :showFilterMenu="false" style="max-width: 9rem">
      <template #body="{ data }">
        <div class="flex gap-2">
          <div>
            <ScreenshotButton></ScreenshotButton>
          </div>
          <div class="my-auto">
            <SessionStatusTag
                :status="data.status"
            ></SessionStatusTag>
          </div>
        </div>
      </template>

      <template #filter="{ filterModel, filterCallback }">
        <Dropdown
            v-model="filterModel.value" :options="SessionStatuses"
            @change="filterCallback()"
            placeholder="Any" class="p-column-filter"
            :showClear="true"
        >
          <template #option="{ option }">
            <SessionStatusTag
                :status="option"
                :value="option"
            ></SessionStatusTag>
          </template>
        </Dropdown>
      </template>
    </Column>

    <Column field="server.name" filterField='server.id' header="Server" :showFilterMenu="false">
      <template #filter="{ filterModel, filterCallback }">
        <ServerDropdown
            placeholder="Any"
            @change="filterCallback()"
            v-model="filterModel.value"
            :showClear="true"
            :required="false"
        ></ServerDropdown>
      </template>
    </Column>

    <Column>
      <template #body="{data}">
        <div class="text-right">
          <Button icon="pi pi-cog" class="mr-2" severity="secondary" rounded outlined @click="showSessionConfig(data)"/>
          <Button icon="pi pi-play" class="mr-2" rounded outlined @click="startSession(data)"/>
          <Button icon="pi pi-stop" class="mr-2" severity="warning" rounded outlined
                  @click="confirmStopSession($event, data)"/>
          <Button icon="pi pi-trash" class="mt-2" severity="danger" rounded outlined
                  @click="confirmLogoutSession($event, data)"/>
        </div>
      </template>
    </Column>
  </DataTable>
  <ConfirmPopup></ConfirmPopup>
  <SessionControlDialog
      v-model:visible="sessionControlDialog"
      v-model:session="session"
  ></SessionControlDialog>
  <SessionDialog
      v-model:visible="sessionDialog"
      v-model:session="session"
      :mode="sessionDialogMode"
  ></SessionDialog>
</template>

<style lang="scss">
</style>
