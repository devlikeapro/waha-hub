<script setup>

import ContactChip from "../sessions/ContactChip.vue";
import {sleep} from "../../services/utils";
import ChatMessages from "./ChatMessages.vue";
import ChatHeader from "./ChatHeader.vue";
import ChatList from "./ChatList.vue";

const visible = defineModel("visible");
const session = defineModel("session");

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

const text = ref("")
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
  refreshChats()

  store.getProfilePicture(session.value.server.id, session.value.name, session.value.me.id).then((data) => {
    profilePicture.value = data.profilePictureURL
  })
})

function clickOnChat(chat) {
  selectedChat.value = chat
}

const sendingText = ref(false)

function sendText() {
  if (!text.value) {
    toast.add({
      severity: "warn",
      summary: "Empty message",
      detail: "Please enter a message",
      life: 3000
    })
    return
  }
  sendingText.value = true
  // send text
  store.sendText(session.value.server.id, session.value.name, selectedChat.value.id, text.value).then(async () => {
    text.value = ""
    await sleep(1000)
    fetchMessages()
  }).finally(() => {
    sendingText.value = false
  })
}
</script>

<template>
  <Dialog
      v-model:visible="visible"
      :modal="true"
      maximizable
      style="width: 90%; height: 90%;"
  >
    <template #header>
      <SessionHeader
          :session="session"
      ></SessionHeader>
    </template>
    <div>
      Header
    </div>
    <Splitter style="height: 90%;">
      <SplitterPanel :size=30>
        <div class="scrollable-panel">
          <LongText/>
        </div>
      </SplitterPanel>
      <SplitterPanel :size=70>
        <div class="scrollable-panel">
          <LongText/>
        </div>
      </SplitterPanel>
    </Splitter>
  </Dialog>

</template>

<style scoped lang="scss">
.scrollable-panel {
  height: 100%; /* Ensure it fills the SplitterPanel */
  overflow-y: auto; /* Enable vertical scrolling */
}

</style>
