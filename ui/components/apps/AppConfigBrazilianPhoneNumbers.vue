<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { BrazilianPhoneNumbersAppConfig } from '../../services/waha/dtos';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object as () => BrazilianPhoneNumbersAppConfig,
    required: true,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const getDefaults = (): BrazilianPhoneNumbersAppConfig => ({
  strict: false,
  lookup: true,
  cache: {
    memoryTtl: '24h',
    persistent: true,
    persistentTtl: '31d',
  },
});

const config = reactive<BrazilianPhoneNumbersAppConfig>(
  lodash.defaultsDeep({}, lodash.cloneDeep(props.modelValue ?? {}), getDefaults()),
);

watch(
  config,
  (val) => {
    emit('update:modelValue', lodash.cloneDeep(val));
  },
  { deep: true, immediate: true },
);

// Inverted toggle - "send best guess" is the green state, strict reject the grey one
const bestGuess = computed({
  get: () => !config.strict,
  set: (val: boolean) => {
    config.strict = !val;
  },
});
</script>

<template>
  <div class="brazilian-phone-numbers-config">
    <div class="field">
      <label class="block mb-2">
        {{ t('apps.brazilianPhoneNumbers.strict.label') }}
      </label>
      <ToggleButton
        v-model="bestGuess"
        onIcon="pi pi-send"
        offIcon="pi pi-ban"
        :onLabel="t('apps.brazilianPhoneNumbers.strict.on')"
        :offLabel="t('apps.brazilianPhoneNumbers.strict.off')"
      />
      <small class="p-message-secondary block mt-1">
        {{ t('apps.brazilianPhoneNumbers.strict.help') }}
      </small>
    </div>

    <div class="field">
      <label class="block mb-2">
        {{ t('apps.brazilianPhoneNumbers.lookup.label') }}
      </label>
      <ToggleButton
        v-model="config.lookup"
        onIcon="pi pi-globe"
        offIcon="pi pi-database"
        :onLabel="t('apps.brazilianPhoneNumbers.lookup.on')"
        :offLabel="t('apps.brazilianPhoneNumbers.lookup.off')"
      />
      <small class="p-message-secondary block mt-1">
        {{ t('apps.brazilianPhoneNumbers.lookup.help') }}
      </small>
    </div>

    <hr />

    <h4 class="text-center">{{ t('apps.brazilianPhoneNumbers.cache.title') }}</h4>
    <div class="field">
      <label class="block mb-2" for="br-memory-ttl">
        {{ t('apps.brazilianPhoneNumbers.cache.memoryTtl.label') }}
      </label>
      <InputText
        id="br-memory-ttl"
        v-model="config.cache.memoryTtl"
        placeholder="24h"
      />
      <small class="p-message-secondary">
        {{ t('apps.brazilianPhoneNumbers.cache.memoryTtl.help') }}
      </small>
    </div>

    <div class="field">
      <label class="block mb-2">
        {{ t('apps.brazilianPhoneNumbers.cache.persistent.label') }}
      </label>
      <ToggleButton
        v-model="config.cache.persistent"
        onIcon="pi pi-database"
        offIcon="pi pi-times"
        :onLabel="t('apps.brazilianPhoneNumbers.cache.persistent.on')"
        :offLabel="t('apps.brazilianPhoneNumbers.cache.persistent.off')"
      />
      <small class="p-message-secondary block mt-1">
        {{ t('apps.brazilianPhoneNumbers.cache.persistent.help') }}
      </small>
    </div>

    <div class="field" v-if="config.cache.persistent">
      <label class="block mb-2" for="br-persistent-ttl">
        {{ t('apps.brazilianPhoneNumbers.cache.persistentTtl.label') }}
      </label>
      <InputText
        id="br-persistent-ttl"
        v-model="config.cache.persistentTtl"
        placeholder="31d"
      />
      <small class="p-message-secondary">
        {{ t('apps.brazilianPhoneNumbers.cache.persistentTtl.help') }}
      </small>
    </div>
  </div>
</template>

<style scoped lang="scss">
.brazilian-phone-numbers-config {
  width: 100%;

  label {
    font-weight: bold;
  }
}
</style>
