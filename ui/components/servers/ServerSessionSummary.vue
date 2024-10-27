<script setup>
import lodash from 'lodash'


const props = defineProps({
  sessions: {
    required: true
  }
})
const sessionsByStatus = computed(() => {
  return lodash.groupBy(props.sessions || [], 'status')
})

// WORKING, SCAN_QR_CODE, STARTING, FAILED, STOPPED
const statusWeight = {
  WORKING: 1,
  SCAN_QR_CODE: 2,
  UNPAIRING: 3,
  STARTING: 4,
  FAILED: 5,
  STOPPED: 6
}
const sessionsByStatusSorted = computed(() => {
  return lodash.sortBy(Object.entries(sessionsByStatus.value), ([status, sessions]) => {
    return statusWeight[status]
  })
})


</script>

<template>
  <SessionStatusTag
      v-for="[status, sessions] in sessionsByStatusSorted"
      :key="status + sessions.length"
      :status="status"
      :value="`${status}: ${sessions.length}`"
  >
  </SessionStatusTag>

</template>

<style scoped lang="scss">

</style>
