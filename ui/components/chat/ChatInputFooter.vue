<script setup>
const props = defineProps(
    {
      disabled: Boolean,
      sendText: Function,
    }
)
const loading = ref(false)
const text = ref('')

function send() {
  loading.value = true
  props.sendText(text.value).then(() => {
    text.value = ''
  }).finally(() => {
    loading.value = false
  })
}

</script>

<template>
  <div class="flex justify-content-end" style="width: 100%">
    <div style="width: 100%">
      <Textarea v-model="text" rows="2" cols="50"
                @keydown.enter.ctrl="send"
                style="width: 100%"
      />
    </div>
    <div class="my-auto pl-2">
      <Button
          @click="send"
          :disabled="disabled || !text"
          :loading="loading"
          label="" icon="pi pi-send" class="p-button-success"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>