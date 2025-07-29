<script setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { formatUptime } from "../../utils/uptime";

const { t } = useI18n();
const props = defineProps(['status'])
const uptime = computed(() => {
  const ms = props.status.uptime
  if (!ms) {
    return
  }
  return formatUptime(ms, t)
})
const startTime = computed(() => {
  const timestamp = props.status.startTimestamp
  if (!timestamp) {
    return
  }
  return new Date(timestamp)
})

</script>

<template>
  {{ uptime }} {{ t('servers.uptimeStatus') }}
  <i
      v-tooltip='`${t("servers.startTime")}: ${startTime?.toLocaleString()}`'
      class="pi pi-info-circle"
  ></i>
</template>

<style scoped lang="scss">

</style>
