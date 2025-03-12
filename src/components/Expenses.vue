<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNewExpense" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelectedExpenses" :disabled="!selectedExpenses || !selectedExpenses.length" />
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          v-model:selection="selectedExpenses"
          :value="expenses"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} expenses"
          :loading="loading"
          responsiveLayout="scroll"  >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Expenses</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </span>
          </div>
        </template>

        <Column selectionMode="multiple"  :exportable="false"></Column>
        <Column field="category.name" header="Category" sortable >
          <template #body="slotProps">
            {{ slotProps.data.category?.name }}
          </template>
        </Column>
        <Column field="employee.name" header="Employee Name" sortable >
          <template #body="slotProps">
            {{ slotProps.data.employee?.name }}
          </template>
        </Column>
        <Column field="amount" header="Amount" sortable >
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.amount) }}
          </template>
        </Column>
        <Column field="details" header="Details" sortable ></Column>
        <Column field="given_by" header="Given By" sortable ></Column>
        <Column field="created_at" header="Created At" sortable >
          <template #body="slotProps">
            {{ formatDate(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column :exportable="false" >
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editExpense(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteExpense(slotProps.data)" />
          </template>
        </Column>
        <template #empty>
          No Expenses found.
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="expenseDialog" :style="{ width: '600px' }" header="Expense Details" :modal="true" @hide="hideDialog">
      <div class="flex flex-col gap-6">
        <div>
          <label for="expense_category_id" class="block font-bold mb-2">Expense Category</label>
          <Dropdown id="expense_category_id" v-model="expense.expense_category_id" :options="expenseCategoriesDropdown" optionLabel="name" optionValue="id" placeholder="Select Category" class="w-full" required="true" :class="{ 'p-invalid': submitted && !expense.expense_category_id }" />
          <small v-if="submitted && !expense.expense_category_id" class="text-red-500 block">Expense Category is required.</small>
        </div>
        <div>
          <label for="employee_id" class="block font-bold mb-2">Employee</label>
          <Dropdown id="employee_id" v-model="expense.employee_id" :options="employeesDropdown" optionLabel="name" optionValue="id" placeholder="Select Employee" class="w-full" :class="{ 'p-invalid': submitted && !expense.employee_id }" />
          <small v-if="submitted && !expense.employee_id" class="text-red-500 block">Employee is required.</small>
        </div>
        <div>
          <label for="amount" class="block font-bold mb-2">Amount</label>
          <InputNumber id="amount" v-model="expense.amount" mode="currency" currency="USD" locale="en-US" class="w-full" required="true" :class="{ 'p-invalid': submitted && !expense.amount }" />
          <small v-if="submitted && !expense.amount" class="text-red-500 block">Amount is required.</small>
        </div>
        <div>
          <label for="details" class="block font-bold mb-2">Details</label>
          <Textarea id="details" v-model.trim="expense.details" rows="3" class="w-full" />
        </div>
        <div>
          <label for="others" class="block font-bold mb-2">Others</label>
          <InputText id="others" v-model.trim="expense.others" class="w-full" />
        </div>
        <div>
          <label for="given_by" class="block font-bold mb-2">Given By</label>
          <InputText id="given_by" v-model.trim="expense.given_by" class="w-full" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveExpense" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteExpenseDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="expense">Are you sure you want to delete this expense?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteExpenseDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteExpense" :loading="deletingExpense" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteSelectedExpensesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Are you sure you want to delete the selected expenses?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteSelectedExpensesDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" text @click="deleteSelectedExpenses" :loading="deletingSelectedExpenses" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { expenseService } from '../services/expenseService'; // Import expenseService
import { expenseCategoryService } from '../services/expenseCategoryService'; // Import expenseCategoryService to fetch categories
import { employeeService } from '../services/employeeService'; // Import employeeService to fetch employees
import { FilterMatchMode } from '@primevue/core/api';

const toast = useToast();
const dt = ref(null);
const expenses = ref([]);
const selectedExpenses = ref(null);
const expenseDialog = ref(false);
const deleteExpenseDialog = ref(false);
const deleteSelectedExpensesDialog = ref(false);
const expense = ref({});
const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'category.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'employee.name': { value: null, matchMode: FilterMatchMode.CONTAINS }, // Filter by employee name
  'amount': { value: null, matchMode: FilterMatchMode.EQUALS },
  'details': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'given_by': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'created_at': { value: null, matchMode: FilterMatchMode.DATE_IS }
});
const submitted = ref(false);
const loading = ref(false);
const saving = ref(false);
const deletingExpense = ref(false);
const deletingSelectedExpenses = ref(false);
const expenseCategoriesDropdown = ref([]); // For Expense Category dropdown in dialog
const employeesDropdown = ref([]); // For Employee dropdown in dialog

onMounted(async () => {
  await loadExpenses();
  await loadExpenseCategoriesForDropdown();
  await loadEmployeesForDropdown(); // Load employees for dropdown
});

const loadExpenses = async () => {
  loading.value = true;
  try {
    expenses.value = await expenseService.fetchExpenses();
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: 'Failed to load expenses', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const loadExpenseCategoriesForDropdown = async () => {
  try {
    expenseCategoriesDropdown.value = await expenseCategoryService.fetchExpenseCategories();
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: 'Failed to load expense categories for dropdown', life: 3000 });
  }
};

const loadEmployeesForDropdown = async () => {
  try {
    employeesDropdown.value = await employeeService.fetchEmployees();
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: 'Failed to load employees for dropdown', life: 3000 });
  }
};


const openNewExpense = () => {
  expense.value = {};
  submitted.value = false;
  expenseDialog.value = true;
};

const hideDialog = () => {
  expenseDialog.value = false;
  submitted.value = false;
};

const saveExpense = async () => {
  submitted.value = true;

  if (!expense.value.expense_category_id || !expense.value.employee_id || !expense.value.amount) { // Basic validation
    return;
  }

  saving.value = true;
  try {
    if (expense.value.id) {
      // Update Expense
      await expenseService.updateExpense(expense.value.id, expense.value);
      const index = findIndexById(expense.value.id);
      if (index !== -1) {
        expenses.value[index] = { ...expense.value }; // Optimistic update
      }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Expense Updated', life: 3000 });
    } else {
      // Create New Expense
      await expenseService.createExpense(expense.value);
      await loadExpenses(); // Reload expenses
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Expense Created', life: 3000 });
    }
    expenseDialog.value = false;
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error saving expense', life: 3000 });
  } finally {
    saving.value = false;
  }
  expense.value = {};
  submitted.value = false;
};

const editExpense = async (exp) => {
  expense.value = { ...exp };
  expenseDialog.value = true;
};

const confirmDeleteExpense = (exp) => {
  expense.value = exp;
  deleteExpenseDialog.value = true;
};

const deleteExpense = async () => {
  deletingExpense.value = true;
  try {
    await expenseService.deleteExpense(expense.value.id);
    expenses.value = expenses.value.filter(val => val.id !== expense.value.id); // Optimistic update
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Expense Deleted', life: 3000 });
    deleteExpenseDialog.value = false;
    expense.value = {};
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting expense', life: 3000 });
  } finally {
    deletingExpense.value = false;
  }
};

const findIndexById = (id) => {
  return expenses.value.findIndex(expense => expense.id === id);
};


const exportCSV = () => {
  dt.value.exportCSV();
};

const confirmDeleteSelectedExpenses = () => {
  deleteSelectedExpensesDialog.value = true;
};

const deleteSelectedExpenses = async () => {
  deletingSelectedExpenses.value = true;
  try {
    if (selectedExpenses.value) {
      for (const selectedExp of selectedExpenses.value) {
        await expenseService.deleteExpense(selectedExp.id);
      }
      await loadExpenses(); // Reload expenses
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Expenses Deleted', life: 3000 });
      deleteSelectedExpensesDialog.value = false;
      selectedExpenses.value = null;
    }
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting selected expenses', life: 3000 });
  } finally {
    deletingSelectedExpenses.value = false;
  }
};


const formatCurrency = (value) => {
  if(value)
    return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'}); // Adjust currency if needed
  return '';
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