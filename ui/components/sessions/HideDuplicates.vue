<script setup>
import {saveHideDuplicatedSessions} from "../../stores/useServerStore";

const store = useServerStore()
const {hideDuplicatedSessions, servers} = storeToRefs(store)

store.$subscribe((mutation, state) => {
  saveHideDuplicatedSessions(state.hideDuplicatedSessions)
})

</script>

<template>
  <div v-if="servers && servers.length < 2">

  </div>
  <div
      class="ml-auto flex align-items-center gap-2 mr-2"
      v-else
  >
    <label for="show-duplicates">Hide Duplicates</label>
    <i
        v-tooltip='"Show NOT STOPPED sessions with the same \"name\" and \"me\".\nUseful when you use multiple workers with the same database"'
        class="pi pi-info-circle"></i>
    <InputSwitch
        id="show-duplicates"
        v-model="hideDuplicatedSessions"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
