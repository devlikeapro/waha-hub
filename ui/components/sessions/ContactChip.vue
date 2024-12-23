<script setup>
const props = defineProps({
  id: String,
  name: String,
  image: String,
})
</script>

<template>
  <div>
    <div class="text-center p-1">
      <b class="text-center">{{ name }}</b>
    </div>
    <Chip
        v-if="id"
        :label="id"
        :image="image"
    ></Chip>
  </div>

</template>

<style scoped lang="scss">

</style>