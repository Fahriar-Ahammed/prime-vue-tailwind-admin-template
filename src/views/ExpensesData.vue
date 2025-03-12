
<template>
  <div class="card">
    <Tabs value="0">
      <TabList>
        <Tab value="0">Expenses</Tab>
        <Tab value="1">Expenses Category</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <Expenses/>
        </TabPanel>
        <TabPanel value="1">
          <ExpenseCategories/>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import Expenses from "../components/Expenses.vue";
import ExpenseCategories from "../components/ExpenseCategories.vue";
</script>
