<script setup>
import {toRef} from "vue";
import LabelTag from "./LabelTag.vue";
import LabelPicker from "./LabelPicker.vue";

const props = defineProps({
  serverId: String,
  sessionName: String,
  chatId: String,
  editable: Boolean,
})

const {labels, allLabels, saving, loadAll, has, add, remove} = useChatLabels(
    toRef(props, 'serverId'),
    toRef(props, 'sessionName'),
    toRef(props, 'chatId'),
)

function toggle(label) {
  if (has(label)) {
    remove(label)
  } else {
    add(label)
  }
}
</script>

<template>
  <span class="chat-labels flex align-items-center gap-2 flex-wrap">
    <LabelTag
        v-for="label in labels"
        :key="label.id"
        :label="label"
        :removable="editable"
        @remove="remove"
    />
    <LabelPicker
        v-if="editable"
        :labels="allLabels"
        :selected="labels"
        :disabled="saving"
        @open="loadAll"
        @toggle="toggle"
    />
  </span>
</template>
