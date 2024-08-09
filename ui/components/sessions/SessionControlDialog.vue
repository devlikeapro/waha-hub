<script setup>

const visible = defineModel("visible");
const session = defineModel("session");

const toast = useToast();

function hide() {
  visible.value = false;
}
</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      maximizable
  >
    <template #header>
      <SessionHeader
          :session="session"
      ></SessionHeader>
    </template>
    <SessionControl :session="session"></SessionControl>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
