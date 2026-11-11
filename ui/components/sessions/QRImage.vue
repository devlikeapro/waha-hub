<script setup>
import {sleep} from "../../services/utils";

const QR_SIZE = "20rem"

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
    `session-qr-${props.session.server.id}-${props.session.name}`,
    async () => {
      await sleep(1000)
      return await store.getQR(props.session.server.id, props.session.name)
    })

</script>

<template>
  <div class="" style="min-width:20rem;">
    <div class="flex justify-content-center align-items-center">
      <h5 class="m-0">QR</h5>
      <RefreshButton @click="refresh"></RefreshButton>
    </div>
    <div class="m-auto w-full">
      <ProgressBar v-if="pending" mode="indeterminate" style="height: 3px"></ProgressBar>
      <div class="flex justify-content-center">
        <!-- Same box for the skeleton and the QR, also on refresh -->
        <Skeleton
            v-if="pending"
            :width="QR_SIZE"
            :height="QR_SIZE"
        ></Skeleton>
        <Base64Img
            v-else-if="data"
            :data="data.data"
            :mimetype="data.mimetype"
            :style="{width: QR_SIZE, height: QR_SIZE, imageRendering: 'pixelated'}"
        ></Base64Img>
        <pre
            v-else-if="error"
            style="background-color: #f8f9fa; padding: 1rem; color: red; white-space: pre-wrap;"
        >
{{ error.cause.response.data.message || error.cause.response.data || error }}
  </pre>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
