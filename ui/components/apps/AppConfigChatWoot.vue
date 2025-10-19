<script setup lang="ts">
import {ref, onMounted, reactive, watch, computed} from 'vue';
import {useServerStore} from '../../stores/useServerStore';
import {
  ChatWootAppConfig,
  Locale,
  LinkPreview,
  ConversationSort,
  ConversationStatus,
  ChatWootConversationsConfig
} from '../../services/waha/dtos';
import useShowToastOnResult from '../../composables/useShowToastOnResult';
import {useI18n} from 'vue-i18n';
import InlineMessage from 'primevue/inlinemessage';
import lodash from 'lodash';
import AppConfigChatWootTemplates from "./AppConfigChatWootTemplates.vue";

const {t} = useI18n();

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

const defaults: ChatWootAppConfig = {
  url: '',
  accountId: null,
  accountToken: '',
  inboxId: null,
  inboxIdentifier: '',
  locale: 'en-US',
  linkPreview: LinkPreview.OFF,
  templates: {},
  commands: {
    server: true,
  },
  conversations: {
    sort: 'created_newest' as ConversationSort,
    status: null,
  }
};


const config = reactive<ChatWootAppConfig>(
    lodash.defaultsDeep({}, lodash.cloneDeep(props.modelValue ?? {}), defaults)
)
watch(
    config,
    (val) => {
      const out = lodash.cloneDeep(val)
      emit('update:modelValue', out)
    },
    {deep: true}
)

const locales = ref<Locale[]>([]);
const loading = ref(false);

const linkPreviewOptions = [
  {label: t('apps.chatwoot.linkPreview.off'), value: LinkPreview.OFF},
  {label: t('apps.chatwoot.linkPreview.lq'), value: LinkPreview.LQ},
  {label: t('apps.chatwoot.linkPreview.hq'), value: LinkPreview.HQ},
];

// Conversations config
const conversationSortOptions = [
  {label: t('apps.chatwoot.conversations.sort.createdNewest'), value: 'created_newest' as ConversationSort},
  {label: t('apps.chatwoot.conversations.sort.activityNewest'), value: 'activity_newest' as ConversationSort},
  {label: t('apps.chatwoot.conversations.sort.activityOldest'), value: 'activity_oldest' as ConversationSort},
  {label: t('apps.chatwoot.conversations.sort.createdOldest'), value: 'created_oldest' as ConversationSort},
];

const conversationStatusOptions = [
  {label: t('apps.chatwoot.conversations.status.open'), value: 'open' as ConversationStatus},
  {label: t('apps.chatwoot.conversations.status.pending'), value: 'pending' as ConversationStatus},
  {label: t('apps.chatwoot.conversations.status.snoozed'), value: 'snoozed' as ConversationStatus},
  {label: t('apps.chatwoot.conversations.status.resolved'), value: 'resolved' as ConversationStatus},
];

// true when filtering by specific statuses; false means "use any status"
const statusFilterOn = ref<boolean>(!!config.conversations?.status);

// Bind toggle to the inverse: ON => use any status; OFF => show filter multiselect
const useAnyStatus = computed({
  get: () => !statusFilterOn.value,
  set: (val: boolean) => {
    statusFilterOn.value = !val;
  }
});

watch(statusFilterOn, (on) => {
  if (on) {
    // when enabling, select default statuses (exclude 'resolved')
    config.conversations.status = conversationStatusOptions
        .filter(o => o.value !== 'resolved')
        .map(o => o.value) as ConversationStatus[];
  } else {
    // when disabling, set to null (off)
    config.conversations.status = null;
  }
});


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
        t('apps.chatwoot.failedToLoadLocales')
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
    <div class="mb-3">
      <InlineMessage severity="info">
        <span>
            {{ t('apps.chatwoot.help.header') }}
        </span>
        <br/>
        <a href="http://waha.devlike.pro/docs/apps/chatwoot/" target="_blank" rel="noopener noreferrer">
          {{ t('apps.chatwoot.help.ChatWootAppPage') }}
        </a>
        <br/>
        <a href="https://waha.devlike.pro/blog/apps-chatwoot-config/" target="_blank" rel="noopener noreferrer">
          {{ t('apps.chatwoot.help.ChatWootConfigArticle') }}
        </a>
      </InlineMessage>
    </div>
    <div class="field">
      <label for="url">{{ t('apps.chatwoot.url') }}</label>
      <InputText
          id="url"
          v-model="config.url"
          placeholder="https://app.chatwoot.com"
          :class="{'p-invalid': submitted && !config.url}"
      />
      <small class="p-error" v-if="submitted && !config.url">{{ t('apps.chatwoot.urlRequired') }}</small>
    </div>

    <div class="grid">
      <div class="col-6">
        <div class="field">
          <label for="accountId">{{ t('apps.chatwoot.accountId') }}</label>
          <InputNumber
              id="accountId"
              v-model="config.accountId"
              :placeholder="t('apps.chatwoot.accountIdPlaceholder')"
              :class="{'p-invalid': submitted && !config.accountId}"
          />
          <small class="p-error" v-if="submitted && !config.accountId">{{
              t('apps.chatwoot.accountIdRequired')
            }}</small>
        </div>
      </div>
      <div class="col-6">
        <div class="field">
          <label for="accountToken">{{ t('apps.chatwoot.accountToken') }}</label>
          <Password
              id="accountToken"
              v-model="config.accountToken"
              :placeholder="t('apps.chatwoot.accountTokenPlaceholder')"
              :feedback="false"
              toggleMask
              :class="{'p-invalid': submitted && !config.accountToken}"
          />
          <small class="p-error" v-if="submitted && !config.accountToken">{{
              t('apps.chatwoot.accountTokenRequired')
            }}</small>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="col-6">
        <div class="field">
          <label for="inboxId">
            {{ t('apps.chatwoot.inboxId') }}
            <i
                class="pi pi-info-circle"
                v-tooltip="t('apps.chatwoot.inboxIdTooltip')"
            />
          </label>
          <InputNumber
              id="inboxId"
              v-model="config.inboxId"
              :placeholder="t('apps.chatwoot.inboxIdPlaceholder')"
              :class="{'p-invalid': submitted && !config.inboxId}"
          />
          <small class="p-error" v-if="submitted && !config.inboxId">{{ t('apps.chatwoot.inboxIdRequired') }}</small>
        </div>
      </div>
      <div class="col-6">
        <div class="field">
          <label for="inboxIdentifier">{{ t('apps.chatwoot.inboxIdentifier') }}</label>
          <Password
              id="inboxIdentifier"
              v-model="config.inboxIdentifier"
              :placeholder="t('apps.chatwoot.inboxIdentifierPlaceholder')"
              :feedback="false"
              toggleMask
              :class="{'p-invalid': submitted && !config.inboxIdentifier}"
          />
          <small class="p-error"
                 v-if="submitted && !config.inboxIdentifier">{{ t('apps.chatwoot.inboxIdentifierRequired') }}</small>
        </div>
      </div>
    </div>

    <div class="field">
      <label for="linkPreview">
        {{ t('apps.chatwoot.linkPreview.label') }}
        <i
            class="pi pi-info-circle"
            v-tooltip="t('apps.chatwoot.linkPreview.tooltip')"
        />
      </label>
      <Dropdown
          id="linkPreview"
          v-model="config.linkPreview"
          :options="linkPreviewOptions"
          optionLabel="label"
          optionValue="value"
      />
    </div>

    <div class="field">
      <label for="conversations-sort">
        {{ t('apps.chatwoot.conversations.sort.label') }}
        <i
            class="pi pi-info-circle"
            v-tooltip="t('apps.chatwoot.conversations.sort.tooltip')"
        />
      </label>
      <Dropdown
          id="conversations-sort"
          v-model="config.conversations.sort"
          :options="conversationSortOptions"
          optionLabel="label"
          optionValue="value"
          :class="{'p-invalid': submitted && !config.conversations?.sort}"
      />
      <small class="p-error"
             v-if="submitted && !config.conversations?.sort">{{ t('apps.chatwoot.conversations.sortRequired') }}</small>
    </div>

    <div class="field">
      <label class="block mb-2">
        {{ t('apps.chatwoot.conversations.statusFilter.label') }}
        <i
            class="pi pi-info-circle"
            v-tooltip="t('apps.chatwoot.conversations.statusFilter.tooltip')"
        />
      </label>
      <div class="flex align-items-center gap-2">
        <ToggleButton
            v-model="useAnyStatus"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            :onLabel="t('apps.chatwoot.conversations.statusFilter.on')"
            :offLabel="t('apps.chatwoot.conversations.statusFilter.off')"
        />
        <MultiSelect
            v-if="!useAnyStatus"
            v-model="config.conversations.status"
            :options="conversationStatusOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('apps.chatwoot.conversations.status.selectPlaceholder')"
            :max-selected-labels="4"
            class="flex-1 w-full"
            :style="{ minWidth: '12rem' }"
        />
      </div>
    </div>

    <div class="field">
      <label>
        {{ t('apps.chatwoot.commands.title') }}
        <i
            class="pi pi-info-circle"
            v-tooltip="t('apps.chatwoot.commands.tooltip')"
        />
      </label>
      <div>
        <ToggleButton
            v-model="config.commands.server"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            :onLabel="t('apps.chatwoot.commands.server.on')"
            :offLabel="t('apps.chatwoot.commands.server.off')"
        />
      </div>
    </div>

    <div class="field">
      <label for="locale">
        {{ t('apps.chatwoot.language') }}
        <i
            class="pi pi-info-circle"
            v-tooltip="t('apps.chatwoot.languageTooltip')"
        />
      </label>
      <Dropdown
          id="locale"
          v-model="config.locale"
          :options="locales"
          optionLabel="name"
          optionValue="locale"
          :placeholder="t('apps.chatwoot.selectLocale')"
          :loading="loading"
          :class="{'p-invalid': submitted && !config.locale}"
          scrollHeight="400px"
      />
      <small class="p-error" v-if="submitted && !config.locale">{{ t('apps.chatwoot.languageRequired') }}</small>
    </div>

    <hr/>
    <div class="field">
      <div class="text-center">
        <h4>
          {{ t('apps.chatwoot.templates.title') }}
          <i
              class="pi pi-info-circle"
              v-tooltip="t('apps.chatwoot.templates.tooltip')"
          />
        </h4>
      </div>
      <div>
        <AppConfigChatWootTemplates v-model="config.templates"/>
      </div>
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
