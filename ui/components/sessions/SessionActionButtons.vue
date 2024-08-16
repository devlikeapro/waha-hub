<script setup>
import {useConfirm} from "primevue/useconfirm";

const confirm = useConfirm()

const props = defineProps([
  "name",
  "isStarting",
  "isRestarting",
  "isStopping",
  "isLoggingOut",
  "isRemoving",
  "allDisabled",
  "hideActions",
  "group",
])
const emit = defineEmits([
  "view",
  "start",
  "restart",
  "stop",
  "logout",
  "delete"
])

async function startSession() {
  emit("start")
}

const shouldShowConfiguration = computed(() => {
  if (!props.hideActions) {
    return true
  }
  return !props.hideActions.includes('view')

})

function confirmRestartSession(event) {
  confirm.require({
    group: props.group,
    target: event.target,
    message: `Restart ${props.name}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-info p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Restart',
    accept: () => {
      emit("restart")
    },
    reject: () => {
    }
  });
}

function confirmStopSession(event) {
  confirm.require({
    group: props.group,
    target: event.target,
    message: `Stop ${props.name}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Stop',
    accept: async () => {
      emit("stop")

    },
    reject: () => {
    }
  });
}

function confirmLogoutSession(event) {
  confirm.require({
    group: props.group,
    target: event.target,
    message: `Logout ${props.name}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Logout',
    accept: async () => {
      emit("logout")
    },
    reject: () => {
    }
  });
}

function confirmRemoveSession(event) {
  confirm.require({
    group: props.group,
    target: event.target,
    message: `Delete ${props.name}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: 'No',
    acceptLabel: 'Yes, Delete',
    accept: async () => {
      emit("delete")
    },
    reject: () => {
    }
  });
}

</script>

<template>
  <div class="flex flex-row gap-2 justify-content-end">
    <Button
        v-if="shouldShowConfiguration"
        icon="pi pi-cog"
        v-tooltip.top="'Configuration'"
        severity="help"
        rounded
        outlined
        @click="$emit('view')"
        :disabled="allDisabled"
    />
    <Button
        icon="pi pi-play"
        v-tooltip.top="'Start'"
        severity="success"
        rounded
        outlined
        @click="startSession"
        :loading="isStarting"
        :disabled="allDisabled"
    />
    <Button
        icon="pi pi-replay"
        v-tooltip.top="'Restart'"
        severity="info"
        rounded outlined
        @click="confirmRestartSession($event)"
        :loading="isRestarting"
        :disabled="allDisabled"
    />
    <Button
        icon="pi pi-stop"
        v-tooltip.top="'Stop'"
        severity="secondary"
        rounded outlined
        @click="confirmStopSession($event)"
        :loading="isStopping"
        :disabled="allDisabled"
    />
    <Button
        icon="pi pi-sign-out"
        v-tooltip.top="'Logout'"
        severity="warning"
        rounded
        outlined
        @click="confirmLogoutSession($event)"
        :loading="isLoggingOut"
        :disabled="allDisabled"
    />
    <Button
        icon="pi pi-trash"
        v-tooltip.top="'Delete'"
        severity="danger"
        rounded
        outlined
        @click="confirmRemoveSession($event)"
        :loading="isRemoving"
        :disabled="allDisabled"
    />
  </div>
  <ConfirmPopup
      v-if="group==='popup'"
      group="popup"
  ></ConfirmPopup>
  <ConfirmDialog
      v-if="group==='dialog'"
      group="dialog"
  ></ConfirmDialog>
</template>

<style scoped lang="scss">

</style>
