<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref, computed, watch} from "vue";
import lodash from "lodash";

const toast = useToast();
import useShowToastOnResult from "../composables/useShowToastOnResult";
import {useToast} from "primevue/usetoast";

const visible = defineModel("visible");
const session = defineModel("session");
const props = defineProps({
  mode: String,
})
const modeNew = computed(() => props.mode === 'new')
const modeView = computed(() => props.mode === 'view')
const modeStart = computed(() => props.mode === 'start')

const disabled = computed(() => modeView.value)
const disabledServer = computed(() => disabled.value || modeStart.value)


const req = useShowToastOnResult()
const store = useServerStore()

const server = computed(() => {
  return store.getServer(session.value.server)
})

const isNOWEB = computed(() => server.value?.version?.engine === 'NOWEB')
const isWEBJS = computed(() => server.value?.version?.engine === 'WEBJS')

const proxyEnabled = ref(!!session.value.config?.proxy?.server)
watch(session, async (newSession, _) => {
  proxyEnabled.value = newSession?.config?.proxy?.server
})
const submitted = ref(false);
const loading = ref(false);
const startConfig = computed(
    () => {
      const config = lodash.cloneDeep(session.value.config)
      if (!proxyEnabled.value) {
        config.proxy = undefined
      }
      return config
    }
)

const sessionStartRequest = computed(() => {
  const config = {...startConfig.value}
  if (!isNOWEB.value) {
    delete config.noweb
  }
  return {
    name: session.value.name,
    config: config,
    start: true,
  }
})

async function saveSession() {
  submitted.value = true;

  try {
    loading.value = true
    const result = await req(
        store.createSession(session.value.server, sessionStartRequest.value),
        undefined,
        "Failed to start session",
    )
    toast.add({
      severity: 'success',
      summary: `Started`,
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

const canNotStartSession = computed(() => {
  return modeStart.value && (!['STOPPED', 'FAILED'].includes(session.value.status))
})

async function copyRequest(event) {
  await navigator.clipboard.writeText(JSON.stringify(
      {
        method: "POST",
        uri: "/api/sessions/start",
        body: sessionStartRequest.value,
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
      header="Session"
      :modal="true"
      class="p-fluid"
      maximizable
  >
    <template #header v-if="!modeNew">
      <SessionHeader :session="session"></SessionHeader>
    </template>
    <div class="mb-2">
      <InlineMessage severity="info" v-if="modeStart">
        To change the <b>Server</b> or <b>Name</b> - please logout from the session and run again.
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
        <label>Engine Settings </label>
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
                  v-model="session.config.noweb.store.enabled"
                  onLabel="Store: Enabled"
                  offLabel="Store: Disabled"
                  :disabled="disabledServer"
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
                  :disabled="disabledServer"
                  v-tooltip="'Sync all contacts, chats, messages from the phone at the start.\nOtherwise the store can miss some information.'"
              >
                <template #icon>
                  <font-awesome-icon icon="fa-solid fa-sync" class="mr-2"/>
                </template>
              </ToggleButton>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <div class="field">
      <SessionWebhooksField
          ref="webhooks"
          v-model:webhooks="session.config.webhooks"
          :disabled="disabled"
      ></SessionWebhooksField>
    </div>

    <div>
      <div class="field flex justify-content-between align-items-center">
        <div>
          <label for="debug">Proxy</label>
        </div>
        <ToggleButton
            v-model="proxyEnabled"
            onLabel="Proxy On"
            offLabel="Proxy Off"
            :disabled="disabled"
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
              :disabled="modeView"
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
                :disabled="modeView"
            />
          </div>
          <div class="field w-full">
            <label for="proxy-password">Password (optional)</label>
            <Password
                id="proxy-password"
                v-model.trim="session.config.proxy.password"
                :disabled="modeView"
                :feedback="false"
                toggleMask
            />
          </div>
        </div>
      </div>
    </div>

    <div class="field flex justify-content-between align-items-center">
      <div>
        <label for="debug">Debug Mode</label>
      </div>
      <ToggleButton
          v-model="session.config.debug"
          onLabel="Debug Enabled"
          offLabel="Debug Disabled"
          onIcon="fa fa-bug"
          :disabled="disabled"
      >
        <template #icon>
          <font-awesome-icon icon="fa-solid fa-bug" class="mr-2"/>
        </template>
      </ToggleButton>
    </div>

    <template #footer>
      <div class="w-full flex flex-column gap-2">
        <div>
          <InlineMessage severity="warn" v-if="canNotStartSession">
            The session is in '<b>{{ session.status }}'</b> status!
            If you want to change config - please stop it first and run again.
          </InlineMessage>
        </div>
        <div class="flex justify-content-end">
          <Button
              label="Copy Request"
              text=""
              v-tooltip.focus.bottom="{ value: 'Copied to clipboard' }"
              :tabindex="0"
              icon="pi pi-copy"
              severity="secondary"
              @click="copyRequest($event)">
          </Button>
          <Button
              :label="modeView ? 'Close' : 'Cancel'"
              icon="pi pi-times"
              text=""
              severity="secondary"
              @click="hide"
          />
          <Button
              v-if="!modeView"
              :label="modeNew? 'Start New': 'Start' "
              icon="pi pi-play"
              text=""
              @click="saveSession"
              :loading="loading"
              :disabled="canNotStartSession"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">

</style>
