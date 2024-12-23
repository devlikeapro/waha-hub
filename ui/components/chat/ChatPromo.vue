<script setup>
const emit = defineEmits(['close'])

</script>

<template>
  <Message @close="emit('close')">
    It's an example <b>Chats UI</b>.<br>
    You can implement <b>Live Chat</b>, <b>Multiple Agents</b>, and more features using
    <a href="https://waha.devlike.pro/" target="_blank">
      <b>
        WAHA API
      </b>
    </a>
    :<br>
    <ul>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/chats/" target="_blank"><b>Chats API</b></a>
        to get chats overview and messages
      </li>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/send-messages/" target="_blank"><b>Send API</b></a>
        to send messages to chats
      </li>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/webhooks/#messageack" target="_blank"><b>Message ACK</b></a>
        to get message status
      </li>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/webhooks/#websockets" target="_blank"><b>Websockets</b></a>
        to get real-time messages on client side
      </li>
    </ul>

    👉
    <a href="https://github.com/devlikeapro/waha-hub/tree/main/ui/components/chat" target="_blank">
      <b>Source Code on Github</b>
    </a>
    (Vue3 + PrimeVue) available for
    <a href="https://waha.devlike.pro/pricing/#tier-pro" target="_blank">
      WAHA PRO
    </a> supporters!

  </Message>
</template>

<style scoped lang="scss">

</style>