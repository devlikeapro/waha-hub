<script setup>
const props = defineProps(["data"])
const values = computed(() => {
  const payload = props.data.payload
  const data = props.data
  const event = props.data.event
  switch (event) {
    case "session.status":
      return [
        payload.status,
        data.me?.id,
        data.me?.pushName,
      ]
    case "message":
    case "message.any":
    case "message.ack":
    case "engine.event":
      return [
        payload.event,
        payload.data,
      ]
    case "message.reaction":
      return [
        payload.fromMe ? "📤" : "📥",
        payload.id,
        payload.body,
        event === "message.ack" ? payload.ackName : null,
        payload.reaction?.text,
        payload.media?.url ? "🖼" : null,
      ]
    case "presence.update":
      return [
        payload.id,
        payload.presences?.[0].lastKnownPresence
      ]
    default:
      return []
  }
})

const text = computed(() => {
  return values.value.filter(v => v != null).join(" | ")
  // limit text to
})

</script>

<template>
  <!--  key: value of values, one line for all -->
  <div class="truncate">
    <code>{{ text }}</code>
  </div>

</template>

<style scoped lang="scss">
.truncate {
  width: 60rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>