<script setup>
// pending (grey), running (spinner), ok (green), fail (red)
defineProps({
  status: { type: String, default: "pending" },
});
</script>

<template>
  <i
    class="pi"
    :class="{
      'pi-spin pi-spinner': status === 'running',
      'text-green-500 pi-check-circle': status === 'ok',
      'text-pink-500 pi-times-circle': status === 'fail',
      'text-500 pi-minus-circle': status === 'pending',
    }"
  ></i>
</template>

<style scoped lang="scss"></style>
