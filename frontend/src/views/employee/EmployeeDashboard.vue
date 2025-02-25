<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="p-4">
      <!-- Employee Info Header -->
      <div class="mb-6 bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center space-x-4">
          <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span class="text-blue-600 font-semibold text-lg">{{ employeeInitials }}</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800">{{ employeeData.name }}</h1>
            <p class="text-sm text-gray-500">ID: {{ employeeData.employeeId }} | {{ employeeData.position }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Dashboard Content -->
        <div class="lg:col-span-3 space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-500">
                Current Pay Period: {{ currentPayPeriod }}
              </div>
              <div class="flex space-x-3">
                <button 
                  @click="timeIn" 
                  class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :disabled="isTimedIn || isLoading"
                >
                  {{ isLoading && !isTimedIn ? 'Processing...' : 'Time In' }}
                </button>
                <button 
                  @click="timeOut" 
                  class="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :disabled="!isTimedIn || isLoading"
                >
                  {{ isLoading && isTimedIn ? 'Processing...' : 'Time Out' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Attendance Table -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-800">My Attendance Records</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="record in attendanceRecords" :key="record.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.date }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.timeIn || '--' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.timeOut || '--' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span :class="getStatusClass(record.status)">
                        {{ record.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Salary Section -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-800">Salary Details</h2>
            <div class="pt-4 border-t-2 border-gray-200">
              <div class="flex justify-between items-center">
                <span class="text-base font-semibold text-gray-800">Net Salary</span>
                <span class="text-lg font-bold text-blue-600">₱{{ netSalary.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EmployeeDashboard',
  data() {
    return {
      employeeData: {
        name: '',
        employeeId: '',
        position: '',
        earnings: [],
        deductions: [],
        attendance: []
      },
      attendanceRecords: [],
      totalAbsences: 0,
      totalLate: 0,
      totalOnTime: 0,
      isTimedIn: false,
      isLoading: false
    };
  },
  computed: {
    employeeInitials() {
      return this.employeeData.name
        ? this.employeeData.name.split(' ').map(word => word[0]).join('').toUpperCase()
        : '';
    },
    currentPayPeriod() {
      const now = new Date();
      return `${now.toLocaleString('default', { month: 'long' })} 1-15, ${now.getFullYear()}`;
    },
    totalEarnings() {
      return this.employeeData.earnings?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    totalDeductions() {
      return this.employeeData.deductions?.reduce((sum, item) => sum + item.amount, 0) || 0;
    },
    netSalary() {
      return this.totalEarnings - this.totalDeductions;
    }
  },
  methods: {
    async fetchEmployeeData() {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('No user ID found in localStorage');
        }
        
        const response = await axios.get(`http://localhost:7777/api/employees/${userId}`);
        this.employeeData = response.data || {};
        this.attendanceRecords = response.data.attendance || [];
        
        // Check today's record to determine if employee is timed in
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = this.attendanceRecords.find(record => record.date === today);
        this.isTimedIn = todayRecord && todayRecord.timeIn && !todayRecord.timeOut;

        this.totalAbsences = response.data.totalAbsences || 0;
        this.totalLate = response.data.totalLate || 0;
        this.totalOnTime = response.data.totalOnTime || 0;
      } catch (error) {
        console.error('Error fetching employee data:', error);
        alert('Failed to load employee data. Please try again.');
      }
    },
    async timeIn() {
      this.isLoading = true;
      try {
        const userId = this.employeeData.employeeId;
        const response = await axios.post(`http://localhost:7777/api/employees/time-in`, { 
          userId,
          time: new Date().toISOString()
        });
        
        if (response.status === 200) {
          await this.fetchEmployeeData();
          this.isTimedIn = true;
          alert('Successfully timed in!');
        }
      } catch (error) {
        console.error('Error during Time In:', error);
        alert('Failed to record Time In. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    async timeOut() {
      this.isLoading = true;
      try {
        const userId = this.employeeData.employeeId;
        const response = await axios.post(`http://localhost:7777/api/employees/time-out`, { 
          userId,
          time: new Date().toISOString()
        });
        
        if (response.status === 200) {
          await this.fetchEmployeeData();
          this.isTimedIn = false;
          alert('Successfully timed out!');
        }
      } catch (error) {
        console.error('Error during Time Out:', error);
        alert('Failed to record Time Out. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'on time':
          return 'text-green-600 font-medium';
        case 'late':
          return 'text-yellow-600 font-medium';
        case 'absent':
          return 'text-red-600 font-medium';
        default:
          return 'text-gray-600';
      }
    }
  },
  async created() {
    await this.fetchEmployeeData();
  }
};
</script>

<style scoped>
/* Add some additional styling for better UX */
button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}
</style>