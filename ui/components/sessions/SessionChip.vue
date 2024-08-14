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
      return `${props.session.me.id}`
    }
)
</script>

<template>
  <div>
    <div class="text-center p-1">
      <b class="text-center">{{ props.session?.me?.pushName }}</b>
    </div>
    <Chip
        v-if="sessionInfoLabel"
        :label="sessionInfoLabel"
        :image="image"
    ></Chip>
  </div>
</template>

<style scoped lang="scss">

</style>
