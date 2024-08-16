<script setup>
const props = defineProps([
    'session',
    "disabled"
])


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
      `Started`,
      `Failed to start session`,
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
      `Restarted`,
      `Failed to restart session`,
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
      `Stopped`,
      `Failed to stop session`,
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
      `Logged out`,
      `Failed to logout session`,
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
      `Removed`,
      `Failed to delete session`,
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
        :name="`'${session.name}' session`"
        @view="$emit('view', session)"
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
    />
  </div>
</template>

<style scoped lang="scss">

</style>
