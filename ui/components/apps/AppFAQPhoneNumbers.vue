<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const {t} = useI18n();
</script>

<template>
  <div class="phone-numbers-faq">
    <Accordion :multiple="true" :activeIndex="[0]">
      <AccordionTab :header="t('apps.phoneNumbers.aboutApp')">
        <p class="mb-3">
          <b>
            {{ t('apps.phoneNumbers.description') }}
          </b>
        </p>
        <a href="https://waha.devlike.pro/docs/apps/phone-numbers" target="_blank" rel="noopener noreferrer">
          {{ t('apps.phoneNumbers.learnMore') }}
        </a>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<style scoped lang="scss">
.phone-numbers-faq {
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
