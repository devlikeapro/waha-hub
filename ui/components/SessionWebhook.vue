<script setup>
const webhook = defineModel("webhook");
const events = [
  "session.status",
  "message",
  "message.any",
  "message.reaction",
  "message.ack",
  "message.revoked",
  "state.change",
  "group.join",
  "group.leave",
  "presence.update",
  "poll.vote",
  "poll.vote.failed",
]

</script>

<template>
  <Fieldset :legend="webhook.url" toggleable>
    <div class="field">
      <label for="url">URL</label>
      <InputText id="url" v-model.trim="webhook.url" required="true" autofocus/>
    </div>

    <div>
      <label for="events">Events</label>
      <MultiSelect
          id="events"
          v-model="webhook.events"
          :options="events"
          placeholder="Select Events"
          class="w-25rem"
      />
    </div>
  </Fieldset>
</template>

<style scoped lang="scss">

</style>
