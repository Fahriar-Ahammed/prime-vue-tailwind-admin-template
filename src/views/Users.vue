<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNewUser" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" outlined @click="confirmDeleteSelectedUsers" :disabled="!selectedUsers || !selectedUsers.length" />
        </template>

        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataTable
          ref="dt"
          v-model:selection="selectedUsers"
          :value="users"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
          :loading="loading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Users</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </span>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Name" sortable style="min-width: 15rem"></Column>
        <Column field="email" header="Email" sortable style="min-width: 20rem"></Column>
        <Column field="role" header="Role" sortable style="min-width: 12rem"></Column>
        <Column field="active" header="Active" sortable style="min-width: 10rem">
          <template #body="slotProps">
            <i v-if="slotProps.data.active" class="pi pi-check-circle" style="color: green"></i>
            <i v-else class="pi pi-times-circle" style="color: red"></i>
          </template>
        </Column>
        <Column field="created_at" header="Created At" sortable style="min-width: 15rem">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUser(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="userDialog" :style="{ width: '600px' }" header="User Details" :modal="true" @hide="hideDialog">
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-2">Name</label>
          <InputText id="name" v-model.trim="user.name" required="true" autofocus :class="{ 'p-invalid': submitted && !user.name }" class="w-full" />
          <small v-if="submitted && !user.name" class="text-red-500 block">Name is required.</small>
        </div>
        <div>
          <label for="email" class="block font-bold mb-2">Email</label>
          <InputText id="email" v-model.trim="user.email" type="email" required="true" :class="{ 'p-invalid': submitted && !user.email }" class="w-full" />
          <small v-if="submitted && !user.email" class="text-red-500 block">Email is required.</small>
        </div>
        <div v-if="isNewUser">
          <label for="password" class="block font-bold mb-2">Password</label>
          <Password id="password" v-model="user.password" class="w-full" :feedback="false" required="true" :class="{ 'p-invalid': submitted && !user.password }" />
          <small v-if="submitted && !user.password" class="text-red-500 block">Password is required for new users.</small>
        </div>
        <div>
          <label for="role" class="block font-bold mb-2">Role</label>
          <Dropdown id="role" v-model="user.role" :options="roles" optionLabel="label" option-value="value" placeholder="Select a Role" class="w-full" required="true" :class="{ 'p-invalid': submitted && !user.role }" />
          <small v-if="submitted && !user.role" class="text-red-500 block">Role is required.</small>
        </div>
        <div class="field-checkbox flex items-center">
          <Checkbox id="active" v-model="user.active" :binary="true" />
          <label for="active" class="ml-2 font-bold">Active</label>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveUser" :loading="saving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="user">Are you sure you want to delete <b>{{ user.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteUserDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteUser" :loading="deletingUser" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteSelectedUsersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Are you sure you want to delete the selected users?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteSelectedUsersDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteSelectedUsers" :loading="deletingSelectedUsers" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { userService } from '../services/userService'; // Import userService

const toast = useToast();
const dt = ref(null);
const users = ref([]); // Changed from products to users
const userDialog = ref(false); // Changed from productDialog to userDialog
const deleteUserDialog = ref(false); // Changed from deleteProductDialog to deleteUserDialog
const deleteSelectedUsersDialog = ref(false); // Changed from deleteProductsDialog to deleteSelectedUsersDialog
const user = ref({}); // Changed from product to user
const selectedUsers = ref(null); // Changed from selectedProducts to selectedUsers
const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'email': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'role': { value: null, matchMode: FilterMatchMode.IN },
  'active': { value: null, matchMode: FilterMatchMode.EQUALS },
  'created_at': { value: null, matchMode: FilterMatchMode.DATE_IS }
});
const submitted = ref(false);
const loading = ref(false); // Loading state for DataTable
const saving = ref(false);   // Loading state for Save User button
const deletingUser = ref(false); // Loading state for Delete User button
const deletingSelectedUsers = ref(false); // Loading state for Delete Selected Users button
const roles = ref([ // User roles for dropdown
  { label: 'Admin', value: 'admin' },
  { label: 'Accountant', value: 'accountant' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]);
const isNewUser = ref(false); // Flag to indicate if it's a new user creation

onMounted(async () => {
  await loadUsers(); // Fetch users on component mount
});

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await userService.fetchUsers();
    console.log("users data ", users.value)
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const openNewUser = () => {
  user.value = { active: true }; // Initialize default values for new user, active defaults to true
  submitted.value = false;
  userDialog.value = true;
  isNewUser.value = true; // Set flag for new user creation
};

const hideDialog = () => {
  userDialog.value = false;
  submitted.value = false;
  isNewUser.value = false; // Reset new user flag when dialog is closed
};

const saveUser = async () => {
  submitted.value = true;

  if (!user.value.name || !user.value.email || !user.value.role || (isNewUser.value && !user.value.password)) {
    return; // Validation failed, stop here
  }

  saving.value = true;
  try {
    if (user.value.id) {
      // Update User
      await userService.updateUser(user.value.id, user.value);
      const index = findIndexById(user.value.id);
      if (index !== -1) {
        users.value[index] = { ...user.value }; // Update in the local array
      }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
    } else {
      // Create New User
      await userService.createUser(user.value);
      await loadUsers(); // Reload users to get the updated list from the server
      toast.add({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
    }
    userDialog.value = false;
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error saving user', life: 3000 });
  } finally {
    saving.value = false;
  }
  user.value = {}; // Clear user object after save/cancel
  submitted.value = false; // Reset submitted state
  isNewUser.value = false; // Reset new user flag
};


const editUser = async (usr) => {
  user.value = { ...usr };
  userDialog.value = true;
  isNewUser.value = false; // Set flag to false for edit mode
};

const confirmDeleteUser = (usr) => {
  user.value = usr;
  deleteUserDialog.value = true;
};

const deleteUser = async () => {
  deletingUser.value = true;
  try {
    await userService.deleteUser(user.value.id);
    users.value = users.value.filter(val => val.id !== user.value.id); // Optimistic update
    toast.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
    deleteUserDialog.value = false;
    user.value = {};
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting user', life: 3000 });
  } finally {
    deletingUser.value = false;
  }
};

const findIndexById = (id) => {
  return users.value.findIndex(user => user.id === id);
};


const exportCSV = () => {
  dt.value.exportCSV();
};

const confirmDeleteSelectedUsers = () => {
  deleteSelectedUsersDialog.value = true;
};

const deleteSelectedUsers = async () => {
  deletingSelectedUsers.value = true;
  try {
    if (selectedUsers.value) {
      for (const selectedUser of selectedUsers.value) {
        await userService.deleteUser(selectedUser.id); // Delete each selected user
      }
      await loadUsers(); // Reload users to reflect deletions from server
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Selected Users Deleted', life: 3000 });
      deleteSelectedUsersDialog.value = false;
      selectedUsers.value = null;
    }
  } catch (error) {
    toast.error({ severity: 'error', summary: 'Error', detail: error.toString() || 'Error deleting selected users', life: 3000 });
  } finally {
    deletingSelectedUsers.value = false;
  }
};


const formatDate = (value) => {
  if (value) {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return '';
};

</script>