<script setup>
import { useLayout } from "../composables/useLayout";
import AppConfig from "./AppConfig.vue";

const { isDarkMode, toggleDarkMode } = useLayout();

defineEmits(['toggle-mobile']);
</script>

<template>
  <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-4 md:p-3 m-1 md:m-2 border-b md:border border-surface-200 dark:border-surface-700 sticky top-0 z-30"
  >
    <div class="flex justify-between items-center">
      <!-- Left Section -->
      <div class="flex gap-3 items-center">
        <!-- Mobile Menu Button -->
        <button
            @click="$emit('toggle-mobile')"
            class="md:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <i class="pi pi-bars text-xl text-surface-700 dark:text-surface-100" />
        </button>

        <!-- Logo and Branding -->
        <div class="flex gap-3 items-center">
          <span class="hidden sm:flex flex-col">
                        <span class="text-xl font-light text-surface-700 dark:text-surface-100 leading-none">
                            Cuddle Crafter Admin
                        </span>

                    </span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center gap-2">
        <!-- Dark Mode Toggle -->
        <button
            type="button"
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-all text-surface-900 dark:text-surface-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:focus-visible:ring-offset-surface-950"
            @click="toggleDarkMode"
        >
          <i :class="['pi text-base', { 'pi-moon': isDarkMode, 'pi-sun': !isDarkMode }]" />
        </button>

        <!-- Settings -->
        <div class="relative">
          <Button
              v-styleclass="{
                            selector: '@next',
                            enterFromClass: 'hidden',
                            enterActiveClass: 'animate-scalein',
                            leaveToClass: 'hidden',
                            leaveActiveClass: 'animate-fadeout',
                            hideOnOutsideClick: true,
                        }"
              icon="pi pi-cog"
              text
              rounded
              aria-label="Settings"
          />
          <AppConfig />
        </div>
      </div>
    </div>
  </div>
</template>