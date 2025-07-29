<script setup>
import AppList from './AppList.vue';
import SessionHeader from '../sessions/SessionHeader.vue';
import InlineMessage from 'primevue/inlinemessage';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const visible = defineModel("visible");
const session = defineModel("session");
const server = defineModel("server");

const isStopped = computed(() => {
  return session.value.status === "STOPPED"
});

function hide() {
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    class="p-fluid"
    maximizable
    style="min-width: 50%;"
  >
    <template #header>
      <SessionHeader
        :session="session"
      ></SessionHeader>
    </template>

    <AppList :server="server" :session="session" :isNewSession="false"></AppList>

    <template #footer>
      <div class="w-full flex flex-column gap-2">
        <div v-if="!isStopped">
          <InlineMessage severity="warn">
            <span v-html="t('apps.sessionStatusWarning', { status: session.status })"></span>
          </InlineMessage>
        </div>
        <div class="flex justify-content-end">
          <Button
            :label="t('apps.close')"
            icon="pi pi-times"
            text=""
            @click="hide"
            severity="secondary"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
</style>
