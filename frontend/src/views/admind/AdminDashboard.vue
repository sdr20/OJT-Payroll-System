<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white shadow-md sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <span class="material-icons text-indigo-600">dashboard</span>
            <h1 class="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 bg-indigo-100 px-4 py-2 rounded-full">
              <span class="material-icons text-indigo-600">admin_panel_settings</span>
              <span class="text-indigo-800 font-medium">Admin</span>
            </div>
            <button @click="logout" class="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
              <span class="material-icons">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Stats Overview with Hover Effects -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total Employees -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="p-6">
            <div class="flex items-center">
              <div class="rounded-full bg-indigo-100 p-3">
                <span class="material-icons text-indigo-600">groups</span>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-600">Total Employees</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ totalEmployees }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Present Today -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="p-6">
            <div class="flex items-center">
              <div class="rounded-full bg-green-100 p-3">
                <span class="material-icons text-green-600">how_to_reg</span>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-600">Present Today</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ totalPresentToday }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Lates -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="p-6">
            <div class="flex items-center">
              <div class="rounded-full bg-yellow-100 p-3">
                <span class="material-icons text-yellow-600">schedule</span>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-600">Late Today</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ totalLateToday }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Eligible for Salary -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="p-6">
            <div class="flex items-center">
              <div class="rounded-full bg-blue-100 p-3">
                <span class="material-icons text-blue-600">attach_money</span>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-600">Eligible for Salary</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ totalEligibleForSalaryToday }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex space-x-4">
        <button @click="refreshAttendance" class="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors" :disabled="isLoading">
          <span v-if="isLoading" class="animate-spin material-icons">refresh</span>
          <span v-else class="material-icons">refresh</span>
          <span>Refresh Data</span>
        </button>
        <button @click="exportAttendance" class="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors" :disabled="isLoading">
          <span class="material-icons">download</span>
          <span>Export CSV</span>
        </button>
        <button @click="processPayroll" class="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" :disabled="isProcessingPayroll">
          <span class="material-icons">payment</span>
          <span>{{ isProcessingPayroll ? 'Processing...' : 'Process Payroll' }}</span>
        </button>
      </div>

      <!-- Enhanced Attendance Table -->
      <div class="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900 flex items-center">
            <span class="material-icons mr-2">event_note</span>
            Today's Attendance
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <span class="material-icons text-gray-400">badge</span>
                    <span>Employee</span>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <span class="material-icons text-gray-400">work</span>
                    <span>Position</span>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <span class="material-icons text-gray-400">login</span>
                    <span>Sign In</span>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <span class="material-icons text-gray-400">logout</span>
                    <span>Sign Out</span>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <span class="material-icons text-gray-400">info</span>
                    <span>Status</span>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="flex items-center space-x-2">
                    <span class="material-icons text-gray-400">settings</span>
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <!-- Skeleton Loaders -->
              <template v-if="isLoading">
                <tr v-for="n in 5" :key="n" class="animate-pulse">
                  <td v-for="m in 6" :key="m" class="px-6 py-4"><div class="h-4 bg-gray-200 rounded"></div></td>
                </tr>
              </template>
              <!-- Attendance Records -->
              <template v-else>
                <tr v-for="record in attendanceRecords" :key="record.id" class="hover:bg-gray-50 transition-colors cursor-pointer" @click="viewEmployeeDetails(record)">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-4">
                      <img class="h-10 w-10 rounded-full object-cover" :src="`https://ui-avatars.com/api/?name=${record.firstName}+${record.lastName}&background=random`" :alt="record.firstName" />
                      <div>
                        <div class="font-medium text-gray-900">{{ record.firstName }} {{ record.lastName }}</div>
                        <div class="text-sm text-gray-500">{{ record.employeeId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ record.position }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ record.signInTime || '--' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ record.signOutTime || '--' }}</td>
                  <td class="px-6 py-4 text-sm" :class="getStatusClass(record.status)">{{ record.status || 'Absent' }}</td>
                  <td class="px-6 py-4 text-sm">
                    <div class="flex space-x-2">
                      <button @click.stop="viewEmployeeDetails(record)" class="text-blue-600 hover:text-blue-800 transition" title="View Details" aria-label="View employee details">
                        <span class="material-icons">visibility</span>
                      </button>
                      <button @click.stop="deleteAttendance(record.id)" class="text-red-600 hover:text-red-800 transition" title="Delete Record" aria-label="Delete attendance record">
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="attendanceRecords.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No attendance records for today.</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Enhanced Modal -->
      <transition name="fade">
        <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full transform transition-all scale-95" :class="{ 'scale-100': showDetailsModal }">
            <div class="p-6 border-b flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900 flex items-center">
                <span class="material-icons mr-2">person</span> Employee Details
              </h2>
              <button @click="showDetailsModal = false" class="text-gray-600 hover:text-gray-800">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <p><strong>ID:</strong> {{ selectedEmployee.employeeId }}</p>
              <p><strong>Name:</strong> {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</p>
              <p><strong>Position:</strong> {{ selectedEmployee.position }}</p>
              <p><strong>Email:</strong> {{ selectedEmployee.email }}</p>
              <p><strong>Sign In Time:</strong> {{ selectedEmployee.signInTime || 'N/A' }}</p>
              <p><strong>Sign Out Time:</strong> {{ selectedEmployee.signOutTime || 'N/A' }}</p>
              <p><strong>Status:</strong> <span :class="getStatusClass(selectedEmployee.status)">{{ selectedEmployee.status || 'Absent' }}</span></p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Enhanced Status Messages -->
      <transition name="slide-fade">
        <div v-if="statusMessage" class="fixed bottom-4 right-4 flex items-center space-x-2 p-4 rounded-lg shadow-lg z-50" :class="statusMessage.includes('successfully') ? 'bg-green-500' : 'bg-red-500'">
          <span class="material-icons text-white">{{ statusMessage.includes('successfully') ? 'check_circle' : 'error' }}</span>
          <span class="text-white">{{ statusMessage }}</span>
        </div>
      </transition>
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
      statusMessage: '',
      isLoading: false,
    };
  },
  created() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      this.isLoading = true;
      await Promise.all([
        this.fetchTotalEmployees(),
        this.fetchAttendanceRecords(),
        this.fetchTotalLateToday(),
        this.fetchEligibleForSalary()
      ]);
      this.isLoading = false;
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
      this.isLoading = true;
      try {
        await this.fetchAttendanceRecords();
        await this.fetchTotalLateToday();
        this.showSuccessMessage('Attendance data refreshed successfully!');
      } catch (error) {
        this.showErrorMessage('Failed to refresh attendance data.');
      } finally {
        this.isLoading = false;
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
        case 'on time': return 'text-green-600 font-medium';
        case 'late': return 'text-yellow-600 font-medium';
        case 'absent': return 'text-red-600 font-medium';
        default: return 'text-gray-600';
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; }
}
</style>