<script setup>
import {ref, onBeforeMount} from 'vue';
import {useToast} from 'primevue/usetoast';
import {FilterMatchMode} from "primevue/api";
import {useConfirm} from "primevue/useconfirm";
import {useServerStore} from "../stores/useServerStore";
import lodash from "lodash";
import {useAsyncData} from "nuxt/app";

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
  };
};

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
      :rows="10"
      dataKey="id"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="menu"
      :loading="loading"
      :filters="filters"
      :globalFilterFields="['name', 'server']"
      showGridlines
      @row-click="rowClick"
      class="p-datatable--clickable"
  >

    <template #header>
      <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-0">
        <div class="flex gap-2">
          <Button label="Add" icon="pi pi-plus" severity="success" @click="openNew"/>
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()"/>
        </div>
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search"/>
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" style="width: 100%"/>
        </IconField>
      </div>
    </template>
    <template #empty> No sessions found</template>
    <template #loading> Loading sessions...</template>


    <Column field="name" header="Name">
      <template #body="{ data }">
        {{ data.name }}
      </template>
    </Column>

    <Column field="status" header="Status">
      <template #body="{ data }">
        <SessionStatusTag
            :status="data.status"
        ></SessionStatusTag>
      </template>
    </Column>

    <Column field="server" header="Server">
      <template #body="{ data }">
        {{ store.getServer(data.server).name }}
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
