<script setup>
import {useI18n} from "vue-i18n";
import {FilterMatchMode} from "primevue/api";
import ContactChip from "../sessions/ContactChip.vue";
import {useI18nDate} from "../../composables/useI18nDate";

const props = defineProps({
  chat: Object,
  serverId: String,
  sessionName: String,
})
const visible = defineModel("visible")

const {t} = useI18n()
const toast = useToast()
const store = useServerStore()
const {formatChatTimestamp} = useI18nDate()

const activeIndex = ref(0)
const loading = ref(false)
const participants = ref([])
const tags = ref([])
const membersFilters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
})
const tagsFilters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
})

async function load() {
  loading.value = true
  try {
    const [members, memberTags] = await Promise.all([
      store.getGroupParticipants(props.serverId, props.sessionName, props.chat.id),
      store.getGroupParticipantTags(props.serverId, props.sessionName, props.chat.id),
    ])
    participants.value = members || []
    tags.value = memberTags || []
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('chat.group.loadFailedTitle'),
      detail: e?.response?.data?.message || e?.message || String(e),
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

watch(visible, (isVisible) => {
  if (!isVisible) return
  activeIndex.value = 0
  membersFilters.value.global.value = null
  tagsFilters.value.global.value = null
  participants.value = []
  tags.value = []
  load()
})
</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      :dismissableMask="true"
      maximizable
      style="width: 60%"
  >
    <template #header>
      <ContactChip
          :id="chat.id"
          :name="chat.name"
          :image="chat.picture"
      />
    </template>
    <TabView v-model:activeIndex="activeIndex">
      <TabPanel>
        <template #header>
          <i class="pi pi-users mr-2"></i>
          {{ t('chat.group.participantsTab') }}
        </template>
        <div class="flex align-items-center gap-2 mb-2">
          <IconField iconPosition="left" class="flex-1">
            <InputIcon class="pi pi-search"/>
            <InputText
                v-model="membersFilters['global'].value"
                :placeholder="t('chat.group.search')"
                style="width: 100%"
            />
          </IconField>
          <RefreshButton
              :refreshing="loading"
              @click="load"
          />
        </div>
        <DataTable
            :value="participants"
            dataKey="id"
            :loading="loading"
            v-model:filters="membersFilters"
            :globalFilterFields="['id', 'pn', 'role']"
            paginator
            :rows="20"
            :rowsPerPageOptions="[20, 50, 100, 500]"
            sortField="role"
            :sortOrder="-1"
            style="white-space: nowrap"
        >
          <template #empty>{{ t('chat.group.noParticipants') }}</template>
          <Column field="id" :header="t('chat.group.id')" sortable/>
          <Column field="pn" :header="t('chat.group.phoneNumber')" sortable/>
          <Column field="role" :header="t('chat.group.role')" sortable>
            <template #body="{ data }">
              <Tag
                  v-if="data.role === 'superadmin' || data.role === 'admin'"
                  :value="data.role"
                  severity="info"
              />
              <span v-else>{{ data.role }}</span>
            </template>
          </Column>
        </DataTable>
      </TabPanel>
      <TabPanel>
        <template #header>
          <i class="pi pi-tag mr-2"></i>
          {{ t('chat.group.participantTagsTab') }}
        </template>
        <div class="flex align-items-center gap-2 mb-2">
          <IconField iconPosition="left" class="flex-1">
            <InputIcon class="pi pi-search"/>
            <InputText
                v-model="tagsFilters['global'].value"
                :placeholder="t('chat.group.search')"
                style="width: 100%"
            />
          </IconField>
          <RefreshButton
              :refreshing="loading"
              @click="load"
          />
        </div>
        <DataTable
            :value="tags"
            dataKey="id"
            :loading="loading"
            v-model:filters="tagsFilters"
            :globalFilterFields="['id', 'tag']"
            paginator
            :rows="20"
            :rowsPerPageOptions="[20, 50, 100, 500]"
            sortField="timestamp"
            :sortOrder="-1"
            style="white-space: nowrap"
        >
          <template #empty>{{ t('chat.group.noTags') }}</template>
          <Column field="id" :header="t('chat.group.id')" sortable/>
          <Column field="tag" :header="t('chat.group.tag')" sortable/>
          <Column field="timestamp" :header="t('chat.group.updatedAt')" sortable>
            <template #body="{ data }">
              {{ data.timestamp ? formatChatTimestamp(data.timestamp) : '' }}
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>
  </Dialog>
</template>
