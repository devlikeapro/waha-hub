<script setup>
import {useI18n} from "vue-i18n";

const props = defineProps({
  data: {},
  deep: {
    type: Number,
    default: 2,
  },
  // vue-json-pretty paths to collapse by default, e.g. "root.config"
  collapsedPaths: {
    type: Array,
    default: () => [],
  },
});
const {t} = useI18n();

const pathCollapsible = (node) => props.collapsedPaths.includes(node.path)

async function copy(event) {
  await navigator.clipboard.writeText(JSON.stringify(
      props.data,
      null,
      2
  ));
  event.preventDefault();
}

</script>

<template>
  <div class="flex gap-2">
    <div style="margin-top: -0.75rem">
      <Button
          rounded
          text=""
          v-tooltip.focus.bottom="{ value: t('ui.copiedToClipboard') }"
          icon="pi pi-copy"
          severity="secondary"
          @click="copy($event)">
      </Button>
    </div>
    <div style="max-width: 100%">
      <vue-json-pretty
          :data="data"
          :deep="deep"
          :pathCollapsible="pathCollapsible"
          :showLine="false"
          :showIcon="true"
          theme="dark"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>