<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNewExpenseCategory" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelectedExpenseCategories" :disabled="!selectedExpenseCategories || !selectedExpenseCategories.length" />
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          v-model:selection="selectedExpenseCategories"
          :value="expenseCategories"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} expense categories"
          :loading="loading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Expense Categories</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search by name" />
            </span>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Name" sortable style="min-width: 30rem"></Column>
        <Column field="created_at" header="Created At" sortable style="min-width: 30rem">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editExpenseCategory(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteExpenseCategory(slotProps.data)" />
          </template>
        </Column>
        <template #empty>
          No Expense Categories found.
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="expenseCategoryDialog" :style="{ width: '450px' }" header="Expense Category Details" :modal="true" @hide="hideDialog">
      <div class="flex flex-col gap-5">
        <div>
          <label for="name" class="block font-bold mb-2">Name</label>
          <InputText id="name" v-model.trim="expenseCategory.name" required="true" autofocus :class="{ 'p-invalid': submitted && !expenseCategory.name }" class="w-full" />
          <small v-if="submitted && !expenseCategory.name" class="text-red-500 block">Name is required.</small>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveExpenseCategory" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteExpenseCategoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="expenseCategory">Are you sure you want to delete <b>{{ expenseCategory.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteExpenseCategoryDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteExpenseCategory" :loading="deletingExpenseCategory" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteSelectedExpenseCategoriesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Are you sure you want to delete the selected expense categories?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteSelectedExpenseCategoriesDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" text @click="deleteSelectedExpenseCategories" :loading="deletingSelectedExpenseCategories" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { expenseCategoryService } from '../services/expenseCategoryService'; // Import expenseCategoryService
import { FilterMatchMode } from '@primevue/core/api';

const toast = useToast();
const dt = ref(null);
const expenseCategories = ref([]);
const selectedExpenseCategories = ref(null);
const expenseCategoryDialog = ref(false);
const deleteExpenseCategoryDialog = ref(false);
const deleteSelectedExpenseCategoriesDialog = ref(false);
const expenseCategory = ref({});
const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const loading = ref(false);
const saving = ref(false);
const deletingExpenseCategory = ref(false);
const deletingSelectedExpenseCategories = ref(false);

onMounted(async () => {
  await loadExpenseCategories();
});

const loadExpenseCategories = async () => {
  loading.value = true;
  try {
    expenseCategories.value = await expenseCategoryService.fetchExpenseCategories();
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: 'Failed to load expense categories', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const openNewExpenseCategory = () => {
  expenseCategory.value = {};
  submitted.value = false;
  expenseCategoryDialog.value = true;
};

const hideDialog = () => {
  expenseCategoryDialog.value = false;
  submitted.value = false;
};

const saveExpenseCategory = async () => {
  submitted.value = true;

  if (!expenseCategory.value.name) { // Basic validation
    return;
  }

  saving.value = true;
  try {
    if (expenseCategory.value.id) {
      // Update Expense Category
      await expenseCategoryService.updateExpenseCategory(expenseCategory.value.id, expenseCategory.value);
      const index = findIndexById(expenseCategory.value.id);
      if (index !== -1) {
        expenseCategories.value[index] = { ...expenseCategory.value }; // Optimistic update
      }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Expense Category Updated', life: 3000 });
    } else {
      // Create New Expense Category
      await expenseCategoryService.createExpenseCategory(expenseCategory.value);
      await loadExpenseCategories(); // Reload expense categories
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Expense Category Created', life: 3000 });
    }
    expenseCategoryDialog.value = false;
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error saving expense category', life: 3000 });
  } finally {
    saving.value = false;
  }
  expenseCategory.value = {};
  submitted.value = false;
};

const editExpenseCategory = async (expCat) => {
  expenseCategory.value = { ...expCat };
  expenseCategoryDialog.value = true;
};

const confirmDeleteExpenseCategory = (expCat) => {
  expenseCategory.value = expCat;
  deleteExpenseCategoryDialog.value = true;
};

const deleteExpenseCategory = async () => {
  deletingExpenseCategory.value = true;
  try {
    await expenseCategoryService.deleteExpenseCategory(expenseCategory.value.id);
    expenseCategories.value = expenseCategories.value.filter(val => val.id !== expenseCategory.value.id); // Optimistic update
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Expense Category Deleted', life: 3000 });
    deleteExpenseCategoryDialog.value = false;
    expenseCategory.value = {};
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting expense category', life: 3000 });
  } finally {
    deletingExpenseCategory.value = false;
  }
};

const findIndexById = (id) => {
  return expenseCategories.value.findIndex(expenseCategory => expenseCategory.id === id);
};


const exportCSV = () => {
  dt.value.exportCSV();
};

const confirmDeleteSelectedExpenseCategories = () => {
  deleteSelectedExpenseCategoriesDialog.value = true;
};

const deleteSelectedExpenseCategories = async () => {
  deletingSelectedExpenseCategories.value = true;
  try {
    if (selectedExpenseCategories.value) {
      for (const selectedExpCat of selectedExpenseCategories.value) {
        await expenseCategoryService.deleteExpenseCategory(selectedExpCat.id);
      }
      await loadExpenseCategories(); // Reload expense categories
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Expense Categories Deleted', life: 3000 });
      deleteSelectedExpenseCategoriesDialog.value = false;
      selectedExpenseCategories.value = null;
    }
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting selected expense categories', life: 3000 });
  } finally {
    deletingSelectedExpenseCategories.value = false;
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
/* Optional DataTable specific styles if needed */
</style>