<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ApiKeyDTO, SessionActions } from '../../services/waha/dtos';
import ApiKeyPermissions from './ApiKeyPermissions.vue';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object as () => ApiKeyDTO,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  },
  isNewApiKey: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  sessions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'update:visible', 'save', 'cancel']);

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const apiKey = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isActive = computed({
  get: () => apiKey.value?.isActive !== false,
  set: (val: boolean) => {
    apiKey.value = {
      ...apiKey.value,
      isActive: val,
    } as ApiKeyDTO;
  }
});

const isAdmin = computed({
  get: () => !!apiKey.value?.isAdmin,
  set: (val: boolean) => {
    apiKey.value = {
      ...apiKey.value,
      isAdmin: val,
      session: val ? null : apiKey.value?.session,
      actions: val ? null : apiKey.value?.actions,
    } as ApiKeyDTO;
  }
});

const actionsModel = computed<SessionActions | null>({
  get: () => apiKey.value?.actions ?? null,
  set: (val) => {
    apiKey.value = { ...apiKey.value, actions: val } as ApiKeyDTO;
  }
});

const submitted = ref(false);

function save() {
  submitted.value = true;

  if (isAdmin.value) {
    apiKey.value = {
      ...apiKey.value,
      session: null
    } as ApiKeyDTO;
  }

  if (!isAdmin.value && !apiKey.value?.session) {
    return;
  }

  emit('save', apiKey.value);
}

function cancel() {
  submitted.value = false;
  emit('update:visible', false);
  emit('cancel');
}
</script>

<template>
  <Dialog :dismissableMask="true"
    v-model:visible="isVisible"
    :modal="true"
    class="p-fluid"
    style="min-width: 30%;"
    :header="props.isNewApiKey ? t('apiKeys.createTitle') : t('apiKeys.editTitle')"
  >
    <div class="api-key-edit">
      <div class="field">
        <label><b>{{ t('apiKeys.statusEdit') }}</b></label>
        <div>
          <ToggleButton
            v-model="isActive"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            :onLabel="t('apiKeys.activeOn')"
            :offLabel="t('apiKeys.activeOff')"
          />
        </div>
      </div>

      <div class="field">
        <label><b>{{ t('apiKeys.scope') }}</b></label>
        <div>
          <ToggleButton
            v-model="isAdmin"
            onIcon="pi pi-shield"
            offIcon="pi pi-user"
            :onLabel="t('apiKeys.scopeAdmin')"
            :offLabel="t('apiKeys.scopeSession')"
          />
        </div>
      </div>

      <div class="field" v-if="!isAdmin">
        <label for="session"><b>{{ t('apiKeys.session') }}</b></label>
        <Dropdown
          id="session"
          v-model="apiKey.session"
          :options="props.sessions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('apiKeys.selectSession')"
          :class="{ 'p-invalid': submitted && !apiKey.session }"
          :editable="true"
        />
        <small class="p-error" v-if="submitted && !apiKey.session">
          {{ t('apiKeys.sessionRequired') }}
        </small>
      </div>

      <div class="field" v-if="!isAdmin">
        <label><b>{{ t('apiKeys.actions') }}</b></label>
        <ApiKeyPermissions v-model="actionsModel" />
      </div>
    </div>

    <template #footer>
      <Button
        :label="t('apiKeys.cancel')"
        icon="pi pi-times"
        @click="cancel"
        text=""
        severity="secondary"
      />
      <Button
        :label="props.isNewApiKey ? t('apiKeys.create') : t('apiKeys.save')"
        :icon="props.isNewApiKey ? 'pi pi-plus' : 'pi pi-check'"
        @click="save"
        :loading="props.loading"
        text=""
      />
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.api-key-edit {
  padding: 1rem 0;
}
</style>
