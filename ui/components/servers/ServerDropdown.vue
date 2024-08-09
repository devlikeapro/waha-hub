<script setup>
const server = defineModel("server");
defineProps(
    {
      showClear: Boolean,
      placeholder: String,
      required: Boolean,
      invalid: Boolean,
      disabled: Boolean,
    }
);

const store = useServerStore()

</script>

<template>
  <Dropdown
      optionValue="id"
      v-model="server" :options="store.servers"
      @change="$emit('change', server)"
      :placeholder="placeholder"
      class="p-column-filter"
      :showClear="showClear"
      :required="required"
      :invalid="invalid"
      :disabled="disabled"
  >
    <template #value="slotProps">
      <template v-if="slotProps.value">
        <ServerConnectionIcon :connected="store.getServer(slotProps.value).connected"></ServerConnectionIcon>
        <span class="ml-1">{{ store.getServer(slotProps.value).name }} </span>
      </template>
      <span v-else>{{ slotProps.placeholder }}</span>
    </template>
    <template #option="slotProps">
      <ServerConnectionIcon :connected="slotProps.option.connected"></ServerConnectionIcon>
      <span class="ml-1">{{ slotProps.option.name }} ({{ slotProps.option.connection.url }}) </span>
    </template>
  </Dropdown>

</template>

<style scoped lang="scss">

</style>
