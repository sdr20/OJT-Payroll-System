<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header Section -->
      <div class="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="text-center md:text-left">
          <h1 class="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span class="material-icons">schedule</span> Employee Attendance
          </h1>
          <p class="text-sm text-gray-600 mt-1">Track daily attendance records</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <!-- Date Picker -->
          <div class="relative w-full sm:w-48">
            <span class="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">calendar_today</span>
            <input
              type="date"
              v-model="selectedDate"
              id="attendanceDate"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
              @change="fetchAttendance"
              aria-label="Select attendance date"
            />
          </div>
          <!-- Search Bar -->
          <div class="relative w-full sm:w-64">
            <span class="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
              aria-label="Search employees by name"
            />
          </div>
        </div>
      </div>

      <!-- Employees Information -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.key"
                  class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  :class="header.align === 'center' ? 'text-center' : 'text-left'"
                  @click="sortTable(header.key)"
                  :aria-sort="sortKey === header.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                >
                  <div class="flex items-center gap-2" :class="header.align === 'center' ? 'justify-center' : 'justify-start'">
                    <span class="material-icons text-gray-400 text-base">{{ header.icon }}</span>
                    {{ header.label }}
                    <span v-if="sortKey === header.key" class="material-icons text-sm">
                      {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <!-- Loading State -->
              <template v-if="isLoading">
                <tr v-for="n in 5" :key="n" class="animate-pulse">
                  <td v-for="m in 4" :key="m" class="px-6 py-4">
                    <div class="h-4 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              </template>
              <!-- Data Rows -->
              <template v-else>
                <tr
                  v-for="employee in paginatedAttendance"
                  :key="employee.id"
                  class="hover:bg-blue-50 transition-colors cursor-pointer"
                  @click="showDetails(employee)"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ employee.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <img
                        :src="`https://ui-avatars.com/api/?name=${employee.name}&background=random`"
                        alt="Employee avatar"
                        class="h-8 w-8 rounded-full object-cover"
                      />
                      <span class="text-sm text-gray-600">{{ employee.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ employee.position }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getStatusClass(employee.status)">
                    {{ employee.status }}
                  </td>
                </tr>
                <tr v-if="paginatedAttendance.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-sm text-gray-500">
                    <div class="flex flex-col items-center gap-2">
                      <span class="material-icons text-3xl text-gray-400">event_busy</span>
                      No attendance records for this date.
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="!isLoading && filteredAttendance.length > itemsPerPage" class="p-4 flex justify-between items-center bg-gray-50 border-t">
          <div class="text-sm text-gray-600">
            Showing {{ paginationInfo.start }} to {{ paginationInfo.end }} of {{ filteredAttendance.length }} records
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Previous page"
            >
              <span class="material-icons">chevron_left</span>
            </button>
            <span class="text-sm text-gray-700">{{ currentPage }} / {{ totalPages }}</span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Next page"
            >
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all scale-95" :class="{ 'scale-100': showModal }">
            <div class="p-6 border-b flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span class="material-icons">person</span> Employee Details
              </h2>
              <button @click="showModal = false" class="text-gray-600 hover:text-gray-800">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <p><strong>ID:</strong> {{ selectedEmployee?.id }}</p>
              <p><strong>Name:</strong> {{ selectedEmployee?.name }}</p>
              <p><strong>Position:</strong> {{ selectedEmployee?.position }}</p>
              <p><strong>Status:</strong> <span :class="getStatusClass(selectedEmployee?.status)">{{ selectedEmployee?.status }}</span></p>
              <p><strong>Date:</strong> {{ selectedEmployee?.date }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Status Message -->
      <transition name="slide-fade">
        <div
          v-if="statusMessage"
          :class="[
            'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2',
            statusMessage.includes('successfully') ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'bg-red-50 text-red-700 border-l-4 border-red-500'
          ]"
        >
          <span class="material-icons">
            {{ statusMessage.includes('successfully') ? 'check_circle' : 'error' }}
          </span>
          {{ statusMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EmployeeAttendance',
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0],
      attendanceRecords: [],
      statusMessage: '',
      isLoading: false,
      searchQuery: '',
      sortKey: 'id',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      selectedEmployee: null,
      headers: [
        { key: 'id', label: 'Employee ID', icon: 'badge', align: 'left' },
        { key: 'name', label: 'Name', icon: 'person', align: 'left' },
        { key: 'position', label: 'Position', icon: 'work', align: 'left' },
        { key: 'status', label: 'Status', icon: 'info', align: 'center' }
      ]
    };
  },
  computed: {
    filteredAttendance() {
      let filtered = [...this.attendanceRecords];
      if (this.selectedDate) {
        filtered = filtered.filter(record => record.date === this.selectedDate);
      }
      if (this.searchQuery) {
        filtered = filtered.filter(record => 
          record.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      // Sorting
      filtered.sort((a, b) => {
        const valueA = a[this.sortKey] || '';
        const valueB = b[this.sortKey] || '';
        if (this.sortDirection === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
      return filtered;
    },
    paginatedAttendance() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAttendance.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredAttendance.length / this.itemsPerPage) || 1;
    },
    paginationInfo() {
      if (this.filteredAttendance.length === 0) return { start: 0, end: 0 };
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(start + this.itemsPerPage - 1, this.filteredAttendance.length);
      return { start, end };
    }
  },
  created() {
    this.fetchAttendance();
  },
  methods: {
    async fetchAttendance() {
      this.isLoading = true;
      this.statusMessage = '';
      try {
        const response = await axios.get(`http://localhost:7777/api/attendance?date=${this.selectedDate}`);
        this.attendanceRecords = response.data || [];
        this.currentPage = 1; // Reset to first page on new fetch
      } catch (error) {
        console.error('Error fetching attendance:', error);
        this.showErrorMessage('Failed to load attendance records.');
      } finally {
        this.isLoading = false;
      }
    },
    sortTable(key) {
      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDirection = 'asc';
      }
    },
    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'present': return 'text-green-600 font-medium';
        case 'absent': return 'text-red-600 font-medium';
        case 'late': return 'text-yellow-600 font-medium';
        default: return 'text-gray-600';
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    showDetails(employee) {
      this.selectedEmployee = employee;
      this.showModal = true;
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
  table {
    display: block;
    overflow-x: auto;
  }
  thead {
    display: none; /* Hide headers on mobile */
  }
  tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
  }
  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  td:last-child {
    border-bottom: none;
  }
  td:before {
    content: attr(data-label);
    font-weight: 600;
    color: #4b5563;
    margin-right: 1rem;
  }
}
</style>