<script setup>
const props = defineProps({
  attachment: Object, // { type, file, previewUrl }
})
const emit = defineEmits(['remove'])

const iconMap = {
  image: 'pi pi-image',
  video: 'pi pi-video',
  audio: 'pi pi-microphone',
  file: 'pi pi-file',
}
const icon = computed(() => iconMap[props.attachment.type] || 'pi pi-file')
</script>

<template>
  <div class="attachment-chip">
    <div class="attachment-media">
      <img
          v-if="attachment.previewUrl"
          :src="attachment.previewUrl"
          class="attachment-thumb"
          alt=""
      />
      <i v-else :class="icon" class="attachment-icon"/>
    </div>
    <span class="attachment-name" :title="attachment.file.name">{{ attachment.file.name }}</span>
    <Button
        icon="pi pi-times"
        text
        rounded
        severity="danger"
        size="small"
        class="attachment-remove"
        @click="emit('remove')"
    />
  </div>
</template>

<style scoped lang="scss">
.attachment-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-100);
  border: 1px solid var(--surface-300);
  border-radius: 6px;
  padding: 4px 6px 4px 4px;
  max-width: 180px;
}

.attachment-media {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-thumb {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 4px;
}

.attachment-icon {
  font-size: 1.5rem;
  color: var(--text-color-secondary);
}

.attachment-name {
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.attachment-remove {
  flex-shrink: 0;
  width: 1.4rem !important;
  height: 1.4rem !important;
  padding: 0 !important;
}
</style>
