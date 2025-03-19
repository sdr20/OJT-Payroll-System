<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div
      class="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isUpdate ? 'Edit Payheads' : 'Add Payheads for Employee' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <span class="material-icons-outlined">close</span>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Selected Employee Info -->
        <div class="bg-gray-100 p-4 rounded-lg">
          <p class="text-sm text-gray-700">
            Employee: {{ selectedEmployee.name || 'N/A' }}
          </p>
          <p class="text-sm text-gray-700">
            Base Salary: ₱{{ (selectedEmployee.salary || 0).toLocaleString() }}
          </p>
          <p class="text-sm text-gray-700">
            Total Payable Salary: ₱{{ (totalPayableSalary || 0).toLocaleString() }}
          </p>
        </div>

        <!-- Available Payheads -->
        <div class="space-y-2" v-if="!isUpdate">
          <h3 class="text-lg font-semibold text-gray-800">Available Payheads</h3>
          <select
            v-model="selectedPayhead"
            class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="isUpdate"
          >
            <option value="" disabled>Select a Payhead</option>
            <option
              v-for="payhead in availablePayheads"
              :key="payhead.id"
              :value="payhead"
            >
              {{ payhead.name }} ({{ payhead.type }}, ₱{{ payhead.amount }}{{ payhead.isRecurring ? ', Recurring' : '' }})
            </option>
          </select>
          <button
            @click="addPayhead"
            class="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            :disabled="!selectedPayhead || isUpdate"
          >
            Add Payhead
          </button>
        </div>

        <!-- Selected Payheads -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-gray-800">Selected Payheads</h3>
          <div
            v-for="(payhead) in selectedEmployeePayheads"
            :key="payhead.uniqueId"
            class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <span>{{ payhead.name }} ({{ payhead.type }}, ₱{{ payhead.amount }}{{ payhead.isRecurring ? ', Recurring' : '' }})</span>
            <div>
              <input
                v-model.number="payhead.amount"
                type="number"
                class="w-24 p-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="updatePayhead(payhead)"
                min="0"
                :disabled="isUpdate"
              />
              <button
                @click="removePayhead(payhead)"
                class="ml-2 p-1 text-red-500 hover:text-red-700"
                :disabled="isUpdate"
              >
                <span class="material-icons-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-4">
        <button
          @click="$emit('close')"
          class="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
        >
          Cancel
        </button>
        <button
          @click="$emit('save')"
          class="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          :disabled="isUpdate" 
        >
          {{ isUpdate ? 'Update Payheads' : 'Save Payheads' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddPayheadModal',
  props: {
    availablePayheads: {
      type: Array,
      required: true
    },
    selectedEmployeePayheads: {
      type: Array,
      required: true
    },
    totalPayableSalary: {
      type: Number,
      default: 0
    },
    selectedEmployee: {
      type: Object,
      required: true
    },
    isUpdate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedPayhead: null
    };
  },
  methods: {
    addPayhead() {
      if (this.selectedPayhead) {
        this.$emit('addPayhead', { ...this.selectedPayhead, uniqueId: Date.now() + Math.random() });
        this.selectedPayhead = null;
      }
    },
    removePayhead(payhead) {
      this.$emit('removePayhead', payhead);
    },
    updatePayhead(payhead) {
      this.$emit('updatePayhead', payhead);
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