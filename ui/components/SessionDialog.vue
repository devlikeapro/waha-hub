<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref, computed} from "vue";
import lodash from "lodash";
import useShowToastOnResult from "../composables/useShowToastOnResult";

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

const submitted = ref(false);
const loading = ref(false);

const sessionStartRequest = computed(
    () => {
      return {
        name: session.value.name,
        config: lodash.cloneDeep(session.value.config),
      }
    })

async function saveSession() {
  submitted.value = true;
  if (!session.value.name) {
    return
  }

  try {
    loading.value = true
    await req(
        store.startSession(session.value.server, sessionStartRequest.value),
        "Session Started",
        "Failed to start session",
    )
  } finally {
    loading.value = false
  }
  toast.add({severity: 'success', summary: 'Successful', detail: 'Session Started', life: 3000});
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
      <label for="name">Name</label>
      <InputText
          id="name" v-model.trim="session.name" required="true" autofocus :invalid="submitted && !session.name"
          :disabled="!modeNew"
      />
      <small class="p-invalid" v-if="submitted && !session.name">Name is required.</small>
    </div>

    <div class="field">
      <SessionWebhooksField
          ref="webhooks"
          v-model:webhooks="session.config.webhooks"
          :disabled="disabled"
      ></SessionWebhooksField>
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
    <div>
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
          <Button :label="modeView ? 'Close' : 'Cancel'" icon="pi pi-times" text="" @click="hide" severity="secondary"/>
          <Button
              v-if="!modeView"
              :label="modeNew? 'Start New': 'Start' "
              :icon="{'pi pi-play': modeStart, 'pi pi-plus': modeNew}"
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
