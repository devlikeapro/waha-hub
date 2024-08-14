<script setup>
import {ref, onBeforeMount} from 'vue';
import {useToast} from 'primevue/usetoast';
import {FilterMatchMode, FilterOperator} from "primevue/api";
import lodash from "lodash";
import {useAsyncData} from "nuxt/app";
import {SessionStatuses} from "../../services/waha/dtos";

const toast = useToast();

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
    name: "",
    config: {
      metadata: {
        ['user.id']: "123",
      },
      webhooks: [
        {
          url: "https://httpbin.org/post",
          events: ["session.status", "message", "message.reaction"],
          hmac: {
            key: null,
          },
          retries: {
            delaySeconds: 2,
            attempts: 15,
          }
        },
      ],
      noweb: {
        store: {
          enabled: true,
          fullSync: false
        }
      },
      proxy: {},
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
  sessionDialogMode.value = "update"
  sessionDialog.value = true;
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


const globalFilterFields = computed(
    () => {
      return [
        'name',
        'me.id',
        "me.pushName",
        "_metadata",
      ]
    }
)

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
      <button
          v-tooltip.top="'Refresh'"
          @click="refreshServers" class="p-link layout-topbar-button" :disabled="refreshing">
        <i class="pi pi-refresh"></i>
      </button>
    </div>
  </div>

  <DataTable
      :value="sessions.length > 0 ? sessions : []"
      :paginator="true"
      :rows="20"
      :dataKey="(data) => `${data.server.id}-${data.name}`"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="row"
      :loading="loading"
      :globalFilterFields="globalFilterFields"
      @row-click="rowClick"
      showGridlines
      class="p-datatable--clickable"
      style="white-space: nowrap;"
  >

    <template #header>
      <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-0">
        <Button label="Start New" icon="pi pi-play" severity="success" @click="openNew"/>
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search"/>
          <InputText
              v-model="filters['global'].value"
              placeholder="Search by name, phone, metadata"
              style="width: 100%"
          />
        </IconField>
      </div>
    </template>
    <template #empty> No sessions found</template>
    <template #loading> Loading sessions...</template>

    <Column field="name" header="Name" sortable>
    </Column>

    <Column header="Metadata">
      <template #body="{ data }">
        <Metadata
            :metadata="data.config?.metadata"
        ></Metadata>
      </template>
    </Column>

    <Column header="Me">
      <template #body="{ data }">
        <div class="text-center">
          <SessionChip :session="data"></SessionChip>
        </div>
      </template>
    </Column>

    <Column field="status" header="Status" :showFilterMenu="false" style="width: 9rem">
      <template #body="{ data }">
        <div class="flex gap-2">
          <div>
            <ScreenshotButton :session="data"></ScreenshotButton>
          </div>
          <div class="my-auto">
            <SessionStatusTag
                :status="data.status"
                :value="data.status.toUpperCase()"
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
        <SessionActions
            :session="data"
            @view="showSessionConfig"
        />
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
