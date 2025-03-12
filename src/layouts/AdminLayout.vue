<script setup>

import {ref} from "vue";
import AppSidebar from "../components/AppSidebar.vue";
import AppTopbar from "../components/AppTopbar.vue";

const sidebarCollapsed = ref(false);
const sidebarMobileOpen = ref(false);
const toggleMobileSidebar = () => {
  sidebarMobileOpen.value = !sidebarMobileOpen.value;
};
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 min-h-screen flex h-screen overflow-hidden">
    <AppSidebar
        :collapsed="sidebarCollapsed"
        :mobile-open="sidebarMobileOpen"
        class="sticky top-0 h-screen flex-shrink-0"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
        @close-mobile="sidebarMobileOpen = false"
    />

    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <AppTopbar
          class="sticky top-0 z-30"
          @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
          @toggle-mobile="toggleMobileSidebar"
      />

      <main class="flex-1 overflow-y-auto">
        <div class="p-6  mx-auto">
          <router-view />
        </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
/* Optional CSS adjustments can be added here if still needed */
</style>