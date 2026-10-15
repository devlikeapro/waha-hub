<script setup>
const props = defineProps({
  label: Object,
  removable: Boolean,
})
const emit = defineEmits(['remove'])

const style = computed(() => ({
  background: 'transparent',
  border: '2px solid ' + props.label.colorHex,
  color: props.label.colorHex,
}))

const tooltip = computed(() => {
  const parts = ['id: ' + props.label.id]
  if (props.label.type != null) {
    parts.push('type: ' + props.label.type)
  }
  return parts.join(', ')
})
</script>

<template>
  <Tag :style="style" v-tooltip.top="tooltip">
    <span>{{ label.name }}</span>
    <i
        v-if="removable"
        class="pi pi-times label-remove"
        @click.stop="emit('remove', label)"
    ></i>
  </Tag>
</template>

<style scoped lang="scss">
.label-remove {
  cursor: pointer;
  margin-left: 0.25rem;
  font-size: 0.75rem;
}
</style>
