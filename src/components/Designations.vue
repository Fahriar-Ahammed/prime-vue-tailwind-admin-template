<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNewDesignation" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelectedDesignations" :disabled="!selectedDesignations || !selectedDesignations.length" />
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          v-model:selection="selectedDesignations"
          :value="designations"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} designations"
          :loading="loading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Designations</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search by name" />
            </span>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Name" sortable style="min-width: 20rem"></Column>
        <Column field="created_at" header="Created At" sortable style="min-width: 20rem">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editDesignation(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteDesignation(slotProps.data)" />
          </template>
        </Column>
        <template #empty>
          No Designations found.
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="designationDialog" :style="{ width: '450px' }" header="Designation Details" :modal="true" @hide="hideDialog">
      <div class="flex flex-col gap-5">
        <div>
          <label for="name" class="block font-bold mb-2">Name</label>
          <InputText id="name" v-model.trim="designation.name" required="true" autofocus :class="{ 'p-invalid': submitted && !designation.name }" class="w-full" />
          <small v-if="submitted && !designation.name" class="text-red-500 block">Name is required.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveDesignation" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteDesignationDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="designation">Are you sure you want to delete <b>{{ designation.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDesignationDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteDesignation" :loading="deletingDesignation" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteSelectedDesignationsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Are you sure you want to delete the selected designations?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteSelectedDesignationsDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" text @click="deleteSelectedDesignations" :loading="deletingSelectedDesignations" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { designationService } from '../services/designationService'; // Import designationService
import { FilterMatchMode } from '@primevue/core/api';

const toast = useToast();
const dt = ref(null); // Ref for DataTable instance (for exportCSV if needed)
const designations = ref([]);
const selectedDesignations = ref(null);
const designationDialog = ref(false);
const deleteDesignationDialog = ref(false);
const deleteSelectedDesignationsDialog = ref(false);
const designation = ref({});
const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS }, // Global filter for DataTable
});
const submitted = ref(false);
const loading = ref(false);
const saving = ref(false);
const deletingDesignation = ref(false);
const deletingSelectedDesignations = ref(false);

onMounted(async () => {
  await loadDesignations();
});

const loadDesignations = async () => {
  loading.value = true;
  try {
    designations.value = await designationService.fetchDesignations();
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: 'Failed to load designations', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const openNewDesignation = () => {
  designation.value = {};
  submitted.value = false;
  designationDialog.value = true;
};

const hideDialog = () => {
  designationDialog.value = false;
  submitted.value = false;
};

const saveDesignation = async () => {
  submitted.value = true;

  if (!designation.value.name) { // Basic validation
    return;
  }

  saving.value = true;
  try {
    if (designation.value.id) {
      // Update Designation
      await designationService.updateDesignation(designation.value.id, designation.value);
      const index = findIndexById(designation.value.id);
      if (index !== -1) {
        designations.value[index] = { ...designation.value }; // Optimistic update
      }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Designation Updated', life: 3000 });
    } else {
      // Create New Designation
      await designationService.createDesignation(designation.value);
      await loadDesignations(); // Reload designations
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Designation Created', life: 3000 });
    }
    designationDialog.value = false;
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error saving designation', life: 3000 });
  } finally {
    saving.value = false;
  }
  designation.value = {};
  submitted.value = false;
};

const editDesignation = async (desig) => {
  designation.value = { ...desig };
  designationDialog.value = true;
};

const confirmDeleteDesignation = (desig) => {
  designation.value = desig;
  deleteDesignationDialog.value = true;
};

const deleteDesignation = async () => {
  deletingDesignation.value = true;
  try {
    await designationService.deleteDesignation(designation.value.id);
    designations.value = designations.value.filter(val => val.id !== designation.value.id); // Optimistic update
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Designation Deleted', life: 3000 });
    deleteDesignationDialog.value = false;
    designation.value = {};
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting designation', life: 3000 });
  } finally {
    deletingDesignation.value = false;
  }
};

const findIndexById = (id) => {
  return designations.value.findIndex(designation => designation.id === id);
};


const exportCSV = () => {
  dt.value.exportCSV(); // Now using dt.value which is ref to DataTable
};

const confirmDeleteSelectedDesignations = () => {
  deleteSelectedDesignationsDialog.value = true;
};

const deleteSelectedDesignations = async () => {
  deletingSelectedDesignations.value = true;
  try {
    if (selectedDesignations.value) {
      for (const selectedDesig of selectedDesignations.value) {
        await designationService.deleteDesignation(selectedDesig.id);
      }
      await loadDesignations(); // Reload designations
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Designations Deleted', life: 3000 });
      deleteSelectedDesignationsDialog.value = false;
      selectedDesignations.value = null;
    }
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting selected designations', life: 3000 });
  } finally {
    deletingSelectedDesignations.value = false;
  }
};


const formatDate = (value) => {
  if (value) {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); // Short month format
  }
  return '';
};
</script>

<style scoped>
/* No DataView specific styles needed anymore */
</style>