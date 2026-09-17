<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <span class="phone-numbers-label">
    <span class="emoji">📱</span>
    <span>{{ t('apps.phoneNumbers.name') }}</span>
  </span>
</template>

<style scoped>
.phone-numbers-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.emoji {
  font-size: 1rem;
  line-height: 1;
}
</style>
