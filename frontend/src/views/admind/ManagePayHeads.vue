<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header with Search and Filters -->
      <div class="flex justify-between items-center mb-6 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Payheads or Employees..."
          class="border rounded-lg px-4 py-2 w-1/3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <select
          v-model="filterType"
          class="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        >
          <option value="">All Types</option>
          <option value="Earnings">Earnings</option>
          <option value="Deductions">Deductions</option>
        </select>
        <button
          class="py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
          @click="showAddModal = true"
        >
          Add Pay Head
        </button>
      </div>

      <!-- Tabs for Payheads and Employees -->
      <div class="mb-6">
        <div class="flex border-b">
          <button
            class="px-4 py-2 text-sm font-medium"
            :class="{ 'border-b-2 border-blue-500 text-blue-600': activeTab === 'payheads', 'text-gray-500 hover:text-gray-700': activeTab !== 'payheads' }"
            @click="activeTab = 'payheads'"
          >
            Payheads
          </button>
          <button
            class="px-4 py-2 text-sm font-medium"
            :class="{ 'border-b-2 border-blue-500 text-blue-600': activeTab === 'employees', 'text-gray-500 hover:text-gray-700': activeTab !== 'employees' }"
            @click="activeTab = 'employees'"
          >
            Employee Payroll
          </button>
        </div>
      </div>

      <!-- Payheads Section -->
      <div v-if="activeTab === 'payheads'" class="bg-white p-5 rounded-xl shadow-md mb-6">
        <PayHeadTable :payHeads="filteredPayHeads" @update="showUpdatePayHeadModal" @delete="deletePayHead" />
      </div>

      <!-- Employee Payroll Section -->
      <div v-if="activeTab === 'employees'" class="bg-white p-5 rounded-xl shadow-md">
        <EmployeePayrollTable :employees="filteredEmployees" @addPayhead="openAddPayheadModal" />
      </div>

      <!-- Modals -->
      <PayHeadModal
        v-if="showAddModal"
        @close="showAddModal = false"
        @save="addPayHead"
        :payHead="newPayHead"
        title="Add New Pay Head"
      />
      <PayHeadModal
        v-if="showUpdateModal"
        @close="showUpdateModal = false"
        @save="updatePayHead"
        :payHead="selectedPayHead"
        title="Update Pay Head"
        isUpdate
      />
      <AddPayheadModal
        v-if="showAddPayheadModal"
        @close="showAddPayheadModal = false"
        @save="savePayheads"
        :availablePayheads="availablePayheads"
        :selectedEmployeePayheads="selectedEmployeePayheads"
        @addPayhead="addPayheadToEmployee"
        @removePayhead="removePayheadFromEmployee"
        @updatePayhead="updatePayheadInEmployee"
        :totalPayableSalary="totalPayableSalary || 0"
        :selectedEmployee="selectedEmployee || {}"
        :isUpdate="false"
      />

      <!-- Status Message -->
      <div
        v-if="statusMessage"
        :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
        class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50"
      >
        {{ statusMessage }}
      </div>

      <!-- Pagination for Employees -->
      <div v-if="activeTab === 'employees'" class="flex justify-center items-center mt-4 gap-4">
        <button
          @click="prevPage"
          :disabled="currentPage === 1 || isLoading"
          class="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        <span class="text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages || isLoading"
          class="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
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
  data() {
    return {
      payHeads: [],
      employees: [],
      newPayHead: {
        name: '',
        amount: '',
        type: 'Earnings'
      },
      selectedPayHead: {
        id: '',
        name: '',
        amount: '',
        type: 'Earnings'
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
      itemsPerPage: 5,
      isLoading: false
    };
  },
  computed: {
    filteredPayHeads() {
      let filtered = [...this.payHeads];
      if (this.searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
      if (this.filterType) {
        filtered = filtered.filter(p => p.type === this.filterType);
      }
      return filtered;
    },
    filteredEmployees() {
      let filtered = [...this.employees];
      if (this.searchQuery) {
        filtered = filtered.filter(e => e.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
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
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage) || 1;
    },
    totalPayableSalary() {
      if (!this.selectedEmployee) return 0;
      const earnings = this.calculateEarnings(this.selectedEmployeePayheads || []);
      const deductions = this.calculateDeductions(this.selectedEmployeePayheads || []);
      return (this.selectedEmployee.salary || 0) + earnings - deductions;
    }
  },
  async created() {
    await this.fetchPayHeads();
    await this.fetchEmployees();
  },
  methods: {
    async fetchPayHeads() {
      try {
        const response = await axios.get('http://localhost:7777/api/payheads');
        this.payHeads = response.data || [];
      } catch (error) {
        console.error('Error fetching pay heads:', error);
        this.showErrorMessage('Failed to fetch pay heads.');
      }
    },
    async fetchEmployees() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://localhost:7777/api/employees');
        this.employees = response.data.map(emp => ({
          ...emp,
          name: `${emp.firstName} ${emp.lastName}`, // Compute full name
          position: emp.position || 'N/A',
          totalEarnings: this.calculateEarnings(emp.payheads || []),
          totalDeduction: this.calculateDeductions(emp.payheads || []),
          totalSalary: (emp.salary || 0) + this.calculateEarnings(emp.payheads || []) - this.calculateDeductions(emp.payheads || []),
          payheads: emp.payheads || []
        })) || [];
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showErrorMessage('Failed to fetch employees.');
      } finally {
        this.isLoading = false;
      }
    },
    async addPayHead(payHead) {
      try {
        const response = await axios.post('http://localhost:7777/api/payheads', payHead);
        this.payHeads.push(response.data);
        this.showAddModal = false;
        this.showSuccessMessage('Pay head added successfully!');
        await this.fetchEmployees(); // Refresh employees to reflect new payhead
      } catch (error) {
        console.error('Error adding pay head:', error);
        this.showErrorMessage('Failed to add pay head.');
      }
    },
    showUpdatePayHeadModal(payHead) {
      this.selectedPayHead = { ...payHead };
      this.showUpdateModal = true;
    },
    async updatePayHead(updatedPayHead) {
      try {
        const response = await axios.put(`http://localhost:7777/api/payheads/${updatedPayHead.id}`, updatedPayHead);
        const index = this.payHeads.findIndex(ph => ph.id === updatedPayHead.id);
        if (index !== -1) {
          this.payHeads.splice(index, 1, response.data);
          this.showUpdateModal = false;
          this.showSuccessMessage('Pay head updated successfully!');
          await this.fetchEmployees(); // Refresh employees to reflect updated payhead
        }
      } catch (error) {
        console.error('Error updating pay head:', error);
        this.showErrorMessage('Failed to update pay head.');
      }
    },
    async deletePayHead(id) {
      try {
        await axios.delete(`http://localhost:7777/api/payheads/${id}`);
        this.payHeads = this.payHeads.filter(payHead => payHead.id !== id);
        this.showSuccessMessage('Pay head deleted successfully!');
        await this.fetchEmployees(); // Refresh employees to reflect deleted payhead
      } catch (error) {
        console.error('Error deleting pay head:', error);
        this.showErrorMessage('Failed to delete pay head.');
      }
    },
    openAddPayheadModal(employee) {
      this.selectedEmployee = { ...employee, salary: employee.salary || 0 }; // Ensure salary exists
      this.selectedEmployeePayheads = [...(employee.payheads || [])]; // Load existing payheads
      this.availablePayheads = [...this.payHeads]; // Keep all payheads available
      this.showAddPayheadModal = true;
    },
    addPayheadToEmployee(payhead) {
      // Add a copy of the payhead with a unique identifier to allow duplicates
      const newPayhead = { ...payhead, uniqueId: Date.now() + Math.random() }; // Temporary unique ID
      this.selectedEmployeePayheads.push(newPayhead);
    },
    removePayheadFromEmployee(payhead) {
      this.selectedEmployeePayheads = this.selectedEmployeePayheads.filter(p => p.uniqueId !== payhead.uniqueId);
    },
    updatePayheadInEmployee(updatedPayhead) {
      const index = this.selectedEmployeePayheads.findIndex(p => p.uniqueId === updatedPayhead.uniqueId);
      if (index !== -1) {
        this.selectedEmployeePayheads.splice(index, 1, { ...updatedPayhead });
      }
    },
    async savePayheads() {
      try {
        // Allow saving even if selectedEmployeePayheads is empty
        const payheadsToSave = this.selectedEmployeePayheads.length > 0
          ? this.selectedEmployeePayheads.map(ph => ({
              id: ph.id,
              name: ph.name,
              amount: ph.amount,
              type: ph.type
            }))
          : []; // Explicitly set to empty array if no payheads

        const updatedEmployee = {
          ...this.selectedEmployee,
          payheads: payheadsToSave,
          totalEarnings: this.calculateEarnings(payheadsToSave),
          totalDeduction: this.calculateDeductions(payheadsToSave),
          totalSalary: (this.selectedEmployee.salary || 0) + this.calculateEarnings(payheadsToSave) - this.calculateDeductions(payheadsToSave)
        };

        await axios.put(`http://localhost:7777/api/employees/${this.selectedEmployee.id}`, updatedEmployee);

        const employeeIndex = this.employees.findIndex(e => e.id === this.selectedEmployee.id);
        if (employeeIndex !== -1) {
          this.employees.splice(employeeIndex, 1, updatedEmployee);
        }

        this.showAddPayheadModal = false;
        this.showSuccessMessage('Payheads saved to employee successfully!');
      } catch (error) {
        console.error('Error saving payheads:', error);
        this.showErrorMessage('Failed to save payheads.');
      }
    },
    calculateEarnings(payheads) {
      return payheads
        .filter(p => p.type === 'Earnings')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },
    calculateDeductions(payheads) {
      return payheads
        .filter(p => p.type === 'Deductions')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
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
.transition-all {
  transition: all 0.2s ease-in-out;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}
</style>