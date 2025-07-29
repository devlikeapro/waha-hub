<script setup>
import {saveHideDuplicatedSessions} from "../../stores/useServerStore";
import {useI18n} from 'vue-i18n'

const { t } = useI18n();
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
    <label for="show-duplicates">{{ t('sessions.hideDuplicates') }}</label>
    <i
        v-tooltip="t('sessions.hideDuplicatesTooltip')"
        class="pi pi-info-circle"></i>
    <InputSwitch
        id="show-duplicates"
        v-model="hideDuplicatedSessions"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
