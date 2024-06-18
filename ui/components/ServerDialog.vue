<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref} from "vue";
import useShowToastOnResult from "../composables/useShowToastOnResult";

const visible = defineModel("visible");
const server = defineModel("server");

const store = useServerStore()
const req = useShowToastOnResult()

const submitted = ref(false);
const validConnectionUrl = computed(
    () => {
      const url = server.value.connection?.url
      if (!url) return false
      return url.startsWith("http://") || url.startsWith("https://")
    })


async function saveServer() {
  submitted.value = true;
  if (!server.value.name || !validConnectionUrl.value) {
    return
  }

  if (server.value.id) {
    await req(
        store.editServer(server.value.id, server.value),
        "Server updated",
        "Failed to update server",
    )
  } else {
    await req(
        store.addServer(server.value),
        "Connected to server",
        "Failed to connect to server",
    )
  }
  hide()
  server.value = {connection: {}}
}

function hide() {
  submitted.value = false;
  visible.value = false;
}

const isNotSecureConnection = computed(() => {
  const url = server.value.connection?.url
  if (!url) return false
  return url.startsWith("http://")
})

// Check if site us using https
const isCurrentConnectionSecure = computed(() => {
  return location.protocol === 'https:'
})

</script>

<template>
  <Dialog v-model:visible="visible" header="Server" :modal="true" class="p-fluid">
    <div class="mb-4">
      <InlineMessage severity="info">
        Servers data is saved in your <b>browser's local storage</b>.
        <br>
        It's safe to put server API and key here.
      </InlineMessage>
    </div>
    <div class="field">
      <label for="name">Name</label>
      <InputText id="name" v-model.trim="server.name" required="true" autofocus :invalid="submitted && !server.name"/>
      <small class="p-invalid" v-if="submitted && !server.name">Name is required.</small>
    </div>
    <div class="field">
      <label for="connection-url">API URL</label>
      <InputText
          id="connection-url" v-model.trim="server.connection.url" required="true"
          :invalid="submitted && !validConnectionUrl"
      />
      <small class="p-invalid" v-if="submitted && !server.connection.url">URL is required.</small>
      <small class="p-invalid" v-if="submitted && !validConnectionUrl">URL is not correct.</small>
      <InlineMessage
          severity="error"
          v-if="isCurrentConnectionSecure && isNotSecureConnection"
          class="mt-2"
      >
        You're using <b>https://</b> connection but server is using <b>http://</b> connection.
        <br/>
        It's not possible to use it due to
        <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#developer_console" target="_blank">
          Mixed Content
        </a>
      </InlineMessage>
      <InlineMessage
          severity="warn"
          v-if="isNotSecureConnection"
          class="mt-2"
      >
        You're using <b>http://</b> connection which is not secure.
        <br/>
        Kindly configure HTTPS Connection.
        <br/>
        Read more about <a href="https://waha.devlike.pro/docs/how-to/security/#https" target="_blank">🔒 Security -></a>
      </InlineMessage>
    </div>
    <div class="field">
      <label for="connection-key">API Key (optional)</label>
      <Password id="connection-key" v-model.trim="server.connection.key" :feedback="false" toggleMask/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text="" @click="hide" severity="secondary"/>
      <Button
          :label="server.id? 'Save': 'Connect' "
          :icon="{'pi pi-check': !!server.id, 'pi pi-link': !server.id}"
          text="" @click="saveServer"
      />
    </template>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
