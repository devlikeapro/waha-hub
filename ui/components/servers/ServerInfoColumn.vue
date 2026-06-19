<script setup>
const props = defineProps(['server'])
const store = useServerStore()
</script>

<template>
  <div>
    <code>
      {{ server.version.engine }}
    </code>
    <code> (</code>
    <code :class="{'text-orange-400': server.version.version !== store.latestVersion, 'text-green-500': server.version.version === store.latestVersion}">
      {{ server.version.version }} {{ server.version.tier }}
    </code>
    <code>)</code>
  </div>
  <div v-if="server.status">
    <ServerUptime
      :status="server.status"
      />
  </div>
</template>

<style scoped lang="scss">

</style>
