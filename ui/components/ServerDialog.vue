<script setup>
import {useServerStore} from "../stores/useServerStore";
import {ref} from "vue";

const visible = defineModel("visible");
const server = defineModel("server");

const toast = useToast();
const serverStore = useServerStore()

const submitted = ref(false);


async function saveServer() {
  submitted.value = true;

  if (server.value.id) {
    await serverStore.editServer(server.value.id, server.value)
    toast.add({severity: 'success', summary: 'Successful', detail: 'Updated', life: 3000});
  } else {
    await serverStore.addServer(server.value)
    toast.add({severity: 'success', summary: 'Successful', detail: 'Created', life: 3000});
  }
  hide()
  server.value = {connection: {}}
}

function hide() {
  submitted.value = false;
  visible.value = false;
}

</script>

<template>
  <Dialog v-model:visible="visible" :style="{ width: '450px' }" header="Server" :modal="true" class="p-fluid">
    <img :src="'/demo/images/product/' + server.image" :alt="server.image" v-if="server.image" width="150"
         class="mt-0 mx-auto mb-5 block shadow-2"/>
    <div class="field">
      <label for="name">Name</label>
      <InputText id="name" v-model.trim="server.name" required="true" autofocus :invalid="submitted && !server.name"/>
      <small class="p-invalid" v-if="submitted && !server.name">Name is required.</small>
    </div>
    <div class="field">
      <label for="connection-url">API URL</label>
      <InputText id="connection-url" v-model.trim="server.connection.url" required="true"
                 :invalid="submitted && !server.connection.url"/>
      <small class="p-invalid" v-if="submitted && !server.connection.url">URL is required.</small>
    </div>
    <div class="field">
      <label for="connection-key">API Key (optional)</label>
      <Password id="connection-key" v-model.trim="server.connection.key" :feedback="false"/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text="" @click="hide" severity="secondary"/>
      <Button
          :label="server.id? 'Save': 'Add' "
          :icon="{'pi pi-check': !!server.id, 'pi pi-plus': !server.id}"
          text="" @click="saveServer"
      />
    </template>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
