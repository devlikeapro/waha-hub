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


async function saveSession() {
  submitted.value = true;
  if (!session.value.name || !validConnectionUrl.value) {
    return
  }

  if (session.value.id) {
    toast.add({severity: 'success', summary: 'Successful', detail: 'Updated', life: 3000});
  } else {
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
  <Dialog v-model:visible="visible" :style="{ width: '450px' }" header="Session" :modal="true" class="p-fluid">
    <div class="field">
      <label for="name">Name</label>
      <InputText id="name" v-model.trim="session.name" required="true" autofocus :invalid="submitted && !session.name"/>
      <small class="p-invalid" v-if="submitted && !session.name">Name is required.</small>
    </div>

    <div class="field flex justify-content-between align-items-center">
      <div>
        <label for="debug">Debug Mode: </label>
      </div>
      <ToggleButton
          v-model="session.config.debug"
          onLabel="Debug Enabled"
          offLabel="Debug Disabled"
          onIcon="pi pi-check"
      />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text="" @click="hide" severity="secondary"/>
      <Button
          :label="session.server? 'Start': 'Start New' "
          :icon="{'pi pi-check': !!session.server, 'pi pi-plus': !session.server}"
          text=""
          @click="saveSession"
      />
    </template>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
