<script setup>
import {ref, watch} from "vue";
import {convertKeyValueToList} from "../../utils/objects";
import {WAHAEvents} from "../../services/WAHAEvents";
import {useI18n} from 'vue-i18n';

const { t } = useI18n();

const webhook = defineModel("webhook");
const props = defineProps({
  disabled: Boolean,
  index: Number,
})
const retryPolicies = [
  "constant",
  "linear",
  "exponential",
]
const retryPolicyTooltip = computed(() => {
  const delay = webhook.value.retries?.delaySeconds ?? 2
  const attemptsInExample = 4
  const constant = Array.from({length: attemptsInExample}, (_, i) => delay)
  const linear = Array.from({length: attemptsInExample}, (_, i) => delay * (i + 1))
  const exponential = Array.from({length: attemptsInExample}, (_, i) => delay * 2 ** i)
  return [
    t('sessions.webhooks.constant', { values: constant.join(", ") }),
    t('sessions.webhooks.linear', { values: linear.join(", ") }),
    t('sessions.webhooks.exponential', { values: exponential.join(", ") }),
  ].join("\n")
})
const events = WAHAEvents
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
            {{ t('sessions.webhooks.webhookNumber', { number: props.index + 1 }) }}
          </div>
          <div>
            <Button
                label=""
                text
                rounded
                v-tooltip.top="t('sessions.webhooks.deleteWebhook')"
                style="height:2rem; width: 2rem"
                icon="pi pi-trash"
                severity="warning"
                @click="$emit('remove')"
            />
          </div>
        </div>
      </template>
      <div class="field">
        <label for="url">{{ t('sessions.webhooks.url') }}</label>
        <InputText id="url" v-model.trim="webhook.url" required="true"
                   :disabled="disabled"
        />
      </div>

      <div class="field mb-4">
        <label for="events">{{ t('sessions.webhooks.events') }}</label>
        <MultiSelect
            id="events"
            v-model="webhook.events"
            :options="events"
            :placeholder="t('sessions.webhooks.selectEvents')"
            :max-selected-labels="1"
            :selectedItemsLabel="t('sessions.webhooks.eventsSelected')"
            :disabled="disabled"
        />
        <ul>
          <li v-for="event in webhook.events" :key="event">{{ event }}</li>
        </ul>
      </div>

      <div>
        <div class="font-bold mb-2">{{ t('sessions.webhooks.retries') }}</div>
        <div class="flex gap-3">
          <div class="field" style="width: 10em">
            <label for="retries-attempts">{{ t('sessions.webhooks.attempts') }}</label>
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

          <div class="field" style="width: 10em">
            <label for="retries-delay-seconds">{{ t('sessions.webhooks.delaySeconds') }}</label>
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

          <div class="field">
            <label for="retries-delay-policy">
              {{ t('sessions.webhooks.retryPolicy') }}
              <i
                  v-tooltip="retryPolicyTooltip"
                  class="pi pi-info-circle"
              ></i>
            </label>
            <Dropdown
                id="retries-delay-policy"
                v-model="webhook.retries.policy"
                :options="retryPolicies"
                :placeholder="t('sessions.webhooks.selectRetryPolicy')"
                :max-selected-labels="1"
                :disabled="disabled"
            >
              <template #option="slotProps">
                <span style="text-transform: capitalize">
                {{ slotProps.option }}
                </span>
              </template>
              <template #value="slotProps">
                <span style="text-transform: capitalize">
                {{ slotProps.value }}
                </span>
              </template>
            </Dropdown>
          </div>
        </div>
      </div>

      <div class="field">
        <label for="hmac">{{ t('sessions.webhooks.hmacKey') }}</label>
        <InputText id="hmac" v-model.trim="webhook.hmac.key"
                   :disabled="disabled"
        />
      </div>
      <div class="field">
        <div class="field flex justify-content-between align-items-center">
          <div>
            <label for="hmac">{{ t('sessions.webhooks.customHeaders') }}</label>
          </div>
          <ToggleButton
              v-model="customHeadersEnabled"
              id="customHeaders"
              :onLabel="t('sessions.webhooks.headersOn')"
              :offLabel="t('sessions.webhooks.headersOff')"
          >
            <template #icon>
              <font-awesome-icon icon="fa-solid fa-fingerprint" class="mr-2"/>
            </template>
          </ToggleButton>
        </div>
        <KeyValueTable
            v-if="customHeadersEnabled"
            v-model="webhook.customHeaders"
            entity-name="Header"
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
