<script setup>
import {ref, onMounted, onBeforeMount} from 'vue';
import {useToast} from 'primevue/usetoast';
import {FilterMatchMode} from "primevue/api";
import {useConfirm} from "primevue/useconfirm";
import {useServerStore} from "../stores/useServerStore";

const toast = useToast();
const confirmPopup = useConfirm();

const serverStore = useServerStore()
const {servers} = storeToRefs(serverStore)

const dt = ref(null);
const filters = ref({});
const loading = ref(null);

onBeforeMount(() => {
  initFilters()
  useAsyncData('serverStore', () => serverStore.refresh())
});
onMounted(() => {
});


const initFilters = () => {
  filters.value = {
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
  };
};

function openNew() {
  toast.add({severity: 'success', summary: 'Success', detail: 'Server Created', life: 3000});
}

function rowClick(event) {
  toast.add({severity: 'info', summary: 'Server Selected', detail: event.data.name, life: 3000});
}

function editServer(server) {
  toast.add({severity: 'info', summary: 'Server Edited', detail: server.name, life: 3000});
}

function confirmDeleteServer(event, server) {
  confirmPopup.require({
    target: event.target,
    message: `Delete '${server.name}'?`,
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      toast.add({severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000});
    },
    reject: () => {
      toast.add({severity: 'info', summary: 'Rejected', detail: 'You have rejected', life: 3000});
    }
  });
}

</script>

<template>
  <h5>Servers</h5>

  <DataTable
      :value="servers"
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
  >

    <template #header>
      <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-0">
        <Button label="Add" icon="pi pi-plus" severity="success" @click="openNew"/>
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
        <b>
          {{ data.name }}
        </b>
      </template>
    </Column>

    <Column header="Connection">
      <template #body="{ data }">
        <div>
          <i class="pi"
             :class="{ 'text-green-500 pi-check-circle': data.connected, 'text-pink-500 pi-times-circle': !data.connected }"></i>
          <a
              class="ml-1"
              :href="data.connection.url" target="_blank">
            {{ data.connection.url }}
          </a>
        </div>
      </template>
    </Column>

    <Column field="version" header="Version">
      <template #body="{ data }">
        <Skeleton v-if="data.version === undefined" width="9rem">
        </Skeleton>
        <code v-else>
          {{ data.version }}
        </code>
      </template>
    </Column>

    <Column header="Sessions">
      <template #body="{ data }">
        <div class="flex gap-1">
          <Skeleton
              v-if="serverStore.sessions.get(data.id) === undefined"
              width="10rem">
          </Skeleton>
          <ServerSessionSummary
              :sessions="serverStore.sessions.get(data.id)"
          ></ServerSessionSummary>
        </div>
      </template>
    </Column>

    <Column>
      <template #body="{data}">
        <div class="text-right">
          <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded outlined @click="editServer(data)"/>
          <ConfirmPopup></ConfirmPopup>
          <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded outlined
                  @click="confirmDeleteServer($event, data)"/>
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style lang="scss">
</style>
