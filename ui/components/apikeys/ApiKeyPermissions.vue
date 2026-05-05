<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SessionActions } from '../../services/waha/dtos';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object as () => SessionActions | null,
    default: null,
  },
  defaults: {
    type: Object as () => Required<SessionActions>,
    default: (): Required<SessionActions> => ({
      read: true,
      send: true,
      control: true,
      setting: true,
      app: true,
      delete: false,
    }),
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: SessionActions): void;
}>();

const actionsModel = computed<Required<SessionActions>>({
  get: () => ({ ...props.defaults, ...props.modelValue }),
  set: (val) => emit('update:modelValue', val),
});

function setAction(key: keyof SessionActions, val: boolean) {
  actionsModel.value = { ...actionsModel.value, [key]: val };
}
</script>

<template>
  <div class="permissions-grid">
    <div class="permissions-col">
      <div v-for="action in ['read', 'send']" :key="action" class="permission-row">
        <Checkbox
          :inputId="`perm-${action}`"
          :modelValue="actionsModel[action as keyof SessionActions]"
          @update:modelValue="setAction(action as keyof SessionActions, $event)"
          :binary="true"
        />
        <label :for="`perm-${action}`" class="permission-label">
          <span class="permission-name">{{ t(`apiKeys.actions_${action}`) }}</span>
          <span class="permission-desc">{{ t(`apiKeys.actions_${action}_desc`) }}</span>
        </label>
      </div>
    </div>
    <div class="permissions-col">
      <div v-for="action in ['setting', 'control', 'app', 'delete']" :key="action" class="permission-row">
        <Checkbox
          :inputId="`perm-${action}`"
          :modelValue="actionsModel[action as keyof SessionActions]"
          @update:modelValue="setAction(action as keyof SessionActions, $event)"
          :binary="true"
        />
        <label :for="`perm-${action}`" class="permission-label">
          <span class="permission-name">{{ t(`apiKeys.actions_${action}`) }}</span>
          <span class="permission-desc">{{ t(`apiKeys.actions_${action}_desc`) }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.permissions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2rem;
  row-gap: 0.75rem;
}

.permissions-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.permission-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.permission-label {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  line-height: 1.3;

  .permission-name {
    font-weight: 500;
  }

  .permission-desc {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
}
</style>
