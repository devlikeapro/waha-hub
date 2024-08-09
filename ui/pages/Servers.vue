<script setup>
import {onBeforeMount} from "vue";

const store = useServerStore()
onBeforeMount(() => {
  store.refresh()
});
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <ServerTable></ServerTable>
      </div>
    </div>
  </div>
</template>
