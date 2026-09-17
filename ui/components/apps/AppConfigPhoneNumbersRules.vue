<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { PhoneNumbersRuleConfig } from '../../services/waha/dtos';

const { t } = useI18n();
const rules = defineModel<PhoneNumbersRuleConfig[]>({ default: () => [] });

const onCellEditComplete = (event: any) => {
  const { data, newValue, field } = event;
  data[field] = newValue;
  // The API expects no "replace" rather than an empty one
  if (field === 'replace' && !newValue) {
    delete data.replace;
  }
};

function addRule() {
  rules.value.push({ regexp: '' });
}

function deleteRule(index: number) {
  rules.value.splice(index, 1);
}
</script>

<template>
  <div class="card p-fluid phone-numbers-rules">
    <DataTable
      :value="rules"
      editMode="cell"
      @cell-edit-complete="onCellEditComplete"
      :pt="{
        column: {
          bodycell: ({ state }) => ({
            style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
          })
        }
      }"
    >
      <template #empty>
        <div class="text-center text-500">{{ t('apps.phoneNumbers.rules.empty') }}</div>
      </template>
      <Column field="regexp" :header="t('apps.phoneNumbers.rules.regexp')" style="width: 45%">
        <template #body="{ data }">
          <code>{{ data.regexp }}</code>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" placeholder="^52(\\d{10})$" />
        </template>
      </Column>
      <Column field="replace" :header="t('apps.phoneNumbers.rules.replace')" style="width: 45%">
        <template #body="{ data }">
          <code>{{ data.replace }}</code>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" placeholder="521$1" />
        </template>
      </Column>
      <Column style="min-width: 1rem">
        <template #header>
          <div class="flex flex-grow-1 justify-content-center">
            <Button
              :label="t('common.add')"
              text
              icon="pi pi-plus"
              severity="success"
              @click="addRule"
            />
          </div>
        </template>
        <template #body="{ index }">
          <div class="flex flex-grow-1 justify-content-center">
            <Button
              label=""
              rounded
              text
              v-tooltip.top="t('common.delete')"
              style="height: 2rem; width: 2rem"
              icon="pi pi-trash"
              severity="warning"
              @click="deleteRule(index)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
