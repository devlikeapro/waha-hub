<script setup>
import {useConfirm} from "primevue/useconfirm";

const props = defineProps(['session'])


const store = useServerStore()
const confirmPopup = useConfirm();
const req = useShowToastOnResult()

function confirmStopSession(event) {
  const session = props.session
  confirmPopup.require({
    target: event.target,
    message: `Stop '${session.name}' session?\nIt'll take 5 seconds`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Stop',
    accept: async () => {
      await req(
          store.stopSession(session.server.id, session.name, false),
          `Stopped - '${session.name}'`,
          `Failed to stop session - '${session.name}'`,
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
      await req(
          store.logoutSession(session.server.id, session.name),
          `Logged out - '${session.name}'`,
          `Failed to logout session - '${session.name}'`,
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
        severity="secondary"
        rounded
        outlined
        @click="$emit('view', session)"
    />
    <Button
        icon="pi pi-play"
        severity="success"
        rounded
        outlined
        @click="$emit('start', session)"
    />
    <Button
        icon="pi pi-stop"
        severity="warning"
        rounded outlined
        @click="confirmStopSession($event, session)"
    />
    <Button
        icon="pi pi-trash"
        severity="danger"
        rounded
        outlined
        @click="confirmLogoutSession($event, session)"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
