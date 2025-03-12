<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNewEmployee" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelectedEmployees" :disabled="!selectedEmployees || !selectedEmployees.length" />
        </template>

        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          v-model:selection="selectedEmployees"
          :value="employees"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees"
          :loading="loading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Employees</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </span>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Designation"  style="min-width: 15rem">
          <template #body="slotProps">
            {{ slotProps.data.name }} - <span class="text-green-700">{{ slotProps.data.designation?.name }}</span>
            <p>{{ slotProps.data.address }}</p>
          </template>
        </Column>
        <Column field="number" header="Number" sortable style="min-width: 15rem"></Column>

        <Column field="join_date" header="Join Date" sortable style="min-width: 15rem">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.join_date) }}
          </template>
        </Column>
        <Column field="basic_salary" header="Basic Salary" sortable style="min-width: 15rem">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.basic_salary) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editEmployee(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteEmployee(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="employeeDialog" :style="{ width: '600px' }" header="Employee Details" :modal="true" @hide="hideDialog">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-2">Name</label>
          <InputText id="name" v-model.trim="employee.name" required="true" autofocus :class="{ 'p-invalid': submitted && !employee.name }" class="w-full" />
          <small v-if="submitted && !employee.name" class="text-red-500 block">Name is required.</small>
        </div>
        <div>
          <label for="address" class="block font-bold mb-2">Address</label>
          <InputText id="address" v-model.trim="employee.address" class="w-full" />
        </div>
        <div>
          <label for="number" class="block font-bold mb-2">Number</label>
          <InputText id="number" v-model.trim="employee.number" class="w-full" />
        </div>
        <div>
          <label for="designation_id" class="block font-bold mb-2">Designation</label>
          <Dropdown id="designation_id" v-model="employee.designation_id" :options="designations" optionLabel="name" optionValue="id" placeholder="Select Designation" class="w-full" required="true" :class="{ 'p-invalid': submitted && !employee.designation_id }" />
          <small v-if="submitted && !employee.designation_id" class="text-red-500 block">Designation is required.</small>
        </div>
        <div>
          <label for="join_date" class="block font-bold mb-2">Join Date</label>
          <Calendar id="join_date" v-model="employee.join_date" dateFormat="yy-mm-dd" class="w-full" />
        </div>
        <div>
          <label for="basic_salary" class="block font-bold mb-2">Basic Salary</label>
          <InputNumber id="basic_salary" v-model="employee.basic_salary" mode="currency" currency="USD" locale="en-US" class="w-full" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveEmployee" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteEmployeeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="employee">Are you sure you want to delete <b>{{ employee.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteEmployeeDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteEmployee" :loading="deletingEmployee" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteSelectedEmployeesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Are you sure you want to delete the selected employees?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteSelectedEmployeesDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" text @click="deleteSelectedEmployees" :loading="deletingSelectedEmployees" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { employeeService } from '../services/employeeService';

const toast = useToast();
const dt = ref(null);
const employees = ref([]); // Changed from users to employees
const employeeDialog = ref(false); // Changed from userDialog to employeeDialog
const deleteEmployeeDialog = ref(false); // Changed from deleteUserDialog to deleteEmployeeDialog
const deleteSelectedEmployeesDialog = ref(false); // Changed from deleteSelectedUsersDialog to deleteSelectedEmployeesDialog
const employee = ref({}); // Changed from user to employee
const selectedEmployees = ref(null); // Changed from selectedUsers to selectedEmployees
const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'address': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'number': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'designation.name': { value: null, matchMode: FilterMatchMode.CONTAINS }, // Filter on nested designation name
  'join_date': { value: null, matchMode: FilterMatchMode.DATE_IS },
  'basic_salary': { value: null, matchMode: FilterMatchMode.EQUALS },
  'created_at': { value: null, matchMode: FilterMatchMode.DATE_IS }
});
const submitted = ref(false);
const loading = ref(false); // Loading state for DataTable
const saving = ref(false);   // Loading state for Save Employee button
const deletingEmployee = ref(false); // Loading state for Delete Employee button
const deletingSelectedEmployees = ref(false); // Loading state for Delete Selected Employees button
const designations = ref([ // Example designations - replace with API fetch if needed
  { name: 'CEO', id: 18 },
  { name: 'Account Officer', id: 19 },
  { name: 'Software Engineer', id: 20 },
  { name: 'HR Manager', id: 21 },
]);
const isNewEmployee = ref(false); // Flag to indicate if it's a new employee creation

onMounted(async () => {
  await loadEmployees(); // Fetch employees on component mount
});

const loadEmployees = async () => {
  loading.value = true;
  try {
    employees.value = await employeeService.fetchEmployees();
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: 'Failed to load employees', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const openNewEmployee = () => {
  employee.value = {}; // Initialize default values for new employee
  submitted.value = false;
  employeeDialog.value = true;
  isNewEmployee.value = true; // Set flag for new employee creation
};

const hideDialog = () => {
  employeeDialog.value = false;
  submitted.value = false;
  isNewEmployee.value = false; // Reset new employee flag when dialog is closed
};

const saveEmployee = async () => {
  submitted.value = true;

  if (!employee.value.name || !employee.value.designation_id) { // Basic validation
    return;
  }

  saving.value = true;
  try {
    if (employee.value.join_date) {
      employee.value.join_date = formatDateForAPI(employee.value.join_date); // Format date
    }

    if (employee.value.id) {
      // Update Employee
      await employeeService.updateEmployee(employee.value.id, employee.value);
      const index = findIndexById(employee.value.id);
      if (index !== -1) {
        employees.value[index] = { ...employee.value }; // Optimistic update
      }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Updated', life: 3000 });
    } else {
      // Create New Employee
      await employeeService.createEmployee(employee.value);
      await loadEmployees(); // Reload employees to get updated list
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Created', life: 3000 });
    }
    employeeDialog.value = false;
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error saving employee', life: 3000 });
  } finally {
    saving.value = false;
  }
  employee.value = {}; // Clear employee object
  submitted.value = false; // Reset submitted state
  isNewEmployee.value = false; // Reset new employee flag
};

 const formatDateForAPI = (date) => {
  if (!date) {
    return null; // Or handle null/undefined date as needed for your API
  }

  const dt = new Date(date); // Create Date object from input (if it's not already)
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, pad with 0
  const day = String(dt.getDate()).padStart(2, '0');       // Pad with 0
  return `${year}-${month}-${day}`; // YYYY-MM-DD format
}


const editEmployee = async (emp) => {
  employee.value = { ...emp };
  employeeDialog.value = true;
  isNewEmployee.value = false; // Set flag to false for edit mode
};

const confirmDeleteEmployee = (emp) => {
  employee.value = emp;
  deleteEmployeeDialog.value = true;
};

const deleteEmployee = async () => {
  deletingEmployee.value = true;
  try {
    await employeeService.deleteEmployee(employee.value.id);
    employees.value = employees.value.filter(val => val.id !== employee.value.id); // Optimistic update
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Deleted', life: 3000 });
    deleteEmployeeDialog.value = false;
    employee.value = {};
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting employee', life: 3000 });
  } finally {
    deletingEmployee.value = false;
  }
};

const findIndexById = (id) => {
  return employees.value.findIndex(employee => employee.id === id);
};


const exportCSV = () => {
  dt.value.exportCSV();
};

const confirmDeleteSelectedEmployees = () => {
  deleteSelectedEmployeesDialog.value = true;
};

const deleteSelectedEmployees = async () => {
  deletingSelectedEmployees.value = true;
  try {
    if (selectedEmployees.value) {
      for (const selectedEmployee of selectedEmployees.value) {
        await employeeService.deleteEmployee(selectedEmployee.id);
      }
      await loadEmployees(); // Reload employees after batch delete
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Employees Deleted', life: 3000 });
      deleteSelectedEmployeesDialog.value = false;
      selectedEmployees.value = null;
    }
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting selected employees', life: 3000 });
  } finally {
    deletingSelectedEmployees.value = false;
  }
};


const formatCurrency = (value) => {
  if(value)
    return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'}); // Adjust currency if needed
  return '';
};

const formatDate = (value) => {
  if (value) {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return '';
};

</script>