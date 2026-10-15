<script setup>
import {useI18n} from "vue-i18n";
import LabelTag from "./LabelTag.vue";

const props = defineProps({
  labels: Array,
  selected: Array,
  disabled: Boolean,
})
const emit = defineEmits(['toggle', 'open'])

const {t} = useI18n()
const overlayPanel = ref(null)

function toggle(event) {
  overlayPanel.value.toggle(event)
}

function isSelected(label) {
  return props.selected.some((l) => l.id === label.id)
}
</script>

<template>
  <Button
      icon="pi pi-plus"
      text
      rounded
      size="small"
      class="label-picker-add"
      v-tooltip.top="t('chat.labels.add')"
      @click="toggle"
  />
  <OverlayPanel ref="overlayPanel" appendTo="body" @show="emit('open')">
    <div class="flex flex-column gap-2">
      <div v-if="labels.length === 0" class="text-color-secondary">
        {{ t('chat.labels.empty') }}
      </div>
      <div
          v-for="label in labels"
          :key="label.id"
          class="flex align-items-center gap-2"
      >
        <Checkbox
            :inputId="'label-picker-' + label.id"
            :binary="true"
            :modelValue="isSelected(label)"
            :disabled="disabled"
            @update:modelValue="emit('toggle', label)"
        />
        <label :for="'label-picker-' + label.id" class="cursor-pointer">
          <LabelTag :label="label"/>
        </label>
      </div>
    </div>
  </OverlayPanel>
</template>
