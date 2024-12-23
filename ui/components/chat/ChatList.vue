<script setup>
const props = defineProps({
      chats: Array,
      pending: Boolean,
    }
)
const emit = defineEmits(['clickOnChat',
  'refreshChats'
])

</script>

<template>
  <DataTable
      :value="chats"
      :loading="pending"
      class="p-datatable--clickable"
      @row-click="emit('clickOnChat', $event.data)"
      scrollable
      scrollHeight="100%"
      :rowHover="true"
  >
    <Column>
      <template #header>
        <div class="flex justify-content-center align-items-center gap-1">
          <div>
            Last 20 Chats
          </div>
          <RefreshButton
              @click="emit('refreshChats')"
              :refreshing="pending"
          ></RefreshButton>
        </div>
      </template>
      <template #body="{ data }">
        <ChatPreview
            :id="data.id"
            :name="data.name"
            :picture="data.picture"
            :message="data.lastMessage"
        >

        </ChatPreview>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped lang="scss">

</style>