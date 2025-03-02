<template>
    <div class="min-h-screen bg-gray-50 p-4">
      <!-- Calendar Selection -->
      <div class="bg-white p-4 rounded-lg shadow-md max-w-xs w-full mb-6">
        <label for="attendanceDate" class="block text-gray-700 font-medium text-sm mb-1">Select Date</label>
        <input type="date" v-model="selectedDate" id="attendanceDate"
               class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
               @change="fetchAttendance">
      </div>
  
      <!-- Employees Information -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-3 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-700">Employees Information</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th class="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th class="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="employee in filteredAttendance" :key="employee.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ employee.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ employee.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ employee.position }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ employee.status }}</td>
              </tr>
              <tr v-if="filteredAttendance.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No attendance records for this date.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Status Message -->
      <div v-if="statusMessage" 
           :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
           class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50">
        {{ statusMessage }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        selectedDate: new Date().toISOString().split('T')[0],
        attendanceRecords: [],
        statusMessage: ''
      };
    },
    computed: {
      filteredAttendance() {
        return this.attendanceRecords.filter(record => record.date === this.selectedDate);
      }
    },
    created() {
      this.fetchAttendance();
    },
    methods: {
      async fetchAttendance() {
        try {
          const response = await axios.get(`http://localhost:7777/api/attendance?date=${this.selectedDate}`);
          this.attendanceRecords = response.data || [];
        } catch (error) {
          console.error('Error fetching attendance:', error);
          this.showErrorMessage('Failed to load attendance records.');
        }
      },
      showSuccessMessage(message) {
        this.statusMessage = message;
        setTimeout(() => this.statusMessage = '', 3000);
      },
      showErrorMessage(message) {
        this.statusMessage = message;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    }
  };
  </script>
  
  <style scoped>
  .transition-colors {
    transition: all 0.2s ease-in-out;
  }
  </style>