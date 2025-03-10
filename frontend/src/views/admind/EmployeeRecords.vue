<template>
  <div class="min-h-screen p-1">
    <div class="max-w-8xl mx-auto">
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900">My Salary Slip</h2>
          <input
            v-model="selectedMonth"
            type="month"
            class="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            @change="fetchEmployeeData"
          />
        </div>

        <table v-if="employee" class="min-w-full border border-gray-300">
          <thead class="bg-gray-200">
            <tr>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hourly Rate</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Deductions</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50">
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.id }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.name }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">₱{{ employee.hourlyRate.toLocaleString() }}</td>
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
                  @click="viewPayslip" 
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-all duration-200"
                  :disabled="!payslipDataUrl || isGenerating"
                >
                  View Payslip
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading/Error State -->
        <div v-else class="text-center py-8 text-gray-500">
          {{ errorMessage || 'Loading employee data...' }}
        </div>

        <!-- Payslip Viewer Modal -->
        <div
          v-if="showPayslipModal"
          class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div
            class="bg-white rounded-xl shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto"
          >
            <div class="p-6 border-b flex justify-between items-center">
              <h2 class="text-2xl font-bold text-gray-800">
                Payslip for {{ employee.name }} - {{ employee.salaryMonth }}
              </h2>
              <button
                @click="showPayslipModal = false"
                class="text-gray-500 hover:text-gray-700"
              >
                <span class="material-icons-outlined">close</span>
              </button>
            </div>
            <div class="p-6">
              <iframe
                :src="payslipDataUrl"
                class="w-full h-[70vh]"
                frameborder="0"
                @load="onIframeLoad"
                @error="onIframeError"
              ></iframe>
              <p v-if="iframeError" class="text-red-500 text-sm mt-2">
                Error loading payslip. Please ensure the payslip is generated correctly or try again.
              </p>
            </div>
          </div>
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
import autoTable from 'jspdf-autotable'; // Use default import for compatibility
import moment from 'moment'; // Import moment.js for date formatting

// Extend jsPDF with autoTable plugin
jsPDF.prototype.autoTable = autoTable.default;

export default {
  name: 'EmployeeSalarySlip',
  data() {
    return {
      employee: null,
      selectedMonth: new Date().toISOString().slice(0, 7),
      isGenerating: false,
      statusMessage: '',
      errorMessage: '',
      showPayslipModal: false,
      payslipDataUrl: '',
      iframeError: false,
      payslips: {} // Store payslip URLs locally for viewing
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

        const response = await axios.get(`http://localhost:7777/api/employees/${userId}/salary`, {
          params: { month: this.selectedMonth }
        });
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
        const payslipData = this.createPayslipData(this.employee);
        const pdfBlob = await this.generatePdf(payslipData);
        const url = URL.createObjectURL(pdfBlob);
        this.payslips[`${this.employee.id}_${this.employee.salaryMonth}`] = url;
        this.payslipDataUrl = url;
        this.showSuccessMessage('Payslip generated successfully!');
      } catch (error) {
        console.error('Error generating payslip:', error);
        this.statusMessage = 'Failed to generate payslip. Please try again.';
      } finally {
        this.isGenerating = false;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    },
    viewPayslip() {
      if (!this.payslipDataUrl) {
        this.statusMessage = 'Please generate the payslip first.';
        setTimeout(() => this.statusMessage = '', 3000);
        return;
      }
      this.showPayslipModal = true;
      this.iframeError = false;
      this.showSuccessMessage(`Viewing payslip for ${this.employee.name} for ${this.employee.salaryMonth}`);
    },
    createPayslipData(employee) {
      const salaryDate = moment(employee.salaryMonth, 'MM/YYYY').format('MM/DD/YYYY');
      const basicSalary = (employee.salary || 0) || 0;
      const sss = this.calculateSSSContribution(employee.salary) || 0;
      const philhealth = this.calculatePhilHealthContribution(employee.salary) || 0;
      const hdmf = this.calculatePagIBIGContribution(employee.salary) || 0;
      const totalDeductions = (sss + philhealth + hdmf + (this.calculateWithholdingTax(employee) || 0)) || 0;
      const netSalary = (employee.totalSalary || this.calculateNetSalary(employee) || 0) || 0;

      return {
        salaryDate,
        id: employee.id,
        name: employee.name,
        hourlyRate: employee.hourlyRate || (employee.salary / (8 * 22)) || 0,
        totalEarnings: employee.totalEarnings || 0,
        totalDeductions: totalDeductions,
        totalSalary: netSalary,
        salaryMonth: employee.salaryMonth,
        empNo: employee.empNo || 'N/A',
        lastName: employee.lastName || 'N/A',
        middleName: employee.middleName || 'N/A',
        firstName: employee.firstName || 'N/A',
        birthDate: employee.birthDate ? moment(employee.birthDate).format('MM/DD/YYYY') : 'N/A',
        hireDate: employee.hireDate ? moment(employee.hireDate).format('MM/DD/YYYY') : 'N/A',
        civilStatus: employee.civilStatus || 'SINGLE',
        dependents: employee.dependents || 0,
        sss: employee.sss || 'N/A',
        tin: employee.tin || 'N/A',
        philhealth: employee.philhealth || 'N/A',
        hdmf: employee.hdmf || 'N/A',
        position: employee.position || 'N/A',
        basicSalary: this.formatNumber(basicSalary),
        sssDeduction: this.formatNumber(sss),
        philhealthDeduction: this.formatNumber(philhealth),
        hdmfDeduction: this.formatNumber(hdmf),
        withholdingTax: this.formatNumber(this.calculateWithholdingTax(employee) || 0),
        payheads: employee.payheads || [] // Include dynamic payheads
      };
    },
    formatNumber(value) {
      const num = Number(value) || 0;
      return num.toFixed(2);
    },
    async generatePdf(payslipData) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const lineHeight = 8; // Increased vertical spacing for better readability
      const leftMargin = 14; // Standard left margin

      // Helper function to add formatted text
      function addFormattedText(doc, text, x, y, options = {}) {
        doc.setFontSize(options.fontSize || 12); // Default to larger font for readability
        doc.setFont(undefined, options.fontStyle || 'normal');
        doc.setTextColor(options.textColor ? options.textColor[0] : 0, options.textColor ? options.textColor[1] : 0, options.textColor ? options.textColor[2] : 0); // Use array for RGB
        doc.text(text, x, y, { align: options.align || 'left' });
      }

      // Header: RIGHTJOB Solutions in green, PAYSLIP centered
      addFormattedText(doc, 'RIGHTJOB Solutions', leftMargin, 15, { fontSize: 16, fontStyle: 'bold', textColor: [0, 128, 0] });
      addFormattedText(doc, 'PAYSLIP', doc.internal.pageSize.getWidth() / 2, 15, { fontSize: 18, align: 'center' });
      addFormattedText(doc, 'Salary Date', 140, 15, { fontSize: 12 });
      addFormattedText(doc, payslipData.salaryDate, 170, 15, { fontSize: 12 });

      // Line Separator
      doc.line(leftMargin, 20, doc.internal.pageSize.getWidth() - leftMargin, 20);

      // Personal Information
      let y = 30;
      addFormattedText(doc, 'Personal Information', leftMargin, 25, { fontSize: 14, fontStyle: 'bold' });

      // Left Column (Employee Details)
      addFormattedText(doc, 'Emp No.', leftMargin, y); addFormattedText(doc, payslipData.empNo, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Last Name', leftMargin, y); addFormattedText(doc, payslipData.lastName, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Middle Name', leftMargin, y); addFormattedText(doc, payslipData.middleName, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'First Name', leftMargin, y); addFormattedText(doc, payslipData.firstName, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Birth Date', leftMargin, y); addFormattedText(doc, payslipData.birthDate, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Hire Date', leftMargin, y); addFormattedText(doc, payslipData.hireDate, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Position', leftMargin, y); addFormattedText(doc, payslipData.position, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Basic Salary', leftMargin, y); addFormattedText(doc, `Php${payslipData.basicSalary}`, leftMargin + 40, y);

      // Right Column (Additional Info)
      y = 30;
      addFormattedText(doc, 'Civil Status', 120, y); addFormattedText(doc, payslipData.civilStatus, 150, y);
      y += lineHeight; addFormattedText(doc, 'Dependents', 120, y); addFormattedText(doc, payslipData.dependents.toString(), 150, y);
      y += lineHeight * 2; addFormattedText(doc, 'SSS', 120, y); addFormattedText(doc, payslipData.sss, 150, y);
      y += lineHeight; addFormattedText(doc, 'TIN', 120, y); addFormattedText(doc, payslipData.tin, 150, y);
      y += lineHeight; addFormattedText(doc, 'Philhealth', 120, y); addFormattedText(doc, payslipData.philhealth, 150, y);
      y += lineHeight; addFormattedText(doc, 'HDMF', 120, y); addFormattedText(doc, payslipData.hdmf, 150, y);

      // Update y to start Summary immediately after Personal Information (approx. y = 95)
      y = 95;

      // Summary (left-aligned)
      addFormattedText(doc, 'Summary', leftMargin, y, { fontSize: 14, fontStyle: 'bold' });
      y += lineHeight; addFormattedText(doc, 'Total Deductions', leftMargin, y); addFormattedText(doc, `(Php${payslipData.totalDeductions})`, leftMargin + 50, y);
      addFormattedText(doc, 'Salary PHP', 120, y); addFormattedText(doc, `Php${payslipData.totalSalary}`, 150, y); // Match SSS, TIN, Philhealth, HDMF alignment
      y += lineHeight; addFormattedText(doc, 'Total Misc', leftMargin, y); addFormattedText(doc, 'Php0.00', leftMargin + 50, y);

      // Deductions (left-aligned)
      y += lineHeight + 5;
      addFormattedText(doc, 'Deductions', leftMargin, y, { fontSize: 14, fontStyle: 'bold' });
      y += lineHeight; addFormattedText(doc, 'SSS', leftMargin, y); addFormattedText(doc, `Php${payslipData.sssDeduction}`, leftMargin + 50, y);
      addFormattedText(doc, 'Withholding Tax', 120, y); addFormattedText(doc, `Php${payslipData.withholdingTax}`, 150, y); // Match SSS, TIN, Philhealth, HDMF alignment
      y += lineHeight; addFormattedText(doc, 'Philhealth', leftMargin, y); addFormattedText(doc, `Php${payslipData.philhealthDeduction}`, leftMargin + 50, y);
      y += lineHeight; addFormattedText(doc, 'HDMF', leftMargin, y); addFormattedText(doc, `Php${payslipData.hdmfDeduction}`, leftMargin + 50, y);

      // Miscellaneous Computations (dynamic table based on payheads)
      y += lineHeight + 5;
      addFormattedText(doc, 'Miscellaneous', leftMargin, y, { fontSize: 14, fontStyle: 'bold' });
      y += lineHeight; addFormattedText(doc, 'Computations', leftMargin, y);

      const miscTableData = payslipData.payheads.map(payhead => [
        payhead.name,
        payhead.type === 'Earnings' ? `${payhead.amount} day(s)` : '', // Customize description2 based on type
        `Php${this.formatNumber(payhead.amount)}`
      ]);

      doc.autoTable({
        startY: y + 5,
        head: [['Description', 'description2', 'Amount']],
        body: miscTableData,
        theme: 'grid',
        styles: { fontSize: 12, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 70 }, // Description column
          1: { cellWidth: 50 }, // description2 column (optional for Earnings)
          2: { cellWidth: 50, halign: 'right' } // Amount column
        }
      });

      // Footer
      addFormattedText(doc, 'This being a computer generated payslip, no signature required.', doc.internal.pageSize.getWidth() / 2, 270, { fontSize: 10, align: 'center' });

      const pdfBlob = doc.output('blob');
      return pdfBlob;
    },
    onIframeLoad() {
      console.log('iFrame loaded successfully');
      this.iframeError = false;
    },
    onIframeError() {
      console.error('iFrame failed to load');
      this.iframeError = true;
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => this.statusMessage = '', 3000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => this.statusMessage = '', 3000);
    },
    calculateHolidayPay(employee) {
      const dailyRate = ((employee.salary || 0) / 30) || 0;
      const salaryMonth = this.formatSalaryMonth(this.selectedMonth).split(' ')[0]; // Get month (e.g., "April")
      const regularHolidays = [
        '01/01/2025', '04/09/2025', '04/17/2025', '04/18/2025', '05/01/2025',
        '06/12/2025', '08/25/2025', '11/30/2025', '12/25/2025', '12/30/2025'
      ];
      const specialNonWorkingDays = ['02/08/2025', '04/19/2025', '08/26/2025'];
      const isRegularHoliday = regularHolidays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('MMMM') === salaryMonth);
      const isSpecialHoliday = specialNonWorkingDays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('MMMM') === salaryMonth);
      if (isRegularHoliday) return dailyRate * 2 || 0; // DOLE: 200% for worked regular holiday
      if (isSpecialHoliday) return dailyRate * 0.3 || 0; // DOLE: 30% premium for special holiday
      return 0;
    },
    calculateOvertimePay(employee) {
      const hourlyRate = ((employee.hourlyRate || (employee.salary / (8 * 22))) || 0) || 0;
      const regularOTHours = (employee.overtimeHours?.regular || 2) || 0;
      const holidayOTHours = (employee.overtimeHours?.holiday || 1) || 0;
      const regularOTPay = regularOTHours * hourlyRate * 1.25 || 0; // DOLE: 25% OT rate
      const holidayOTPay = holidayOTHours * hourlyRate * 1.3 || 0; // DOLE: 30% OT on holiday/rest day
      return regularOTPay + holidayOTPay || 0;
    },
    calculateSSSContribution(salary) {
      const monthlySalaryCredit = Math.min(Math.max((salary || 0), 5000), 35000) || 0; // SSS MSC cap at ₱35,000 in 2025
      const employeeShareRate = 0.05; // 5% employee share per SSS Circular 2024-06
      return Math.round(monthlySalaryCredit * employeeShareRate) || 0;
    },
    calculatePhilHealthContribution(salary) {
      const rate = 0.05; // 5% total rate in 2025 per PhilHealth Circular
      const monthlySalary = Math.min((salary || 0), 100000) || 0; // Cap at ₱100,000
      return Math.round((monthlySalary * rate) / 2) || 0; // 2.5% employee share
    },
    calculatePagIBIGContribution(salary) {
      const rate = 0.02; // 2% employee share per Pag-IBIG Circular 460
      const cappedSalary = Math.min((salary || 0), 10000) || 0; // Cap at ₱10,000
      return Math.round(cappedSalary * rate) || 0; // Max ₱200
    },
    calculateWithholdingTax(employee) {
      const nonTaxable = this.calculateNonTaxableIncome(employee);
      const taxableIncome = ((this.calculateTotalEarnings(employee) || 0) - (nonTaxable.totalNonTaxable || 0)) || 0;
      if (taxableIncome <= 20833) return 0;
      if (taxableIncome <= 33333) return Math.round((taxableIncome - 20833) * 0.15) || 0; // Bracket 2: 15% over ₱20,833
      if (taxableIncome <= 66667) return Math.round(1875 + (taxableIncome - 33333) * 0.20) || 0; // Bracket 3: ₱1,875 + 20% over ₱33,333
      if (taxableIncome <= 166667) return Math.round(13541.80 + (taxableIncome - 66667) * 0.25) || 0; // Bracket 4: ₱13,541.80 + 25% over ₱66,667
      if (taxableIncome <= 666667) return Math.round(90841.80 + (taxableIncome - 166667) * 0.30) || 0; // Bracket 5: ₱90,841.80 + 30% over ₱166,667
      return Math.round(408841.80 + (taxableIncome - 666667) * 0.35) || 0; // Bracket 6: ₱408,841.80 + 35% over ₱666,667
    },
    calculateNonTaxableIncome(employee) {
      const isMWE = (employee.salary / 30) <= 610; // NCR minimum wage for 2025
      const basicSalaryMWE = isMWE ? (employee.salary || 0) : 0;
      const holidayPayMWE = isMWE ? (this.calculateHolidayPay(employee) || 0) : 0;
      const overtimePayMWE = isMWE ? (this.calculateOvertimePay(employee) || 0) : 0;
      const nightShiftDiffMWE = isMWE ? (employee.nightShiftDiff || 0) : 0;
      const hazardPayMWE = isMWE ? (employee.hazardPay || 0) : 0;
      const thirteenthMonthExempt = Math.min((employee.thirteenthMonthPay || 0), 90000) || 0;
      const deMinimis = Math.min((employee.deMinimis || 0), 10000) || 0; // De minimis limit for 2025
      const sssContribution = (this.calculateSSSContribution(employee.salary) || 0) || 0;
      const philhealthContribution = (this.calculatePhilHealthContribution(employee.salary) || 0) || 0;
      const pagibigContribution = (this.calculatePagIBIGContribution(employee.salary) || 0) || 0;

      const totalNonTaxable = basicSalaryMWE + holidayPayMWE + overtimePayMWE + nightShiftDiffMWE + hazardPayMWE + thirteenthMonthExempt + deMinimis + sssContribution + philhealthContribution + pagibigContribution;

      return {
        basicSalaryMWE: basicSalaryMWE || 0,
        holidayPayMWE: holidayPayMWE || 0,
        overtimePayMWE: overtimePayMWE || 0,
        nightShiftDiffMWE: nightShiftDiffMWE || 0,
        hazardPayMWE: hazardPayMWE || 0,
        thirteenthMonthExempt: thirteenthMonthExempt || 0,
        deMinimis: deMinimis || 0,
        sssContribution: sssContribution || 0,
        philhealthContribution: philhealthContribution || 0,
        pagibigContribution: pagibigContribution || 0,
        totalNonTaxable: totalNonTaxable || 0
      };
    },
    calculateTotalEarnings(employee) {
      const baseEarnings = (employee.earnings?.travelExpenses || 0) + (employee.earnings?.otherEarnings || 0);
      const monthlySalary = (employee.salary || 0) || 0; // Ensure salary is a number, default to 0
      const holidayPay = this.calculateHolidayPay(employee) || 0;
      const overtimePay = this.calculateOvertimePay(employee) || 0;
      const payheadEarnings = this.calculatePayheadEarnings(employee.payheads) || 0;

      return monthlySalary + baseEarnings + holidayPay + overtimePay + payheadEarnings || 0;
    },
    calculateNetSalary(employee) {
      const totalEarnings = this.calculateTotalEarnings(employee) || 0;
      const totalDeductions = this.calculateTotalDeductions(employee) || 0;

      return totalEarnings - totalDeductions || 0;
    },
    calculateTotalDeductions(employee) {
      const sssContribution = this.calculateSSSContribution(employee.salary) || 0;
      const philhealthContribution = this.calculatePhilHealthContribution(employee.salary) || 0;
      const pagibigContribution = this.calculatePagIBIGContribution(employee.salary) || 0;
      const withholdingTax = this.calculateWithholdingTax(employee) || 0;
      const payheadDeductions = this.calculatePayheadDeductions(employee.payheads) || 0;

      return sssContribution + philhealthContribution + pagibigContribution + withholdingTax + payheadDeductions || 0;
    },
    calculatePayheadDeductions(payheads) {
      return payheads
        .filter(p => p.type === 'Deductions')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },
    calculatePayheadEarnings(payheads) {
      return payheads
        .filter(p => p.type === 'Earnings')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined');

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