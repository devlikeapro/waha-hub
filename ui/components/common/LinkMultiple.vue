<script setup>
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import OverlayPanel from 'primevue/overlaypanel'

const props = defineProps({
  href: {
    type: String,
    required: true
  }
})

const {locale, locales} = useI18n()
const overlayPanel = ref(null)

const isEnglish = computed(() => locale.value === 'en')

// zh locale maps to zh-CN in Google Translate
const gtLocaleMap = {zh: 'zh-CN'}
const gtLocale = computed(() => gtLocaleMap[locale.value] || locale.value)

const translatedUrl = computed(() => {
  const url = new URL(props.href)
  const tl = gtLocale.value
  return `https://waha-devlike-pro.translate.goog${url.pathname}?_x_tr_sl=en&_x_tr_tl=${tl}&_x_tr_hl=${tl}&_x_tr_pto=wapp`
})

const localeName = computed(() => {
  const found = locales.value.find(l => l.code === locale.value)
  return found ? found.name : locale.value
})

const englishName = computed(() => {
  const found = locales.value.find(l => l.code === 'en')
  return found ? found.name : 'English'
})

const toggle = (event) => overlayPanel.value.toggle(event)
</script>

<template>
  <a v-if="isEnglish" :href="href" target="_blank">
    <slot/>&nbsp;<i class="pi pi-external-link"></i>
  </a>

  <template v-else>
    <a href="#" @click.prevent="toggle" class="link-multiple-trigger">
      <slot/>&nbsp;<i class="pi pi-chevron-down link-multiple-chevron"></i>
    </a>
    <OverlayPanel ref="overlayPanel" appendTo="body">
      <div class="flex flex-column" style="min-width: 13rem">
        <a :href="translatedUrl" target="_blank" class="overlay-link">
          {{ localeName }}&nbsp;<i class="pi pi-external-link"></i>
        </a>
        <a :href="href" target="_blank" class="overlay-link">
          {{ englishName }}&nbsp;<i class="pi pi-external-link"></i>
        </a>
      </div>
    </OverlayPanel>
  </template>
</template>

<style scoped>
.link-multiple-trigger {
  color: inherit;
  text-decoration: none;
}

.link-multiple-trigger:hover {
  text-decoration: underline;
}

.link-multiple-chevron {
  font-size: 0.65em;
  vertical-align: middle;
}

.overlay-link {
  display: flex;
  align-items: center;
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.overlay-link:hover {
  background-color: var(--surface-hover);
}
</style>
