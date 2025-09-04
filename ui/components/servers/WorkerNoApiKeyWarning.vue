<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  apikey: {
    type: String,
    required: false,
    default: undefined,
  },
  connected: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const defaultKeys = [
  undefined,
  null,
  '',
  '00000000000000000000000000000000',
  'admin',
  '321',
  '123',
  'waha'
]

const isWeakOrMissing = computed(() => defaultKeys.includes(props.apikey))
const shouldShow = computed(() => props.connected && isWeakOrMissing.value)
</script>

<template>
  <InlineMessage v-if="shouldShow" severity="error" class="mt-3 waha-no-api-key-warning">
    {{ t('servers.noApiKeyWarning.title') }}
    <br/>
    {{ t('servers.noApiKeyWarning.readGuide') }}
    <br/>
    <a href="https://waha.devlike.pro/docs/how-to/install/" target="_blank" rel="noopener noreferrer">
      {{ t('servers.noApiKeyWarning.installUpdate') }}
    </a>
    <br/>
    <a href="https://waha.devlike.pro/docs/how-to/security/" target="_blank" rel="noopener noreferrer">
      {{ t('servers.noApiKeyWarning.security') }}
    </a>
  </InlineMessage>
</template>

<style scoped>
.waha-no-api-key-warning {
  font-size: 1rem;
}
</style>
