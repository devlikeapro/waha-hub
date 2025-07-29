<script setup>
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';

const { t } = useI18n();
const data = defineModel()
const props = defineProps([
  'keyColumn',
  'keyColumnName',
  'prefix',
  'entityName'
])
const editingRows = ref([]);

const onRowEditSave = (event) => {
  let {newData, index} = event;

  data.value[index] = newData;
};
const onCellEditComplete = (event) => {
  let {data, newValue, field} = event;
  data[field] = newValue;
};

function addRow() {
  const count = data.value.length + 1;
  // add row at the start
  const key = `${props.prefix}${count}`
  data.value.unshift({[props.keyColumn]: key, value: '123'});
}

function deleteRow(index) {
  data.value.splice(index, 1);
}
</script>

<template>
  <div class="card p-fluid">
    <DataTable
        v-model:editingRows="editingRows"
        :value="data"
        editMode="cell"
        :dataKey="props.keyColumn"
        @row-edit-save="onRowEditSave"
        @cell-edit-complete="onCellEditComplete"
        :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        style:  state['d_editing']&&'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    })
                }
            }"
        resizableColumns
    >
      <Column
          :field="props.keyColumn"
          :header="props.keyColumnName"
          style="width: 40%"
      >
        <template #editor="{ data, field }">
          <InputText v-model="data[field]"/>
        </template>
      </Column>
      <Column
          style="width: 40%"
          field="value" :header="t('common.value')"
      >
        <template #editor="{ data, field }">
          <InputText v-model="data[field]"/>
        </template>
      </Column>
      <Column style="min-width: 1rem">
        <template #header>
          <div class="flex flex-grow-1 justify-content-center">
            <Button
                v-tooltip.top="`${t('common.add')} ${entityName}`"
                :label="entityName"
                text
                icon="pi pi-plus"
                severity="success"
                @click="addRow"
            />
          </div>
        </template>
        <template #body="{index}">
          <div class="flex flex-grow-1 justify-content-center">
            <Button
                label=""
                rounded
                text
                v-tooltip.top="t('common.delete')"
                style="height:2rem; width: 2rem"
                icon="pi pi-trash"
                severity="warning"
                @click="deleteRow(index)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
