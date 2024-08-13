<script setup>
const props = defineProps(['metadata'])
/**
 * metadata here is key=value object
 */

</script>

<template>
  <div class="metadata">
    <pre v-for="(value, key) in metadata" :key="key">{{ key }} = {{ value }}</pre>
  </div>

</template>

<style scoped lang="scss">

</style>
