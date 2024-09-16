<script setup>
const store = useServerStore()
const {hideDuplicatedSessions} = storeToRefs(store)

</script>

<template>
  <div class="ml-auto flex align-items-center gap-2 mr-2">
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
