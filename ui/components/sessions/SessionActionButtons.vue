<script setup>
import {useConfirm} from "primevue/useconfirm";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
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
  "skipConfirmation",
  "group",
])
const emit = defineEmits([
  "view",
  "start",
  "restart",
  "stop",
  "logout",
  "delete",
  "apps"
])

function shouldConfirm(action) {
  if (!props.skipConfirmation) {
    return true
  }
  return !props.skipConfirmation.includes(action)
}

async function startSession() {
  if (!shouldConfirm("start")) {
    emit("start")
    return
  }

  confirm.require({
    group: props.group,
    target: event.target,
    message: t('sessions.startConfirm', { name: props.name }),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-success p-button-sm',
    rejectLabel: t('sessions.no'),
    acceptLabel: t('sessions.yesStart'),
    accept: () => {
      emit("start")
    },
    reject: () => {
    }
  });
}

const shouldShowConfiguration = computed(() => {
  if (!props.hideActions) {
    return true
  }
  return !props.hideActions.includes('view')
})

const shouldShowApps = computed(() => {
  if (!props.hideActions) {
    return true
  }
  return !props.hideActions.includes('apps')
})

function confirmRestartSession(event) {
  confirm.require({
    group: props.group,
    target: event.target,
    message: t('sessions.restartConfirm', { name: props.name }),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-info p-button-sm',
    rejectLabel: t('sessions.no'),
    acceptLabel: t('sessions.yesRestart'),
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
    message: t('sessions.stopConfirm', { name: props.name }),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: t('sessions.no'),
    acceptLabel: t('sessions.yesStop'),
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
    message: t('sessions.logoutConfirm', { name: props.name }),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-warning p-button-sm',
    rejectLabel: t('sessions.no'),
    acceptLabel: t('sessions.yesLogout'),
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
    message: t('sessions.deleteConfirm', { name: props.name }),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: t('sessions.no'),
    acceptLabel: t('sessions.yesDelete'),
    accept: async () => {
      emit("delete")
    },
    reject: () => {
    }
  });
}

</script>

<template>
  <div class="flex flex-row gap-2 align-items-center justify-content-end">
    <!-- Left group: inspect the session -->
    <div class="flex flex-row gap-2">
      <Button
          v-if="shouldShowConfiguration"
          icon="pi pi-cog"
          v-tooltip.top="t('sessions.configuration')"
          severity="help"
          rounded
          outlined
          @click="$emit('view')"
          :disabled="allDisabled"
      />
      <Button
          v-if="shouldShowApps"
          icon="pi pi-th-large"
          v-tooltip.top="t('sessions.apps')"
          severity="info"
          rounded
          outlined
          @click="$emit('apps')"
          :disabled="allDisabled"
      />
    </div>
    <Divider layout="vertical" class="mx-1"/>
    <!-- Middle group: drive the session lifecycle -->
    <div class="flex flex-row gap-2">
      <Button
          icon="pi pi-play"
          v-tooltip.top="t('sessions.start')"
          severity="success"
          rounded
          outlined
          @click="startSession"
          :loading="isStarting"
          :disabled="allDisabled"
      />
      <Button
          icon="pi pi-replay"
          v-tooltip.top="t('sessions.restart')"
          severity="info"
          rounded outlined
          @click="confirmRestartSession($event)"
          :loading="isRestarting"
          :disabled="allDisabled"
      />
      <Button
          icon="pi pi-stop"
          v-tooltip.top="t('sessions.stop')"
          severity="secondary"
          rounded outlined
          @click="confirmStopSession($event)"
          :loading="isStopping"
          :disabled="allDisabled"
      />
      <Button
          icon="pi pi-sign-out"
          v-tooltip.top="t('sessions.logout')"
          severity="warning"
          rounded
          outlined
          @click="confirmLogoutSession($event)"
          :loading="isLoggingOut"
          :disabled="allDisabled"
      />
    </div>
    <Divider layout="vertical" class="mx-1"/>
    <!-- Right group: destroy the session entry -->
    <div class="flex flex-row gap-2">
      <Button
          icon="pi pi-trash"
          v-tooltip.top="t('sessions.delete')"
          severity="danger"
          rounded
          outlined
          @click="confirmRemoveSession($event)"
          :loading="isRemoving"
          :disabled="allDisabled"
      />
    </div>
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
