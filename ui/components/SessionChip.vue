<script setup>
const props = defineProps({
  session: Object,
  image: String,
})
const sessionInfoLabel = computed(
    () => {
      if (!props.session.me) {
        return undefined
      }
      return `${props.session.me.pushName} (${props.session.me.id})`
    }
)
</script>

<template>
  <Chip
      v-if="sessionInfoLabel"
      :label="sessionInfoLabel"
      :image="image"
  ></Chip>
</template>

<style scoped lang="scss">

</style>
