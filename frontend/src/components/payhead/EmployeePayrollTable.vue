<template>
  <div class="bg-white p-5 rounded-xl shadow-md">
    <h2 class="text-xl font-bold mb-4">Employee Payroll Information</h2>
    <div class="flex items-center justify-between mb-4">
      <div></div> <!-- Empty div for spacing -->
      <div class="flex items-center space-x-2">
        <!-- Bulk Assign Payheads Button -->
        <button
          @click="showBulkAssignPayheadModal = true"
          class="inline-flex items-center px-2 py-0.5 bg-purple-600 text-white rounded-sm 
                 text-xs font-medium hover:bg-purple-700 focus:outline-none focus:ring-1 
                 focus:ring-offset-1 focus:ring-purple-500 transition-all shadow-sm transform hover:scale-105"
        >
          <span class="material-icons text-xs mr-1">group_add</span>
          Bulk Assign Payheads
        </button>
      </div>
    </div>
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of Employee</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deduction</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Recurring Deduction</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Salary</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="employee in employees" :key="employee.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.id }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.position }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalDeduction.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalRecurringDeduction.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalEarnings.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">P {{ employee.totalSalary.toLocaleString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
            <button 
              @click="$emit('addPayhead', employee)" 
              class="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
              title="Add Payhead"
            >
              <span class="material-icons-outlined text-base">add</span>
              Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Bulk Assign Payhead Modal -->
    <transition name="modal-fade">
      <AddPayheadModal
        v-if="showBulkAssignPayheadModal"
        :availablePayheads="availablePayheads"
        :employees="employees"
        :mode="'bulkAssign'"
        @close="showBulkAssignPayheadModal = false"
        @bulkAssign="handleBulkAssign"
        @error="showErrorMessage"
      />
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import AddPayheadModal from '@/components/payhead/AddPayheadModal.vue'; // Adjust the path as needed

export default {
  props: {
    employees: {
      type: Array,
      required: true,
    },
  },
  components: {
    AddPayheadModal,
  },
  data() {
    return {
      showBulkAssignPayheadModal: false,
      availablePayheads: [],
      statusMessage: '',
    };
  },
  methods: {
    async fetchPayheads() {
      try {
        const response = await axios.get('http://localhost:7777/api/payheads', {
          headers: { 'user-role': 'admin' },
        });
        this.availablePayheads = response.data.map(item => ({
          ...item,
          amount: Number(item.amount),
          isRecurring: item.isRecurring || false,
          appliedThisCycle: item.appliedThisCycle || false,
        })) || [];
      } catch (error) {
        console.error('Error fetching payheads:', error);
        this.showErrorMessage('Failed to load payheads');
      }
    },

    async handleBulkAssign({ payheads, employees }) {
      try {
        const updatedEmployees = [...this.employees];
        for (const employee of employees) {
          const employeeIndex = updatedEmployees.findIndex(emp => emp.id === employee.id);
          if (employeeIndex === -1) continue;

          const existingPayheads = employee.payheads || [];
          const newPayheads = payheads.map(payhead => ({
            ...payhead,
            uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            amount: Number(payhead.amount),
            appliedThisCycle: payhead.isRecurring ? false : undefined,
          }));

          // Combine existing and new payheads, avoiding duplicates by name
          const updatedPayheads = [...existingPayheads];
          for (const newPayhead of newPayheads) {
            if (!updatedPayheads.some(p => p.name === newPayhead.name)) {
              updatedPayheads.push(newPayhead);
            }
          }

          const updatedEmployee = {
            ...employee,
            payheads: updatedPayheads,
            totalEarnings: this.calculateEarnings(updatedPayheads),
            totalDeduction: this.calculateDeductions(updatedPayheads),
            totalRecurringDeduction: this.calculateRecurringDeductions(updatedPayheads),
            totalSalary: (employee.salary || 0) +
                         this.calculateEarnings(updatedPayheads) -
                         this.calculateDeductions(updatedPayheads) -
                         this.calculateRecurringDeductions(updatedPayheads),
          };

          // Update the employee in the backend
          await axios.put(
            `http://localhost:7777/api/employees/${employee.id}`,
            updatedEmployee,
            { headers: { 'user-role': 'admin' } }
          );

          // Update the local employees array
          updatedEmployees.splice(employeeIndex, 1, updatedEmployee);
        }

        // Emit the updated employees to the parent
        this.$emit('updateEmployees', updatedEmployees);
        this.showBulkAssignPayheadModal = false;
        this.showSuccessMessage('Payheads assigned successfully!');
      } catch (error) {
        console.error('Error assigning payheads:', error);
        this.showErrorMessage('Failed to assign payheads.');
      }
    },

    calculateEarnings(payheads = []) {
      return payheads
        .filter(p => p.type === 'Earnings')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },

    calculateDeductions(payheads = []) {
      return payheads
        .filter(p => p.type === 'Deductions' && !p.isRecurring)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },

    calculateRecurringDeductions(payheads = []) {
      return payheads
        .filter(p => p.isRecurring && !p.appliedThisCycle)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },

    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 3000);
    },

    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 3000);
    },
  },
  created() {
    this.fetchPayheads(); // Fetch payheads when the component is created
  },
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

/* Toast Notifications (if you want to show them here) */
.fixed.bottom-2.right-2.z-50.space-y-2 {
  position: fixed;
  bottom: 0.5rem;
  right: 0.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transform.ease-out.duration-300.transition {
  transition: all 300ms ease-out;
}

.translate-y-2.opacity-0.sm\:translate-y-0.sm\:translate-x-2 {
  transform: translateY(0.5rem);
  opacity: 0;
}

.translate-y-0.opacity-100.sm\:translate-x-0 {
  transform: translateY(0);
  opacity: 1;
}

.transition.ease-in.duration-100 {
  transition: all 100ms ease-in;
}

.opacity-100 {
  opacity: 1;
}

.opacity-0 {
  opacity: 0;
}

.transition.duration-500 {
  transition: all 500ms;
}

.max-w-xs.w-full.bg-white.rounded-md.shadow-lg {
  max-width: 20rem;
  width: 100%;
  background-color: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.pointer-events-auto {
  pointer-events: auto;
}

.ring-1.ring-black.ring-opacity-5.overflow-hidden {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.p-2 {
  padding: 0.5rem;
}

.flex.items-center {
  display: flex;
  align-items: center;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}

.ml-2.flex-1 {
  margin-left: 0.5rem;
  flex: 1 1 0%;
}

.text-xs.font-medium.text-gray-900 {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  color: #111827;
}

.ml-2.flex-shrink-0.rounded-sm.text-gray-400.hover\:text-gray-500 {
  margin-left: 0.5rem;
  flex-shrink: 0;
  border-radius: 0.125rem;
  color: #9ca3af;
}

.ml-2.flex-shrink-0.rounded-sm.text-gray-400.hover\:text-gray-500:hover {
  color: #6b7280;
}

.focus\:outline-none.focus\:ring-1.focus\:ring-blue-500 {
  outline: none;
}

.focus\:outline-none.focus\:ring-1.focus\:ring-blue-500:focus {
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>