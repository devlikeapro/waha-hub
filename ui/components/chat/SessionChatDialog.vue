<script setup>

import {sleep} from "../../services/utils";
import ChatMessages from "./ChatMessages.vue";
import ChatHeader from "./ChatHeader.vue";
import ChatList from "./ChatList.vue";
import ChatInputFooter from "./ChatInputFooter.vue";
import {ClientStatus, WebSocketClient} from "../../services/WebSocketService";
import {ref} from "vue";
import WebSocketStatus from "../events/WebSocketStatus.vue";

const visible = defineModel("visible");
const session = defineModel("session");
// reset values on visible
watch(visible, () => {
  if (!visible.value) {
    selectedChat.value = null
    messages.value = []
    stopClient()
  }
})

const toast = useToast();
const store = useServerStore()
const {
  data: chats,
  pending,
  error,
  refresh: refreshChats
} = useAsyncData(
    `session-${session.value.name}-chats`,
    async () => {
      return await store.getChatsOverview(session.value.server.id, session.value.name, 20)
    })

const selectedChat = ref(null)
const messages = ref([])

const profilePicture = ref(null)
watch(selectedChat, () => {
  if (!selectedChat.value) {
    return
  }
  fetchMessages()
})
const fetchingMessages = ref(false)
const limit = ref(20)
const offset = ref(0)

let client = null
const clientStatus = ref(ClientStatus.DISCONNECTED)

function startClient() {
  const server = store.getServer(session.value.server.id)
  const listenEvents = ['message.any']
  client = new WebSocketClient(server, listenEvents, session.value.name)
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
  client.on("event", handleEvent)
}

async function handleEvent(event) {
  await sleep(100)
  const chatId = selectedChat.value?.id
  if (!chatId) {
    return
  }
  if (event.payload.from === chatId || event.payload.to === chatId) {
    fetchMessages()
  }
  refreshChats()
}

function restartClient() {
}

function stopClient() {
  client?.stop()
  client = null
  clientStatus.value = ClientStatus.DISCONNECTED
}


function fetchMessages() {
  fetchingMessages.value = true
  store.getChatsMessages(
      session.value.server.id,
      session.value.name,
      selectedChat.value.id,
      limit.value,
      offset.value,
      false
  ).then((data) => {
    // revert
    messages.value = data.reverse()
  }).finally(() => {
        fetchingMessages.value = false
      }
  )
}

watch(session, () => {
  if (!session.value?.me?.id) {
    return;
  }
  stopClient()
  startClient()
  refreshChats()

  store.getProfilePicture(session.value.server.id, session.value.name, session.value.me.id).then((data) => {
    profilePicture.value = data.profilePictureURL
  })
})

function clickOnChat(chat) {
  selectedChat.value = chat
}

function sendText(text) {
  return store.sendText(session.value.server.id, session.value.name, selectedChat.value.id, text).then(() => {
    sleep(100)
  })
}

const showPromo = ref(false)
</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      maximizable
      style="width: 90%; height: 90%;"
  >
    <template #header>
      <div>

        <SessionHeader
            :session="session"
        ></SessionHeader>
      </div>
    </template>
    <div class="pb-3 flex">
      <div class="flex align-items-center gap-1">
        <SessionChip
            v-if="session.me"
            :session="session"
            :image="profilePicture"
        >
        </SessionChip>
        <WebSocketStatus :status="clientStatus"></WebSocketStatus>
      </div>
      <div class="m-auto pb-2">
        <div class="text-center">
          <a href="#" @click="showPromo = true">
            <b>ℹ️ About Chat UI</b>
          </a>
        </div>
        <ChatPromo
            style="max-width:50em"
            v-if="showPromo"
            @close="showPromo = false"
        ></ChatPromo>
      </div>
    </div>

    <Splitter style="max-height: 90%">
      <SplitterPanel :size=30 class="flex items-center justify-center">
        <ChatList
            :chats="chats"
            :loading="pending"
            @click-on-chat="clickOnChat"
            @refresh-chats="refreshChats"
        ></ChatList>
      </SplitterPanel>
      <SplitterPanel :size=70 class="flex flex-column gap-2 justify-content-between p-2">
        <div class="flex flex-column justify-content-between" style="height: 100%">
          <template v-if="selectedChat">
            <ChatHeader
                :chat="selectedChat"
                :me="session.me"
                :mePicture="profilePicture"
                :fetch="fetchMessages"
                :fetching="fetchingMessages"
            >
            </ChatHeader>
            <hr>

            <ChatMessages :messages="messages"></ChatMessages>

            <ChatInputFooter
                :disabled="!selectedChat || fetchingMessages"
                :sendText="sendText"
            />
          </template>
        </div>
      </SplitterPanel>
    </Splitter>
  </Dialog>

</template>

<style scoped lang="scss">

</style>
