<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Add Pay Head Button -->
      <button class="mb-4 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200" 
              @click="showAddModal = true">Add Pay Head</button>
      
      <!-- Add Pay Head Modal -->
      <PayHeadModal v-if="showAddModal" @close="showAddModal = false" @save="addPayHead" :payHead="newPayHead" />

      <!-- Update Pay Head Modal -->
      <PayHeadModal v-if="showUpdateModal" @close="showUpdateModal = false" @save="updatePayHead" :payHead="selectedPayHead" isUpdate />

      <!-- Table to Display Pay Heads -->
      <PayHeadTable :payHeads="payHeads" @update="showUpdatePayHeadModal" @delete="deletePayHead" />

      <!-- Employee Payroll Information -->
      <EmployeePayrollTable :employees="employees" @addPayhead="openAddPayheadModal" />

      <!-- Add/Edit Payhead to Employee Modal -->
      <AddPayheadModal v-if="showAddPayheadModal" 
                       @close="showAddPayheadModal = false" 
                       @save="savePayheads" 
                       :availablePayheads="availablePayheads" 
                       :selectedEmployeePayheads="selectedEmployeePayheads" 
                       @addPayhead="addPayheadToEmployee" 
                       @removePayhead="removePayheadFromEmployee" 
                       @updatePayhead="updatePayheadInEmployee"
                       :totalPayableSalary="totalPayableSalary" 
                       :selectedEmployee="selectedEmployee" />
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" 
         :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
         class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50">
      {{ statusMessage }}
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
      statusMessage: ''
    };
  },
  computed: {
    totalPayableSalary() {
      const earnings = this.selectedEmployeePayheads
        .filter(p => p.type === 'Earnings')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const deductions = this.selectedEmployeePayheads
        .filter(p => p.type === 'Deductions')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return this.selectedEmployee ? (this.selectedEmployee.salary || 0) + earnings - deductions : 0;
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
      }
    },
    async addPayHead(payHead) {
      try {
        const response = await axios.post('http://localhost:7777/api/payheads', payHead);
        this.payHeads.push(response.data);
        this.showAddModal = false;
        this.showSuccessMessage('Pay head added successfully!');
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
          await this.fetchEmployees(); // Refresh employees to reflect updated payheads
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
        await this.fetchEmployees(); // Refresh employees to reflect deleted payheads
      } catch (error) {
        console.error('Error deleting pay head:', error);
        this.showErrorMessage('Failed to delete pay head.');
      }
    },
    openAddPayheadModal(employee) {
      this.selectedEmployee = { ...employee };
      this.selectedEmployeePayheads = [...(employee.payheads || [])]; // Load existing payheads
      this.availablePayheads = [...this.payHeads]; // Keep all payheads available
      this.showAddPayheadModal = true;
    },
    addPayheadToEmployee(payhead) {
      // Add a copy of the payhead with a unique identifier to allow duplicates
      const newPayhead = { ...payhead, uniqueId: Date.now() + Math.random() }; // Temporary unique ID
      this.selectedEmployeePayheads.push(newPayhead);
      // No need to remove from availablePayheads since we want it to stay
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
        // Remove temporary uniqueId before saving to backend
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
        .reduce((sum, p) => sum + Number(p.amount), 0);
    },
    calculateDeductions(payheads) {
      return payheads
        .filter(p => p.type === 'Deductions')
        .reduce((sum, p) => sum + Number(p.amount), 0);
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
</style>