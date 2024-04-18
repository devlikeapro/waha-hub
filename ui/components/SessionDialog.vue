<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref} from "vue";

const visible = defineModel("visible");
const session = defineModel("session");

const toast = useToast();
const store = useServerStore()

const submitted = ref(false);
const validConnectionUrl = computed(
    () => {
      const url = session.value.connection?.url
      if (!url) return false
      return url.startsWith("http://") || url.startsWith("https://")
    })


async function savesession() {
  submitted.value = true;
  if (!session.value.name || !validConnectionUrl.value) {
    return
  }

  if (session.value.id) {
    await store.editsession(session.value.id, session.value)
    toast.add({severity: 'success', summary: 'Successful', detail: 'Updated', life: 3000});
  } else {
    await store.addsession(session.value)
    toast.add({severity: 'success', summary: 'Successful', detail: 'Created', life: 3000});
  }
  hide()
  session.value = {connection: {}}
}

function hide() {
  submitted.value = false;
  visible.value = false;
}

</script>

<template>
  <Dialog v-model:visible="visible" :style="{ width: '450px' }" header="session" :modal="true" class="p-fluid">
    <div class="field">
      <label for="name">Name</label>
      <InputText id="name" v-model.trim="session.name" required="true" autofocus :invalid="submitted && !session.name"/>
      <small class="p-invalid" v-if="submitted && !session.name">Name is required.</small>
    </div>
    <div class="field">
      <label for="connection-url">API URL</label>
      <InputText id="connection-url" v-model.trim="session.connection.url" required="true"
                 :invalid="submitted && !validConnectionUrl"/>
      <small class="p-invalid" v-if="submitted && !session.connection.url">URL is required.</small>
      <small class="p-invalid" v-if="submitted && !validConnectionUrl">URL is not correct.</small>
    </div>
    <div class="field">
      <label for="connection-key">API Key (optional)</label>
      <Password id="connection-key" v-model.trim="session.connection.key" :feedback="false"/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text="" @click="hide" severity="secondary"/>
      <Button
          :label="session.id? 'Save': 'Connect' "
          :icon="{'pi pi-check': !!session.id, 'pi pi-link': !session.id}"
          text="" @click="savesession"
      />
    </template>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
