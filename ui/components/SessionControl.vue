<script setup>
import {useToast} from "primevue/usetoast";
import {useServerStore} from "../stores/useServerStore";

const props = defineProps(['session'])
const toast = useToast();
const refreshScreenshot = () => {
  toast.add({severity: 'info', summary: 'Screenshot', detail: 'Refreshing screenshot'});
}
const response = ref(null)
const requestMethod = ref('POST')
const requestEndpoint = ref('/api/sendText')
const requestExample = {
  "chatId": "11111111111@c.us",
  "text": "Hi there!",
  "session": props.session.name,
}
const requestBody = ref(JSON.stringify(requestExample, null, 2))

async function copyResponse(event) {
  await navigator.clipboard.writeText(response.value);
  event.preventDefault();
}

async function copyRequest(event) {
  const value = `${requestMethod.value} ${requestEndpoint.value}\n` + requestBody.value
  await navigator.clipboard.writeText(value);
  event.preventDefault();
}
const methods = ['GET', 'POST', 'PUT', 'DELETE', "PATCH"]

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
          <div class="p-4 pt-0 h-full flex flex-column">
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
            <div class="flex flex-column justify-content-between h-full">
              <div class="flex flex-column gap-2">
                <div class="flex gap-2">
                  <Dropdown
                      v-model="requestMethod"
                      :options="methods"
                  />
                  <InputText type="text" class="w-full" v-model="requestEndpoint"/>
                </div>
                <div class="text-center">
                  <div class="mb-2">Body</div>
                  <Textarea v-model="requestBody" rows=8 class="w-full"/>
                </div>
              </div>
              <div class="text-center">
                <Button><b>Execute</b></Button>
              </div>
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
