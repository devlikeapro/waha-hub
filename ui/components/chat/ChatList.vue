<script setup>
const props = defineProps({
      chats: Array,
      pending: Boolean,
      merge: {
        type: Boolean,
        default: true,
      }
    }
)
const emit = defineEmits(['clickOnChat',
  'refreshChats',
  'update:merge'
])

</script>

<template>
  <DataTable
      :value="chats"
      :loading="pending"
      style="width: 100%"
      class="p-datatable--clickable"
      @row-click="emit('clickOnChat', $event.data)"
      scrollable
      scrollHeight="100%"
      :rowHover="true"
  >
    <Column>
      <template #header>
        <div class="w-full flex align-items-center gap-3 flex-wrap justify-content-between">
          <div class="flex align-items-center gap-2">
            <div>
              {{ $t('chat.last20Chats') }}
            </div>
            <RefreshButton
                @click="emit('refreshChats')"
                :refreshing="pending"
            ></RefreshButton>
          </div>
          <div
              class="flex align-items-center gap-2 ml-auto"
              v-tooltip.bottom="$t('chat.mergeToggleTooltip')"
          >
            <i class="pi pi-object-ungroup text-sm"></i>
            <span class="font-medium text-sm">{{ $t('chat.mergeToggleLabel') }}</span>
            <InputSwitch
                :modelValue="props.merge"
                @update:modelValue="value => emit('update:merge', value)"
            />
          </div>
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
