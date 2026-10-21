<script setup>
import {useI18n} from "vue-i18n";

const props = defineProps({
  tag: String,
  saving: Boolean,
})
const visible = defineModel("visible")
const emit = defineEmits(['save'])

const {t} = useI18n()
const value = ref('')

watch(visible, (isVisible) => {
  if (isVisible) {
    value.value = props.tag || ''
  }
})

function save() {
  emit('save', value.value.trim())
}
</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      :dismissableMask="true"
      :header="t('chat.tags.edit')"
      style="min-width: 22rem"
  >
    <div class="flex flex-column gap-2">
      <InputText
          v-model="value"
          :placeholder="t('chat.tags.placeholder')"
          maxlength="30"
          autofocus
          @keyup.enter="save"
      />
      <small class="p-text-secondary">{{ t('chat.tags.hint') }}</small>
    </div>
    <template #footer>
      <Button
          :label="t('chat.tags.save')"
          icon="pi pi-check"
          :loading="saving"
          @click="save"
      />
    </template>
  </Dialog>
</template>
