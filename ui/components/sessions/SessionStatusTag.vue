<script setup>
import { computed} from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  value: {
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

</script>

<template>
  <Tag
      :value="value"
      :severity="severity"
      class="session-status-tag"
  ></Tag>
</template>

<style scoped lang="scss">
</style>
