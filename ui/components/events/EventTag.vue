<script setup>
import {WAHAEventColor} from "../../services/WAHAEvents";

const props = defineProps(["event"])
const color = computed(() => {
  return WAHAEventColor[props.event] || "rgb(114,166,234)"

})
const style = computed(() => {
  return {
    background: "transparent",
    border: "2px solid rgb(66, 75, 87)",
    color: color.value,
    "font-size": "0.9rem",
  }
})

const value = computed(() => {
  const event = props.event
  switch (event) {
    case "message":
    case "message.any":
      return `${event} ✉️`
    case "message.ack":
      return `${event} 👀`
    default:
      return props.event
  }
})

</script>

<template>
  <Tag
      :style="style"
      :value="value"
  >
  </Tag>
</template>

<style scoped lang="scss">

</style>