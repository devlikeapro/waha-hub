<script setup>
import {computed} from "vue";
import {useToast} from "primevue/usetoast";
import {useServerStore} from "../stores/useServerStore";
import useShowToastOnResult from "../composables/useShowToastOnResult";

const store = useServerStore()
const props = defineProps(['session'])
const req = useShowToastOnResult()
const screenshot = ref(null)

const refreshScreenshot = () => {
  console.log(screenshot)
  screenshot.value.refresh()
}
const response = ref(null)
const requestMethod = ref('POST')
const requestEndpoint = ref('/api/sendText')
const profilePicture = ref(null)
const requestExample = {
  "chatId": "11111111111@c.us",
  "text": "Hi there!",
  "session": props.session.name,
}
const requestBody = ref(JSON.stringify(requestExample, null, 2))
const rpcRequest = computed(() => {
  return {
    method: requestMethod.value,
    uri: requestEndpoint.value,
    params: undefined,
    body: JSON.parse(requestBody.value),
  }
})

async function copyResponse(event) {
  await navigator.clipboard.writeText(response.value);
  event.preventDefault();
}

async function copyRequest(event) {
  await navigator.clipboard.writeText(JSON.stringify(rpcRequest.value, null, 2));
  event.preventDefault();
}

if (props.session?.me?.id) {
  store.getProfilePicture(props.session.server.id, props.session.name, props.session.me.id).then((data) => {
    profilePicture.value = data.profilePictureURL
  })
}

const methods = ['GET', 'POST', 'PUT', 'DELETE', "PATCH"]

const exampleResponse =
    {
      status: 200,
      response: {
        "id": "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA",
        "timestamp": 1666943582,
        "from": "11111111111@c.us",
        "fromMe": true,
        "to": "11111111111@c.us",
        "participant": "string",
      }
    }
response.value = JSON.stringify(exampleResponse, null, 2)

async function sendRequest() {
  const data = await store.callServerAPI(props.session.server.id, rpcRequest.value)
  response.value = JSON.stringify(data, null, 2)
}
</script>

<template>
  <div class="grid">
    <div class="col-12 sm:col-6 h-full">
      <div class="grid">
        <div class="col-12">
          <div class="">
            <div class="flex justify-content-center align-items-center">
              <SessionChip
                  v-if="session.me"
                  :session="session"
                  :image="profilePicture"
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
            <div class="flex justify-content-center align-items-center">
              <SessionScreenshot
                  ref="screenshot"
                  :session="session"
              ></SessionScreenshot>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="col-12 sm:col-6 h-full">
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
                <InputText type="text" class="w-full" v-model="requestEndpoint"/>
              </div>
              <div class="text-center">
                <div class="mb-2">Body</div>
                <Textarea v-model="requestBody" rows=8 class="w-full"/>
              </div>
            </div>
            <div class="text-center mt-2">
              <Button @click="sendRequest"><b>Send</b></Button>
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
          <CodeHighlight class="m-0 p-4" style="text-wrap: pretty;">
            {{ response }}
          </CodeHighlight>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
