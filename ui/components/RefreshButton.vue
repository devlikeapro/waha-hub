<script setup>
const props = defineProps(['refreshing'])
const icon = computed(() => props.refreshing ? 'pi pi-refresh pi-spin' : 'pi pi-refresh')
</script>

<template>
  <Button :icon="icon" rounded text="" :disabled="refreshing"/>
</template>

<style scoped lang="scss">

</style>
