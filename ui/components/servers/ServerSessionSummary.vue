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

// WORKING, SCAN_QR_CODE, PASSKEY_*, STARTING, FAILED, STOPPED
const statusWeight = {
  WORKING: 1,
  SCAN_QR_CODE: 2,
  PASSKEY_REQUIRED: 3,
  PASSKEY_CONFIRMATION_REQUIRED: 4,
  STARTING: 5,
  FAILED: 6,
  STOPPED: 7
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
      :suffix="`: &nbsp;${sessions.length}`"
  >
  </SessionStatusTag>

</template>

<style scoped lang="scss">

</style>
