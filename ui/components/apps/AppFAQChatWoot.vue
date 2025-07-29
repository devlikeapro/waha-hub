<script setup lang="ts">
import {ref, computed} from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  app: {
    type: Object,
    required: true
  },
  session: {
    type: String,
    required: true
  }
});

const webhookUrl = computed(() => {
  return `/webhooks/chatwoot/${props.session}/${props.app.id}`;
});

const exampleUrl = computed(() => {
  return `http://waha:3000${webhookUrl.value}`;
});

const templateUrl = computed(() => {
  return `{WAHA_BASE_URL}${webhookUrl.value}`;
});

async function copyWebhookUrl() {
  await navigator.clipboard.writeText(templateUrl.value);
}

async function copyExampleUrl() {
  await navigator.clipboard.writeText(exampleUrl.value);
}
</script>

<template>
  <div class="chatwoot-faq">
    <Accordion :multiple="true" :activeIndex="[1]">
      <AccordionTab :header="t('apps.chatwoot.aboutApp')">
        <div class="mb-3">
          <a href="https://waha.devlike.pro/docs/apps/chatwoot" target="_blank">
            {{ t('apps.chatwoot.learnMore') }}
          </a>
        </div>
      </AccordionTab>

      <AccordionTab :header="t('apps.chatwoot.webhookUrl')">
        <div class="mb-4">
          <p class="mb-1">
            {{ t('apps.chatwoot.useWebhookUrl') }}
          </p>
          <div class="p-inputgroup mb-1">
            <InputText
                :value=templateUrl
                disabled
                :placeholder="t('apps.chatwoot.webhookUrlPlaceholder')"
            />
            <Button
                :label="t('apps.chatwoot.copy')"
                icon="pi pi-copy"
                @click="copyWebhookUrl"
                v-tooltip.focus.bottom="{ value: t('apps.chatwoot.copiedToClipboard') }"
            />
          </div>
          <small class="p-message-secondary">{{ t('apps.chatwoot.replaceBaseUrl') }}</small>
        </div>

        <div class="mt-4">
          <p>{{ t('apps.chatwoot.exampleSetup') }}</p>
          <div class="p-inputgroup">
            <InputText
                :value="exampleUrl"
                disabled
                :placeholder="t('apps.chatwoot.exampleUrlPlaceholder')"
            />
            <Button
                :label="t('apps.chatwoot.copy')"
                icon="pi pi-copy"
                @click="copyExampleUrl"
                v-tooltip.focus.bottom="{ value: t('apps.chatwoot.copiedToClipboard') }"
            />
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<style scoped lang="scss">
.chatwoot-faq {
  margin-bottom: 1.5rem;

  a {
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
