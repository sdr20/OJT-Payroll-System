<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-2xl font-semibold mb-6 text-gray-900">My Salary Slip</h2>

        <table v-if="employee" class="min-w-full border border-gray-300">
          <thead class="bg-gray-200">
            <tr>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50">
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.id }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.name }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">₱{{ employee.totalEarnings.toLocaleString() }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">₱{{ employee.totalDeductions.toLocaleString() }}</td>
              <td class="border px-4 py-2 text-sm font-bold text-gray-900">₱{{ employee.totalSalary.toLocaleString() }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.salaryMonth }}</td>
              <td class="border px-4 py-2 text-sm">
                <button 
                  @click="generatePayslip" 
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition-all duration-200 mr-2"
                  :disabled="isGenerating"
                >
                  {{ isGenerating ? 'Generating...' : 'Generate Payslip' }}
                </button>
                <button 
                  @click="sendPayslipEmail" 
                  class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition-all duration-200"
                  :disabled="isSending"
                >
                  {{ isSending ? 'Sending...' : 'Send Email' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading/Error State -->
        <div v-else class="text-center py-8 text-gray-500">
          {{ errorMessage || 'Loading employee data...' }}
        </div>

        <!-- Status Message -->
        <div 
          v-if="statusMessage" 
          :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
          class="mt-4 p-3 rounded-lg text-center"
        >
          {{ statusMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';

export default {
  name: 'EmployeeSalarySlip',
  data() {
    return {
      employee: null,
      isGenerating: false,
      isSending: false,
      statusMessage: '',
      errorMessage: ''
    };
  },
  mounted() {
    this.fetchEmployeeData();
  },
  methods: {
    async fetchEmployeeData() {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          this.errorMessage = 'User not logged in. Redirecting to login...';
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
          return;
        }

        const response = await axios.get(`http://localhost:7777/api/employees/${userId}/salary`);
        if (!response.data) {
          throw new Error('No salary data returned from server');
        }
        this.employee = response.data;
      } catch (error) {
        console.error('Error fetching employee data:', error);
        this.errorMessage = 'Failed to load salary slip. Please check your connection or try again later.';
        this.employee = null; // Ensure employee stays null to show error state
      }
    },
    async generatePayslip() {
      if (!this.employee) {
        this.statusMessage = 'No employee data available to generate payslip.';
        setTimeout(() => this.statusMessage = '', 3000);
        return;
      }

      this.isGenerating = true;
      this.statusMessage = '';
      try {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Salary Slip', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`ID: ${this.employee.id}`, 20, 40);
        doc.text(`Name: ${this.employee.name}`, 20, 50);
        doc.text(`Period: ${this.employee.salaryMonth}`, 20, 60);
        doc.text(`Total Earnings: ₱${this.employee.totalEarnings.toLocaleString()}`, 20, 70);
        doc.text(`Total Deductions: ₱${this.employee.totalDeductions.toLocaleString()}`, 20, 80);
        doc.text(`Net Salary: ₱${this.employee.totalSalary.toLocaleString()}`, 20, 90);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 100);

        const pdfBlob = doc.output('blob');
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onloadend = async () => {
          const base64data = reader.result;

          localStorage.setItem(`payslip_${this.employee.id}_${this.employee.salaryMonth}`, base64data);

          const link = document.createElement('a');
          link.href = URL.createObjectURL(pdfBlob);
          link.download = `payslip-${this.employee.name}-${this.employee.salaryMonth}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          await axios.post(`http://localhost:7777/api/payslips/generate`, {
            employeeId: this.employee.id,
            payslipData: base64data,
            salaryMonth: this.employee.salaryMonth
          });

          this.statusMessage = 'Payslip generated successfully!';
        };
      } catch (error) {
        console.error('Error generating payslip:', error);
        this.statusMessage = 'Failed to generate payslip. Please try again.';
      } finally {
        this.isGenerating = false;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    },
    async sendPayslipEmail() {
      if (!this.employee) {
        this.statusMessage = 'No employee data available to send payslip.';
        setTimeout(() => this.statusMessage = '', 3000);
        return;
      }

      this.isSending = true;
      this.statusMessage = '';
      try {
        const payslipKey = `payslip_${this.employee.id}_${this.employee.salaryMonth}`;
        let payslipData = localStorage.getItem(payslipKey);

        if (!payslipData) {
          await this.generatePayslip();
          payslipData = localStorage.getItem(payslipKey);
        }

        const response = await axios.post(`http://localhost:7777/api/payslips/send-email`, {
          employeeId: this.employee.id,
          employeeEmail: this.employee.email,
          payslipData: payslipData,
          salaryMonth: this.employee.salaryMonth
        });

        if (response.status === 200) {
          this.statusMessage = 'Payslip sent to your email successfully!';
        }
      } catch (error) {
        console.error('Error sending payslip email:', error);
        this.statusMessage = 'Failed to send payslip email. Please try again.';
      } finally {
        this.isSending = false;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    }
  }
};
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

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