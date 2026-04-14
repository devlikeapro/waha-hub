<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useServerStore } from '../../stores/useServerStore';
import { App } from '../../services/waha/dtos';
import AppEdit from './AppEdit.vue';
import useShowToastOnResult from '../../composables/useShowToastOnResult';
import { generateRandomId } from '../../utils/ids';
import ChatWootLabel from '../common/ChatWootLabel.vue';
import CallsLabel from '../common/CallsLabel.vue';
import { useI18n } from 'vue-i18n';

const toast = useToast();
const confirm = useConfirm();
const store = useServerStore();
const req = useShowToastOnResult();
const { t } = useI18n();

const props = defineProps({
  server: Object,
  session: Object,
  isNewSession: {
    type: Boolean,
    default: false
  }
});

const apps = ref<App[]>([]);
const loading = ref(false);
const saving = ref(false);
const appDialog = ref(false);
const selectedApp = ref<App | null>(null);
const isNewApp = ref(false);

// Load apps when component is mounted or when server/session changes
onMounted(async () => {
  await loadApps();
});

watch(() => [props.server, props.session], async () => {
  await loadApps();
}, { deep: true });

async function loadApps() {
  if (!props.server || !props.session || !props.session.name) {
    apps.value = [];
    return;
  }

  try {
    loading.value = true;
    apps.value = await req(
      store.getApps(props.server.id, props.session.name),
      undefined,
      t('apps.failedToLoad')
    );
  } catch (error) {
    console.error("Error loading apps:", error);
  } finally {
    loading.value = false;
  }
}

function openNewApp() {
  if (props.isNewSession) {
    toast.add({
      severity: 'info',
      summary: 'Info',
      detail: t('apps.createSessionFirst'),
      life: 3000
    });
    return;
  }

  selectedApp.value = {
    id: generateAppId(),
    session: props.session.name,
    app: "",
    config: {},
    enabled: true,
  };
  isNewApp.value = true;
  appDialog.value = true;
}

function editApp(app: App) {
  selectedApp.value = { ...app };
  isNewApp.value = false;
  appDialog.value = true;
}

function confirmDeleteApp(app: App, event: Event) {
  const appTypeLabel = getAppTypeLabel(app.app);
  confirm.require({
    target: event.currentTarget,
    message: t('apps.deleteConfirm', { appType: appTypeLabel, id: app.id }),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: t('apps.no'),
    acceptLabel: t('apps.yesDelete'),
    accept: async () => {
      await deleteApp(app);
    },
    reject: () => {
      // Do nothing on reject
    }
  });
}

async function deleteApp(app: App) {
  try {
    await req(
      store.deleteApp(props.server.id, app.id),
      undefined,
      t('apps.failedToDelete')
    );
    const appTypeLabel = getAppTypeLabel(app.app);
    toast.add({
      severity: 'success',
      summary: t('apps.deleted'),
      detail: `${appTypeLabel} (${app.id})`,
      life: 3000
    });
    await loadApps();
  } catch (error) {
    console.error("Error deleting app:", error);
  }
}

function generateAppId() {
  return generateRandomId();
}

async function saveApp(app: App) {
  try {
    saving.value = true;
    const appTypeLabel = getAppTypeLabel(app.app);
    if (isNewApp.value) {
      await req(
        store.createApp(props.server.id, app),
        undefined,
        t('apps.failedToCreate')
      );
      toast.add({
        severity: 'success',
        summary: t('apps.created'),
        detail: `${appTypeLabel} (${app.id})`,
        life: 3000
      });
    } else {
      await req(
        store.updateApp(props.server.id, app),
        undefined,
        t('apps.failedToUpdate')
      );
      toast.add({
        severity: 'success',
        summary: t('apps.updated'),
        detail: `${appTypeLabel} (${app.id})`,
        life: 3000
      });
    }
    await loadApps();
    // Close the dialog after successful save
    appDialog.value = false;
    return true;
  } catch (error) {
    console.error("Error saving app:", error);
    return false;
  } finally {
    saving.value = false;
  }
}

// This function is used for text-only representation (e.g., in toast messages)
function getAppTypeLabel(appType: string) {
  switch (appType) {
    case 'chatwoot':
      return 'ChatWoot';
    case 'calls':
      return '📞 Calls';
    default:
      return appType;
  }
}
</script>

<template>
  <div class="app-list">
    <div class="flex justify-content-between align-items-center w-full mb-2">
      <div>
        <h5 class="mb-0">
          {{ t('apps.title') }}
          <i
              v-tooltip="t('apps.builtInIntegrations')"
              class="pi pi-info-circle"
          ></i>
        </h5>
      </div>
      <div>
        <Button 
          :label="t('apps.addApp')" 
          icon="pi pi-plus" 
          @click="openNewApp" 
          severity="success"
          text
        />
      </div>
    </div>

    <DataTable 
      :value="apps" 
      :loading="loading" 
      dataKey="id"
      :paginator="apps.length > 10" 
      :rows="10"
      showGridlines
    >
      <template #empty>
        <div class="text-center p-4">
          {{ t('apps.noAppsFound') }}
        </div>
      </template>

      <Column field="app" :header="t('apps.appType')">
        <template #body="{ data }">
          <ChatWootLabel v-if="data.app === 'chatwoot'" />
          <CallsLabel v-else-if="data.app === 'calls'" />
          <template v-else>{{ getAppTypeLabel(data.app) }}</template>
        </template>
      </Column>
      <Column field="id" :header="t('apps.id')"></Column>
      <Column :header="t('apps.enabled.label.list')" style="width: 10rem;">
        <template #body="{ data }">
          <AppStatusTag :enabled="data.enabled !== false" />
        </template>
      </Column>
      <Column style="width: 10rem; text-align: right;">
        <template #body="{ data }">
          <div class="flex gap-2 justify-content-end">
            <Button 
              icon="pi pi-pencil" 
              @click="editApp(data)" 
              outlined 
              rounded 
              severity="success"
              v-tooltip.top="t('apps.editApp')"
            />
            <Button 
              icon="pi pi-trash" 
              @click="confirmDeleteApp(data, $event)" 
              outlined 
              rounded 
              severity="danger"
              v-tooltip.top="t('apps.deleteApp')"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <ConfirmPopup></ConfirmPopup>

    <AppEdit 
      v-if="selectedApp" 
      v-model="selectedApp" 
      :server="server"
      v-model:visible="appDialog"
      :isNewApp="isNewApp"
      :loading="saving"
      @save="saveApp"
      @cancel="appDialog = false"
    />
  </div>
</template>

<style scoped lang="scss">
.app-list {
  margin-bottom: 1rem;
}
</style>
