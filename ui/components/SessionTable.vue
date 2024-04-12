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
const {allSessions} = storeToRefs(store)
const sessions = allSessions
const session = ref({})
const sessionDialog = ref(false)

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
    'server.name': {value: null, matchMode: FilterMatchMode.EQUALS},
    name: {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]},
  };
};
const allServerName = computed(() => {
  return lodash.uniq(store.servers.map(server => server.name)).sort()
});

function openNew() {
  session.value = {
    connection: {}
  };
  sessionDialog.value = true;
}

function rowClick(event) {
  toast.add({severity: 'info', summary: 'Session Selected', detail: event.data.name, life: 3000});
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
  useAsyncData('store', () => store.refresh())
}

function clearFilter() {
  initFilters()
}

</script>

<template>
  <div class="flex justify-content-between align-items-center mb-2">
    <h5 class="m-0">
      <i class="pi pi-whatsapp"></i>
      Sessions
    </h5>
    <div>
      <Button icon="pi pi-refresh" rounded text="" @click="refreshServers"/>
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
      :globalFilterFields="['name', 'server.name', 'status']"
      showGridlines
      @row-click="rowClick"
      class="p-datatable--clickable"
  >

    <template #header>
      <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-0">
        <div class="flex gap-2">
          <Button label="Start" icon="pi pi-play" severity="success" @click="openNew"/>
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

    <Column field="status" header="Status" :showFilterMenu="false" style="max-width: 5rem">
      <template #body="{ data }">
        <SessionStatusTag
            :status="data.status"
        ></SessionStatusTag>
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

    <Column field="server.name" header="Server" :showFilterMenu="false">
      <template #filter="{ filterModel, filterCallback }">
        <Dropdown
            v-model="filterModel.value" :options="allServerName"
            @change="filterCallback()"
            placeholder="Any" class="p-column-filter"
            :showClear="true"
        >
        </Dropdown>
      </template>
    </Column>

    <Column>
      <template #body="{data}">
        <div class="text-right">
          <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded outlined @click="editSession(data)"/>
          <ConfirmPopup></ConfirmPopup>
          <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded outlined
                  @click="confirmDeleteSession($event, data)"/>
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style lang="scss">
</style>
