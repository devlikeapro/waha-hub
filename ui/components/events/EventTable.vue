<script setup>
import {onMounted} from 'vue';
import {useToast} from "primevue/usetoast";
import {ref} from "vue";
import EventDataViewer from "./EventDataViewer.vue";
import {FilterMatchMode, FilterOperator} from "primevue/api";
import {WAHAEvents} from "../../services/WAHAEvents";
import Expand from "./expand.vue";
import {ClientStatus, WebSocketClient} from "../../services/WebSocketService";
import WebSocketStatus from "./WebSocketStatus.vue";
import {sleep} from "../../services/utils";
import downloadjs from "downloadjs"
import {showTime} from "../../utils/time";
import {useI18n} from "vue-i18n";

const toast = useToast();
const store = useServerStore()
const {servers} = storeToRefs(store)
const selectedServer = ref(null)
const { t } = useI18n();


onMounted(async () => {
  const timeout = 100
  const retries = 30
  for (let i = 0; i < retries; i++) {
    if (servers.value.length === 0) {
      await sleep(timeout)
    }
  }
  if (servers.value.length > 0) {
    selectedServer.value = servers.value?.[0].id
    startListening()
  }
});

const events = ref([])

const excludeEventsFromDefault = [
    // Too much data
    "engine.event",
    // There's group.v2.events
    "group.join",
    "group.leave",
]
const eventsByDefault = WAHAEvents.filter(e => !excludeEventsFromDefault.includes(e))

const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
  event: {value: eventsByDefault, matchMode: FilterMatchMode.IN},
  session: {value: null, matchMode: FilterMatchMode.CONTAINS},
})
const globalFilterFields = ["_json"]
const listening = ref(false)

function addEvent(event) {
  // Unix timestamp (in ms)
  event.timestamp = event.timestamp || Date.now()
  event._json = event._json || JSON.stringify(event)
  events.value.push(event)
}

watch(selectedServer, () => {
  if (listening.value) {
    stopListening()
    startListening()
  }
})
const includeEngineEvents = computed(() => {
  if (!filters.value.event.value) {
    // No filters - all
    return true
  }
  // check filters
  return filters.value.event.value?.includes("engine.event")
})
watch(includeEngineEvents, () => {
  if (listening.value) {
    stopListening()
    startListening()
  }
})

let client = null
const clientStatus = ref(ClientStatus.DISCONNECTED)

const expandedRows = ref({});
const toggleRow = (event) => {
  const show = expandedRows.value[event.data.id] === undefined || !expandedRows.value[event.data.id]
  const rows = {...expandedRows.value}
  if (show) {
    rows[event.data.id] = true
  } else {
    delete rows[event.data.id]
  }
  expandedRows.value = {...rows}
}

const startListening = () => {
  listening.value = true
  startClient()
}

function startClient() {
  if (!listening.value) {
    return
  }
  if (!selectedServer.value) {
    toast.add({severity: 'warn', summary: 'No server selected', detail: 'Please select a server to start listening'})
    return
  }
  if (client) {
    toast.add({
      severity: 'warn',
      summary: 'Already listening',
      detail: 'Please stop the current listener before starting a new one or refresh the page'
    })
    return
  }
  const server = store.getServer(selectedServer.value)
  const listenEvents = ['*']
  if (includeEngineEvents.value) {
    listenEvents.push('engine.event')
  }
  client = new WebSocketClient(server, listenEvents)
  client.connect()
  clientStatus.value = ClientStatus.CONNECTING
  client.on("open", () => {
    clientStatus.value = ClientStatus.CONNECTED
  })
  client.on("close", () => {
    clientStatus.value = ClientStatus.DISCONNECTED
    restartClient()
  })
  client.on("error", () => {
    clientStatus.value = ClientStatus.ERROR
    restartClient()
  })
  client.on("event", addEvent)
}

function restartClient() {
  stopClient()
  setTimeout(() => {
    startClient()
  }, 300)
}

function stopClient() {
  client?.stop()
  client = null
}

const stopListening = () => {
  listening.value = false
  stopClient()
  clientStatus.value = ClientStatus.DISCONNECTED
}
const clearEvents = () => {
  events.value = []
}

const clearEventsText = computed(() => {
  const count = events.value.length
  return t('monitor.cleanEvents', { count })
})

function download(event) {
  downloadjs(JSON.stringify(events.value, null, 2), "events.json", "text/plain");
}

</script>

<template>
  <div class="mb-4">
    <h5 class="flex align-items-center gap-1">
      <i class="pi pi-eye"></i>
      <span class="mr-1">
      {{ t('monitor.title') }}
      </span>
    </h5>
    <div>
      <p class="m-0">
        {{ t('monitor.description') }}
        <br/>
        {{ t('monitor.purpose') }}
        <i
            v-tooltip="t('monitor.realTimeOnly')"
            class="pi pi-info-circle"
        ></i>
      </p>
    </div>
  </div>

  <DataTable
      :value="events"
      :dataKey="'id'"
      v-model:expandedRows="expandedRows"
      :rowHover="true"
      v-model:filters="filters"
      filterDisplay="row"
      :globalFilterFields="globalFilterFields"
      showGridlines
      style="white-space: nowrap;"
      sortField="timestamp"
      :sortOrder="-1"
      resizableColumns
      class="p-datatable--clickable"
      @row-click="toggleRow"
  >
    <template #header>
      <div class="flex justify-content-between align-items-center flex-column sm:flex-row gap-2 sm:gap-0">
        <div class="flex flex-column sm:flex-row gap-2">
          <div class="flex gap-2">
            <Button v-if="!listening" :label="t('monitor.listen')" icon="pi pi-play" severity="success"
                    @click="startListening"
            />
            <Button v-else :label="t('monitor.pause')" icon="pi pi-pause" severity="secondary"
                    @click="stopListening"
            />
            <ServerDropdown
                :placeholder="t('monitor.selectServer')"
                v-model="selectedServer"
                :showClear="false"
            ></ServerDropdown>
          </div>
          <div class="flex align-items-center justify-content-center">
            <WebSocketStatus :status="clientStatus"></WebSocketStatus>
          </div>
        </div>
        <div class="flex justify-content-between flex-column sm:flex-row gap-2 sm:gap-2">
          <Button
              v-tooltip="t('monitor.downloadTooltip')"
              icon="pi pi-download" :label="t('monitor.download')"
              @click="download($event)"
          />
          <Button
              :label="clearEventsText"
              icon="pi pi-trash" severity="secondary"
              @click="clearEvents"
          />
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search"/>
            <InputText
                v-model="filters['global'].value"
                :placeholder="t('monitor.searchInData')"
                style="width: 100%"
            />
          </IconField>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="p-4 text-center text-se">
        <template v-if="clientStatus === ClientStatus.CONNECTED">
          <span> {{ t('monitor.listeningForEvents') }} </span>
          <i class="pi pi-spin pi-spinner"></i>
        </template>
        <template v-else>
          <Button
              v-if="!listening"
              :label="t('monitor.listen')"
              icon="pi pi-play"
              severity="success"
              @click="startListening"
          />
        </template>
      </div>
    </template>

    <Column style="width: 3rem">
      <template #body="{data}">
        <expand
            :rows="expandedRows"
            :data="data"
        >
        </expand>
      </template>
    </Column>

    <Column
        field="event"
        :header="t('monitor.eventColumn')"
        :show-filter-menu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
            id="events"
            v-model="filterModel.value"
            :placeholder="t('monitor.any')"
            :max-selected-labels="1"
            :selectedItemsLabel="t('monitor.eventsSelected')"
            @change="filterCallback()"
            :options="WAHAEvents"
            :showClear="true"
            :required="false"
        ></MultiSelect>
      </template>
      <template #body="{data}">
        <EventTag :event="data.event"></EventTag>
      </template>
    </Column>
    <Column
        field="session"
        :header="t('monitor.sessionColumn')"
        :show-filter-menu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
            v-model="filters['session'].value"
            :placeholder="t('monitor.sessionColumn')"
            style="width: 100%"
        />
      </template>
    </Column>
    <Column field="timestamp" :header="t('monitor.timeColumn')" sortable>
      <template #body="{data}">
        <span>  {{ showTime(data.timestamp) }}</span>
      </template>
    </Column>

    <Column
        :header="t('monitor.detailColumn')"
        :show-filter-menu="false"
    >
      <template #body="{data}">
        <EventDetail :data="data"></EventDetail>
      </template>
    </Column>

    <template #expansion="slotProps">
      <div class="event-viewer">
        <EventDataViewer :data="slotProps.data"></EventDataViewer>
      </div>
    </template>


  </DataTable>
</template>

<style scoped lang="scss">
.event-viewer {
  margin: 0.2rem -1rem
}

</style>