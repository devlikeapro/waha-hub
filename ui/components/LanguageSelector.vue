<script setup>
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import OverlayPanel from "primevue/overlaypanel";

const {locale, locales} = useI18n();
const overlayPanel = ref(null);

const languages = {}
for (const l of locales.value) {
  languages[l.code] = l.name
}
console.log(locales.value)
console.log(languages)

// Function to toggle the overlay panel
const toggle = (event) => {
  overlayPanel.value.toggle(event);
};

// Load language from localStorage on component mount
const language = localStorage.getItem('language') || "en";
if (language && languages[language]) {
  locale.value = language;
}

// Function to change language
const changeLanguage = (code) => {
  locale.value = code;
  // Save selected language to localStorage
  localStorage.setItem('language', code);
  overlayPanel.value.hide();
  window.location.reload()
};

// Expose the toggle method to parent components
defineExpose({
  toggle
});
</script>

<template>
  <OverlayPanel ref="overlayPanel" appendTo="body">
    <div class="language-options">
      <div
          v-for="(value, code) in languages"
      >
        <Button
            :key="code"
            class="language-option"
            @click="changeLanguage(code)"
            :label="value"
            text=""
            :severity="locale === code ? 'success':'secondary' "
            style="width:100%; text-align: left;"
        >
        </Button>
      </div>
    </div>
  </OverlayPanel>
</template>

<style lang="scss" scoped>
</style>
