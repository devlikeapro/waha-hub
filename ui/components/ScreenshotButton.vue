<script setup>
const props  = defineProps(['disabled']);
const op = ref(null);
const toggle = (event) => {
  op.value.toggle(event);
};

</script>

<template>
  <Button :disabled="disabled" type="button" icon="pi pi-camera" @click="toggle" rounded outlined/>
  <OverlayPanel ref="op" appendTo="body" :showCloseIcon="true">
    <img src="/demo/images/nature/nature9.jpg" alt="Nature 9"/>
  </OverlayPanel>
</template>

<style scoped lang="scss">

</style>
