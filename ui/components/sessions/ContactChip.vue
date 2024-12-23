<script setup>
const props = defineProps({
  id: String,
  name: String,
  image: String,
})
</script>

<template>
  <div>
    <div class="text-center p-1" v-if="name">
      <b class="text-center">{{ name }}</b>
    </div>
    <Chip
        v-if="id"
        :label="id"
        :image="image"
        icon="pi pi-user"
    >
      <template #icon>
        <i class="mr-3 pi pi-user" style="color: #34d399"></i>
      </template>
    </Chip>
  </div>
</template>

<style scoped lang="scss">

</style>