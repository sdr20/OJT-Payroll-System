
<!-- wala na to -->



<template>
    <div>
      <button class="back-button mb-4 py-2 px-4 bg-gray-800 text-white rounded" @click="goBack">Back</button>
      <h1 class="text-2xl font-bold mb-4">Employee Reports</h1>
      <p class="text-gray-700">Generate and view various employee reports here.</p>
      <!-- Add your employee reports content here -->
    </div>
  </template>
  
  <script>
  export default {
    name: 'EmployeeReports',
    methods: {
      goBack() {
        this.$router.go(-1);
      },
    },
  };
  </script>
  
  <style scoped>
  </style>