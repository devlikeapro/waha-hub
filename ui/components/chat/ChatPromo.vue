<script setup>
const emit = defineEmits(['close'])

</script>

<template>
  <Message @close="emit('close')">
    {{ $t('chat.promo.exampleChatsUI') }}<br>
    {{ $t('chat.promo.implementFeatures') }}
    <a href="https://waha.devlike.pro/" target="_blank">
      <b>
        {{ $t('chat.promo.wahaAPI') }}
      </b>
    </a>
    :<br>
    <ul>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/chats/" target="_blank"><b>{{ $t('chat.promo.chatsAPI') }}</b></a>
        {{ $t('chat.promo.getChatsOverview') }}
      </li>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/send-messages/" target="_blank"><b>{{ $t('chat.promo.sendAPI') }}</b></a>
        {{ $t('chat.promo.sendMessages') }}
      </li>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/webhooks/#messageack" target="_blank"><b>{{ $t('chat.promo.messageACK') }}</b></a>
        {{ $t('chat.promo.getMessageStatus') }}
      </li>
      <li>
        <a href="https://waha.devlike.pro/docs/how-to/webhooks/#websockets" target="_blank"><b>{{ $t('chat.promo.websockets') }}</b></a>
        {{ $t('chat.promo.getRealTimeMessages') }}
      </li>
    </ul>

    👉
    <a href="https://github.com/devlikeapro/waha-hub/tree/main/ui/components/chat" target="_blank">
      <b>{{ $t('chat.promo.sourceCodeOnGithub') }}</b>
    </a>
    {{ $t('chat.promo.availableFor') }}
    <a href="https://waha.devlike.pro/pricing/#tier-pro" target="_blank">
      {{ $t('chat.promo.wahaPro') }}
    </a> {{ $t('chat.promo.supporters') }}

  </Message>
</template>

<style scoped lang="scss">

</style>