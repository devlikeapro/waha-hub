<script setup>
import {useToast} from "primevue/usetoast";

defineProps(['session'])
const toast = useToast();
const refreshScreenshot = () => {
  toast.add({severity: 'info', summary: 'Screenshot', detail: 'Refreshing screenshot'});
}
const request = computed(() => "TODO")
const response = ref(null)

async function copyResponse(event) {
  await navigator.clipboard.writeText(response.value);
  event.preventDefault();
}

async function copyRequest(event) {
  await navigator.clipboard.writeText(request.value);
  event.preventDefault();
}

// TODO: For test
const data = {
  "id": 1,
  "name": "Session 1",
  "status": "RUNNING",
  "server": {
    "id": 1,
    "name": "Server 1",
    "connection": {
      "url": "http://localhost:8080"
    }
  }

}
response.value = JSON.stringify(data, null, 2)

</script>

<template>
  <Splitter style="min-height: 75%" class="mb-5">
    <SplitterPanel :size="40">
      <div class="px-4 pb-4">
        <div class="flex justify-content-center align-items-center">
          <h5 class="m-0">Screenshot</h5>
          <RefreshButton
              @click="refreshScreenshot"
          ></RefreshButton>
        </div>
        <div>
          <img src="/demo/images/nature/nature9.jpg" alt="Nature 9"
               style=" width:100%; height:100%"
          />
        </div>
      </div>
    </SplitterPanel>

    <SplitterPanel :size="100">
      <Splitter layout="vertical">
        <SplitterPanel :size="50">
          <div class="p-4 pt-0">
            <div class="flex justify-content-center align-items-center">
              <h5 class="m-0">Request</h5>
              <Button
                  rounded
                  text=""
                  v-tooltip.focus.bottom="{ value: 'Copied to clipboard' }"
                  :tabindex="0"
                  icon="pi pi-copy"
                  @click="copyRequest($event)">
              </Button>
            </div>
          </div>
        </SplitterPanel>
        <SplitterPanel :size="50">
          <div class="p-4 pt-0 flex flex-column h-full">
            <div class="flex justify-content-center align-items-center">
              <h5 class="m-0">Response</h5>
              <Button
                  rounded
                  text=""
                  v-tooltip.focus.bottom="{ value: 'Copied to clipboard' }"
                  :tabindex="0"
                  icon="pi pi-copy"
                  @click="copyResponse($event)">
              </Button>
            </div>
            <CodeHighlight class="m-0 p-4">
              {{ response }}
            </CodeHighlight>
          </div>
        </SplitterPanel>
      </Splitter>
    </SplitterPanel>
  </Splitter>

</template>

<style scoped lang="scss">

</style>
