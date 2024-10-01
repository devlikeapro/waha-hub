<script setup>
import {ref, watch} from "vue";
import {convertKeyValueToList} from "../../utils/objects";

const webhook = defineModel("webhook");
const props = defineProps({
  disabled: Boolean,
  index: Number,
})

const events = [
  "session.status",
  "message",
  "message.any",
  "message.reaction",
  "message.ack",
  "message.waiting",
  "message.revoked",
  "chat.archive",
  "group.join",
  "group.leave",
  "presence.update",
  "poll.vote",
  "poll.vote.failed",
  "call.received",
  "call.accepted",
  "call.rejected",
  "label.upsert",
  "label.deleted",
  "label.chat.added",
  "label.chat.deleted",
]
const customHeadersEnabled = ref(webhook.value.customHeaders && webhook.value.customHeaders.length > 0)
watch(customHeadersEnabled, (value, oldValue) => {
  if (oldValue && !value) {
    webhook.value.customHeaders = null
    return
  }
  if (!oldValue && value) {
    webhook.value.customHeaders = [
      {name: "X-Header-1", value: "123"}
    ]
  }
})


</script>

<template>
  <Accordion :activeIndex="0">
    <AccordionTab>
      <template #header>
        <div class="flex justify-content-between align-items-center w-full">
          <div>
            Webhook {{ props.index + 1 }}
          </div>
          <div>
            <Button
                label=""
                text
                rounded
                v-tooltip.top="'Delete Webhook'"
                style="height:2rem; width: 2rem"
                icon="pi pi-trash"
                severity="warning"
                @click="$emit('remove')"
            />
          </div>
        </div>
      </template>
      <div class="field">
        <label for="url">URL</label>
        <InputText id="url" v-model.trim="webhook.url" required="true"
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
      <div class="field">
        <div class="field flex justify-content-between align-items-center">
          <div>
            <label for="hmac">Custom Headers (optional)</label>
          </div>
          <ToggleButton
              v-model="customHeadersEnabled"
              id="customHeaders"
              onLabel="Headers On"
              offLabel="Headers Off"
          >
            <template #icon>
              <font-awesome-icon icon="fa-solid fa-fingerprint" class="mr-2"/>
            </template>
          </ToggleButton>
        </div>
        <KeyValueTable
            v-if="customHeadersEnabled"
            v-model="webhook.customHeaders"
            key-column="name"
            key-column-name="Header"
            prefix="X-Header-"
        ></KeyValueTable>
      </div>
    </AccordionTab>
  </Accordion>
</template>

<style scoped lang="scss">

</style>
