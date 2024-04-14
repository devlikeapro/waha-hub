<script setup>

import {useServerStore} from "../stores/useServerStore";

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
  >
    <template #header>
      <div class="p-dialog-title flex gap-2 align-items-center">
        <span>
          {{ session?.name }}
        </span>
          <SessionStatusTag
              :status="session.status"
          ></SessionStatusTag>
        <div>
          <span>(</span>
          <ServerConnectionIcon :connected="session.server.connected"></ServerConnectionIcon>
          <span class="ml-1">{{ session.server.name }} </span>
          <span>)</span>
        </div>
      </div>

    </template>
    <SessionControl :session="session"></SessionControl>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
