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
const {allSessions, refreshing} = storeToRefs(store)
const sessions = allSessions

const session = ref({
  config: {
    webhooks: [],
  },
})
const sessionDialog = ref(false)
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
  session.value = {
    config: {
      webhooks: [],
    },
  };
  sessionDialog.value = true;
}


function editSession(selected) {
  session.value = lodash.cloneDeep(selected);
  sessionDialog.value = true;
}

function confirmDeleteSession(event, session) {
  confirmPopup.require({
    target: event.target,
    message: `Delete '${session.name}'?`,
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
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
  sessionControlDialog.value = true;
  session.value = event.data
}

</script>

<template>
  <h5>
    <i class="pi pi-whatsapp"></i>
    <span class="mr-1">
      Sessions
      </span>
    <RefreshIcon :refreshing="refreshing"/>
  </h5>

  <DataTable
      :value="sessions.length > 0 ? sessions : []"
      :paginator="true"
      :rows="20"
      :dataKey="(data) => `${data.name}-${data.server.id}-${data.status}`"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="row"
      :loading="loading"
      :globalFilterFields="['name', 'server.id', 'server.name', 'server.connection.url', 'status']"
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
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" style="width: 100%"/>
        </IconField>
      </div>
    </template>
    <template #empty> No sessions found</template>
    <template #loading> Loading sessions...</template>

    <Column field="name" header="Name" sortable>
      <template #body="{ data }">
        {{ data.name }}
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
        <Dropdown
            optionValue="id"
            v-model="filterModel.value" :options="store.servers"
            @change="filterCallback()"
            placeholder="Any" class="p-column-filter"
            :showClear="true"
        >
          <template #value="slotProps">
            <template v-if="slotProps.value">
              <ServerConnectionIcon :connected="store.getServer(slotProps.value).connected"></ServerConnectionIcon>
              <span class="ml-1">{{ store.getServer(slotProps.value).name }} </span>
            </template>
            <span v-else>{{ slotProps.placeholder }}</span>
          </template>
          <template #option="slotProps">
            <ServerConnectionIcon :connected="slotProps.option.connected"></ServerConnectionIcon>
            <span class="ml-1">{{ slotProps.option.name }} ({{ slotProps.option.connection.url }}) </span>
          </template>
        </Dropdown>
      </template>
    </Column>

    <Column>
      <template #body="{data}">
        <div class="text-right">
          <Button icon="pi pi-play" class="mr-2" rounded outlined @click="editSession(data)"/>
          <Button icon="pi pi-pause" class="mr-2" severity="secondary" rounded outlined @click="editSession(data)"/>
          <Button icon="pi pi-stop" class="mt-2" severity="danger" rounded outlined
                  @click="confirmDeleteSession($event, data)"/>
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
  ></SessionDialog>
</template>

<style lang="scss">
</style>
