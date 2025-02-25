<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Admin
            </span>
           
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total Employees Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-indigo-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ totalEmployees }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <router-link to="/manage-employees" class="font-medium text-indigo-600 hover:text-indigo-900">View all</router-link>
            </div>
          </div>
        </div>

        <!-- Present Today Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-green-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Present Today</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ totalPresentToday }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <button @click="refreshAttendance" class="font-medium text-green-600 hover:text-green-900">Refresh</button>
            </div>
          </div>
        </div>

        <!-- Late Today Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-yellow-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Late Today</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ totalLateToday }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <button @click="refreshAttendance" class="font-medium text-yellow-600 hover:text-yellow-900">Refresh</button>
            </div>
          </div>
        </div>

        <!-- Eligible for Salary Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-blue-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Eligible for Salary</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ totalEligibleForSalaryToday }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <button @click="processPayroll" class="font-medium text-blue-600 hover:text-blue-900" :disabled="isProcessingPayroll">
                {{ isProcessingPayroll ? 'Processing...' : 'Process Payroll' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Table Section -->
      <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 class="text-lg leading-6 font-medium text-gray-900">Attendance Today</h2>
          <div class="flex space-x-3">
            <button @click="exportAttendance" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
              Export to CSV
            </button>
            <!-- Uncomment if you want to link to salary slips -->
            <!-- <router-link to="/salary-slips" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200">
              View Salary Slips
            </router-link> -->
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sign In Time</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sign Out Time</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in attendanceRecords" :key="record.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.employeeId }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img class="h-10 w-10 rounded-full" :src="`https://ui-avatars.com/api/?name=${record.firstName}+${record.lastName}`" alt="" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ record.firstName }} {{ record.lastName }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.position }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.signInTime || '--' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.signOutTime || '--' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getStatusClass(record.status)">
                  {{ record.status || 'Absent' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button @click="viewEmployeeDetails(record)" class="text-blue-600 hover:text-blue-900 mr-2">View</button>
                  <button @click="deleteAttendance(record.id)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr v-if="attendanceRecords.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">No attendance records for today.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Employee Details Modal -->
      <div v-if="showDetailsModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Employee Details</h2>
          <div class="space-y-4">
            <p><strong>ID:</strong> {{ selectedEmployee.employeeId }}</p>
            <p><strong>Name:</strong> {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</p>
            <p><strong>Position:</strong> {{ selectedEmployee.position }}</p>
            <p><strong>Email:</strong> {{ selectedEmployee.email }}</p>
            <p><strong>Sign In Time:</strong> {{ selectedEmployee.signInTime || 'N/A' }}</p>
            <p><strong>Sign Out Time:</strong> {{ selectedEmployee.signOutTime || 'N/A' }}</p>
            <p><strong>Status:</strong> <span :class="getStatusClass(selectedEmployee.status)">{{ selectedEmployee.status || 'Absent' }}</span></p>
          </div>
          <div class="mt-6 flex justify-end">
            <button @click="showDetailsModal = false" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200">Close</button>
          </div>
        </div>
      </div>

      <!-- Status Message -->
      <div v-if="statusMessage" 
           :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
           class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      totalEmployees: 0,
      totalPresentToday: 0,
      totalLateToday: 0,
      totalEligibleForSalaryToday: 0,
      attendanceRecords: [],
      isProcessingPayroll: false,
      showDetailsModal: false,
      selectedEmployee: {},
      statusMessage: ''
    };
  },
  created() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      await Promise.all([
        this.fetchTotalEmployees(),
        this.fetchAttendanceRecords(),
        this.fetchTotalLateToday(),
        this.fetchEligibleForSalary()
      ]);
    },
    async fetchTotalEmployees() {
      try {
        const response = await axios.get('http://localhost:7777/api/employees/count');
        this.totalEmployees = response.data.total || 0;
      } catch (error) {
        console.error('Failed to fetch total employees:', error);
        this.totalEmployees = 0;
        this.showErrorMessage('Failed to fetch total employees.');
      }
    },
    async fetchAttendanceRecords() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:7777/api/attendance?date=${today}`);
        this.attendanceRecords = response.data || [];
        this.totalPresentToday = this.attendanceRecords.filter(r => r.signInTime).length;
      } catch (error) {
        console.error('Failed to fetch attendance records:', error);
        this.attendanceRecords = [];
        this.totalPresentToday = 0;
        this.showErrorMessage('Failed to fetch attendance records.');
      }
    },
    async fetchTotalLateToday() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:7777/api/attendance/late?date=${today}`);
        this.totalLateToday = response.data.total || 0;
      } catch (error) {
        console.error('Failed to fetch total late today:', error);
        this.totalLateToday = 0;
        this.showErrorMessage('Failed to fetch late employees count.');
      }
    },
    async fetchEligibleForSalary() {
      try {
        const response = await axios.get('http://localhost:7777/api/employees/eligible-for-salary');
        this.totalEligibleForSalaryToday = response.data.total || 0;
      } catch (error) {
        console.error('Failed to fetch eligible for salary:', error);
        this.totalEligibleForSalaryToday = 0;
        this.showErrorMessage('Failed to fetch salary eligibility data.');
      }
    },
    async refreshAttendance() {
      try {
        await this.fetchAttendanceRecords();
        await this.fetchTotalLateToday();
        this.showSuccessMessage('Attendance data refreshed successfully!');
      } catch (error) {
        this.showErrorMessage('Failed to refresh attendance data.');
      }
    },
    async processPayroll() {
      this.isProcessingPayroll = true;
      try {
        const response = await axios.post('http://localhost:7777/api/payroll/process');
        if (response.data.success) {
          this.showSuccessMessage('Payroll processed successfully!');
          await this.fetchEligibleForSalary();
        } else {
          this.showErrorMessage('Failed to process payroll.');
        }
      } catch (error) {
        console.error('Failed to process payroll:', error);
        this.showErrorMessage('Error processing payroll. Please try again.');
      } finally {
        this.isProcessingPayroll = false;
      }
    },
    async exportAttendance() {
      try {
        const csvContent = [
          ['Employee ID', 'Name', 'Position', 'Sign In Time', 'Sign Out Time', 'Status'],
          ...this.attendanceRecords.map(record => [
            record.employeeId,
            `${record.firstName} ${record.lastName}`,
            record.position,
            record.signInTime || 'N/A',
            record.signOutTime || 'N/A',
            record.status || 'Absent'
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showSuccessMessage('Attendance exported successfully!');
      } catch (error) {
        console.error('Failed to export attendance:', error);
        this.showErrorMessage('Failed to export attendance data.');
      }
    },
    viewEmployeeDetails(record) {
      this.selectedEmployee = { ...record };
      this.showDetailsModal = true;
    },
    async deleteAttendance(id) {
      if (confirm('Are you sure you want to delete this attendance record?')) {
        try {
          const response = await axios.delete(`http://localhost:7777/api/attendance/${id}`);
          if (response.status === 204) {
            this.attendanceRecords = this.attendanceRecords.filter(r => r.id !== id);
            this.totalPresentToday = this.attendanceRecords.filter(r => r.signInTime).length;
            this.showSuccessMessage('Attendance record deleted successfully!');
          }
        } catch (error) {
          console.error('Failed to delete attendance:', error);
          this.showErrorMessage('Failed to delete attendance record.');
        }
      }
    },
    logout() {
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      this.$router.push('/login');
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
button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.transition {
  transition: all 0.2s ease-in-out;
}
</style>