<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <header class="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <span class="material-icons text-indigo-600 text-2xl">schedule</span>
          Employee Attendance
        </h1>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div class="relative">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">event</span>
            <input
              type="date"
              v-model="date"
              @change="fetchEmployeesAndAttendance"
              class="pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all w-40 bg-white"
            />
          </div>
          <div class="relative w-full sm:w-64">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search employees..."
              class="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all bg-white"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>
          <button @click="generateReport" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
            <span class="material-icons text-lg">download</span>
            Export
          </button>
        </div>
      </header>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-indigo-50">
              <tr>
                <th v-for="header in headers" :key="header.key" 
                  class="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider hover:bg-indigo-100 transition-colors cursor-pointer"
                  @click="sortTable(header.key)">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-indigo-600">{{ header.icon }}</span>
                    <span>{{ header.label }}</span>
                    <span v-if="sortKey === header.key" class="material-icons text-sm">
                      {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="isLoading" class="animate-pulse">
                <td colspan="6" class="px-6 py-4">
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                </td>
              </tr>
              <tr v-for="employee in paginatedEmployees" :key="employee.id" 
                class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-700">{{ employee.id }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img :src="`https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=4f46e5&color=fff`" 
                      class="h-8 w-8 rounded-full shadow-sm" />
                    <span class="text-sm font-medium text-gray-800">{{ employee.firstName }} {{ employee.lastName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <input
                    type="time"
                    v-model="employee.timeIn"
                    @change="updateAttendance(employee, 'timeIn')"
                    class="w-24 p-1 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all bg-white"
                  />
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <input
                    type="time"
                    v-model="employee.timeOut"
                    @change="updateAttendance(employee, 'timeOut')"
                    class="w-24 p-1 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all bg-white"
                  />
                </td>
                <td class="px-6 py-4 text-sm" :class="getStatusClass(employee.status)">
                  {{ employee.status }}
                </td>
                <td class="px-6 py-4 text-sm flex items-center gap-2">
                  <select
                    v-model="employee.status"
                    @change="updateAttendance(employee, 'status')"
                    class="w-28 p-1 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all bg-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                  <button @click="showDetails(employee)" 
                    class="p-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
                    title="Edit Details">
                    <span class="material-icons text-lg">edit</span>
                  </button>
                </td>
              </tr>
              <tr v-if="!isLoading && paginatedEmployees.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 text-sm">
                  No employees found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="filteredEmployees.length > itemsPerPage" 
          class="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
          <span class="text-sm text-gray-600">
            Showing {{ paginationInfo.start }} to {{ paginationInfo.end }} of {{ filteredEmployees.length }}
          </span>
          <div class="flex gap-3">
            <button @click="prevPage" :disabled="currentPage === 1" 
              class="px-3 py-1 bg-indigo-600 text-white rounded-md disabled:bg-gray-400 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
              Previous
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages" 
              class="px-3 py-1 bg-indigo-600 text-white rounded-md disabled:bg-gray-400 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <transition name="modal">
        <div v-if="showDetailsModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Attendance Details</h2>
              <button @click="showDetailsModal = false" class="text-gray-600 hover:text-gray-800 transition-colors">
                <span class="material-icons text-xl">close</span>
              </button>
            </div>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <img :src="`https://ui-avatars.com/api/?name=${selectedEmployee?.firstName}+${selectedEmployee?.lastName}&background=4f46e5&color=fff`" 
                  class="h-10 w-10 rounded-full shadow-sm" />
                <div>
                  <p class="text-lg font-medium text-gray-800">{{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}</p>
                  <p class="text-sm text-gray-600">ID: {{ selectedEmployee?.id }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="timeIn" class="block text-sm font-medium text-gray-700">Time In</label>
                  <input
                    id="timeIn"
                    v-model="selectedEmployee.timeIn"
                    type="time"
                    class="mt-1 p-2 w-full text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all bg-white"
                    @change="updateAttendance(selectedEmployee, 'timeIn')"
                  />
                </div>
                <div>
                  <label for="timeOut" class="block text-sm font-medium text-gray-700">Time Out</label>
                  <input
                    id="timeOut"
                    v-model="selectedEmployee.timeOut"
                    type="time"
                    class="mt-1 p-2 w-full text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all bg-white"
                    @change="updateAttendance(selectedEmployee, 'timeOut')"
                  />
                </div>
                <div class="col-span-2">
                  <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    v-model="selectedEmployee.status"
                    class="mt-1 p-2 w-full text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all bg-white"
                    @change="updateAttendance(selectedEmployee, 'status')"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-3">
                <button @click="markTime('in')" 
                  class="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
                  Time In
                </button>
                <button @click="markTime('out')" 
                  class="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
                  Time Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Status Message -->
      <div
        v-if="statusMessage"
        :class="statusMessage.includes('successfully') ? 'bg-green-600' : 'bg-red-600'"
        class="fixed bottom-6 right-6 p-4 text-white rounded-lg shadow-xl animate-fade-in text-sm flex items-center gap-2"
      >
        <span class="material-icons text-lg">
          {{ statusMessage.includes('successfully') ? 'check_circle' : 'error' }}
        </span>
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:7777';

export default {
  name: 'EmployeeAttendance',
  data() {
    return {
      employees: [],
      selectedEmployee: null,
      showDetailsModal: false,
      isLoading: false,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      statusMessage: '',
      date: new Date().toISOString().split('T')[0],
      sortKey: 'id',
      sortDirection: 'asc',
      headers: [
        { key: 'id', label: 'ID', icon: 'badge' },
        { key: 'firstName', label: 'Name', icon: 'person' },
        { key: 'timeIn', label: 'Time In', icon: 'wb_sunny' },
        { key: 'timeOut', label: 'Time Out', icon: 'nights_stay' },
        { key: 'status', label: 'Status', icon: 'check_circle' },
        { key: 'actions', label: 'Actions', icon: 'settings' },
      ],
    };
  },
  computed: {
    filteredEmployees() {
      if (!this.employees || !Array.isArray(this.employees)) return [];
      return this.employees
        .filter(employee =>
          !this.searchQuery ||
          `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          employee.id.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          const valueA = a[this.sortKey] || '';
          const valueB = b[this.sortKey] || '';
          return this.sortDirection === 'asc'
            ? valueA < valueB ? -1 : 1
            : valueA > valueB ? -1 : 1;
        });
    },
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredEmployees.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage) || 1;
    },
    paginationInfo() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(start + this.itemsPerPage - 1, this.filteredEmployees.length);
      return { start, end };
    },
  },
  mounted() {
    this.fetchEmployeesAndAttendance();
  },
  methods: {
    async fetchEmployeesAndAttendance() {
      this.isLoading = true;
      this.statusMessage = 'Loading attendance data...';
      try {
        const empResponse = await axios.get(`${API_BASE_URL}/api/employees`, {
          headers: { 'user-role': 'admin' },
        }).catch(error => {
          throw new Error(`Employees API failed: ${error.message}`);
        });

        const baseEmployees = (empResponse.data || []).map(emp => ({
          id: emp.id,
          firstName: emp.firstName || 'Unknown',
          lastName: emp.lastName || '',
          timeIn: null,
          timeOut: null,
          status: 'Absent',
        }));

        const attResponse = await axios.get(`${API_BASE_URL}/api/attendance`, {
          params: { date: this.date },
          headers: { 'user-role': 'admin' },
        }).catch(error => {
          console.error('Attendance API response:', error.response?.data);
          throw new Error(`Attendance API failed: ${error.message}`);
        });

        const attendanceRecords = (attResponse.data || []).map(record => ({
          id: record.id,
          employeeId: record.employeeId,
          timeIn: record.timeIn || null,
          timeOut: record.timeOut || null,
          status: record.status || (record.timeIn || record.timeOut ? 'Present' : 'Absent'),
        }));

        const attendanceMap = attendanceRecords.reduce((map, record) => {
          map[record.employeeId] = record;
          return map;
        }, {});

        this.employees = baseEmployees.map(employee => {
          const attendance = attendanceMap[employee.id];
          return {
            ...employee,
            timeIn: attendance ? attendance.timeIn : null,
            timeOut: attendance ? attendance.timeOut : null,
            status: attendance ? attendance.status : 'Absent',
          };
        });

        this.showSuccessMessage('Attendance data loaded successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
        this.showErrorMessage(`Failed to load data: ${error.message}. Check server logs for details.`);
        this.employees = [];
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
      return {
        Present: 'text-green-600 bg-green-50 px-2 py-1 rounded-md',
        Absent: 'text-red-600 bg-red-50 px-2 py-1 rounded-md',
        Late: 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md',
      }[status] || 'text-gray-600';
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    showDetails(employee) {
      this.selectedEmployee = { ...employee };
      this.showDetailsModal = true;
    },
    async markTime(period) {
      try {
        const timeField = period === 'in' ? 'timeIn' : 'timeOut';
        const timeValue = moment().format('HH:mm');
        if (this.selectedEmployee && timeValue) {
          this.selectedEmployee[timeField] = timeValue;
          if (this.selectedEmployee.status === 'Absent') {
            this.selectedEmployee.status = 'Present';
          }
          await this.updateAttendance(this.selectedEmployee, timeField);
        }
      } catch (error) {
        console.error('Error marking time:', error);
        this.showErrorMessage('Failed to mark time');
      }
    },
    async updateAttendance(employee) {
      try {
        const payload = {
          date: this.date,
          employeeId: employee.id,
          timeIn: employee.timeIn,
          timeOut: employee.timeOut,
          status: employee.status,
        };

        const response = await axios.put(
          `${API_BASE_URL}/api/attendance/${employee.id}`,
          payload,
          { headers: { 'user-role': 'admin' } }
        );

        if (response.status === 200) {
          this.employees = this.employees.map(emp =>
            emp.id === employee.id ? { ...emp, ...response.data } : emp
          );
          if (employee === this.selectedEmployee) {
            this.selectedEmployee = { ...this.selectedEmployee, ...response.data };
          }
          this.showSuccessMessage('Attendance updated successfully');
        }
      } catch (error) {
        console.error('Error updating attendance:', error);
        this.showErrorMessage('Failed to update attendance');
      }
    },
    formatTime(time) {
      return time ? moment(time, 'HH:mm').format('h:mm A') : '--';
    },
    async generateReport() {
      try {
        const formattedDate = moment(this.date).format('MM/DD/YYYY');
        const reportData = [
          ['Date', formattedDate],
          ['Employee ID', 'First Name', 'Last Name', 'Time In', 'Time Out', 'Status'],
          ...this.filteredEmployees.map(employee => [
            employee.id,
            employee.firstName,
            employee.lastName,
            employee.timeIn ? this.formatTime(employee.timeIn) : '--',
            employee.timeOut ? this.formatTime(employee.timeOut) : '--',
            employee.status,
          ]),
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(reportData);
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) continue;
            if (R === 0 || R === 1) {
              ws[cellAddress].s = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '4F46E5' } },
              };
            }
          }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        XLSX.writeFile(wb, `Attendance_Report_${this.date}.xlsx`);
        this.showSuccessMessage('Report generated successfully');
      } catch (error) {
        console.error('Error generating report:', error);
        this.showErrorMessage('Failed to generate report');
      }
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 3000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 3000);
    },
  },
};
</script>

<style scoped>
/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #a0aec0;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 640px) {
  .min-h-screen { padding: 1rem; }
  header { padding: 1rem; flex-direction: column; gap: 1rem; }
  h1 { font-size: 1.25rem; }
  .material-icons { font-size: 1.25rem !important; }
  .flex-col.sm\:flex-row { flex-direction: column; gap: 0.75rem; }
  input[type="date"] { width: 100%; font-size: 0.875rem; padding: 0.5rem 0.75rem 0.5rem 2.5rem; }
  .relative.w-full.sm\:w-64 { width: 100%; }
  input[type="text"] { font-size: 0.875rem; padding: 0.5rem 2.5rem; }
  input[type="time"] { font-size: 0.875rem; padding: 0.5rem; width: 5rem; }
  select { font-size: 0.875rem; padding: 0.5rem; width: 6rem; }
  button { font-size: 0.875rem; padding: 0.5rem 1rem; }
  table { font-size: 0.875rem; }
  th, td { padding: 0.75rem; }
  img.h-8.w-8 { height: 1.5rem; width: 1.5rem; }
  .p-4 { padding: 0.75rem; }
  .text-sm { font-size: 0.75rem; }
  .max-w-md.p-6 { padding: 1rem; max-width: 95%; }
  .text-xl { font-size: 1rem; }
  .h-10.w-10 { height: 2rem; width: 2rem; }
  .grid-cols-2.gap-4 { gap: 0.75rem; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .min-h-screen { padding: 2rem; }
  header { padding: 1.5rem; }
  h1 { font-size: 1.5rem; }
  input[type="date"] { width: 10rem; font-size: 0.875rem; }
  input[type="text"] { font-size: 0.875rem; }
  input[type="time"] { font-size: 0.875rem; width: 6rem; }
  select { font-size: 0.875rem; width: 7rem; }
  button { font-size: 0.875rem; }
  table { font-size: 0.875rem; }
  th, td { padding: 1rem; }
  .text-sm { font-size: 0.875rem; }
}
</style>