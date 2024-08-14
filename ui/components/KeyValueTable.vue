<script setup>
import {ref} from 'vue';

const data = defineModel()
const props = defineProps(['keyColumnName'])
const editingRows = ref([]);

const onRowEditSave = (event) => {
  let {newData, index} = event;

  data.value[index] = newData;
};
const onCellEditComplete = (event) => {
  let {data, newValue, field} = event;

  switch (field) {
    case 'quantity':
    case 'price':
      if (isPositiveInteger(newValue)) data[field] = newValue;
      else event.preventDefault();
      break;

    default:
      if (newValue.trim().length > 0) data[field] = newValue;
      else event.preventDefault();
      break;
  }
};

function addRow() {
  const count = data.value.length + 1;
  // add row at the start
  const key = `user.id.${count}`
  data.value.unshift({key: key, value: '123'});
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
        dataKey="key"
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
    >
      <Column
          field="key"
          header="Name"
          style="width: 40%"
      >
        <template #editor="{ data, field }">
          <InputText v-model="data[field]"/>
        </template>
      </Column>
      <Column field="value" header="Value" style="width: 40%">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]"/>
        </template>
      </Column>
      <Column style="min-width: 1rem">
        <template #header>
          <div class="flex flex-grow-1 justify-content-center">
            <Button
                v-tooltip.top="'Add'"
                label=""
                rounded
                text
                style="height:2rem; width: 2rem"
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
                v-tooltip.top="'Delete'"
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

