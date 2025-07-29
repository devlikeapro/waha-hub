<script setup>
import {ref} from "vue";
import {useI18n} from 'vue-i18n';

const { t } = useI18n();
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
        t('servers.serverUpdated'),
        t('servers.failedToUpdateServer'),
        server.value.name,
        server.value.name,
    )
  } else {
    await req(
        store.addServer(server.value),
        t('servers.connectedToServer'),
        t('servers.failedToConnectToServer'),
        server.value.name,
        server.value.name,
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
  <Dialog v-model:visible="visible" :header="t('servers.server')" :modal="true" class="p-fluid">
    <div class="mb-4">
      <InlineMessage severity="info">
        {{ t('servers.workersDataSaved') }}
        <br>
        {{ t('servers.safeToStoreApiKey') }}
      </InlineMessage>
    </div>
    <div class="field">
      <label for="name">{{ t('servers.name') }}</label>
      <InputText id="name" v-model.trim="server.name" required="true" autofocus :invalid="submitted && !server.name"/>
      <small class="p-invalid" v-if="submitted && !server.name">{{ t('servers.nameRequired') }}</small>
    </div>
    <div class="field">
      <label for="connection-url">{{ t('servers.apiUrl') }}</label>
      <InputText
          id="connection-url" v-model.trim="server.connection.url" required="true"
          :invalid="submitted && !validConnectionUrl"
      />
      <small class="p-invalid" v-if="submitted && !server.connection.url">{{ t('servers.urlRequired') }}</small>
      <small class="p-invalid" v-if="submitted && !validConnectionUrl">{{ t('servers.urlNotCorrect') }}</small>
      <InlineMessage
          severity="error"
          v-if="isCurrentConnectionSecure && isNotSecureConnection"
          class="mt-2"
      >
        {{ t('servers.mixedContentWarning') }}
        <br/>
        {{ t('servers.notPossibleDueTo') }}
        <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#developer_console" target="_blank">
          {{ t('servers.mixedContent') }}
        </a>
      </InlineMessage>
      <InlineMessage
          severity="warn"
          v-if="isNotSecureConnection"
          class="mt-2"
      >
        {{ t('servers.httpWarning') }}
        <br/>
        {{ t('servers.configureHttps') }}
        <br/>
        <a href="https://waha.devlike.pro/docs/how-to/security/#https" target="_blank">{{ t('servers.readMoreAboutSecurity') }}</a>
      </InlineMessage>
    </div>
    <div class="field">
      <label for="connection-key">{{ t('servers.apiKeyOptional') }}</label>
      <Password id="connection-key" v-model.trim="server.connection.key" :feedback="false" toggleMask/>
    </div>

    <template #footer>
      <Button :label="t('common.cancel')" icon="pi pi-times" text="" @click="hide" severity="secondary"/>
      <Button
          :label="server.id? t('common.save'): t('servers.connect') "
          :icon="{'pi pi-check': !!server.id, 'pi pi-link': !server.id}"
          text="" @click="saveServer"
      />
    </template>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
