<script setup>
import {ref, onBeforeMount} from 'vue';
import {FilterMatchMode} from "primevue/api";
import {useConfirm} from "primevue/useconfirm";
import lodash from "lodash";
import {useAsyncData} from "nuxt/app";
import {dashboard} from "../../services/utils";
import OverlayLinks from "../common/OverlayLinks.vue";
import OverlayLink from "../common/OverlayLink.vue";
import WorkerNoApiKeyWarning from "./WorkerNoApiKeyWarning.vue";
import {useI18n} from 'vue-i18n';


const {t} = useI18n();
const confirm = useConfirm();
const store = useServerStore()
const req = useShowToastOnResult()

const {servers, refreshing} = storeToRefs(store)
const server = ref({connection: {}}
);
const serverDialog = ref(false)
const serverControlDialog = ref(false)
const forceRestart = ref(false)
const linksOverlayPanel = ref(null)

const toggleLinksPanel = (event, server) => {
  linksOverlayPanel.value.toggle(event, server);
}

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
    message: t('servers.disconnectWorkerConfirm', {worker: server.name}),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: t('common.no'),
    acceptLabel: t('servers.yesDisconnect'),
    accept: () => {
      return req(
          store.deleteServer(server.id),
          t('servers.disconnected'),
          t('servers.failedToDisconnectWorker'),
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
    header: t('servers.restartServerConfirm', {server: server.name}),
    icon: 'pi pi-replay',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: t('common.no'),
    acceptLabel: t('servers.yesRestart'),
    accept: async () => {
      await req(
          store.stopServer(server, forceRestart.value),
          t('servers.restarting'),
          t('servers.failedToRestartWorker'),
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
      {{ t('servers.workers') }}
      </span>
        <RefreshIcon :refreshing="refreshing"/>
      </h5>
    </div>

    <div>
      <button
          v-tooltip.top="t('servers.refresh')"
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
      resizableColumns
  >

    <template #header>
      <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-0">
        <Button :label="t('servers.connect')" icon="pi pi-link" severity="success" @click="openNew"/>
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search"/>
          <InputText v-model="filters['global'].value" :placeholder="t('servers.keywordSearch')" style="width: 100%"/>
        </IconField>
      </div>
    </template>
    <template #empty> {{ t('servers.noWorkersFound') }}</template>
    <template #loading> {{ t('servers.loadingWorkers') }}</template>


    <Column field="name" :header="t('servers.name')">
      <template #body="{ data }">
        <div>
          {{ data.name }}
          <i
              v-if="data.status?.worker?.id && data.status?.worker?.id !== data.name"
              v-tooltip="t('servers.workerIdMismatch', {worker: data.status?.worker?.id})"
              class="pi pi-info-circle text-orange-400"
          ></i>
        </div>
      </template>
    </Column>

    <Column :header="t('servers.api')" class="text-left">
      <template #body="{ data }">
        <div class="text-left">
          <div>
            <ServerConnectionIcon :connected="data.connected"></ServerConnectionIcon>
            <a
                class="ml-1"
                :href="data.connection.url" target="_blank">
              {{ data.connection.url }}
            </a>
          </div>
          <WorkerNoApiKeyWarning :apikey="data.connection?.key" :connected="data.connected === true"/>
        </div>
      </template>
    </Column>

    <Column :header="t('servers.info')">
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

    <Column :header="t('servers.sessionsSection')">
      <template #body="{ data }">
        <div class="flex gap-1">
          <Skeleton
              v-if="data.connected===undefined"
              width="10rem">
          </Skeleton>
          <ServerConnectionIcon v-if="data.connected===false" :connected="data.connected"></ServerConnectionIcon>
          <ServerSessionSummary
              :sessions="store.visibleSessionsByServer[data.id]"
          ></ServerSessionSummary>
        </div>
      </template>
    </Column>

    <Column>
      <template #body="{data}">
        <div class="flex flex-row gap-2 justify-content-end">
          <Button
              v-tooltip.top="t('servers.links')"
              icon="pi pi-link" severity="info" rounded outlined @click="toggleLinksPanel($event, data)"
          />
          <Button
              :disabled="!data.connected"
              v-tooltip.top="t('servers.workerInfo')"
              icon="pi pi-info" severity="help" rounded outlined @click="openServerControl(data)"
          />
          <Button
              v-tooltip.top="t('servers.editWorker')"
              icon="pi pi-pencil" severity="success" rounded outlined @click="editServer(data)"/>
          <Button
              icon="pi pi-replay"
              v-tooltip.top="t('servers.restartWorker')"
              severity="warning"
              rounded outlined
              @click="confirmRestart(data)"
          />
          <Button
              v-tooltip.top="t('servers.disconnectWorker')"
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
          {{ t('servers.youreGoingToRestart', {server: slotProps.message.message}) }}
        </p>
        <div>
          <p>
            {{ t('servers.gracefulStop') }}
          </p>
          <ToggleButton
              v-model="forceRestart"
              id="forceRestart"
              :onLabel="t('servers.forceRestartOn')"
              :offLabel="t('servers.forceRestartOff')"
          >
            <template #icon>
              <i class="pi pi-replay mr-2"/>
            </template>
          </ToggleButton>
        </div>
      </div>
    </template>
  </ConfirmDialog>

  <OverlayLinks ref="linksOverlayPanel" :title="t('servers.links')">
    <OverlayLink
        :href="`${linksOverlayPanel.currentItem?.connection.url}/dashboard`"
        icon="pi-home"
        :name="t('servers.dashboard')"
    />
    <OverlayLink
        :href="`${linksOverlayPanel.currentItem?.connection.url}/jobs`"
        icon="pi-cog"
        :name="t('servers.jobs')"
    />
    <OverlayLink
        :href="linksOverlayPanel.currentItem?.connection.url"
        icon="pi-code"
        :name="t('servers.swagger')"
    />
  </OverlayLinks>
</template>

<style lang="scss">
</style>
