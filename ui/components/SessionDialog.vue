<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref, toRaw} from "vue";
import lodash from "lodash";
import {useAsyncData} from "nuxt/app";

const visible = defineModel("visible");
const session = defineModel("session");

const toast = useToast();
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
    await store.startSession(session.value.server, sessionStartRequest.value)
  } finally {
    loading.value = false
  }

  hide()
  session.value = undefined
}

function hide() {
  submitted.value = false;
  visible.value = false;
}

</script>

<template>
  <Dialog
      v-model:visible="visible" :style="{ width: '450px' }" header="Session" :modal="true" class="p-fluid"
      maximizable
  >
    <div class="field">
      <label for="server">Server</label>
      <ServerDropdown
          placeholder="Select Server"
          v-model="session.server"
          :showClear="false"
          :required="true"
          :invalid="submitted && !session.server"
      ></ServerDropdown>
      <small class="p-invalid" v-if="submitted && !session.server">Server is required.</small>
    </div>

    <div class="field">
      <label for="name">Name</label>
      <InputText id="name" v-model.trim="session.name" required="true" autofocus :invalid="submitted && !session.name"/>
      <small class="p-invalid" v-if="submitted && !session.name">Name is required.</small>
    </div>

    <div class="field">
      <SessionWebhooksField
          v-model:webhooks="session.config.webhooks"
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
      >
        <template #icon>
          <font-awesome-icon icon="fa-solid fa-bug" class="mr-2"/>
        </template>
      </ToggleButton>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text="" @click="hide" severity="secondary"/>
      <Button
          :label="false? 'Start': 'Start New' "
          :icon="{'pi pi-check': !!session.server, 'pi pi-plus': !session.server}"
          text=""
          @click="saveSession"
          :loading="loading"
      />
    </template>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
