<script setup>
import {sleep} from "../../services/utils";

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
    `session-screenshot-${props.session.server.id}-${props.session.name}`,
    async () => {
      await sleep(1000)
      return await store.getScreenshot(props.session.server.id, props.session.name)
    })

defineExpose({
  refresh,
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
  <Base64Img
      v-if="data"
      :data="data.data"
      :mimetype="data.mimetype"
  ></Base64Img>
  <pre
      v-if="error"
      style="background-color: #f8f9fa; padding: 1rem; color: red; white-space: pre-wrap;"
  >
{{ error.cause.response.data.message || error.cause.response.data || error }}
  </pre>
</template>

<style scoped lang="scss">

</style>
