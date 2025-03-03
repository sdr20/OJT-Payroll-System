<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-1">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header Section - Polished with Modern Design -->
      <header class="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-l-4 border-blue-500">
        <div class="text-center md:text-left w-full md:w-auto">
          <h1 class="text-x md:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span class="material-icons text-blue-600 text-lg md:text-xl">schedule</span>
            Employee Attendance
          </h1>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <!-- Date Picker - Enhanced with Icon and Animation -->
          <div class="relative w-full sm:w-56">
            <span class="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs md:text-sm">calendar_today</span>
            <input
              type="date"
              v-model="selectedDate"
              id="attendanceDate"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-300 text-xs md:text-sm bg-white shadow-sm hover:shadow-md"
              @change="fetchAttendance"
              aria-label="Select attendance date"
            />
          </div>
          <!-- Search Bar - Enhanced with Clear Button and Animation -->
          <div class="relative w-full sm:w-72">
            <span class="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs md:text-sm">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or ID..."
              class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all duration-300 text-xs md:text-sm bg-white shadow-sm hover:shadow-md"
              aria-label="Search employees by name or ID"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 text-xs md:text-sm"
            >
              <span class="material-icons text-xs md:text-sm">close</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Attendance Table - Enhanced with Card Design and Animations -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100 sticky top-0 z-20">
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.key"
                  class="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  :class="header.align === 'center' ? 'text-center' : 'text-left'"
                  @click="sortTable(header.key)"
                  :aria-sort="sortKey === header.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                >
                  <div class="flex items-center gap-2" :class="header.align === 'center' ? 'justify-center' : 'justify-start'">
                    <span class="material-icons text-gray-500 text-xs md:text-sm">{{ header.icon }}</span>
                    {{ header.label }}
                    <span v-if="sortKey === header.key" class="material-icons text-xs md:text-sm text-gray-500">
                      {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <!-- Loading State - Polished Animation -->
              <template v-if="isLoading">
                <tr v-for="n in 5" :key="n" class="animate-pulse">
                  <td v-for="m in 4" :key="m" class="px-6 py-4">
                    <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                  </td>
                </tr>
              </template>
              <!-- Data Rows - Enhanced with Hover and Click Effects -->
              <transition-group name="table-slide" tag="template">
                <tr
                  v-for="employee in paginatedAttendance"
                  :key="employee.id"
                  class="hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                  @click="showDetails(employee)"
                  @mouseenter="hoverEmployee = employee.id"
                  @mouseleave="hoverEmployee = null"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-700" :class="{ 'bg-blue-100': hoverEmployee === employee.id }">
                    {{ employee.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <img
                        :src="`https://ui-avatars.com/api/?name=${employee.name}&background=random&color=fff`"
                        alt="Employee avatar"
                        class="h-8 w-8 rounded-full object-cover border border-gray-100"
                        loading="lazy"
                      />
                      <span class="text-xs md:text-sm text-gray-700">{{ employee.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-700" :class="{ 'bg-blue-100': hoverEmployee === employee.id }">
                    {{ employee.position }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium" :class="[getStatusClass(employee.status), { 'bg-blue-100': hoverEmployee === employee.id }]">
                    {{ employee.status }}
                  </td>
                </tr>
                <tr v-if="paginatedAttendance.length === 0 && !isLoading">
                  <td colspan="4" class="px-6 py-12 text-center text-xs md:text-sm text-gray-500">
                    <div class="flex flex-col items-center gap-3">
                      <span class="material-icons text-3xl md:text-4xl text-gray-400">event_busy</span>
                      <p class="text-xs md:text-sm font-medium text-gray-700">No attendance records for this date.</p>
                      <p class="text-xs md:text-sm text-gray-500">Try adjusting the date or search criteria.</p>
                    </div>
                  </td>
                </tr>
              </transition-group>
            </tbody>
          </table>
        </div>
        <!-- Pagination - Enhanced Design with Animation -->
        <div v-if="!isLoading && filteredAttendance.length > itemsPerPage" class="p-4 flex justify-between items-center bg-gray-50 border-t transition-all duration-300">
          <div class="text-xs md:text-sm text-gray-600">
            Showing <span class="font-medium text-gray-800">{{ paginationInfo.start }}</span> to 
            <span class="font-medium text-gray-800">{{ paginationInfo.end }}</span> of 
            <span class="font-medium text-gray-800">{{ filteredAttendance.length }}</span> records
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="p-2 rounded-md bg-white border border-gray-200 hover:bg-blue-100 text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:hover:bg-white text-xs md:text-sm"
              aria-label="Previous page"
            >
              <span class="material-icons text-base">chevron_left</span>
            </button>
            <span class="text-xs md:text-sm text-gray-700">{{ currentPage }} / {{ totalPages }}</span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-md bg-white border border-gray-200 hover:bg-blue-100 text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:hover:bg-white text-xs md:text-sm"
              aria-label="Next page"
            >
              <span class="material-icons text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Details Modal - Polished with Modern Design and Animation -->
      <transition name="modal-slide">
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 class="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span class="material-icons text-blue-600 text-lg md:text-xl">person</span> Employee Attendance Details
              </h2>
              <button @click="showModal = false" class="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-all duration-200">
                <span class="material-icons text-base md:text-lg">close</span>
              </button>
            </div>
            <div class="p-6 space-y-5">
              <div class="flex items-center gap-3">
                <img
                  :src="`https://ui-avatars.com/api/?name=${selectedEmployee?.name}&background=random&color=fff`"
                  alt="Employee avatar"
                  class="h-12 w-12 rounded-full object-cover border border-gray-200"
                  loading="lazy"
                />
                <div>
                  <p class="text-sm md:text-base font-medium text-gray-800">{{ selectedEmployee?.name }}</p>
                  <p class="text-xs md:text-sm text-gray-600">{{ selectedEmployee?.position }}</p>
                </div>
              </div>
              <p class="text-gray-700 text-xs md:text-sm"><strong>ID:</strong> {{ selectedEmployee?.id }}</p>
              <p class="text-gray-700 text-xs md:text-sm"><strong>Status:</strong> <span :class="getStatusClass(selectedEmployee?.status)">{{ selectedEmployee?.status }}</span></p>
              <p class="text-gray-700 text-xs md:text-sm"><strong>Date:</strong> {{ formatDate(selectedEmployee?.date) }}</p>
              <button 
                @click="markAttendance(selectedEmployee?.id)" 
                :disabled="!selectedEmployee || selectedEmployee.status === 'Present'"
                class="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-xs md:text-sm hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                :aria-label="`Mark ${selectedEmployee?.name} as present`"
              >
                Mark Present
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Status Message - Enhanced with Animation and Design -->
      <transition name="slide-fade">
        <div
          v-if="statusMessage"
          class="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-sm w-full"
          :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'bg-red-50 text-red-700 border-l-4 border-red-600'"
        >
          <span class="material-icons text-base md:text-lg">
            {{ statusMessage.includes('successfully') ? 'check_circle' : 'error' }}
          </span>
          <p class="text-xs md:text-sm font-medium">{{ statusMessage }}</p>
          <button
            @click="statusMessage = ''"
            class="ml-auto p-1 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
            aria-label="Close notification"
          >
            <span class="material-icons text-base md:text-lg">close</span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment'; // Add this to format dates

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
      hoverEmployee: null,
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
          record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          record.id.toLowerCase().includes(this.searchQuery.toLowerCase())
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
        this.attendanceRecords = response.data.map(record => ({
          ...record,
          date: moment(record.date).format('YYYY-MM-DD')
        })) || [];
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
        case 'present': return 'text-green-600 bg-green-50 px-2 py-1 rounded-full inline-flex items-center gap-1';
        case 'absent': return 'text-red-600 bg-red-50 px-2 py-1 rounded-full inline-flex items-center gap-1';
        case 'late': return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full inline-flex items-center gap-1';
        default: return 'text-gray-600 bg-gray-50 px-2 py-1 rounded-full inline-flex items-center gap-1';
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    showDetails(employee) {
      this.selectedEmployee = { ...employee, date: this.selectedDate };
      this.showModal = true;
    },
    async markAttendance(employeeId) {
      if (!employeeId) return;
      try {
        const response = await axios.put(`http://localhost:7777/api/attendance/${employeeId}`, {
          date: this.selectedDate,
          status: 'Present'
        });
        if (response.status === 200) {
          this.attendanceRecords = this.attendanceRecords.map(record =>
            record.id === employeeId && record.date === this.selectedDate
              ? { ...record, status: 'Present' }
              : record
          );
          this.showSuccessMessage('Attendance marked as present successfully!');
          this.showModal = false;
        }
      } catch (error) {
        console.error('Error marking attendance:', error);
        this.showErrorMessage('Failed to mark attendance. Please try again.');
      }
    },
    formatDate(date) {
      return moment(date).format('MMMM D, YYYY');
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
/* Table row slide animation */
.table-slide-enter-active, .table-slide-leave-active {
  transition: all 0.4s ease-in-out;
}
.table-slide-enter-from, .table-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Modal slide animation */
.modal-slide-enter-active, .modal-slide-leave-active {
  transition: all 0.4s ease-in-out;
}
.modal-slide-enter-from, .modal-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Slide fade animation for status message */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s ease-in-out;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Pulse animation for loading state */
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Hover and focus enhancements */
.hover\:bg-gray-200:hover, .hover\:bg-blue-50:hover {
  background-color: rgba(226, 232, 240, 0.8);
}
button:focus, input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Responsive adjustments */
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    flex-shrink: 0;
    width: 100px;
    font-size: 0.75rem; /* Smaller text for labels on mobile */
  }
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .text-xl, .text-2xl, .text-3xl {
    font-size: 1.125rem; /* Smaller base text for mobile */
  }
  .p-4, .p-6 {
    padding: 1rem;
  }
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
  transition: background-color 0.3s;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Enhanced hover effects for interactivity */
button:hover:not(:disabled), .cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Accessibility improvements */
[aria-label]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
</style>