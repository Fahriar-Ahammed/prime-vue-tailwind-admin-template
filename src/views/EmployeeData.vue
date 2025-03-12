
<template>
  <div class="card">
    <Tabs value="0">
      <TabList>
        <Tab value="0">Employees</Tab>
        <Tab value="1">Designations</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <Employees/>
        </TabPanel>
        <TabPanel value="1">
          <Designations/>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import Employees from "../components/Employees.vue";
import Designations from "../components/Designations.vue";
</script>
