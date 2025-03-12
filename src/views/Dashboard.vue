<script setup>

import ProductOverviewWidget from "../components/dashboard/ProductOverviewWidget.vue";
import SalesTrendWidget from "../components/dashboard/SalesTrendWidget.vue";
import RecentActivityWidget from "../components/dashboard/RecentActivityWidget.vue";
import StatsWidget from "../components/dashboard/StatsWidget.vue";
</script>

<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">
    <StatsWidget />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SalesTrendWidget />
      <RecentActivityWidget />
    </div>
    <ProductOverviewWidget />
  </div>
</template>

<style scoped>

</style>