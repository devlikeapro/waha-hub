<script setup>
import {ref, onMounted, computed} from "vue";

const store = useServerStore()
const props = defineProps(['session'])
const response = ref(null)
const requestMethod = ref('POST')
const requestEndpoint = ref('/api/sendText')
const requestBody = ref("")
const fetching = ref(false)
const responseFailed = ref(false)

function stringify(obj) {
  return JSON.stringify(obj, null, 2)
}

function parseOrStr(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return str
  }
}

const rpcRequest = computed(() => {
  return {
    method: requestMethod.value,
    uri: requestEndpoint.value,
    params: undefined,
    body: parseOrStr(requestBody.value),
  }
})
const methods = ['GET', 'POST', 'PUT', 'DELETE', "PATCH"]

async function copyResponse(event) {
  await navigator.clipboard.writeText(response.value);
  event.preventDefault();
}

async function copyRequest(event) {
  await navigator.clipboard.writeText(stringify(rpcRequest.value));
  event.preventDefault();
}

async function sendRequest() {
  try {
    responseFailed.value = false
    fetching.value = true
    const data = await store.callServerAPI(props.session.server.id, rpcRequest.value)
    response.value = stringify(data)
  } catch (e) {
    responseFailed.value = true
    if (e.response) {
      response.value = stringify(e.response.data)
    } else {
      response.value = stringify(e)
    }
  } finally {
    fetching.value = false
  }
}

onMounted(() => {
  const requestExample = {
    "chatId": "11111111111@c.us",
    "text": "Hi there!",
    "session": props.session.name,
  }
  requestBody.value = stringify(requestExample)
  response.value = "..."
})

</script>

<template>
  <div>
    <div class="h-full flex flex-column">
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
            <InputText type="text" class="w-full" v-model="requestEndpoint"
                       placeholder="API Endpoint"
            />
          </div>
          <div class="text-center">
            <div class="mb-2">Body</div>
            <Textarea v-model="requestBody" rows=8 class="w-full" placeholder="Request"/>
          </div>
        </div>
        <div class="text-center mt-2">
          <Button @click="sendRequest" :loading="fetching" label="Send" icon="pi pi-send" icon-pos="right">
          </Button>
        </div>
      </div>
    </div>
  </div>
  <Divider/>

  <div>
    <div class="flex flex-column h-full">
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
      <CodeHighlight class="m-0 p-4 pretty" :invalid="responseFailed">
        {{ response }}
      </CodeHighlight>
    </div>
  </div>

</template>

<style scoped lang="scss">
.pretty {
  text-wrap: pretty;
}

</style>
