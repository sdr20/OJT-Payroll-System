<template>
  <div class="vuetify-modal-wrapper">
    <v-dialog
      :value="show"
      max-width="600px"
      persistent
      @input="$emit('update:show', $event)"
      @keydown.esc="closeModal"
    >
      <!-- Rest of the modal content remains unchanged -->
      <v-card>
        <v-card-title class="text-h6 bg-grey-lighten-2">
          Apply Deductions
          <v-spacer></v-spacer>
          <v-btn icon small @click="closeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="deductionForm" @submit.prevent="saveDeductions">
            <!-- Employee Selection -->
            <v-autocomplete
              v-model="selectedEmployees"
              :items="employees"
              item-title="name"
              item-value="id"
              label="Select Employees"
              multiple
              chips
              closable-chips
              :rules="[v => v.length > 0 || 'At least one employee is required']"
              variant="outlined"
              density="compact"
            ></v-autocomplete>

            <!-- Deduction Selection -->
            <v-autocomplete
              v-model="selectedDeductions"
              :items="deductionPayheads"
              item-title="name"
              item-value="id"
              label="Select Deductions"
              multiple
              chips
              closable-chips
              :rules="[v => v.length > 0 || 'At least one deduction is required']"
              variant="outlined"
              density="compact"
              class="mt-4"
            >
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Amount: {{ formatNumber(item.raw.amount) }} | {{ item.raw.isRecurring ? 'Recurring' : 'One-Time' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeModal">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="isSaving"
            :disabled="isSaving"
            @click="saveDeductions"
          >
            Apply Deductions
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
/* Ensure Vuetify styles are preserved within the wrapper */
.vuetify-modal-wrapper :deep(.v-dialog__content) {
  z-index: 1000 !important;
}

.vuetify-modal-wrapper :deep(.v-overlay__scrim) {
  z-index: 999 !important;
}

.bg-grey-lighten-2 {
  background-color: #f5f5f5;
}
</style>

<script>
export default {
  name: 'DeductionModal',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    employees: {
      type: Array,
      default: () => [],
    },
    payheads: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedEmployees: [],
      selectedDeductions: [],
      isSaving: false,
    };
  },
  computed: {
    deductionPayheads() {
      return this.payheads.filter(ph => ph.type === 'Deductions' && ph.amount !== undefined);
    },
  },
  methods: {
    async saveDeductions() {
      if (!this.$refs.deductionForm) {
        this.$emit('error', 'Form is not initialized.');
        return;
      }

      const { valid } = await this.$refs.deductionForm.validate();
      if (!valid) {
        this.$emit('error', 'Please fill in all required fields.');
        return;
      }

      this.isSaving = true;
      try {
        const employees = this.employees.filter(emp => this.selectedEmployees.includes(emp.id));
        const deductions = this.payheads.filter(ph => this.selectedDeductions.includes(ph.id));
        this.$emit('save', {
          selectedEmployees: employees,
          selectedDeductions: deductions,
        });
        this.closeModal();
      } catch (error) {
        console.error('Error saving deductions:', error);
        this.$emit('error', `Failed to apply deductions: ${error.message}`);
      } finally {
        this.isSaving = false;
      }
    },
    closeModal() {
      this.selectedEmployees = [];
      this.selectedDeductions = [];
      if (this.$refs.deductionForm) {
        this.$refs.deductionForm.resetValidation();
      }
      this.$emit('update:show', false);
    },
    formatNumber(number) {
      return Number(number || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  },
};
</script>

<style scoped>
.bg-grey-lighten-2 {
  background-color: #f5f5f5;
}
</style>