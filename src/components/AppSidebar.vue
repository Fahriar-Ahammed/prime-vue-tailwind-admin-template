<script setup>
import { ref, computed, onMounted } from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {authService} from "../services/authService.js";

const props = defineProps({
  collapsed: Boolean,
  mobileOpen: Boolean
});

const emit = defineEmits(['toggle-collapse', 'close-mobile']);

const route = useRoute();

// **Authentication and Role Simulation (for demonstration)**
const userRole = ref(null); // Role of the logged-in user
const localStorageRoleKey = 'userRole'; // Key to store role in localStorage

onMounted(() => {
  // **Simulate getting role from login response (or auth service)**
  // In a real app, you'd get this from your auth service after login and store it
  const storedRole = localStorage.getItem(localStorageRoleKey);
  if (storedRole) {
    userRole.value = storedRole;
  } else {
    // Default role if not logged in or role not found (e.g., 'guest' or null)
    userRole.value = 'accountant'; // Default to accountant for now, change as needed for testing
    localStorage.setItem(localStorageRoleKey, 'accountant'); // Store default for simulation
  }
});

const setRole = (role) => {
  userRole.value = role;
  localStorage.setItem(localStorageRoleKey, role);
  console.log(`User role set to: ${role}`);
}

// **Menu Items with Role Definitions**
const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/dashboard',
    exact: true,
    roles: ['admin', 'accountant'] // Accessible to both admin and accountant
  },
  {
    label: 'Users',
    icon: 'pi pi-user',
    to: '/users',
    exact: true,
    roles: ['admin'] // Only accessible to admin
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    to: '/settings',
    roles: ['admin'] // Only accessible to admin
  }
]);

const filteredMenuItems = computed(() => {
  return menuItems.value.filter(item => {
    if (!item.roles) return true; // If no roles specified, everyone can access (or adjust this logic)
    return item.roles.includes(userRole.value); // Check if user's role is in allowed roles
  });
});


const isActive = (item) => {
  if (item.exact) return route.path === item.to;
  return route.path.startsWith(item.to);
};

const router = useRouter();
const logout = async () => {
  try {
    await authService.logout(); // Call logout from authService
    await router.push('/admin/login'); // Redirect to login page after logout
  } catch (error) {
    console.error('Logout failed:', error);
    // Handle logout error if needed (e.g., show a toast message)
  }
};
</script>

<template>
  <aside
    :class="[
      'bg-surface-100 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700',
      'transition-all duration-300 ease-in-out',
      'fixed md:relative h-screen z-20',
      'sticky top-0',
      collapsed ? 'md:w-20' : 'md:w-64',
      mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-0'
    ]"
  >
    <div class="h-full flex flex-col">
      <div class="p-4  border-b border-surface-200 dark:border-surface-700">
        <div class="flex items-center ml-4">
          <button
            @click="$emit('toggle-collapse')"
            class="w-full"
          >
            <div class="flex items-center gap-3 text-surface-600 dark:text-surface-400">
              <i
                class="pi text-lg transition-transform"
                :class="collapsed ? 'pi-th-large' : 'pi-th-large'"
              />
            </div>
          </button>

        </div>

      </div>

      <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
        <template v-for="item in filteredMenuItems" :key="item.label">  <router-link
          v-if="!item.children"
          :to="item.to"
          class="flex items-center gap-3 p-3 rounded-lg transition-colors group"
          :class="[
              isActive(item)
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-surface-600 dark:text-surface-300 hover:bg-surface-200/50 dark:hover:bg-surface-800',
              collapsed ? 'justify-center' : ''
            ]"
        >
          <i :class="item.icon" class="text-lg" />
          <span v-if="!collapsed" class="text-sm font-medium">{{ item.label }}</span>
        </router-link>

          <div v-else class="group">
            <div
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="[
                item.children.some(child => isActive(child))
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-300 hover:bg-surface-200/50 dark:hover:bg-surface-800',
                collapsed ? 'justify-center' : ''
              ]"
            >
              <i :class="item.icon" class="text-lg" />
              <span v-if="!collapsed" class="text-sm font-medium flex-1">{{ item.label }}</span>
              <i
                v-if="!collapsed"
                class="pi pi-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': item.isOpen }"
              />
            </div>

            <div
              v-if="!collapsed && item.isOpen"
              class="ml-8 space-y-1"
            >
              <router-link
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                class="flex items-center gap-2 p-2 text-sm rounded-lg transition-colors"
                :class="[
                  isActive(child)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                ]"
              >
                <span class="w-2 h-2 rounded-full bg-current opacity-50" />
                {{ child.label }}
              </router-link>
            </div>
          </div>
        </template>
      </nav>
      <div class="p-4 border-t border-surface-200 dark:border-surface-700">
        <Button
          label="Logout"
          icon="pi pi-power-off"
          class="w-full"
          severity="secondary"
          outlined
          @click="logout"
        />
      </div>
    </div>

    <div
      v-if="mobileOpen"
      class="fixed inset-0  md:hidden z-10"
      @click="$emit('close-mobile')"
    />
  </aside>
</template>