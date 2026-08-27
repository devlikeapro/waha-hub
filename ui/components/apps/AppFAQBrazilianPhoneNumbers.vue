<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const {t} = useI18n();
</script>

<template>
  <div class="brazilian-phone-numbers-faq">
    <Accordion :multiple="true" :activeIndex="[0]">
      <AccordionTab :header="t('apps.brazilianPhoneNumbers.aboutApp')">
        <p class="mb-3">
          <b>
            {{ t('apps.brazilianPhoneNumbers.description') }}
          </b>
        </p>
        <a href="https://waha.devlike.pro/docs/apps/brazilian-phone-numbers" target="_blank" rel="noopener noreferrer">
          {{ t('apps.brazilianPhoneNumbers.learnMore') }}
        </a>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<style scoped lang="scss">
.brazilian-phone-numbers-faq {
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
