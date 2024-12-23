<script setup>
const props = defineProps(['session'])
const screenshot = ref(null)

const refreshScreenshot = () => {
  screenshot.value.refresh()
}

</script>

<template>
  <div class="grid pt-4">
    <div class="col-12 sm:col-6 h-full">
      <div class="grid">
        <div class="col-12">
          <div class="">
            <div class="flex justify-content-center align-items-center">
              <SessionChip
                  v-if="session.me"
                  :session="session"
              >
              </SessionChip>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="">
            <div class="flex justify-content-center align-items-center">
              <h5 class="m-0">Screenshot</h5>
              <RefreshButton @click="refreshScreenshot"></RefreshButton>
            </div>
            <div class="m-auto w-full">
              <SessionScreenshot
                  ref="screenshot"
                  :session="session"
              ></SessionScreenshot>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="col-12 sm:col-6 h-full card">
      <SessionRequestResponse :session="session"></SessionRequestResponse>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
