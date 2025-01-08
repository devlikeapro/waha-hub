<script setup>
import ContactChip from "./ContactChip.vue";
import {onMounted} from "vue";

const props = defineProps({
  session: Object,
})

const store = useServerStore()

const profilePicture = ref(null)

onMounted(() => {
  if (props.session?.me?.id && props.session?.status === "WORKING") {
    store.getProfilePicture(props.session.server.id, props.session.name, props.session.me.id).then((data) => {
      profilePicture.value = data.profilePictureURL
    })
  }
})
</script>

<template>
  <ContactChip
      :id="props.session?.me?.id"
      :name="props.session?.me?.pushName"
      :image="profilePicture"
  />
</template>

<style scoped lang="scss">

</style>
