<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import YAML, { Scalar, YAMLMap, Pair } from 'yaml';

type Templates = Record<string, string>;

const {t} = useI18n();

const props = defineProps({
  modelValue: {
    type: Object as () => Templates,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

// Local edit state
const editing = ref(false);
const value = ref('');
const error = ref<string | null>(null);

// Build YAML ensuring values are serialized as block literals
function formatToYaml(data: Record<string, string>): string {
  if (!data || Object.keys(data).length === 0) return '';

  const parts = Object.entries(data).map(([key, val]) => {
    const doc = new YAML.Document();
    const scalar = new Scalar(val);
    // @ts-ignore force block literal
    scalar.type = Scalar.BLOCK_LITERAL;
    doc.set(key, scalar);
    // remove leading `---\n`
    return String(doc).replace(/^---\s*\n/, '').trimEnd();
  });

  return parts.join('\n\n');
}


// Keep local value in sync when model changes and not editing
watch(
    () => props.modelValue,
    (nv) => {
      if (!editing.value) {
        value.value = formatToYaml(nv || {});
        error.value = null;
      }
    },
    {deep: true, immediate: true}
);

function onEdit() {
  editing.value = true;
  error.value = null;
}

function onCancel() {
  // Revert to original
  value.value = formatToYaml(props.modelValue || {});
  error.value = null;
  editing.value = false;
}

function onSave() {
  try {
    const parsed: any = YAML.parse(value.value || '') ?? {};
    // Validate: must be a plain object where key/value are strings
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Templates = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k !== 'string') {
          throw new Error('All keys must be strings');
        }
        if (typeof v !== 'string') {
          throw new Error(`Value for key "${k}" must be a string`);
        }
        out[k] = v;
      }
      emit('update:modelValue', out);
      error.value = null;
      editing.value = false;
    } else {
      throw new Error('YAML must be a mapping of string keys to string values');
    }
  } catch (e: any) {
    error.value = e?.message || String(e);
  }
}

const isInvalid = computed(() => !!error.value);

async function copyYaml() {
  try {
    await navigator.clipboard.writeText(value.value || '');
  } catch (e) {
    // Clipboard may be unavailable; ignore
  }
}
</script>

<template>
  <div class="templates-editor">
    <Textarea
        v-model="value"
        spellcheck="false"
        autoResize
        rows="2"
        cols="30"
        :disabled="!editing"
        :class="{ 'p-invalid': isInvalid }"
        class="w-full"
        placeholder="Put your templates here in YAML format..."
    />
    <small v-if="isInvalid" class="p-error">{{ error }}</small>

    <div class="toolbar">
      <template v-if="!editing">
        <a
            href="#"
            class="toolbar-action mr-3"
            v-tooltip.focus.bottom="{ value: t('apps.chatwoot.copiedToClipboard') }"
            :tabindex="0"
            @click.prevent="copyYaml"
        >
          <i class="pi pi-copy"/>
          <span>{{ t('apps.chatwoot.copy') }}</span>
        </a>
        <a href="#" class="toolbar-action" @click.prevent="onEdit">
          <i class="pi pi-pencil"/>
          <span>{{ t('common.edit') }}</span>
        </a>
      </template>
      <template v-else>
        <Button size="small" class="mr-2" severity="secondary" @click="onCancel">
          <i class="pi pi-times mr-2"/>
          <span>{{ t('common.cancel') }}</span>
        </Button>
        <Button size="small" class="ml-2" severity="success" @click="onSave">
          <i class="pi pi-check mr-2"/>
          <span>{{ t('common.save') }}</span>
        </Button>
      </template>
    </div>
  </div>

</template>

<style scoped lang="scss">
.templates-editor {
  .toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;

    .toolbar-action {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }
  }
}
</style>
