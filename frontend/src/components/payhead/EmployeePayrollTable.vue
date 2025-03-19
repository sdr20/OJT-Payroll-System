<template>
  <div class="bg-white p-5 rounded-xl shadow-md">
    <h2 class="text-xl font-bold mb-4">Employee Payroll Information</h2>
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of Employee</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deduction</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Recurring Deduction</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Salary</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="employee in employees" :key="employee.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.id }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.position }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalDeduction.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalRecurringDeduction.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalEarnings.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalSalary.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
            <button 
              @click="$emit('addPayhead', employee)" 
              class="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
              title="Add Payhead"
            >
              <span class="material-icons-outlined text-base">add</span>
            Add</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    employees: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
</style>