<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref, computed, watch} from "vue";
import lodash from "lodash";
import {useI18n} from "vue-i18n";

const toast = useToast();
import useShowToastOnResult from "../composables/useShowToastOnResult";
import {useToast} from "primevue/usetoast";
import {convertKeyValueToList} from "../../utils/objects";

const {t} = useI18n();

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
const chatsFilterEnabled = ref(session.value.config?.ignore != null)
const includeStatus = ref(!session.value.config?.ignore?.status)
const includeGroups = ref(!session.value.config?.ignore?.groups)
const includeChannels = ref(!session.value.config?.ignore?.channels)

watch(session, async (newSession, _) => {
  proxyEnabled.value = newSession?.config?.proxy?.server
  metadataKeyValue.value = convertKeyValueToList(newSession.config?.metadata)
  chatsFilterEnabled.value = newSession?.config?.ignore != null
  includeStatus.value = !newSession?.config?.ignore?.status
  includeGroups.value = !newSession?.config?.ignore?.groups
  includeChannels.value = !newSession?.config?.ignore?.channels
})
const submitted = ref(false);
const loading = ref(false);
const sessionConfig = computed(
    () => {
      const config = lodash.cloneDeep(session.value.config)
      if (!proxyEnabled.value) {
        config.proxy = undefined
      }
      if (chatsFilterEnabled.value){
        config.ignore = {
          status: !includeStatus.value,
          groups: !includeGroups.value,
          channels: !includeChannels.value,
        }
      } else {
        config.ignore = undefined
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
  if (!isWEBJS.value) {
    delete config.webjs
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
        t('sessions.failedToUpdateSession'),
    )
    toast.add({
      severity: 'success',
      summary: t('sessions.updated'),
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
        t('sessions.failedToStartSession'),
    )
    const summary = start ? t('sessions.started') : t('sessions.created')
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
      createSessionRequest.value,
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
          {{ t('sessions.createSession') }}
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
        {{ t('sessions.changeServerOrNameInfo') }}
      </InlineMessage>
    </div>

    <div class="field">
      <label for="server">{{ t('sessions.server') }}</label>
      <ServerDropdown
          :placeholder="t('sessions.selectServer')"
          v-model="session.server"
          :showClear="false"
          :required="true"
          :invalid="submitted && !session.server"
          :disabled="disabledServer"
      ></ServerDropdown>
      <small class="p-invalid" v-if="submitted && !session.server">{{ t('sessions.serverRequired') }}</small>
    </div>

    <div class="field">
      <label for="name">{{ t('sessions.nameOptional') }}</label>
      <InputText
          id="name"
          v-model.trim="session.name"
          required="false"
          autofocus
          :placeholder="t('sessions.sessionIdPlaceholder')"
          :disabled="!modeNew"
      />
    </div>

    <div class="mb-4" v-if="isNOWEB">
      <div class="mb-3">
        <h5>🏭 {{ t('sessions.engineSettings') }}</h5>
      </div>
      <Accordion :activeIndex="0">
        <AccordionTab header="NOWEB">
          <!-- Store -->
          <div class="flex flex-column gap-2">
            <div>
              <a href="https://waha.devlike.pro/docs/engines/noweb" target="_blank">{{
                  t('sessions.readMoreAboutNOWEB')
                }}</a>
            </div>

            <div>
              <ToggleButton
                  v-model="session.config.noweb.markOnline"
                  :onLabel="t('sessions.presenceOnline')"
                  :offLabel="t('sessions.presenceOffline')"
                  v-tooltip="t('sessions.presenceTooltip')"
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
                    :onLabel="t('sessions.storeEnabled')"
                    :offLabel="t('sessions.storeDisabled')"
                    v-tooltip="t('sessions.storeTooltip')"
                >
                  <template #icon>
                    <font-awesome-icon icon="fa-solid fa-folder" class="mr-2"/>
                  </template>
                </ToggleButton>
              </div>

              <div>
                <ToggleButton
                    v-model="session.config.noweb.store.fullSync"
                    :onLabel="t('sessions.storeFullSyncOn')"
                    :offLabel="t('sessions.storeFullSyncOff')"
                    v-tooltip="t('sessions.storeFullSyncTooltip')"
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

    <div class="mb-4" v-if="isWEBJS">
      <div class="mb-3">
        <h5>🏭 {{ t('sessions.engineSettings') }}</h5>
      </div>
      <Accordion :activeIndex="0">
        <AccordionTab header="WEBJS">
          <div class="flex flex-column gap-2">
            <div>
              <ToggleButton
                  v-model="session.config.webjs.tagsEventsOn"
                  :onLabel="t('sessions.webjs.tagsEventsOnOn')"
                  :offLabel="t('sessions.webjs.tagsEventsOnOff')"
                  v-tooltip="t('sessions.webjs.tagsEventsOnTooltip')"
              >
                <template #icon>
                  <font-awesome-icon icon="fa-solid fa-tag" class="mr-2"/>
                </template>
              </ToggleButton>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <div>
      <div>
        <h5>📝 {{ t('sessions.metadata') }}&nbsp;
          <i
              v-tooltip="t('sessions.metadataTooltip')"
              class="pi pi-info-circle"></i>
        </h5>
      </div>

      <KeyValueTable
          v-model="metadataKeyValue"
          :entity-name="t('sessions.metadata')"
          key-column="key"
          :key-column-name="t('sessions.key')"
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
          <h5>
            <label for="chats-filter">{{ t('sessions.config.ignore.title') }}</label>&nbsp;
            <i v-tooltip="t('sessions.config.ignore.tooltip')" class="pi pi-info-circle"></i>
          </h5>
        </div>
        <ToggleButton
            v-model="chatsFilterEnabled"
            id="ignore"
            :onLabel="t('sessions.config.ignore.filterOn')"
            :offLabel="t('sessions.config.ignore.filterOff')"
        >
          <template #icon>
            <font-awesome-icon icon="fa-solid fa-filter" class="mr-2"/>
          </template>
        </ToggleButton>
      </div>

      <div v-if="chatsFilterEnabled" class="card mb-4">
        <div class="flex gap-2">
          <ToggleButton
              v-model="includeStatus"
              id="include-status"
              :onLabel="'' + t('sessions.config.ignore.status.title') + ': ' + t('sessions.config.ignore.on')"
              :offLabel="'' + t('sessions.config.ignore.status.title') + ': ' + t('sessions.config.ignore.off')"
          >
          </ToggleButton>
          <ToggleButton
              v-model="includeGroups"
              id="include-groups"
              :onLabel="'' + t('sessions.config.ignore.groups.title') + ': ' + t('sessions.config.ignore.on')"
              :offLabel="'' + t('sessions.config.ignore.groups.title') + ': ' + t('sessions.config.ignore.off')"
          >
          </ToggleButton>
          <ToggleButton
              v-model="includeChannels"
              id="include-channels"
              :onLabel="'' + t('sessions.config.ignore.channels.title') + ': ' + t('sessions.config.ignore.on')"
              :offLabel="'' + t('sessions.config.ignore.channels.title') + ': ' + t('sessions.config.ignore.off')"
          >
          </ToggleButton>
        </div>
      </div>
    </div>


    <div>
      <div class="field flex justify-content-between align-items-center">
        <div>
          <h5><label for="proxy">🌐 {{ t('sessions.proxy') }}</label></h5>
        </div>
        <ToggleButton
            v-model="proxyEnabled"
            id="proxy"
            :onLabel="t('sessions.proxyOn')"
            :offLabel="t('sessions.proxyOff')"
        >
          <template #icon>
            <font-awesome-icon icon="fa-solid fa-server" class="mr-2"/>
          </template>
        </ToggleButton>
      </div>

      <div v-if="proxyEnabled" class="card mb-4">
        <div class="field">
          <label for="proxy-server">{{ t('sessions.server') }}</label>
          <InputText
              id="proxy-server"
              v-model.trim="session.config.proxy.server"
              required="true"
              :invalid="submitted && !session.config.proxy.server"
              :placeholder="t('sessions.hostPort')"
          />
          <small class="p-invalid" v-if="submitted && !session.config.proxy.server">{{
              t('sessions.serverRequired')
            }}</small>
        </div>
        <div class="flex gap-3">
          <div class="field w-full">
            <label for="proxy-username">{{ t('sessions.usernameOptional') }}</label>
            <InputText
                id="proxy-username"
                v-model.trim="session.config.proxy.username"
            />
          </div>
          <div class="field w-full">
            <label for="proxy-password">{{ t('sessions.passwordOptional') }}</label>
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
        <h5><label for="debug">🛠️ {{ t('sessions.debug') }}</label></h5>
      </div>
      <ToggleButton
          v-model="session.config.debug"
          :onLabel="t('sessions.debugEnabled')"
          :offLabel="t('sessions.debugDisabled')"
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
            {{ t('sessions.sessionRestartWarning', {status: session.status}) }}
          </InlineMessage>
        </div>
        <div class="flex justify-content-end">
          <Button
              :label="t('common.cancel')"
              icon="pi pi-times"
              text=""
              @click="hide"
              severity="secondary"
          />
          <Button
              :label="t('sessions.copy')"
              text=""
              v-tooltip.focus.bottom="{ value: t('sessions.copiedToClipboard') }"
              :tabindex="0"
              icon="pi pi-copy"
              severity="secondary"
              @click="copyRequest($event)">
          </Button>
          <Button
              v-if="!modeUpdate"
              :label="t('sessions.create')"
              icon="pi pi-plus"
              text=""
              @click="createSession(false)"
              :loading="loading"
          />
          <Button
              v-if="!modeUpdate"
              :label="t('sessions.createAndStart')"
              icon="pi pi-play"
              text
              @click="createSession(true)"
              :loading="loading"
          />
          <Button
              v-if="modeUpdate"
              :label="t('sessions.update')"
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
