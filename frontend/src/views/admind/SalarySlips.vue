<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header with Search, Month Picker, and Refresh -->
      <div class="flex justify-between items-center mb-4 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Employee..."
          class="border rounded-lg px-4 py-2 w-1/3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <input
          v-model="selectedMonth"
          type="month"
          class="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          @change="fetchEmployees"
        />
        <button @click="refreshData" 
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                :disabled="isLoading">
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <!-- Salary Table -->
      <div class="bg-white p-5 rounded-xl shadow-md">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Deductions</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary Month</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in paginatedEmployees" :key="employee.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">{{ employee.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">₱{{ employee.totalEarnings.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">₱{{ employee.totalDeductions.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 font-bold">₱{{ employee.totalSalary.toLocaleString() }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ employee.salaryMonth }}</td>
              <td class="px-6 py-4 text-sm font-medium flex gap-2">
                <button @click="generatePayslip(employee)" 
                        class="bg-green-50 text-green-600 font-semibold py-1.5 px-3 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center gap-2 text-xs"
                        :disabled="payslipGenerationStatus[employee.id]?.generating || isLoading">
                  <span class="material-icons text-green-600">description</span> 
                  {{ payslipGenerationStatus[employee.id]?.generating ? 'Generating...' : 'Generate' }}
                </button>
                <button @click="sendPayslipEmail(employee)" 
                        class="bg-blue-50 text-blue-600 font-semibold py-1.5 px-3 rounded-lg hover:bg-blue-100 transition-all duration-200 flex items-center gap-2 text-xs"
                        :disabled="payslipGenerationStatus[employee.id]?.sending || isLoading">
                  <span class="material-icons text-blue-600">email</span> 
                  {{ payslipGenerationStatus[employee.id]?.sending ? 'Sending...' : 'Send Email' }}
                </button>
              </td>
            </tr>
            <tr v-if="paginatedEmployees.length === 0 && !isLoading">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No employees found for this month.</td>
            </tr>
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">Loading employees...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="flex justify-center items-center mt-4 gap-4">
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

      <!-- Status Message -->
      <div v-if="statusMessage" 
           :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
           class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';

export default {
  name: 'SalarySlips',
  data() {
    return {
      employees: [],
      searchQuery: '',
      selectedMonth: new Date().toISOString().slice(0, 7), // Default to current month (YYYY-MM)
      currentPage: 1,
      itemsPerPage: 5,
      payslipGenerationStatus: {}, // Plain object initialized in data
      isLoading: false,
      statusMessage: ''
    };
  },
  computed: {
    filteredEmployees() {
      return this.employees.filter(employee =>
        employee.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage) || 1;
    },
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredEmployees.slice(start, end);
    }
  },
  created() {
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      this.isLoading = true;
      this.statusMessage = '';
      try {
        const response = await axios.get('http://localhost:7777/api/employees');
        this.employees = response.data.map(employee => ({
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          totalEarnings: this.calculateTotalEarnings(employee),
          totalDeductions: this.calculateTotalDeductions(employee),
          totalSalary: this.calculateNetSalary(employee),
          salaryMonth: this.formatSalaryMonth(this.selectedMonth),
          email: employee.email,
          position: employee.position,
          rawData: employee // Store raw data for detailed payslip generation
        })) || [];
        this.showSuccessMessage('Employees loaded successfully!');
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showErrorMessage('Failed to load employees. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
    async refreshData() {
      await this.fetchEmployees();
    },
    calculateTotalEarnings(employee) {
      const baseEarnings = (employee.earnings?.travelExpenses || 0) + (employee.earnings?.otherEarnings || 0);
      const payheadEarnings = employee.payheads
        ?.filter(p => p.type === 'Earnings')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return (employee.salary || 0) + baseEarnings + payheadEarnings;
    },
    calculateTotalDeductions(employee) {
      // Only include payheads with type 'Deductions'
      const payheadDeductions = employee.payheads
        ?.filter(p => p.type === 'Deductions')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return payheadDeductions;
    },
    calculateNetSalary(employee) {
      return this.calculateTotalEarnings(employee) - this.calculateTotalDeductions(employee);
    },
    formatSalaryMonth(month) {
      const [year, monthNum] = month.split('-');
      return `${monthNum}/01/${year}`; // Format as MM/DD/YYYY starting at 1st of month
    },
    async generatePayslip(employee) {
      this.payslipGenerationStatus[employee.id] = { generating: true };
      this.statusMessage = '';
      try {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Payslip', 20, 20);
        doc.setFontSize(12);
        doc.text(`Employee ID: ${employee.id}`, 20, 30);
        doc.text(`Name: ${employee.name}`, 20, 40);
        doc.text(`Position: ${employee.position}`, 20, 50);
        doc.text(`Salary Month: ${employee.salaryMonth}`, 20, 60);
        doc.text(`SSS ID: ${employee.rawData.sss || 'Not provided'}`, 20, 70);
        doc.text(`PhilHealth ID: ${employee.rawData.philhealth || 'Not provided'}`, 20, 80);
        doc.text(`Pag-IBIG ID: ${employee.rawData.pagibig || 'Not provided'}`, 20, 90);
        
        // Detailed Earnings
        doc.text('Earnings:', 20, 110);
        let yPos = 120;
        doc.text(`Base Salary: ₱${(employee.rawData.salary || 0).toLocaleString()}`, 20, yPos);
        yPos += 10;
        if (employee.rawData.earnings.travelExpenses) {
          doc.text(`Travel Expenses: ₱${employee.rawData.earnings.travelExpenses.toLocaleString()}`, 20, yPos);
          yPos += 10;
        }
        if (employee.rawData.earnings.otherEarnings) {
          doc.text(`Other Earnings: ₱${employee.rawData.earnings.otherEarnings.toLocaleString()}`, 20, yPos);
          yPos += 10;
        }
        employee.rawData.payheads?.filter(p => p.type === 'Earnings').forEach(payhead => {
          doc.text(`${payhead.name}: ₱${payhead.amount.toLocaleString()}`, 20, yPos);
          yPos += 10;
        });
        doc.text(`Total Earnings: ₱${employee.totalEarnings.toLocaleString()}`, 20, yPos);
        yPos += 20;

        // Detailed Deductions (Only payheads)
        doc.text('Deductions:', 20, yPos);
        yPos += 10;
        employee.rawData.payheads?.filter(p => p.type === 'Deductions').forEach(payhead => {
          doc.text(`${payhead.name}: ₱${payhead.amount.toLocaleString()}`, 20, yPos);
          yPos += 10;
        });
        doc.text(`Total Deductions: ₱${employee.totalDeductions.toLocaleString()}`, 20, yPos);
        yPos += 20;

        // Net Salary
        doc.text(`Net Salary: ₱${employee.totalSalary.toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);

        const pdfBlob = doc.output('blob');
        const reader = new FileReader();
        
        // Return a promise to ensure payslipData is set before proceeding
        const base64data = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(pdfBlob);
        });

        console.log('Generated payslipData:', base64data.slice(0, 50) + '...');
        localStorage.setItem(`payslip_${employee.id}_${employee.salaryMonth}`, base64data);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `payslip-${employee.name}-${employee.salaryMonth}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await axios.post('http://localhost:7777/api/payslips/generate', {
          employeeId: employee.id,
          payslipData: base64data,
          salaryMonth: employee.salaryMonth
        });

        this.showSuccessMessage(`Payslip generated for ${employee.name}`);
      } catch (error) {
        console.error('Error generating payslip:', error);
        this.showErrorMessage(`Failed to generate payslip for ${employee.name}`);
      } finally {
        this.payslipGenerationStatus[employee.id] = { generating: false };
      }
    },
    async sendPayslipEmail(employee) {
      this.payslipGenerationStatus[employee.id] = { sending: true };
      this.statusMessage = '';
      try {
        const payslipKey = `payslip_${employee.id}_${employee.salaryMonth}`;
        let payslipData = localStorage.getItem(payslipKey);

        if (!payslipData) {
          await this.generatePayslip(employee);
          payslipData = localStorage.getItem(payslipKey);
        }

        // Debug the payslipData format
        console.log('Payslip data being sent:', payslipData ? payslipData.slice(0, 50) + '...' : 'null');

        // Ensure payslipData is valid
        if (!payslipData || typeof payslipData !== 'string' || !payslipData.startsWith('data:application/pdf;base64,')) {
          throw new Error('Invalid or missing payslipData');
        }

        const response = await axios.post('http://localhost:7777/api/payslips/send-email', {
          employeeId: employee.id,
          employeeEmail: employee.email,
          payslipData,
          salaryMonth: employee.salaryMonth
        });

        if (response.status === 200) {
          this.showSuccessMessage(`Payslip email sent to ${employee.name} at ${employee.email}`);
        }
      } catch (error) {
        console.error('Error sending payslip email:', error);
        if (error.response) {
          console.error('Server response:', error.response.data);
          this.showErrorMessage(`Failed to send payslip email to ${employee.name}: ${error.response.data.message || 'Unknown error'}`);
        } else {
          this.showErrorMessage(`Failed to send payslip email to ${employee.name}: ${error.message}`);
        }
      } finally {
        this.payslipGenerationStatus[employee.id] = { sending: false };
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
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
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}
</style>