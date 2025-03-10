<template>
  <div class="min-h-screen p-2 bg-gray-100">
    <div class="max-w-7xl mx-auto space-y-4">
      <!-- Header Section -->
      <header class="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 class="text-lg font-bold text-gray-800 flex items-center gap-1">
          <span class="material-icons text-indigo-600 text-xl">schedule</span>
          Employee Attendance
        </h1>
        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <!-- Date Range Picker -->
          <div class="flex gap-2 items-center">
            <div class="relative">
              <span class="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">event</span>
              <input
                type="date"
                v-model="dateRange.start"
                @change="fetchAttendance"
                class="pl-8 pr-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all w-32"
              />
            </div>
            <span class="text-gray-600 text-sm">to</span>
            <div class="relative">
              <span class="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">event</span>
              <input
                type="date"
                v-model="dateRange.end"
                @change="fetchAttendance"
                class="pl-8 pr-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all w-32"
              />
            </div>
          </div>
          <!-- Search Bar -->
          <div class="relative w-full sm:w-48">
            <span class="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search employees..."
              class="w-full pl-8 pr-8 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
          <!-- Export Button -->
          <button @click="generateReport" 
            class="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1 text-sm">
            <span class="material-icons text-sm">download</span>
            Export
          </button>
        </div>
      </header>

      <!-- Attendance Table -->
      <div class="bg-white rounded-lg shadow-md overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-indigo-50">
            <tr>
              <th v-for="header in headers" :key="header.key" 
                class="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                @click="sortTable(header.key)">
                <div class="flex items-center gap-1">
                  <span class="material-icons text-indigo-600 text-sm">{{ header.icon }}</span>
                  <span class="text-xs">{{ header.label }}</span>
                  <span v-if="sortKey === header.key" class="material-icons text-xs">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="isLoading" class="animate-pulse">
              <td colspan="6" class="px-4 py-3">
                <div class="h-3 bg-gray-200 rounded w-full"></div>
              </td>
            </tr>
            <tr v-for="employee in paginatedAttendance" :key="employee.id" 
              class="hover:bg-indigo-50 transition-colors cursor-pointer"
              @click="showDetails(employee)">
              <td class="px-4 py-3 text-xs text-gray-700">{{ employee.id }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <img :src="`https://ui-avatars.com/api/?name=${employee.name}&background=4f46e5&color=fff`" 
                    class="h-6 w-6 rounded-full" />
                  <span class="text-xs text-gray-800">{{ employee.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-700">{{ employee.position }}</td>
              <td class="px-4 py-3 text-xs" :class="getStatusClass(employee.timeInAM ? employee.status : 'Absent')">
                {{ employee.timeInAM ? formatTime(employee.timeInAM) : '--' }}
              </td>
              <td class="px-4 py-3 text-xs" :class="getStatusClass(employee.timeInPM ? employee.status : 'Absent')">
                {{ employee.timeInPM ? formatTime(employee.timeInPM) : '--' }}
              </td>
              <td class="px-4 py-3 text-xs text-gray-700">{{ formatDate(employee.date) }}</td>
            </tr>
            <tr v-if="!isLoading && paginatedAttendance.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500 text-xs">
                No records found
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination -->
        <div v-if="filteredAttendance.length > itemsPerPage" 
          class="p-3 flex justify-between items-center bg-gray-50">
          <span class="text-xs text-gray-600">
            Showing {{ paginationInfo.start }} to {{ paginationInfo.end }} of {{ filteredAttendance.length }}
          </span>
          <div class="flex gap-2">
            <button @click="prevPage" :disabled="currentPage === 1" 
              class="px-2 py-1 bg-indigo-600 text-white rounded-md disabled:bg-gray-400 hover:bg-indigo-700 text-xs">
              Previous
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages" 
              class="px-2 py-1 bg-indigo-600 text-white rounded-md disabled:bg-gray-400 hover:bg-indigo-700 text-xs">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <transition name="modal">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl w-full max-w-sm p-4">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-base font-semibold text-gray-800">Attendance Details</h2>
              <button @click="showModal = false" class="text-gray-600 hover:text-gray-800">
                <span class="material-icons text-sm">close</span>
              </button>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <img :src="`https://ui-avatars.com/api/?name=${selectedEmployee?.name}&background=4f46e5&color=fff`" 
                  class="h-8 w-8 rounded-full" />
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ selectedEmployee?.name }}</p>
                  <p class="text-xs text-gray-600">{{ selectedEmployee?.position }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 text-xs">
                <p><strong>ID:</strong> {{ selectedEmployee?.id }}</p>
                <p><strong>Date:</strong> {{ formatDate(selectedEmployee?.date) }}</p>
                <div>
                  <label for="timeInAM" class="block text-xs font-medium">Time In AM:</label>
                  <input
                    id="timeInAM"
                    v-model="selectedEmployee.timeInAM"
                    type="time"
                    class="mt-1 p-1 w-full text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    @change="updateAttendance('timeInAM')"
                  />
                </div>
                <div>
                  <label for="timeInPM" class="block text-xs font-medium">Time Out PM:</label>
                  <input
                    id="timeInPM"
                    v-model="selectedEmployee.timeInPM"
                    type="time"
                    class="mt-1 p-1 w-full text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    @change="updateAttendance('timeInPM')"
                  />
                </div>
                <div>
                  <label for="status" class="block text-xs font-medium">Status:</label>
                  <select
                    id="status"
                    v-model="selectedEmployee.status"
                    class="mt-1 p-1 w-full text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    @change="updateAttendance('status')"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="markTime('am')" 
                  class="flex-1 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 text-xs">
                  Time In AM
                </button>
                <button @click="markTime('pm')" 
                  class="flex-1 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 text-xs">
                  Time Out PM
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

interface EmployeeAttendance {
  id: string;
  name: string;
  position: string;
  timeInAM: string | null;
  timeInPM: string | null;
  date: string;
  status: string;
}

export default defineComponent({
  data() {
    return {
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      attendanceRecords: [] as EmployeeAttendance[],
      allEmployees: [] as any[],
      searchQuery: '',
      sortKey: 'id',
      sortDirection: 'asc' as 'asc' | 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      selectedEmployee: null as EmployeeAttendance | null,
      isLoading: false,
      headers: [
        { key: 'id', label: 'ID', icon: 'badge' },
        { key: 'name', label: 'Name', icon: 'person' },
        { key: 'position', label: 'Position', icon: 'work' },
        { key: 'timeInAM', label: 'Time In', icon: 'wb_sunny' },
        { key: 'timeInPM', label: 'Time Out', icon: 'nights_stay' },
        { key: 'date', label: 'Date', icon: 'calendar_today' }
      ],
      isClient: false
    };
  },
  computed: {
    filteredAttendance(): EmployeeAttendance[] {
      if (!this.allEmployees || !Array.isArray(this.allEmployees)) return [];
      const employeeAttendanceMap = this.attendanceRecords.reduce((map, record) => {
        map[record.id] = record;
        return map;
      }, {} as { [key: string]: EmployeeAttendance });
      return this.allEmployees.map(employee => {
        const attendanceRecord = employeeAttendanceMap[employee.id] || {
          ...employee,
          date: this.dateRange.start,
          timeInAM: null,
          timeInPM: null,
          status: 'Absent'
        };
        return attendanceRecord;
      }).filter(record => {
        if (!this.isClient) return true;
        const moment = require('moment');
        const recordDate = moment(record.date);
        return recordDate.isBetween(this.dateRange.start, this.dateRange.end, undefined, '[]');
      }).filter(record => 
        !this.searchQuery || 
        record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.id.toLowerCase().includes(this.searchQuery.toLowerCase())
      ).sort((a, b) => {
        const valueA = a[this.sortKey] || '';
        const valueB = b[this.sortKey] || '';
        return this.sortDirection === 'asc' 
          ? valueA < valueB ? -1 : 1 
          : valueA > valueB ? -1 : 1;
      });
    },
    paginatedAttendance(): EmployeeAttendance[] {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredAttendance.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredAttendance.length / this.itemsPerPage) || 1;
    },
    paginationInfo() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(start + this.itemsPerPage - 1, this.filteredAttendance.length);
      return { start, end };
    }
  },
  mounted() {
    this.isClient = true;
    this.fetchAttendance();
    this.fetchAllEmployees();
  },
  methods: {
    async fetchAttendance() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://localhost:7777/api/attendance', {
          params: {
            startDate: this.dateRange.start,
            endDate: this.dateRange.end
          },
          headers: { 'user-role': 'admin' }
        });
        this.attendanceRecords = (response.data || []).map((record: any) => ({
          ...record,
          date: this.isClient ? require('moment')(record.date).format('YYYY-MM-DD') : record.date,
          status: this.calculateStatus(record.timeInAM, record.timeInPM)
        }));
      } catch (error) {
        console.error('Error fetching attendance:', error);
        this.showErrorMessage('Failed to load attendance');
      } finally {
        this.isLoading = false;
      }
    },
    async fetchAllEmployees() {
      try {
        const response = await axios.get('http://localhost:7777/api/employees', {
          headers: { 'user-role': 'admin' }
        });
        this.allEmployees = (response.data || []).map((emp: any) => ({
          ...emp,
          name: `${emp.firstName} ${emp.lastName}`
        }));
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showErrorMessage('Failed to load employees');
      }
    },
    calculateStatus(timeInAM: string | null, timeInPM: string | null): string {
      if (!this.isClient) return 'Absent';
      const moment = require('moment');
      if (!timeInAM && !timeInPM) return 'Absent';
      if (timeInAM) {
        const timeMomentAM = moment(timeInAM, 'HH:mm');
        const cutoffAM = moment('09:00', 'HH:mm');
        if (timeMomentAM.isAfter(cutoffAM)) return 'Late';
      }
      if (timeInPM && !timeInAM) {
        const timeMomentPM = moment(timeInPM, 'HH:mm');
        const cutoffPM = moment('14:00', 'HH:mm');
        if (timeMomentPM.isAfter(cutoffPM)) return 'Late';
      }
      return 'Present';
    },
    sortTable(key: string) {
      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDirection = 'asc';
      }
    },
    getStatusClass(status: string) {
      return {
        'Present': 'text-green-600 bg-green-100 px-1 py-0.5 rounded-full text-xs',
        'Absent': 'text-red-600 bg-red-100 px-1 py-0.5 rounded-full text-xs',
        'Late': 'text-yellow-600 bg-yellow-100 px-1 py-0.5 rounded-full text-xs'
      }[status] || '';
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    showDetails(employee: EmployeeAttendance) {
      this.selectedEmployee = { ...employee };
      this.showModal = true;
    },
    async markTime(period: 'am' | 'pm') {
      try {
        const timeField = period === 'am' ? 'timeInAM' : 'timeInPM';
        const timeValue = this.isClient ? require('moment')().format('HH:mm') : null;
        if (timeValue) {
          this.selectedEmployee[timeField] = timeValue;
          await this.updateAttendance(timeField);
        }
      } catch (error) {
        console.error('Error marking time:', error);
        this.showErrorMessage('Failed to mark time');
      }
    },
    async updateAttendance(field: keyof EmployeeAttendance) {
      try {
        const payload: Partial<EmployeeAttendance> = {
          date: this.selectedEmployee.date,
          [field]: this.selectedEmployee[field]
        };
        if (field === 'status') {
          payload.status = this.selectedEmployee.status;
        }
        const response = await axios.put(`http://localhost:7777/api/attendance/${this.selectedEmployee.id}`, payload, {
          headers: { 'user-role': 'admin' }
        });
        if (response.status === 200) {
          this.attendanceRecords = this.attendanceRecords.map(record =>
            record.id === this.selectedEmployee.id && record.date === this.selectedEmployee.date
              ? { ...record, ...payload }
              : record
          );
          this.showSuccessMessage('Attendance updated successfully');
        }
      } catch (error) {
        console.error('Error updating attendance:', error);
        this.showErrorMessage('Failed to update attendance');
      }
    },
    formatTime(time: string | null) {
      if (!this.isClient) return time || '--';
      const moment = require('moment');
      return time ? moment(time, 'HH:mm').format('h:mm A') : '--';
    },
    formatDate(date: string) {
      if (!this.isClient) return date;
      const moment = require('moment');
      return moment(date).format('MM/DD/YYYY');
    },
    async generateReport() {
      if (!this.isClient) return;
      try {
        const XLSX = await import('xlsx');
        const employeeAttendanceMap = this.attendanceRecords.reduce((map, record) => {
          map[record.id] = record;
          return map;
        }, {} as { [key: string]: EmployeeAttendance });

        const reportData = [
          ['Date', 'Employee ID', 'Name', 'Position', 'Time In', 'Time Out', 'Status'],
          ...this.allEmployees.map(employee => {
            const attendanceRecord = employeeAttendanceMap[employee.id] || {
              ...employee,
              date: this.dateRange.start,
              timeInAM: null,
              timeInPM: null,
              status: 'Absent'
            };
            return [
              this.formatDate(attendanceRecord.date),
              attendanceRecord.id,
              attendanceRecord.name,
              attendanceRecord.position,
              attendanceRecord.timeInAM ? this.formatTime(attendanceRecord.timeInAM) : '--',
              attendanceRecord.timeInPM ? this.formatTime(attendanceRecord.timeInPM) : '--',
              attendanceRecord.status || 'Absent'
            ];
          })
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(reportData);
        
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) continue;
            if (R === 0) {
              ws[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F46E5" } }
              };
            }
          }
        }
        
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        XLSX.writeFile(wb, `Attendance_Report_${this.dateRange.start}_to_${this.dateRange.end}.xlsx`);
      } catch (error) {
        console.error('Error generating report:', error);
        this.showErrorMessage('Failed to generate report');
      }
    },
    showSuccessMessage(message: string) {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 p-3 bg-green-500 text-white rounded-lg shadow-lg text-sm';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    },
    showErrorMessage(message: string) {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 p-3 bg-red-500 text-white rounded-lg shadow-lg text-sm';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  }
});
</script>

<style scoped>
/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Hover effects for buttons */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .min-h-screen {
    padding: 1rem;
  }

  header {
    padding: 0.75rem;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    font-size: 1rem;
  }

  .material-icons {
    font-size: 1rem !important;
  }

  .flex-col.sm\:flex-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  input[type="date"] {
    width: 100%;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem 0.25rem 1.75rem;
  }

  .relative.w-full.sm\:w-48 {
    width: 100%;
  }

  input[type="text"] {
    font-size: 0.75rem;
    padding: 0.25rem 1.75rem 0.25rem 1.75rem;
  }

  input[type="time"] {
    font-size: 0.75rem;
    padding: 0.25rem;
  }

  select {
    font-size: 0.75rem;
    padding: 0.25rem;
  }

  button {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  table {
    font-size: 0.75rem;
  }

  th, td {
    padding: 0.5rem;
  }

  img.h-6.w-6 {
    height: 1rem;
    width: 1rem;
  }

  .bg-white.rounded-lg {
    overflow-x: auto;
  }

  .p-3 {
    padding: 0.5rem;
  }

  .text-xs {
    font-size: 0.65rem;
  }

  .max-w-sm.p-4 {
    padding: 0.75rem;
    max-width: 90%;
  }

  .text-base {
    font-size: 0.875rem;
  }

  .h-8.w-8 {
    height: 1.5rem;
    width: 1.5rem;
  }

  .grid-cols-2.gap-3 {
    gap: 0.5rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .min-h-screen {
    padding: 1.5rem;
  }

  header {
    padding: 1rem;
  }

  h1 {
    font-size: 1.25rem;
  }

  input[type="date"] {
    width: 8rem;
    font-size: 0.875rem;
  }

  input[type="text"] {
    font-size: 0.875rem;
  }

  input[type="time"] {
    font-size: 0.875rem;
  }

  select {
    font-size: 0.875rem;
  }

  button {
    font-size: 0.875rem;
  }

  table {
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.75rem;
  }

  .text-xs {
    font-size: 0.75rem;
  }
}
</style>