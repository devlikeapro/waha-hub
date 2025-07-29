<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  suffix: {
    type: String,
    required: true,
  },
})

const severity = computed(() => {
  const status = props.status.toLowerCase();
  const map = {
    working: 'success',
    failed: 'danger',
    stopped: 'secondary',
    pending: 'warning',
    starting: 'info',
  };
  return map[status] || "warning";
})

const visibleStatusName = computed(() => {
  const status = props.status.toUpperCase();
  if (props.suffix){
    return t(status) + props.suffix
  }
  return t(status)
})

</script>

<template>
  <Tag
      :value="visibleStatusName"
      :severity="severity"
      class="session-status-tag"
  ></Tag>
</template>

<style scoped lang="scss">
</style>
