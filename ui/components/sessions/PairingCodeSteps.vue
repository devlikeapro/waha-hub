<script setup>
import EnterCodeGuide from "./EnterCodeGuide.vue";
import {sleep} from "../../services/utils";
// @ts-ignore
import lodash from "lodash";
import {useI18n} from 'vue-i18n'

const props = defineProps(['session'])
const phone = ref(null)
const loading = ref(false)
const code = ref('XXXX-XXXX')

const req = useShowToastOnResult()
const store = useServerStore()
const {t} = useI18n()

function keepOnlyDigits(phone){
  return phone.replace(/\D/g, '')
}

async function showCode() {
  phone.value = keepOnlyDigits(phone.value)
  loading.value = true
  try {
    await sleep(1000)
    const data = await req(
        store.getPairingCode(props.session.server.id, props.session.name, phone.value),
        t('sessions.guide.code.requestSent'),
        t('sessions.guide.code.failedToRequestCode'),
        props.session.name,
        props.session.name,
    )
    code.value = data.code
  } finally {
    loading.value = false
  }
}
// Watch phone, add debounce - sanitize it after some time
watch(phone, lodash.debounce((newValue) => {
  phone.value = keepOnlyDigits(newValue)
}, 1000))


</script>

<template>
  <div class="flex flex-column gap-2 mt-4">
    <form @submit.prevent="showCode">
      <div class="flex justify-content-between gap-2">
        <div class="field">
          <InputText
              id="phone"
              input-id="phone"
              name="phone"
              v-model.trim="phone"
              :useGrouping="false"
              required="true"
              autofocus
              :placeholder="t('sessions.guide.code.phonePlaceholder')"
          />
        </div>
        <div>
          <Button
              type="submit"
              :label="t('sessions.guide.code.showCode')"
              icon="pi pi-send"
              :loading="loading"
          />
        </div>
      </div>
    </form>
  </div>
  <template v-if="code">
    <Divider></Divider>
    <div>
      <EnterCodeGuide></EnterCodeGuide>
    </div>
    <div class="card flex justify-content-center align-items-center">
      <div>
        <template
            v-for="symbol of code"
            v-if="code"
        >
        <span
            class="mx-1"
            style="font-size:2rem">
          {{ symbol }}
        </span>
        </template>
      </div>
    </div>
  </template>
</template>

<style scoped lang="scss">

</style>
