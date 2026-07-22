<script setup>
const props = defineProps({
  id: String,
  name: String,
  image: String,
  id2: String,
})
const ids = computed(() => {
  const list = [props.id, props.id2]
  return list.filter(Boolean)
})
</script>

<template>
  <div class="contact-chip">
    <Chip
        :label="id"
        :image="image"
        icon="pi pi-user"
    >
      <div class="contact-chip__content">
        <div
            class="contact-chip__avatar p-chip-text p-chip-icon"
            :class="{ 'contact-chip__avatar--icon': !image }"
        >
          <template v-if="image">
            <img
                class="contact-chip__avatar-image"
                :src="image"
                :alt="name || id"
            >
          </template>
          <template v-else-if="id?.includes('@g.us')">
            <i class="contact-chip__avatar-icon contact-chip__avatar-icon--group pi pi-users"></i>
          </template>
          <template v-else>
            <i class="contact-chip__avatar-icon pi pi-user contact-chip__avatar-icon--single"></i>
          </template>
        </div>

        <div class="contact-chip__info" data-pc-section="label">
          <b>{{ name || id }}</b>
          <br/>
          <div>
            <template v-for="id in ids" :key="id">
              <div class="p-text-secondary contact-chip__id">{{ id }}</div>
            </template>
          </div>
        </div>

        <slot name="end"></slot>
      </div>
    </Chip>
  </div>
</template>

<style scoped lang="scss">
.contact-chip__content {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}

.contact-chip__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 0;
  border: 1px solid #dbeafe;
  background-color: #eef2ff;
}

.contact-chip__avatar--icon {
  padding: 0.15rem;
}

.contact-chip__avatar-image {
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  object-fit: cover;
  display: block;
  margin: -1px;
  border-radius: inherit;
}

.contact-chip__avatar-icon {
  font-size: 1.3rem;
  color: slateblue;
}

.contact-chip__avatar-icon--single {
  color: #34d399;
}

.contact-chip__avatar-icon--group {
  font-size: 1.45rem;
}

.contact-chip__info {
  line-height: 1.3;
}

.contact-chip__id {
  font-size: 0.9rem;
}

.contact-chip :deep(.p-chip) {
  padding: 0.5rem 0.7rem;
}

.contact-chip :deep(.p-chip .p-chip-text) {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
