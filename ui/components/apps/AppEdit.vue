<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useServerStore } from '../../stores/useServerStore';
import { App } from '../../services/waha/dtos';
import AppConfigChatWoot from './AppConfigChatWoot.vue';
import AppConfigCalls from './AppConfigCalls.vue';
import AppConfigMcp from './AppConfigMcp.vue';
import AppConfigBrazilianPhoneNumbers from './AppConfigBrazilianPhoneNumbers.vue';
import AppFAQChatWoot from './AppFAQChatWoot.vue';
import AppFAQCalls from './AppFAQCalls.vue';
import AppFAQMcp from './AppFAQMcp.vue';
import AppFAQBrazilianPhoneNumbers from './AppFAQBrazilianPhoneNumbers.vue';
import useShowToastOnResult from '../../composables/useShowToastOnResult';
import { generateRandomId } from '../../utils/ids';
import ChatWootLabel from '../common/ChatWootLabel.vue';
import CallsLabel from '../common/CallsLabel.vue';
import McpLabel from '../common/McpLabel.vue';
import BrazilianPhoneNumbersLabel from '../common/BrazilianPhoneNumbersLabel.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object as () => App,
    required: true
  },
  server: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  },
  isNewApp: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Create a local ref for dialog visibility
const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// Determine if this is a new app or an existing one
const isNewApp = computed(() => {
  // If the app has no ID, it's a new app
  return !props.modelValue.id;
});

const emit = defineEmits(['update:modelValue', 'update:visible', 'save', 'cancel']);

const store = useServerStore();
const req = useShowToastOnResult();

const app = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Enabled toggle directly maps to `enabled` API field
const enabled = computed({
  get: () => app.value?.enabled === undefined ? true : !!app.value.enabled,
  set: (val: boolean) => {
    app.value = {
      ...app.value,
      enabled: val,
    } as App;
  }
});

const appTypes = computed(() => [
  {
    name: 'ChatWoot',
    value: 'chatwoot',
    label: 'chatwoot'
  },
  {
    name: `📞 ${t('apps.calls.name')}`,
    value: 'calls',
    label: 'calls'
  },
  {
    name: `🤖 ${t('apps.mcp.name')}`,
    value: 'mcp',
    label: 'mcp'
  },
  {
    name: `🇧🇷 ${t('apps.brazilianPhoneNumbers.name')}`,
    value: 'brazilian-phone-numbers',
    label: 'brazilian-phone-numbers'
  }
]);

watch(
  () => app.value?.app,
  (type, prevType) => {
    if (!type || type === prevType) {
      return;
    }
    app.value = {
      ...app.value,
      config: {},
    } as App;
  },
);

const submitted = ref(false);

// Generate a new ID if it's not set
watch(() => app.value, (newApp) => {
  if (!newApp.id) {
    app.value = {
      ...newApp,
      id: generateAppId()
    };
  }
  // Ensure enabled has a default (true)
  if (newApp.enabled === undefined) {
    app.value = {
      ...newApp,
      enabled: true,
    } as App;
  }
}, { immediate: true });

function generateAppId() {
  return generateRandomId();
}

function save() {
  submitted.value = true;

  // Validate required fields
  if (!app.value.id || !app.value.app || !app.value.session) {
    return;
  }

  // Validate ChatWoot configuration fields if app type is chatwoot
  if (app.value.app === 'chatwoot') {
    const config = app.value.config;
    if (!config || !config.url || !config.accountId || !config.accountToken || 
        !config.inboxId || !config.inboxIdentifier || !config.locale) {
      return;
    }
  }

  // Emit save event - dialog will be closed by parent component if save is successful
  emit('save', app.value);
}

function cancel() {
  submitted.value = false;
  emit('update:visible', false);
  emit('cancel');
}
</script>

<template>
  <Dialog 
    v-model:visible="isVisible" 
    :modal="true" 
    class="p-fluid" 
    :header="props.isNewApp ? t('apps.addAppTitle') : t('apps.editAppTitle')"
  >
    <div class="app-edit">
      <div class="field">
        <label for="id"><b>{{ t('apps.appId') }}</b></label>
        <InputText 
          id="id" 
          v-model="app.id" 
          :disabled="!props.isNewApp"
          placeholder="Automatically generated"
        />
        <small class="p-error" v-if="submitted && !app.id">{{ t('apps.appIdRequired') }}</small>
      </div>

      <div class="field">
        <label for="app-type"><b>{{ t('apps.appType') }}</b></label>
        <Dropdown 
          id="app-type" 
          v-model="app.app" 
          :options="appTypes" 
          optionLabel="name" 
          optionValue="value"
          :placeholder="t('apps.selectAppType')"
          :class="{'p-invalid': submitted && !app.app}"
          :disabled="!props.isNewApp"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value">
              <ChatWootLabel v-if="slotProps.value === 'chatwoot'" />
              <CallsLabel v-else-if="slotProps.value === 'calls'" />
              <McpLabel v-else-if="slotProps.value === 'mcp'" />
              <BrazilianPhoneNumbersLabel v-else-if="slotProps.value === 'brazilian-phone-numbers'" />
              <span v-else>{{ slotProps.value }}</span>
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
          <template #option="slotProps">
            <ChatWootLabel v-if="slotProps.option.value === 'chatwoot'" />
            <CallsLabel v-else-if="slotProps.option.value === 'calls'" />
            <McpLabel v-else-if="slotProps.option.value === 'mcp'" />
            <BrazilianPhoneNumbersLabel v-else-if="slotProps.option.value === 'brazilian-phone-numbers'" />
            <span v-else>{{ slotProps.option.name }}</span>
          </template>
        </Dropdown>
        <small class="p-error" v-if="submitted && !app.app">{{ t('apps.appTypeRequired') }}</small>
      </div>

      <div class="field">
        <label><b>{{ t('apps.enabled.label.edit') }}</b></label>
        <div>
          <ToggleButton
            v-model="enabled"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            :onLabel="t('apps.enabled.on')"
            :offLabel="t('apps.enabled.off')"
          />
        </div>
      </div>

      <div class="field" v-if="app.app">
        <div v-if="app.app === 'chatwoot'">
          <label><b>{{ t('apps.appFAQ') }}</b></label>
          <AppFAQChatWoot
            :app="app"
            :session="app.session || ''"
          />
        </div>
        <div v-else-if="app.app === 'calls'">
          <label><b>{{ t('apps.appFAQ') }}</b></label>
          <AppFAQCalls />
        </div>
        <div v-else-if="app.app === 'mcp'">
          <label><b>{{ t('apps.appFAQ') }}</b></label>
          <AppFAQMcp :app="app" :server="server" />
        </div>
        <div v-else-if="app.app === 'brazilian-phone-numbers'">
          <label><b>{{ t('apps.appFAQ') }}</b></label>
          <AppFAQBrazilianPhoneNumbers />
        </div>

        <label><b>{{ t('apps.appConfiguration') }}</b></label>
        <div class="card app-config">
          <AppConfigChatWoot
            v-if="app.app === 'chatwoot'"
            v-model="app.config"
            :server="server"
            :submitted="submitted"
          />
          <AppConfigCalls
            v-else-if="app.app === 'calls'"
            v-model="app.config"
            :submitted="submitted"
          />
          <AppConfigMcp
            v-else-if="app.app === 'mcp'"
            v-model="app.config"
            :submitted="submitted"
          />
          <AppConfigBrazilianPhoneNumbers
            v-else-if="app.app === 'brazilian-phone-numbers'"
            v-model="app.config"
            :submitted="submitted"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button 
        :label="t('apps.cancel')" 
        icon="pi pi-times" 
        @click="cancel" 
        text="" 
        severity="secondary"
      />
      <Button 
        :label="isNewApp ? t('apps.add') : t('apps.save')" 
        :icon="isNewApp ? 'pi pi-plus' : 'pi pi-check'" 
        @click="save" 
        :loading="props.loading"
        text=""
      />
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.app-edit {
  padding: 1rem 0;
}

.app-config {
  margin-top: 0.5rem;
}
</style>
