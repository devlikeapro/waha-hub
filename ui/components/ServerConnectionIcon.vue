<script setup>
defineProps(['connected'])

</script>

<template>
  <i
      class="pi"
      :class="{
        'pi pi-spin pi-spinner': connected===undefined,
        'text-green-500 pi-check-circle': connected === true,
        'text-pink-500 pi-times-circle': connected === false,
  }">
  </i>
</template>

<style scoped lang="scss">

</style>
