<script setup>
import ContactChip from "./ContactChip.vue";

const props = defineProps({
  session: Object,
  image: String,
})
</script>

<template>
  <ContactChip
      :id="props.session?.me?.id"
      :name="props.session?.me?.pushName"
      :image="props.image"
  />
</template>

<style scoped lang="scss">

</style>
