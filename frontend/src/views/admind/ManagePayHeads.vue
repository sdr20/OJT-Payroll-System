<template>
  <div>
    <!-- Main Content - Improved layout and spacing -->
    <main class="flex-1 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
      <!-- Stats Cards - New component for key metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 rounded-lg bg-blue-100 p-3">
                <span class="material-icons text-blue-600">payments</span>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Total Pay Heads</p>
                <h3 class="mt-1 text-xl font-semibold text-gray-900">{{ payHeads.length }}</h3>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2">
            <div class="text-sm text-blue-700">
              <span class="font-medium">{{ calculatePayHeadsByType('Earnings') }}</span> earnings, 
              <span class="font-medium">{{ calculatePayHeadsByType('Deductions') }}</span> deductions
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 rounded-lg bg-green-100 p-3">
                <span class="material-icons text-green-600">trending_up</span>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Average Earnings</p>
                <h3 class="mt-1 text-xl font-semibold text-gray-900">${{ calculateAverageAmount('Earnings').toFixed(2) }}</h3>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2">
            <div class="text-sm text-green-700">
              <span class="flex items-center">
                <span class="material-icons text-sm mr-1">info</span>
                Per employee average
              </span>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 rounded-lg bg-purple-100 p-3">
                <span class="material-icons text-purple-600">people</span>
              </div>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500">Total Employees</p>
                <h3 class="mt-1 text-xl font-semibold text-gray-900">{{ employees.length }}</h3>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-5 py-2">
            <div class="text-sm text-purple-700">
              <span class="flex items-center">
                <span class="material-icons text-sm mr-1">verified</span>
                All records up to date
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Section - Improved with card design and better spacing -->
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
          <!-- Search Input - Enhanced with better visual feedback -->
          <div class="md:col-span-5 relative">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or description..."
                class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 outline-none transition-all"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <span class="material-icons">clear</span>
              </button>
            </div>
          </div>

          <!-- Filter Dropdown - Enhanced with label and better styling -->
          <div class="md:col-span-3">
            <label for="filter" class="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                filter_list
              </span>
              <select
                id="filter"
                v-model="filterType"
                class="w-full pl-10 pr-9 py-2.5 border rounded-lg appearance-none focus:ring-2 
                      focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Types</option>
                <option value="Earnings">Earnings</option>
                <option value="Deductions">Deductions</option>
              </select>
              <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                arrow_drop_down
              </span>
            </div>
          </div>

          <!-- View Toggle - Enhanced visual design -->
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">View</label>
            <div class="flex rounded-lg bg-gray-100 p-1 shadow-inner">
              <button
                v-for="tab in ['payheads', 'employees']"
                :key="tab"
                @click="activeTab = tab"
                class="flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
                :class="activeTab === tab ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'"
              >
                <div class="flex items-center justify-center gap-2">
                  <span class="material-icons text-sm">
                    {{ tab === 'payheads' ? 'payments' : 'people' }}
                  </span>
                  {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State - New component -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-sm flex justify-center items-center p-20">
        <div class="flex flex-col items-center">
          <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          <h2 class="text-center text-gray-600 text-xl font-semibold">Loading...</h2>
          <p class="w-full text-center text-gray-500">Please wait while we fetch the data</p>
        </div>
      </div>

      <!-- Empty State - New component -->
      <div v-else-if="(activeTab === 'payheads' && filteredPayHeads.length === 0) || 
                      (activeTab === 'employees' && filteredEmployees.length === 0)" 
           class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div class="rounded-full bg-blue-100 p-3 mb-4">
            <span class="material-icons text-blue-600 text-2xl">search_off</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900">No results found</h3>
          <p class="mt-1 text-gray-500 text-center max-w-sm">
            We couldn't find any {{ activeTab }} that match your search criteria. Try adjusting your filters or search terms.
          </p>
          <button 
            @click="resetFilters" 
            class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span class="material-icons text-sm mr-2">refresh</span>
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Data Table Section - Enhanced with better spacing and borders -->
      <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <!-- Table Header - New component for better visual hierarchy with "New Pay Head" button -->
        <div class="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">
            {{ activeTab === 'payheads' ? 'Pay Heads' : 'Employees' }}
          </h2>
          <div class="flex items-center space-x-4">
            <div v-if="filteredPayHeads.length > 0 && activeTab === 'payheads'" class="text-sm text-gray-500">
              Showing {{ filteredPayHeads.length }} {{ filteredPayHeads.length === 1 ? 'item' : 'items' }}
            </div>
            <!-- Smaller "New Pay Head" button -->
            <button
              v-if="activeTab === 'payheads'"
              @click="showAddModal = true"
              class="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white rounded-md 
                     text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm transform hover:scale-105"
            >
              <span class="material-icons text-sm mr-1">add</span>
              New Pay Head
            </button>
          </div>
        </div>

        <!-- Table Content -->
        <div class="overflow-x-auto">
          <component 
            :is="activeTab === 'payheads' ? 'PayHeadTable' : 'EmployeePayrollTable'"
            :payHeads="filteredPayHeads"
            :employees="paginatedEmployees"
            @update="showUpdatePayHeadModal"
            @delete="confirmDeletePayHead"
            @addPayhead="openAddPayheadModal"
          />
        </div>

        <!-- Pagination - Enhanced with better visual design -->
        <div v-if="activeTab === 'employees' && totalPages > 1" 
             class="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
          <div class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> to 
            <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredEmployees.length) }}</span> of 
            <span class="font-medium">{{ filteredEmployees.length }}</span> entries
          </div>

          <!-- Pagination Controls - Enhanced with better spacing and hover states -->
          <div class="flex items-center space-x-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              :class="currentPage === 1 ? 'text-gray-400' : 'text-gray-700'"
            >
              <span class="material-icons">chevron_left</span>
            </button>

            <div class="flex items-center gap-1">
              <template v-for="page in displayedPages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="currentPage = page"
                  class="min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all"
                  :class="currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-gray-700'"
                >
                  {{ page }}
                </button>
                <span v-else class="px-2 text-gray-500">...</span>
              </template>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              :class="currentPage === totalPages ? 'text-gray-400' : 'text-gray-700'"
            >
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals - Enhanced with animations and better UI -->
    <transition name="modal-fade">
      <PayHeadModal 
        v-if="showAddModal"
        :payHead="newPayHead"
        title="Add New Pay Head"
        @close="showAddModal = false"
        @save="addPayHead"
      />
    </transition>

    <transition name="modal-fade">
      <PayHeadModal
        v-if="showUpdateModal"
        :payHead="selectedPayHead"
        :isUpdate="true"
        title="Update Pay Head"
        @close="showUpdateModal = false"
        @save="updatePayHead"
      />
    </transition>

    <transition name="modal-fade">
      <AddPayheadModal
        v-if="showAddPayheadModal"
        :availablePayheads="availablePayheads"
        :selectedEmployeePayheads="selectedEmployeePayheads"
        :selectedEmployee="selectedEmployee"
        :totalPayableSalary="totalPayableSalary"
        @close="showAddPayheadModal = false"
        @save="savePayheads"
        @addPayhead="addPayheadToEmployee"
        @removePayhead="removePayheadFromEmployee"
        @updatePayhead="updatePayheadInEmployee"
      />
    </transition>

    <!-- Toast Notifications - Enhanced with better styling and animations -->
    <div class="fixed bottom-4 right-4 z-50 space-y-4">
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        move-class="transition duration-500"
      >
        <div
          v-if="statusMessage"
          :key="statusMessage"
          class="max-w-sm w-full bg-white rounded-lg shadow-lg pointer-events-auto
                ring-1 ring-black ring-opacity-5 overflow-hidden"
        >
          <div class="p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span 
                  class="material-icons"
                  :class="statusMessage.includes('success') ? 'text-green-500' : 'text-red-500'"
                >
                  {{ statusMessage.includes('success') ? 'check_circle' : 'error' }}
                </span>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ statusMessage }}
                </p>
              </div>
              <button
                @click="statusMessage = ''"
                class="ml-4 flex-shrink-0 rounded-md text-gray-400 hover:text-gray-500 
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, onBeforeUnmount } from 'vue';
import axios from 'axios';
import PayHeadModal from '@/components/payhead/PayHeadModal.vue';
import PayHeadTable from '@/components/payhead/PayHeadTable.vue';
import EmployeePayrollTable from '@/components/payhead/EmployeePayrollTable.vue';
import AddPayheadModal from '@/components/payhead/AddPayheadModal.vue';

export default {
  name: 'ManagePayHeads',
  components: {
    PayHeadModal,
    PayHeadTable,
    EmployeePayrollTable,
    AddPayheadModal
  },

  setup() {
    const currentTime = ref('2025-03-03 05:41:55');
    const username = ref('sdr20');
    const userInitials = computed(() => username.value.charAt(0).toUpperCase());
    const showUserMenu = ref(false);
    const userMenuContainer = ref(null);

    let timeInterval;

    const handleClickOutside = (event) => {
      if (userMenuContainer.value && !userMenuContainer.value.contains(event.target)) {
        showUserMenu.value = false;
      }
    };

    onMounted(() => {
      timeInterval = setInterval(() => {
        const now = new Date();
        currentTime.value = now.toISOString().slice(0, 19).replace('T', ' ');
      }, 1000);
      
      document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      if (timeInterval) clearInterval(timeInterval);
    });

    return {
      currentTime,
      username,
      userInitials,
      showUserMenu,
      userMenuContainer
    };
  },

  data() {
    return {
      payHeads: [],
      employees: [],
      newPayHead: {
        name: '',
        amount: '',
        type: 'Earnings',
        description: ''
      },
      selectedPayHead: {
        id: '',
        name: '',
        amount: '',
        type: 'Earnings',
        description: ''
      },
      showAddModal: false,
      showUpdateModal: false,
      showAddPayheadModal: false,
      selectedEmployee: null,
      selectedEmployeePayheads: [],
      availablePayheads: [],
      statusMessage: '',
      searchQuery: '',
      filterType: '',
      activeTab: 'payheads',
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false
    };
  },

  computed: {
    filteredPayHeads() {
      let filtered = [...this.payHeads];
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) || 
          (p.description && p.description.toLowerCase().includes(query))
        );
      }
      if (this.filterType) {
        filtered = filtered.filter(p => p.type === this.filterType);
      }
      return filtered;
    },

    filteredEmployees() {
      let filtered = [...this.employees];
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(e => 
          e.name.toLowerCase().includes(query) || 
          (e.position && e.position.toLowerCase().includes(query))
        );
      }
      if (this.filterType) {
        filtered = filtered.filter(e => {
          const earnings = this.calculateEarnings(e.payheads || []);
          const deductions = this.calculateDeductions(e.payheads || []);
          return this.filterType === 'Earnings' ? earnings > 0 : deductions > 0;
        });
      }
      return filtered;
    },

    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredEmployees.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage) || 1;
    },

    displayedPages() {
      const total = this.totalPages;
      const current = this.currentPage;
      const pages = [];

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...', total);
        } else if (current >= total - 2) {
          pages.push(1, '...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1, '...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...', total);
        }
      }
      return pages;
    },

    totalPayableSalary() {
      if (!this.selectedEmployee) return 0;
      const earnings = this.calculateEarnings(this.selectedEmployeePayheads || []);
      const deductions = this.calculateDeductions(this.selectedEmployeePayheads || []);
      return (this.selectedEmployee.salary || 0) + earnings - deductions;
    }
  },

  methods: {
    async fetchPayHeads() {
      this.isLoading = true;
      this.statusMessage = '';
      try {
        const userRole = localStorage.getItem('userRole') || 'admin'; // Default to 'admin' for testing
        console.log('Fetching pay heads with role:', userRole, 'Headers being sent:', {
          'user-role': 'admin'
        });
        const response = await axios.get('http://localhost:7777/api/payheads', {
          headers: {
            'user-role': 'admin' // Explicitly force admin role
          }
        });
        console.log('Fetched pay heads:', JSON.stringify(response.data, null, 2));
        this.payHeads = response.data || []; // Store pay heads data
        this.showSuccessMessage('Pay heads loaded successfully!');
      } catch (error) {
        console.error('Error fetching pay heads:', {
          message: error.message,
          response: error.response ? error.response.data : null,
          config: error.config ? error.config.headers : null
        });
        this.showErrorMessage('Failed to load pay heads. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEmployees() {
      this.isLoading = true;
      this.statusMessage = '';
      try {
        const userRole = localStorage.getItem('userRole') || 'admin'; // Default to 'admin' for testing
        console.log('Fetching employees with role:', userRole, 'Headers being sent:', {
          'user-role': 'admin'
        });
        const response = await axios.get('http://localhost:7777/api/employees', {
          headers: {
            'user-role': 'admin' // Explicitly force admin role
          }
        });
        console.log('Fetched employees response:', JSON.stringify(response.data, null, 2));
        this.employees = response.data.map(emp => ({
          ...emp,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          position: emp.position || 'N/A',
          totalEarnings: this.calculateEarnings(emp.payheads || []),
          totalDeduction: this.calculateDeductions(emp.payheads || []),
          totalSalary: (emp.salary || 0) + this.calculateEarnings(emp.payheads || []) - this.calculateDeductions(emp.payheads || []),
          payheads: emp.payheads || []
        }));
        this.showSuccessMessage('Employees loaded successfully!');
      } catch (error) {
        console.error('Error fetching employees:', {
          message: error.message,
          response: error.response ? error.response.data : null,
          config: error.config ? error.config.headers : null
        });
        this.showErrorMessage('Failed to load employees. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },

    async addPayHead(payHead) {
      try {
        this.isLoading = true;
        const response = await axios.post('http://localhost:7777/api/payheads', payHead, {
          headers: {
            'user-role': 'admin' // Explicitly force admin role
          }
        });
        this.payHeads.push(response.data);
        this.showAddModal = false;
        this.showSuccessMessage('Pay head added successfully!');
        await this.fetchEmployees();
      } catch (error) {
        console.error('Error adding pay head:', error);
        this.showErrorMessage('Failed to add pay head.');
      } finally {
        this.isLoading = false;
      }
    },

    showUpdatePayHeadModal(payHead) {
      this.selectedPayHead = { ...payHead };
      this.showUpdateModal = true;
    },

    async updatePayHead(updatedPayHead) {
      try {
        this.isLoading = true;
        const response = await axios.put(
          `http://localhost:7777/api/payheads/${updatedPayHead.id}`, 
          updatedPayHead, {
            headers: {
              'user-role': 'admin' // Explicitly force admin role
            }
          }
        );
        const index = this.payHeads.findIndex(ph => ph.id === updatedPayHead.id);
        if (index !== -1) {
          this.payHeads.splice(index, 1, response.data);
          this.showUpdateModal = false;
          this.showSuccessMessage('Pay head updated successfully!');
          await this.fetchEmployees();
        }
      } catch (error) {
        console.error('Error updating pay head:', error);
        this.showErrorMessage('Failed to update pay head.');
      } finally {
        this.isLoading = false;
      }
    },

    async confirmDeletePayHead(id) {
      if (confirm('Are you sure you want to delete this pay head?')) {
        await this.deletePayHead(id);
      }
    },

    async deletePayHead(id) {
      try {
        this.isLoading = true;
        await axios.delete(`http://localhost:7777/api/payheads/${id}`, {
          headers: {
            'user-role': 'admin' // Explicitly force admin role
          }
        });
        this.payHeads = this.payHeads.filter(payHead => payHead.id !== id);
        this.showSuccessMessage('Pay head deleted successfully!');
        await this.fetchEmployees();
      } catch (error) {
        console.error('Error deleting pay head:', error);
        this.showErrorMessage('Failed to delete pay head.');
      } finally {
        this.isLoading = false;
      }
    },

    openAddPayheadModal(employee) {
      this.selectedEmployee = { ...employee, salary: employee.salary || 0 };
      this.selectedEmployeePayheads = [...(employee.payheads || [])];
      this.availablePayheads = [...this.payHeads];
      this.showAddPayheadModal = true;
    },

    addPayheadToEmployee(payhead) {
      const newPayhead = { 
        ...payhead, 
        uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
      };
      this.selectedEmployeePayheads.push(newPayhead);
    },

    removePayheadFromEmployee(payhead) {
      this.selectedEmployeePayheads = this.selectedEmployeePayheads.filter(
        p => p.uniqueId !== payhead.uniqueId
      );
    },

    updatePayheadInEmployee(updatedPayhead) {
      const index = this.selectedEmployeePayheads.findIndex(
        p => p.uniqueId === updatedPayhead.uniqueId
      );
      if (index !== -1) {
        this.selectedEmployeePayheads.splice(index, 1, { ...updatedPayhead });
      }
    },

    async savePayheads() {
      try {
        this.isLoading = true;
        const payheadsToSave = this.selectedEmployeePayheads.map(ph => ({
          id: ph.id,
          name: ph.name,
          amount: ph.amount,
          type: ph.type
        }));

        const updatedEmployee = {
          ...this.selectedEmployee,
          payheads: payheadsToSave,
          totalEarnings: this.calculateEarnings(payheadsToSave),
          totalDeduction: this.calculateDeductions(payheadsToSave),
          totalSalary: (this.selectedEmployee.salary || 0) + 
                      this.calculateEarnings(payheadsToSave) - 
                      this.calculateDeductions(payheadsToSave)
        };

        await axios.put(
          `http://localhost:7777/api/employees/${this.selectedEmployee.id}`,
          updatedEmployee, {
            headers: {
              'user-role': 'admin' // Explicitly force admin role
            }
          }
        );

        const employeeIndex = this.employees.findIndex(
          e => e.id === this.selectedEmployee.id
        );
        if (employeeIndex !== -1) {
          this.employees.splice(employeeIndex, 1, updatedEmployee);
        }

        this.showAddPayheadModal = false;
        this.showSuccessMessage('Payheads saved successfully!');
      } catch (error) {
        console.error('Error saving payheads:', error);
        this.showErrorMessage('Failed to save payheads.');
      } finally {
        this.isLoading = false;
      }
    },

    calculateEarnings(payheads = []) {
      return payheads
        .filter(p => p.type === 'Earnings')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },

    calculateDeductions(payheads = []) {
      return payheads
        .filter(p => p.type === 'Deductions')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },

    calculatePayHeadsByType(type) {
      return this.payHeads.filter(p => p.type === type).length;
    },

    calculateAverageAmount(type) {
      const filtered = this.payHeads.filter(p => p.type === type && p.amount > 0);
      if (filtered.length === 0) return 0;
      const total = filtered.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return total / filtered.length;
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    resetFilters() {
      this.searchQuery = '';
      this.filterType = '';
    },

    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 3000);
    },

    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 3000);
    }
  },

  created() {
    this.fetchPayHeads();
    this.fetchEmployees();
  }
};
</script>

<style scoped>
/* Modal animation */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* Dropdown animation */
.animate-dropdown {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loader animation */
.loader {
  border-top-color: #3b82f6; /* Blue-600 */
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Cross-browser scrollbar support */
.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>