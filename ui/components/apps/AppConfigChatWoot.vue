<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useServerStore } from '../../stores/useServerStore';
import { ChatWootAppConfig, Locale } from '../../services/waha/dtos';
import useShowToastOnResult from '../../composables/useShowToastOnResult';
import ChatWootLabel from '../common/ChatWootLabel.vue';

const props = defineProps({
  modelValue: {
    type: Object as () => ChatWootAppConfig,
    required: true
  },
  server: {
    type: Object,
    required: true
  },
  submitted: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const store = useServerStore();
const req = useShowToastOnResult();

const config = computed({
  get: () => props.modelValue || {
    url: '',
    accountId: 0,
    accountToken: '',
    inboxId: 0,
    inboxIdentifier: '',
    locale: 'en-US'
  },
  set: (value) => emit('update:modelValue', value)
});

const locales = ref<Locale[]>([]);
const loading = ref(false);

onMounted(async () => {
  await loadLocales();
});

async function loadLocales() {
  if (!props.server || !props.server.id) {
    return;
  }

  try {
    loading.value = true;
    locales.value = await req(
      store.getAppChatWootLocales(props.server.id),
      undefined,
      "Failed to load locales"
    );
  } catch (error) {
    console.error("Error loading locales:", error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="chatwoot-config">
    <div class="field">
      <label for="url">ChatWoot URL</label>
      <InputText 
        id="url" 
        v-model="config.url" 
        placeholder="https://app.chatwoot.com"
        :class="{'p-invalid': submitted && !config.url}"
      />
      <small class="p-error" v-if="submitted && !config.url">URL is required.</small>
    </div>

    <div class="grid">
      <div class="col-6">
        <div class="field">
          <label for="accountId">Account ID</label>
          <InputNumber 
            id="accountId" 
            v-model="config.accountId" 
            placeholder="Your Account ID"
            :class="{'p-invalid': submitted && !config.accountId}"
          />
          <small class="p-error" v-if="submitted && !config.accountId">Account ID is required.</small>
        </div>
      </div>
      <div class="col-6">
        <div class="field">
          <label for="accountToken">Account Token</label>
          <Password 
            id="accountToken" 
            v-model="config.accountToken" 
            placeholder="Your account token"
            :feedback="false"
            toggleMask
            :class="{'p-invalid': submitted && !config.accountToken}"
          />
          <small class="p-error" v-if="submitted && !config.accountToken">Account Token is required.</small>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="col-6">
        <div class="field">
          <label for="inboxId">
            Inbox ID
            <i
              class="pi pi-info-circle"
              v-tooltip="'Create and use different inboxes for every WhatsApp phone/session you\'re using'"
            />
          </label>
          <InputNumber 
            id="inboxId" 
            v-model="config.inboxId" 
            placeholder="Your Inbox ID"
            :class="{'p-invalid': submitted && !config.inboxId}"
          />
          <small class="p-error" v-if="submitted && !config.inboxId">Inbox ID is required.</small>
        </div>
      </div>
      <div class="col-6">
        <div class="field">
          <label for="inboxIdentifier">Inbox Identifier</label>
          <Password 
            id="inboxIdentifier" 
            v-model="config.inboxIdentifier" 
            placeholder="Your inbox identifier"
            :feedback="false"
            toggleMask
            :class="{'p-invalid': submitted && !config.inboxIdentifier}"
          />
          <small class="p-error" v-if="submitted && !config.inboxIdentifier">Inbox Identifier is required.</small>
        </div>
      </div>
    </div>

    <div class="field">
      <label for="locale">
        Language
        <i
          class="pi pi-info-circle"
          v-tooltip="'This is the integration language, not the Chatwoot account language. They can be different.'"
        />
      </label>
      <Dropdown 
        id="locale" 
        v-model="config.locale" 
        :options="locales" 
        optionLabel="name" 
        optionValue="locale"
        placeholder="Select Locale"
        :loading="loading"
        :class="{'p-invalid': submitted && !config.locale}"
      />
      <small class="p-error" v-if="submitted && !config.locale">Language is required.</small>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chatwoot-config {
  width: 100%;

  label {
    font-weight: bold;
  }

  .pi-info-circle {
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>
