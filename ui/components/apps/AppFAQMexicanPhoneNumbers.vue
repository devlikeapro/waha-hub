<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const {t} = useI18n();
</script>

<template>
  <div class="mexican-phone-numbers-faq">
    <Accordion :multiple="true" :activeIndex="[0]">
      <AccordionTab :header="t('apps.mexicanPhoneNumbers.aboutApp')">
        <p class="mb-3">
          <b>
            {{ t('apps.mexicanPhoneNumbers.description') }}
          </b>
        </p>
        <a href="https://waha.devlike.pro/docs/apps/mexican-phone-numbers" target="_blank" rel="noopener noreferrer">
          {{ t('apps.mexicanPhoneNumbers.learnMore') }}
        </a>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<style scoped lang="scss">
.mexican-phone-numbers-faq {
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
