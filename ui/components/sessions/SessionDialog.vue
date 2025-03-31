<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref, computed, watch} from "vue";
import lodash from "lodash";

const toast = useToast();
import useShowToastOnResult from "../composables/useShowToastOnResult";
import {useToast} from "primevue/usetoast";
import {convertKeyValueToList} from "../../utils/objects";

const visible = defineModel("visible");
const session = defineModel("session");
const props = defineProps({
  mode: String,
})
const modeNew = computed(() => props.mode === 'new')
const modeUpdate = computed(() => props.mode === 'update')

const disabledServer = computed(() => modeUpdate.value)


const req = useShowToastOnResult()
const store = useServerStore()

const server = computed(() => {
  return store.getServer(session.value.server)
})

const isNOWEB = computed(() => server.value?.version?.engine === 'NOWEB')
const isWEBJS = computed(() => server.value?.version?.engine === 'WEBJS')

const metadataKeyValue = ref([])

const proxyEnabled = ref(!!session.value.config?.proxy?.server)
watch(session, async (newSession, _) => {
  proxyEnabled.value = newSession?.config?.proxy?.server
  metadataKeyValue.value = convertKeyValueToList(newSession.config?.metadata)
})
const submitted = ref(false);
const loading = ref(false);
const sessionConfig = computed(
    () => {
      const config = lodash.cloneDeep(session.value.config)
      if (!proxyEnabled.value) {
        config.proxy = undefined
      }
      config.metadata = convertListToKeyValue(metadataKeyValue.value)
      return config
    }
)

const createSessionRequest = computed(() => {
  const config = {...sessionConfig.value}
  if (!isNOWEB.value) {
    delete config.noweb
  }
  return {
    name: session.value.name,
    config: config,
  }
})

async function updateSession() {
  submitted.value = true;

  try {
    loading.value = true
    const body = lodash.cloneDeep(createSessionRequest.value)
    await req(
        store.updateSession(session.value.server, session.value.name, body.config),
        undefined,
        "Failed to update session",
    )
    toast.add({
      severity: 'success',
      summary: "Updated",
      detail: session.value.name,
      life: 3000
    });
  } finally {
    loading.value = false
  }
  session.value = undefined
  hide()
}

async function createSession(start) {
  submitted.value = true;

  try {
    loading.value = true
    const body = lodash.cloneDeep(createSessionRequest.value)
    body.start = start
    const result = await req(
        store.createSession(session.value.server, body),
        undefined,
        "Failed to start session",
    )
    const summary = start ? 'Started' : 'Created'
    toast.add({
      severity: 'success',
      summary: summary,
      detail: result.name,
      life: 3000
    });
  } finally {
    loading.value = false
  }
  session.value = undefined
  hide()
}

function hide() {
  submitted.value = false;
  visible.value = false;
}

const isStopped = computed(() => {
  return session.value.status === "STOPPED"
})

async function copyRequest(event) {
  await navigator.clipboard.writeText(JSON.stringify(
      {
        method: "POST",
        uri: "/api/sessions",
        body: createSessionRequest.value,
      },
      null,
      2
  ));
  event.preventDefault();
}

</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      class="p-fluid"
      maximizable
  >
    <template #header v-if="modeNew">
      <div>
        <h5>
          <i class="pi pi-whatsapp"></i>
          Create Session
        </h5>
      </div>
    </template>
    <template #header v-if="!modeNew">
      <div>
        <SessionHeader :session="session"></SessionHeader>
      </div>
    </template>
    <div class="mb-2">
      <InlineMessage severity="info" v-if="modeUpdate">
        To change the <b>Server</b> or <b>Name</b> - please remove the session and run again.
      </InlineMessage>
    </div>

    <div class="field">
      <label for="server">Server</label>
      <ServerDropdown
          placeholder="Select Server"
          v-model="session.server"
          :showClear="false"
          :required="true"
          :invalid="submitted && !session.server"
          :disabled="disabledServer"
      ></ServerDropdown>
      <small class="p-invalid" v-if="submitted && !session.server">Server is required.</small>
    </div>

    <div class="field">
      <label for="name">Name (optional)</label>
      <InputText
          id="name"
          v-model.trim="session.name"
          required="false"
          autofocus
          placeholder="session_1111111111111"
          :disabled="!modeNew"
      />
    </div>

    <div class="mb-4" v-if="isNOWEB">
      <div class="mb-3">
        <h5>🏭 Engine Settings </h5>
      </div>
      <Accordion :activeIndex="0">
        <AccordionTab header="NOWEB">
          <template #header>
            &nbsp;<Tag value="New"></Tag>
          </template>
          <!-- Store -->
          <div class="flex flex-column gap-2">
            <div>
              <a href="https://waha.devlike.pro/docs/engines/noweb" target="_blank">Read more about NOWEB settings</a>
            </div>

            <div>
              <ToggleButton
                  v-model="session.config.noweb.markOnline"
                  onLabel="Presence: online"
                  offLabel="Presence: offline"
                  v-tooltip="'Send presence when connect for the connected session. If presence online - you don not get notifications in your phone'"
              >
                <template #icon>
                  <font-awesome-icon icon="fa-solid fa-sync" class="mr-2"/>
                </template>
              </ToggleButton>
            </div>

            <div class="flex gap-2">
              <div>
                <ToggleButton
                    v-model="session.config.noweb.store.enabled"
                    onLabel="Store: Enabled"
                    offLabel="Store: Disabled"
                    v-tooltip="'Store contacts, chats, messages in the database, so you can get it in API'"
                >
                  <template #icon>
                    <font-awesome-icon icon="fa-solid fa-folder" class="mr-2"/>
                  </template>
                </ToggleButton>
              </div>

              <div>
                <ToggleButton
                    v-model="session.config.noweb.store.fullSync"
                    onLabel="Store: Full Sync On"
                    offLabel="Store: Full Sync Off"
                    v-tooltip="'Sync all contacts, chats, messages from the phone at the start.\nOtherwise the store can miss some information.'"
                >
                  <template #icon>
                    <font-awesome-icon icon="fa-solid fa-sync" class="mr-2"/>
                  </template>
                </ToggleButton>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <div>
      <div>
        <h5>📝 Metadata
          <i
              v-tooltip='"Key value pairs you can attach to Session and will receive it in webhooks, API and search the values on Dashboard."'
              class="pi pi-info-circle"></i>
        </h5>
      </div>

      <KeyValueTable
          v-model="metadataKeyValue"
          entity-name="Metadata"
          key-column="key"
          key-column-name="Key"
          prefix="user.id."
      ></KeyValueTable>
    </div>

    <div class="field mt-4">
      <SessionWebhooksField
          ref="webhooks"
          v-model:webhooks="session.config.webhooks"
      ></SessionWebhooksField>
    </div>

    <div>
      <div class="field flex justify-content-between align-items-center">
        <div>
          <h5><label for="proxy">🌐 Proxy</label></h5>
        </div>
        <ToggleButton
            v-model="proxyEnabled"
            id="proxy"
            onLabel="Proxy On"
            offLabel="Proxy Off"
        >
          <template #icon>
            <font-awesome-icon icon="fa-solid fa-server" class="mr-2"/>
          </template>
        </ToggleButton>
      </div>

      <div v-if="proxyEnabled" class="card mb-4">
        <div class="field">
          <label for="proxy-server">Server</label>
          <InputText
              id="proxy-server"
              v-model.trim="session.config.proxy.server"
              required="true"
              :invalid="submitted && !session.config.proxy.server"
              placeholder="host:port"
          />
          <small class="p-invalid" v-if="submitted && !session.config.proxy.server">Server is required.</small>
        </div>
        <div class="flex gap-3">
          <div class="field w-full">
            <label for="proxy-username">Username (optional)</label>
            <InputText
                id="proxy-username"
                v-model.trim="session.config.proxy.username"
            />
          </div>
          <div class="field w-full">
            <label for="proxy-password">Password (optional)</label>
            <Password
                id="proxy-password"
                v-model.trim="session.config.proxy.password"
                :feedback="false"
                toggleMask
            />
          </div>
        </div>
      </div>
    </div>

    <div class="field flex justify-content-between align-items-center">
      <div>
        <h5><label for="debug">🛠️ Debug</label></h5>
      </div>
      <ToggleButton
          v-model="session.config.debug"
          onLabel="Debug Enabled"
          offLabel="Debug Disabled"
          onIcon="fa fa-bug"
      >
        <template #icon>
          <font-awesome-icon icon="fa-solid fa-bug" class="mr-2"/>
        </template>
      </ToggleButton>
    </div>

    <template #footer>
      <div class="w-full flex flex-column gap-2">
        <div>
          <InlineMessage severity="warn" v-if="modeUpdate && !isStopped">
            The session is in '<b>{{ session.status }}'</b> status,
            in order to save configuration the session will be restarted.
          </InlineMessage>
        </div>
        <div class="flex justify-content-end">
          <Button
              label="Copy"
              text=""
              v-tooltip.focus.bottom="{ value: 'Copied to clipboard' }"
              :tabindex="0"
              icon="pi pi-copy"
              severity="secondary"
              @click="copyRequest($event)">
          </Button>
          <Button
              v-if="!modeUpdate"
              label="Create"
              icon="pi pi-plus"
              text=""
              @click="createSession(false)"
              :loading="loading"
          />
          <Button
              v-if="!modeUpdate"
              label="Create & Start"
              icon="pi pi-play"
              text
              @click="createSession(true)"
              :loading="loading"
          />
          <Button
              v-if="modeUpdate"
              label="Update"
              icon="pi pi-save"
              text=""
              @click="updateSession"
              :loading="loading"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">

</style>
