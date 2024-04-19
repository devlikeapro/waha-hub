<script setup>
const webhook = defineModel("webhook");
const props = defineProps({
  disabled: Boolean,
})

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
  <Accordion :activeIndex="0">
    <AccordionTab :header="webhook.url">
      <div class="field">
        <label for="url">URL</label>
        <InputText id="url" v-model.trim="webhook.url" required="true" autofocus
                   :disabled="disabled"
        />
      </div>

      <div class="field mb-4">
        <label for="events">Events</label>
        <MultiSelect
            id="events"
            v-model="webhook.events"
            :options="events"
            placeholder="Select Events"
            :max-selected-labels="1"
            selectedItemsLabel="{0} events selected"
            :disabled="disabled"
        />
        <ul>
          <li v-for="event in webhook.events" :key="event">{{ event }}</li>
        </ul>
      </div>

      <div>
        <div class="font-bold mb-2">Retries</div>
        <div class="flex gap-3">
          <div class="field">
            <label for="retries-attempts">Attempts</label>
            <InputNumber
                v-model="webhook.retries.attempts"
                inputId="retries-delay-attempts"
                showButtons
                buttonLayout="horizontal"
                :min="1"
                :step="1"
                :disabled="disabled"
            >
              <template #incrementbuttonicon>
                <span class="pi pi-plus"/>
              </template>
              <template #decrementbuttonicon>
                <span class="pi pi-minus"/>
              </template>
            </InputNumber>
          </div>
          <div class="field">
            <label for="retries-delay-seconds">Delay, seconds</label>
            <InputNumber
                v-model="webhook.retries.delaySeconds"
                inputId="retries-delay-seconds"
                showButtons
                buttonLayout="horizontal"
                :min="1"
                :step="1"
                :disabled="disabled"
            >
              <template #incrementbuttonicon>
                <span class="pi pi-plus"/>
              </template>
              <template #decrementbuttonicon>
                <span class="pi pi-minus"/>
              </template>
            </InputNumber>
          </div>
        </div>
      </div>

      <div class="field">
        <label for="hmac">HMAC Key (optional)</label>
        <InputText id="hmac" v-model.trim="webhook.hmac.key"
                   :disabled="disabled"
        />
      </div>

      <Button
          label="Remove Webhook"
          icon="pi pi-trash"
          text=""
          @click="$emit('remove')"
          severity="warning"
          :disabled="disabled"
      />
    </AccordionTab>
  </Accordion>
</template>

<style scoped lang="scss">

</style>
