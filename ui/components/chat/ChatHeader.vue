<script setup>
const props = defineProps({
  chat: Object,
  me: Object,
  mePicture: Object,
  fetching: Boolean,
  fetch: Function,
})

import ContactChip from "../sessions/ContactChip.vue";
</script>

<template>
  <div class="flex justify-content-between gap-2 my-2">
    <div class="flex gap-2 align-items-center">
      <ContactChip
          :id="chat.name || chat.id"
          :image="chat.picture"
      />
    </div>
    <RefreshButton
        @click="fetch"
        :refreshing="fetching"
    ></RefreshButton>

    <ContactChip
        :id="me?.pushName"
        :image="mePicture"
    />
  </div>

</template>

<style scoped lang="scss">

</style>