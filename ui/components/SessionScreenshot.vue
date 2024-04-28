<script setup>
import {useServerStore} from "../stores/useServerStore";

const store = useServerStore()
const props = defineProps({
  session: Object,
})

const {
  data,
  pending,
  error,
  refresh
} = useAsyncData(() => {
  return store.getScreenshot(props.session.server.id, props.session.name)
})

defineExpose({
  refresh,
})

</script>

<template>
  <template v-if="pending">
    <Skeleton
        width="40rem"
        height="20rem"
    ></Skeleton>
  </template>
  <template v-else>
    <Base64Img
        v-if="data"
        :data="data.data"
        :mimetype="data.mimetype"
    ></Base64Img>
    <pre
        v-if="error"
        style="background-color: #f8f9fa; padding: 1rem; color: red; width: 40rem; height: 20rem;  white-space: pre-wrap;"
    >
{{ error.cause.response.data.message || error.cause.response.data || error }}
  </pre>
  </template>
</template>

<style scoped lang="scss">

</style>
