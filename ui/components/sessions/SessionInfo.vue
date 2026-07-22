<script setup>
import JsonDataViewer from "../common/JsonDataViewer.vue";

const store = useServerStore()
const props = defineProps({
  session: Object,
})

const {
  data,
  pending,
  error,
  refresh
} = useAsyncData(
    `session-info-${props.session.server.id}-${props.session.name}`,
    async () => {
      return await store.getSession(props.session.server.id, props.session.name)
    })

defineExpose({
  refresh,
})

const FIELDS_ORDER = ['name', 'status', 'me', 'timestamps', 'config', 'engine']

const orderedData = computed(() => {
  if (!data.value) {
    return null
  }
  const result = {}
  for (const key of FIELDS_ORDER) {
    if (key in data.value) {
      result[key] = data.value[key]
    }
  }
  for (const key of Object.keys(data.value)) {
    if (!(key in result)) {
      result[key] = data.value[key]
    }
  }
  return result
})

</script>

<template>
  <template v-if="pending">
    <ProgressBar mode="indeterminate" style="height: 3px"></ProgressBar>
    <Skeleton
        v-if="!data && !error"
        width="100%"
        height="20rem"
    ></Skeleton>
  </template>
  <JsonDataViewer
      v-if="data"
      :data="orderedData"
      :collapsedPaths="['root.config']"
  ></JsonDataViewer>
  <pre
      v-if="error"
      style="background-color: #f8f9fa; padding: 1rem; color: red; white-space: pre-wrap;"
  >
{{ error.cause?.response?.data?.message || error.cause?.response?.data || error }}
  </pre>
</template>

<style scoped lang="scss">

</style>
