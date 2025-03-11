<template>
  <div class="min-h-screen bg-gray-50 p-2">
    <div class="max-w-7xl mx-auto">
      <!-- Header - Streamlined -->
      <header class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800 flex items-center gap-1">
          <span class="material-icons text-indigo-500 text-xl">schedule</span>
          Attendance
        </h1>
        <div class="flex items-center gap-2">
          <div class="relative">
            <span class="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">event</span>
            <input
              type="date"
              v-model="date"
              @change="fetchEmployeesAndAttendance"
              class="pl-8 pr-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 w-32 bg-white"
            />
          </div>
          <div class="relative">
            <span class="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-36 pl-8 pr-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <span class="material-icons text-xs">close</span>
            </button>
          </div>
          <button @click="generateReport" 
            class="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 flex items-center gap-1">
            <span class="material-icons text-xs">download</span>
            Export
          </button>
        </div>
      </header>

      <!-- Table - Compact design -->
      <div class="bg-white rounded-lg shadow mt-3 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="header in headers" :key="header.key" 
                  class="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
                  @click="sortTable(header.key)">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-indigo-400 text-xs">{{ header.icon }}</span>
                    <span>{{ header.label }}</span>
                    <span v-if="sortKey === header.key" class="material-icons text-xs">
                      {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-if="isLoading" class="animate-pulse">
                <td colspan="6" class="px-3 py-2">
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                </td>
              </tr>
              <tr v-for="employee in paginatedEmployees" :key="employee.id" 
                class="hover:bg-gray-50 transition-colors text-xs">
                <td class="px-3 py-2 text-gray-700">{{ employee.id }}</td>
                <td class="px-3 py-2">
                  <div class="flex items-center gap-2">
                    <img :src="`https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=4f46e5&color=fff&size=24`" 
                      class="h-6 w-6 rounded-full" />
                    <span class="font-medium text-gray-800">{{ employee.firstName }} {{ employee.lastName }}</span>
                  </div>
                </td>
                <td class="px-3 py-2 text-gray-700">
                  <input
                    type="time"
                    v-model="employee.timeIn"
                    @change="updateAttendance(employee, 'timeIn')"
                    class="w-20 py-1 px-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                  />
                </td>
                <td class="px-3 py-2 text-gray-700">
                  <input
                    type="time"
                    v-model="employee.timeOut"
                    @change="updateAttendance(employee, 'timeOut')"
                    class="w-20 py-1 px-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                  />
                </td>
                <td class="px-3 py-2">
                  <span :class="getStatusClass(employee.status)" class="text-xs px-2 py-1 rounded-full">
                    {{ employee.status }}
                  </span>
                </td>
                <td class="px-3 py-2 flex items-center gap-1">
                  <select
                    v-model="employee.status"
                    @change="updateAttendance(employee, 'status')"
                    class="w-20 py-1 px-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                  <button @click="showDetails(employee)" 
                    class="p-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    title="Edit Details">
                    <span class="material-icons text-xs">edit</span>
                  </button>
                </td>
              </tr>
              <tr v-if="!isLoading && paginatedEmployees.length === 0">
                <td colspan="6" class="px-3 py-4 text-center text-gray-500 text-xs">
                  No employees found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination - Simplified -->
        <div v-if="filteredEmployees.length > itemsPerPage" 
          class="p-2 flex justify-between items-center bg-gray-50 border-t border-gray-100">
          <span class="text-xs text-gray-500">
            {{ paginationInfo.start }}-{{ paginationInfo.end }} of {{ filteredEmployees.length }}
          </span>
          <div class="flex gap-2">
            <button @click="prevPage" :disabled="currentPage === 1" 
              class="px-2 py-1 bg-indigo-500 text-white text-xs rounded disabled:bg-gray-300 hover:bg-indigo-600">
              Prev
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages" 
              class="px-2 py-1 bg-indigo-500 text-white text-xs rounded disabled:bg-gray-300 hover:bg-indigo-600">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Modal - Compact -->
      <transition name="modal">
        <div v-if="showDetailsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow w-full max-w-sm p-4">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-medium text-gray-800">Edit Attendance</h2>
              <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700">
                <span class="material-icons text-lg">close</span>
              </button>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <img :src="`https://ui-avatars.com/api/?name=${selectedEmployee?.firstName}+${selectedEmployee?.lastName}&background=4f46e5&color=fff`" 
                  class="h-8 w-8 rounded-full" />
                <div>
                  <p class="font-medium text-gray-800">{{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}</p>
                  <p class="text-xs text-gray-500">ID: {{ selectedEmployee?.id }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="timeIn" class="block text-xs font-medium text-gray-700">Time In</label>
                  <input
                    id="timeIn"
                    v-model="selectedEmployee.timeIn"
                    type="time"
                    class="mt-1 p-1 w-full text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                    @change="updateAttendance(selectedEmployee, 'timeIn')"
                  />
                </div>
                <div>
                  <label for="timeOut" class="block text-xs font-medium text-gray-700">Time Out</label>
                  <input
                    id="timeOut"
                    v-model="selectedEmployee.timeOut"
                    type="time"
                    class="mt-1 p-1 w-full text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                    @change="updateAttendance(selectedEmployee, 'timeOut')"
                  />
                </div>
                <div class="col-span-2">
                  <label for="status" class="block text-xs font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    v-model="selectedEmployee.status"
                    class="mt-1 p-1 w-full text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                    @change="updateAttendance(selectedEmployee, 'status')"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <button @click="markTime('in')" 
                  class="flex-1 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600">
                  Time In Now
                </button>
                <button @click="markTime('out')" 
                  class="flex-1 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600">
                  Time Out Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Status Message - More compact -->
      <div
        v-if="statusMessage"
        :class="statusMessage.includes('successfully') ? 'bg-green-500' : 'bg-red-500'"
        class="fixed bottom-4 right-4 px-3 py-2 text-white text-xs rounded-md shadow-lg animate-fade-in flex items-center gap-1"
      >
        <span class="material-icons text-xs">
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
        { key: 'timeIn', label: 'In', icon: 'wb_sunny' },
        { key: 'timeOut', label: 'Out', icon: 'nights_stay' },
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
      this.statusMessage = 'Loading data...';
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

        this.showSuccessMessage('Data loaded');
      } catch (error) {
        console.error('Error fetching data:', error);
        this.showErrorMessage(`Failed to load data: ${error.message}`);
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
        Present: 'text-green-600 bg-green-100',
        Absent: 'text-red-600 bg-red-100',
        Late: 'text-yellow-600 bg-yellow-100',
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
          this.showSuccessMessage('Updated successfully');
        }
      } catch (error) {
        console.error('Error updating attendance:', error);
        this.showErrorMessage('Update failed');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        XLSX.writeFile(wb, `Attendance_${this.date}.xlsx`);
        this.showSuccessMessage('Report exported');
      } catch (error) {
        console.error('Error generating report:', error);
        this.showErrorMessage('Export failed');
      }
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 2000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 2000);
    },
  },
};
</script>

<style scoped>
/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: all 0.15s ease;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive fixes */
@media (max-width: 640px) {
  .flex-col.sm\:flex-row { flex-direction: column; gap: 0.5rem; }
  .relative.w-full.sm\:w-64 { width: 100%; }
  input[type="date"], input[type="time"], input[type="text"], select { font-size: 0.75rem; }
  img.h-6.w-6 { height: 1.25rem; width: 1.25rem; }
}
</style>