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

      <!-- Add Payhead to Employee Modal -->
      <AddPayheadModal v-if="showAddPayheadModal" 
                       @close="showAddPayheadModal = false" 
                       @save="savePayheads" 
                       :availablePayheads="availablePayheads" 
                       :selectedEmployeePayheads="selectedEmployeePayheads" 
                       @addPayhead="addPayheadToEmployee" 
                       @removePayhead="removePayheadFromEmployee" 
                       :totalPayableSalary="totalPayableSalary" />
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
      const earnings = this.selectedEmployeePayheads.filter(p => p.type === 'Earnings').reduce((sum, p) => sum + p.amount, 0);
      const deductions = this.selectedEmployeePayheads.filter(p => p.type === 'Deductions').reduce((sum, p) => sum + p.amount, 0);
      return earnings - deductions;
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
          totalEarnings: this.calculateNetSalary(emp),
          totalDeduction: (emp.deductions?.sss || 0) + (emp.deductions?.philhealth || 0) + (emp.deductions?.pagibig || 0),
          totalSalary: emp.salary
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
      } catch (error) {
        console.error('Error deleting pay head:', error);
        this.showErrorMessage('Failed to delete pay head.');
      }
    },
    openAddPayheadModal(employee) {
      this.selectedEmployee = employee;
      this.selectedEmployeePayheads = []; // Reset or fetch existing payheads for employee from backend if implemented
      this.availablePayheads = [...this.payHeads];
      this.showAddPayheadModal = true;
    },
    addPayheadToEmployee(payhead) {
      this.selectedEmployeePayheads.push(payhead);
      this.availablePayheads = this.availablePayheads.filter(p => p.id !== payhead.id);
    },
    removePayheadFromEmployee(payhead) {
      this.selectedEmployeePayheads = this.selectedEmployeePayheads.filter(p => p.id !== payhead.id);
      this.availablePayheads.push(payhead);
    },
    async savePayheads() {
      try {
        // Assuming backend has an endpoint to save payheads for an employee
        await axios.put(`http://localhost:7777/api/employees/${this.selectedEmployee.id}/payheads`, {
          payheads: this.selectedEmployeePayheads
        });
        this.showAddPayheadModal = false;
        this.showSuccessMessage('Payheads saved to employee successfully!');
        await this.fetchEmployees(); // Refresh employee list to reflect changes
      } catch (error) {
        console.error('Error saving payheads:', error);
        this.showErrorMessage('Failed to save payheads.');
      }
    },
    calculateNetSalary(employee) {
      const totalDeductions = (employee.deductions?.sss || 0) + 
                              (employee.deductions?.philhealth || 0) + 
                              (employee.deductions?.pagibig || 0);
      const totalEarnings = (employee.earnings?.travelExpenses || 0) + 
                            (employee.earnings?.otherEarnings || 0);
      return employee.salary + totalEarnings - totalDeductions;
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