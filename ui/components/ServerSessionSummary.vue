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

</script>

<template>
  <SessionStatusTag
      v-for="(sessions, status) in sessionsByStatus"
      :key="status + sessions.length"
      :status="status"
      :value="`${status}: ${sessions.length}`"
  >
  </SessionStatusTag>

</template>

<style scoped lang="scss">

</style>
