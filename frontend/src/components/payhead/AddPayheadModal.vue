<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-xl shadow-md max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Add Payhead to Employee</h2>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1 font-medium text-sm">Available Payheads</label>
          <div class="space-y-2">
            <div v-for="payhead in availablePayheads" :key="payhead.id" class="flex justify-between items-center p-2 border border-gray-200 rounded-lg">
              <span>{{ payhead.name }} ({{ payhead.type }})</span>
              <button @click="$emit('addPayhead', payhead)" class="bg-green-50 text-green-600 font-semibold py-1 px-2 rounded-lg hover:bg-green-100 transition-all duration-200 text-xs">Add</button>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1 font-medium text-sm">Payheads Added to Employee</label>
          <div class="space-y-2">
            <div v-for="payhead in selectedEmployeePayheads" :key="payhead.id" class="flex justify-between items-center p-2 border border-gray-200 rounded-lg">
              <span>{{ payhead.name }} ({{ payhead.type }})</span>
              <button @click="$emit('removePayhead', payhead)" class="bg-red-50 text-red-600 font-semibold py-1 px-2 rounded-lg hover:bg-red-100 transition-all duration-200 text-xs">X</button>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-1 font-medium text-sm">Total Payhead</label>
          <div class="p-2 border border-gray-200 rounded-lg">
            <span>Total Payable Salary: P {{ totalPayableSalary.toLocaleString() }}</span>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200">Cancel</button>
          <button type="button" @click="$emit('save')" class="py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200">Save</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      availablePayheads: {
        type: Array,
        required: true
      },
      selectedEmployeePayheads: {
        type: Array,
        required: true
      },
      totalPayableSalary: {
        type: Number,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  </style>