<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { PhoneNumbersAppConfig } from '../../services/waha/dtos';
import AppConfigPhoneNumbersRules from './AppConfigPhoneNumbersRules.vue';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object as () => PhoneNumbersAppConfig,
    required: true,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
  // Show the rules editor - only the generic phone-numbers app has rules
  rules: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const getDefaults = (): PhoneNumbersAppConfig => {
  const defaults: PhoneNumbersAppConfig = {
    strict: false,
    lookup: true,
    cache: {
      memoryTtl: '24h',
      persistent: true,
      persistentTtl: '31d',
    },
  };
  if (props.rules) {
    defaults.rules = [];
  }
  return defaults;
};

const config = reactive<PhoneNumbersAppConfig>(
  lodash.defaultsDeep({}, lodash.cloneDeep(props.modelValue ?? {}), getDefaults()),
);

watch(
  config,
  (val) => {
    emit('update:modelValue', lodash.cloneDeep(val));
  },
  { deep: true, immediate: true },
);

// Rules stay hidden until the user opts in, no rules means every number is checked
const filterByRules = ref((config.rules ?? []).length > 0);
const applyToAll = computed({
  get: () => !filterByRules.value,
  set: (val: boolean) => {
    filterByRules.value = !val;
    if (val) {
      config.rules = [];
    }
  },
});

// Inverted toggle - "send best guess" is the green state, strict reject the grey one
const bestGuess = computed({
  get: () => !config.strict,
  set: (val: boolean) => {
    config.strict = !val;
  },
});
</script>

<template>
  <div class="phone-numbers-config">
    <div v-if="props.rules">
      <div class="field">
        <label class="block mb-2">
          {{ t('apps.phoneNumbers.rules.label') }}
        </label>
        <ToggleButton
          v-model="applyToAll"
          onIcon="pi pi-globe"
          offIcon="pi pi-filter"
          :onLabel="t('apps.phoneNumbers.rules.on')"
          :offLabel="t('apps.phoneNumbers.rules.off')"
        />
        <small class="p-message-secondary block mt-1">
          {{ t('apps.phoneNumbers.rules.help') }}
        </small>
      </div>
      <div class="field" v-if="!applyToAll">
        <AppConfigPhoneNumbersRules v-model="config.rules" />
        <small class="p-message-secondary block mt-1">
          {{ t('apps.phoneNumbers.rules.hint') }}
        </small>
      </div>
      <hr />
    </div>

    <div class="field">
      <label class="block mb-2">
        {{ t('apps.phoneNumbers.strict.label') }}
      </label>
      <ToggleButton
        v-model="bestGuess"
        onIcon="pi pi-send"
        offIcon="pi pi-ban"
        :onLabel="t('apps.phoneNumbers.strict.on')"
        :offLabel="t('apps.phoneNumbers.strict.off')"
      />
      <small class="p-message-secondary block mt-1">
        {{ t('apps.phoneNumbers.strict.help') }}
      </small>
    </div>

    <div class="field">
      <label class="block mb-2">
        {{ t('apps.phoneNumbers.lookup.label') }}
      </label>
      <ToggleButton
        v-model="config.lookup"
        onIcon="pi pi-globe"
        offIcon="pi pi-database"
        :onLabel="t('apps.phoneNumbers.lookup.on')"
        :offLabel="t('apps.phoneNumbers.lookup.off')"
      />
      <small class="p-message-secondary block mt-1">
        {{ t('apps.phoneNumbers.lookup.help') }}
      </small>
    </div>

    <hr />

    <h4 class="text-center">{{ t('apps.phoneNumbers.cache.title') }}</h4>
    <div class="field">
      <label class="block mb-2" for="pn-memory-ttl">
        {{ t('apps.phoneNumbers.cache.memoryTtl.label') }}
      </label>
      <InputText
        id="pn-memory-ttl"
        v-model="config.cache.memoryTtl"
        placeholder="24h"
      />
      <small class="p-message-secondary">
        {{ t('apps.phoneNumbers.cache.memoryTtl.help') }}
      </small>
    </div>

    <div class="field">
      <label class="block mb-2">
        {{ t('apps.phoneNumbers.cache.persistent.label') }}
      </label>
      <ToggleButton
        v-model="config.cache.persistent"
        onIcon="pi pi-database"
        offIcon="pi pi-times"
        :onLabel="t('apps.phoneNumbers.cache.persistent.on')"
        :offLabel="t('apps.phoneNumbers.cache.persistent.off')"
      />
      <small class="p-message-secondary block mt-1">
        {{ t('apps.phoneNumbers.cache.persistent.help') }}
      </small>
    </div>

    <div class="field" v-if="config.cache.persistent">
      <label class="block mb-2" for="pn-persistent-ttl">
        {{ t('apps.phoneNumbers.cache.persistentTtl.label') }}
      </label>
      <InputText
        id="pn-persistent-ttl"
        v-model="config.cache.persistentTtl"
        placeholder="31d"
      />
      <small class="p-message-secondary">
        {{ t('apps.phoneNumbers.cache.persistentTtl.help') }}
      </small>
    </div>
  </div>
</template>

<style scoped lang="scss">
.phone-numbers-config {
  width: 100%;

  label {
    font-weight: bold;
  }
}
</style>
