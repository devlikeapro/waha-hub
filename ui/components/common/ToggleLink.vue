<script setup>
// A text link with a chevron that flips: a compact collapse toggle for secondary content
defineProps({
  label: String,
});
const open = defineModel({ type: Boolean });
</script>

<template>
  <a href="#" class="white-space-nowrap" @click.prevent="open = !open">
    <i
      class="pi text-xs mr-1"
      :class="open ? 'pi-chevron-down' : 'pi-chevron-right'"
    ></i>
    {{ label }}
  </a>
</template>

<style scoped lang="scss"></style>
