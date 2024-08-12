<script setup>
import {useConfirm} from "primevue/useconfirm";

const props = defineProps(['session'])


const store = useServerStore()
const confirmPopup = useConfirm();
const req = useShowToastOnResult()

const stopping = ref(false)
const loggingOut = ref(false)
const removing = ref(false)

async function startSession() {
  const session = props.session
  await req(
      store.startSession(session.server.id, session.name),
      `Started - '${session.name}'`,
      `Failed to start session - '${session.name}'`,
  )
}

function confirmStopSession(event) {
  const session = props.session
  confirmPopup.require({
    target: event.target,
    message: `Stop '${session.name}' session?`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Stop',
    accept: async () => {
      stopping.value = true
      await req(
          store.stopSession(session.server.id, session.name),
          `Stopped - '${session.name}'`,
          `Failed to stop session - '${session.name}'`,
      ).finally(
          () => stopping.value = false
      )
    },
    reject: () => {
    }
  });
}

function confirmLogoutSession(event) {
  const session = props.session
  confirmPopup.require({
    target: event.target,
    message: `Logout '${session.name}' session?\n`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Logout',
    accept: async () => {
      loggingOut.value = true
      await req(
          store.logoutSession(session.server.id, session.name),
          `Logged out - '${session.name}'`,
          `Failed to logout session - '${session.name}'`,
      ).finally(
          () => loggingOut.value = false
      )
    },
    reject: () => {
    }
  });
}

function confirmRemoveSession(event) {
  const session = props.session
  confirmPopup.require({
    target: event.target,
    message: `Delete '${session.name}' session?\n`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Delete',
    accept: async () => {
      removing.value = true
      await req(
          store.deleteServer(session.server.id, session.name),
          `Logged out - '${session.name}'`,
          `Failed to delete session - '${session.name}'`,
      ).finally(
          () => removing.value = false
      )
    },
    reject: () => {
    }
  });
}

</script>

<template>
  <div class="flex flex-row gap-2 justify-content-end">
    <Button
        icon="pi pi-cog"
        severity="help"
        rounded
        outlined
        @click="$emit('view', session)"
    />
    <Button
        icon="pi pi-play"
        severity="success"
        rounded
        outlined
        @click="startSession"
    />
    <Button
        icon="pi pi-stop"
        severity="secondary"
        rounded outlined
        @click="confirmStopSession($event, session)"
        :loading="stopping"
    />
    <Button
        icon="pi pi-sign-out"
        severity="warning"
        rounded
        outlined
        @click="confirmLogoutSession($event, session)"
        :loading="loggingOut"
    />
    <Button
        icon="pi pi-trash"
        severity="danger"
        rounded
        outlined
        @click="confirmRemoveSession($event, session)"
        :loading="loggingOut"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
