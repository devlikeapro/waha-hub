<script setup>
// Whole-number input with - and + buttons on the sides; everything else goes to InputNumber
const value = defineModel({ type: Number });
defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: undefined },
  disabled: { type: Boolean, default: false },
});
</script>

<template>
  <InputNumber
    v-model="value"
    showButtons
    buttonLayout="horizontal"
    :min="min"
    :max="max"
    :step="1"
    :disabled="disabled"
  >
    <template #incrementbuttonicon>
      <span class="pi pi-plus" />
    </template>
    <template #decrementbuttonicon>
      <span class="pi pi-minus" />
    </template>
  </InputNumber>
</template>

<style scoped lang="scss"></style>
