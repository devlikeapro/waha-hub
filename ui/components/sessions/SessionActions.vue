<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps([
    'session',
    "disabled"
])

const emit = defineEmits(['view', 'apps', 'proxy'])


const store = useServerStore()
const req = useShowToastOnResult()

const stopping = ref(false)
const loggingOut = ref(false)
const removing = ref(false)
const starting = ref(false)
const restarting = ref(false)
const allDisabled = computed(
    () => {
      return props.disabled || stopping.value || loggingOut.value || removing.value || starting.value || restarting.value
    }
)

async function startSession() {
  const session = props.session
  starting.value = true
  await req(
      store.startSession(session.server.id, session.name),
      t('sessions.started'),
      t('sessions.failedToStartSession'),
      session.name,
      session.name
  ).finally(
      () => starting.value = false
  )
}

async function restartSession() {
  const session = props.session
  restarting.value = true
  await req(
      store.restartSession(session.server.id, session.name),
      t('sessions.restarted'),
      t('sessions.failedToRestartSession'),
      session.name,
      session.name
  ).finally(
      () => restarting.value = false
  )
}

async function stopSession() {
  const session = props.session
  stopping.value = true
  await req(
      store.stopSession(session.server.id, session.name),
      t('sessions.stopped'),
      t('sessions.failedToStopSession'),
      session.name,
      session.name
  ).finally(
      () => stopping.value = false
  )
}

async function logoutSession() {
  const session = props.session
  loggingOut.value = true
  await req(
      store.logoutSession(session.server.id, session.name),
      t('sessions.loggedOut'),
      t('sessions.failedToLogoutSession'),
      session.name,
      session.name
  ).finally(
      () => loggingOut.value = false
  )
}

async function deleteSession() {
  const session = props.session
  removing.value = true
  await req(
      store.deleteSession(session.server.id, session.name),
      t('sessions.deleted'),
      t('sessions.failedToDeleteSession'),
      session.name,
      session.name
  ).finally(
      () => removing.value = false
  )
}

defineExpose({
  startSession,
  restartSession,
  stopSession,
  logoutSession,
  deleteSession
})

</script>

<template>
  <div class="flex flex-row gap-2 justify-content-end">
    <SessionActionButtons
        group="popup"
        :name="`'${session.name}' ${t('sessions.session')}`"
        @view="$emit('view', session)"
        @apps="$emit('apps', session)"
        @proxy="$emit('proxy', session)"
        @start="startSession"
        @restart="restartSession"
        @stop="stopSession"
        @logout="logoutSession"
        @delete="deleteSession"
        :is-starting="starting"
        :is-restarting="restarting"
        :is-stopping="stopping"
        :is-logging-out="loggingOut"
        :is-removing="removing"
        :all-disabled="allDisabled"
        :hide-actions="[]"
        :skip-confirmation="['start']"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
