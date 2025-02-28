<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
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
        <button
          @click="refreshData"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div class="bg-white p-5 rounded-xl shadow-md">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Employee Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Hourly Rate
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Total Earnings
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Total Deductions
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Net Salary
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Salary Month
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="employee in paginatedEmployees"
              :key="employee.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ employee.name }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                ₱{{ employee.hourlyRate.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                ₱{{ employee.totalEarnings.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                ₱{{ employee.totalDeductions.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 font-bold">
                ₱{{ employee.totalSalary.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ employee.salaryMonth }}
              </td>
              <td class="px-6 py-4 text-sm font-medium flex gap-2">
                <button
                  @click="generatePayslip(employee)"
                  class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                  :disabled="
                    payslipGenerationStatus[employee.id]?.generating ||
                    isLoading
                  "
                >
                  <span class="material-icons">description</span>
                  {{
                    payslipGenerationStatus[employee.id]?.generating
                      ? 'Generating...'
                      : 'Generate'
                  }}
                </button>
                <button
                  @click="viewPayslip(employee)"
                  class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                  :disabled="isLoading || !hasPayslip(employee)"
                >
                  <span class="material-icons">visibility</span>
                  View
                </button>

              </td>
            </tr>
            <tr v-if="paginatedEmployees.length === 0 && !isLoading">
              <td
                colspan="7"
                class="px-6 py-4 text-center text-sm text-gray-500"
              >
                No employees found for this month.
              </td>
            </tr>
            <tr v-if="isLoading">
              <td
                colspan="7"
                class="px-6 py-4 text-center text-sm text-gray-500"
              >
                Loading employees...
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
              Payslip for {{ selectedEmployee.name }} -
              {{ selectedEmployee.salaryMonth }}
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
              Error loading payslip. Please ensure the payslip is generated
              correctly or try again.
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="statusMessage"
        :class="
          statusMessage.includes('successfully')
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        "
        class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50"
      >
        {{ statusMessage }}
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
  name: 'SalarySlips',
  data() {
    return {
      employees: [],
      searchQuery: '',
      selectedMonth: new Date().toISOString().slice(0, 7),
      currentPage: 1,
      itemsPerPage: 5,
      payslipGenerationStatus: {},
      isLoading: false,
      statusMessage: '',
      minimumWage: 610, // NCR minimum wage for 2025
      deMinimisLimit: 10000, // De minimis limit for 2025
      showPayslipModal: false,
      selectedEmployee: null,
      payslipDataUrl: '',
      iframeError: false,
      payslips: {}, // Store payslip URLs locally for viewing
      regularHolidays: [
        '01/01/2025', '04/09/2025', '04/17/2025', '04/18/2025', '05/01/2025',
        '06/12/2025', '08/25/2025', '11/30/2025', '12/25/2025', '12/30/2025'
      ],
      specialNonWorkingDays: ['02/08/2025', '04/19/2025', '08/26/2025']
    };
  },
  computed: {
    filteredEmployees() {
      return this.employees.filter((employee) =>
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
        const response = await axios.get('http://localhost:7777/api/employees', {
          params: { month: this.selectedMonth }
        });
        this.employees = response.data.map((employee) => ({
          id: employee.id,
          empNo: employee.empNo || 'N/A',
          name: `${employee.firstName} ${employee.lastName}`,
          lastName: employee.lastName || 'N/A',
          middleName: employee.middleName || 'N/A',
          firstName: employee.firstName || 'N/A',
          birthDate: employee.birthDate || 'N/A',
          hireDate: employee.hireDate || 'N/A',
          civilStatus: employee.civilStatus || 'SINGLE',
          dependents: employee.dependents || 0, // Default to 0 if undefined
          sss: employee.sss || 'N/A',
          tin: employee.tin || 'N/A',
          philhealth: employee.philhealth || 'N/A',
          hdmf: employee.hdmf || 'N/A',
          hourlyRate: employee.hourlyRate || (employee.salary / (8 * 22)) || 0, // Default to 0 if undefined
          totalEarnings: employee.totalEarnings || this.calculateTotalEarnings(employee) || 0,
          totalDeductions: employee.totalDeductions || this.calculateTotalDeductions(employee) || 0,
          totalSalary: employee.netSalary || this.calculateNetSalary(employee) || 0,
          salaryMonth: this.formatSalaryMonth(this.selectedMonth),
          email: employee.email,
          position: employee.position,
          rawData: employee
        }));
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
      const monthlySalary = (employee.salary || 0) || 0; // Ensure salary is a number, default to 0
      const holidayPay = this.calculateHolidayPay(employee) || 0;
      const overtimePay = this.calculateOvertimePay(employee) || 0;
      const taxableSupplementary = (this.calculateSupplementaryIncome(employee)?.taxable || 0) || 0;

      return monthlySalary + baseEarnings + holidayPay + overtimePay + taxableSupplementary || 0;
    },
    calculateSupplementaryIncome(employee) {
      const commission = (employee.commission || 0) || 0;
      const profitSharing = (employee.profitSharing || 0) || 0;
      const fees = (employee.fees || 0) || 0;
      const thirteenthMonthPay = (employee.thirteenthMonthPay || 0) || 0;
      const hazardPay = (employee.hazardPay || 0) || 0;
      const overtimePay = (this.calculateOvertimePay(employee) || 0) || 0;
      const otherTaxable = (employee.otherTaxable || 0) || 0;

      const totalSupplementary = commission + profitSharing + fees + thirteenthMonthPay + hazardPay + overtimePay + otherTaxable;
      const exemptThirteenthMonth = Math.min(thirteenthMonthPay, 90000) || 0;
      const taxableThirteenthMonth = Math.max(0, thirteenthMonthPay - 90000) || 0;

      const taxableSupplementaryIncome = commission + profitSharing + fees + taxableThirteenthMonth + hazardPay + overtimePay + otherTaxable;

      return {
        taxable: taxableSupplementaryIncome || 0,
        nonTaxable: exemptThirteenthMonth || 0,
        commission: commission || 0,
        profitSharing: profitSharing || 0,
        fees: fees || 0,
        thirteenthMonthPay: taxableThirteenthMonth || 0,
        hazardPay: hazardPay || 0,
        overtimePay: overtimePay || 0,
        otherTaxable: otherTaxable || 0,
        totalSupplementary: totalSupplementary || 0
      };
    },
    calculateNonTaxableIncome(employee) {
      const isMWE = (employee.salary / 30) <= this.minimumWage;
      const basicSalaryMWE = isMWE ? (employee.salary || 0) : 0;
      const holidayPayMWE = isMWE ? (this.calculateHolidayPay(employee) || 0) : 0;
      const overtimePayMWE = isMWE ? (this.calculateOvertimePay(employee) || 0) : 0;
      const nightShiftDiffMWE = isMWE ? (employee.nightShiftDiff || 0) : 0;
      const hazardPayMWE = isMWE ? (employee.hazardPay || 0) : 0;
      const thirteenthMonthExempt = Math.min((employee.thirteenthMonthPay || 0), 90000) || 0;
      const deMinimis = Math.min((employee.deMinimis || 0), this.deMinimisLimit) || 0;
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
    calculateTotalDeductions(employee) {
      const sssContribution = (this.calculateSSSContribution(employee.salary) || 0) || 0;
      const philhealthContribution = (this.calculatePhilHealthContribution(employee.salary) || 0) || 0;
      const pagibigContribution = (this.calculatePagIBIGContribution(employee.salary) || 0) || 0;
      const withholdingTax = (this.calculateWithholdingTax(employee) || 0) || 0;

      return sssContribution + philhealthContribution + pagibigContribution + withholdingTax || 0;
    },
    calculateNetSalary(employee) {
      const totalEarnings = (this.calculateTotalEarnings(employee) || 0) || 0;
      const totalDeductions = (this.calculateTotalDeductions(employee) || 0) || 0;

      return totalEarnings - totalDeductions || 0;
    },
    calculateHolidayPay(employee) {
      const dailyRate = ((employee.salary || 0) / 30) || 0;
      const salaryMonth = this.formatSalaryMonth(this.selectedMonth).split(' ')[0]; // Get month (e.g., "April")
      const regularHolidays = this.regularHolidays || [];
      const specialNonWorkingDays = this.specialNonWorkingDays || [];
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
    formatSalaryMonth(month) {
      const date = new Date(month + '-01');
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    async generatePayslip(employee) {
      this.payslipGenerationStatus[employee.id] = { generating: true };
      this.statusMessage = '';
      try {
        const payslipData = this.createPayslipData(employee);
        const pdfBlob = await this.generatePdf(payslipData);
        const url = URL.createObjectURL(pdfBlob);
        this.payslips[employee.id] = url;
        this.showSuccessMessage(`Payslip generated for ${employee.name}!`);
      } catch (error) {
        console.error('Error generating payslip:', error);
        this.showErrorMessage(`Failed to generate payslip for ${employee.name}.`);
      } finally {
        this.payslipGenerationStatus[employee.id] = { generating: false };
      }
    },
    createPayslipData(employee) {
      const salaryDate = moment(employee.salaryMonth, 'MM/YYYY').format('MM/DD/YYYY');
      const basicSalary = (employee.rawData.salary || 0) || 0;
      const sss = (this.calculateSSSContribution(employee.rawData.salary) || 0) || 0;
      const philhealth = (this.calculatePhilHealthContribution(employee.rawData.salary) || 0) || 0;
      const hdmf = (this.calculatePagIBIGContribution(employee.rawData.salary) || 0) || 0;
      const totalDeductions = (sss + philhealth + hdmf + (this.calculateWithholdingTax(employee) || 0)) || 0;
      const netSalary = (employee.totalSalary || this.calculateNetSalary(employee) || 0) || 0;
      const paidLeavesDays = (employee.paidLeaves?.days || 1) || 0;
      const absencesDays = (employee.absences?.days || 1) || 0;
      const paidLeavesAmount = (employee.paidLeaves?.amount || 568.18) || 0;
      const absencesAmount = -((employee.absences?.amount || 568.18) || 0);

      return {
        salaryDate,
        empNo: employee.empNo || '202220308',
        lastName: employee.lastName || 'TAMSM',
        middleName: employee.middleName || 'LEDESMA',
        firstName: employee.firstName || 'MOHAMMED ZIN',
        birthDate: moment(employee.birthDate).format('MM/DD/YYYY') || '07/22/1998',
        hireDate: moment(employee.hireDate).format('MM/DD/YYYY') || '03/28/2022',
        civilStatus: employee.civilStatus || 'SINGLE',
        dependents: (employee.dependents || 0) || 0,
        sss: employee.sss || '10-13386313-6',
        tin: employee.tin || '444-340-756',
        philhealth: employee.philhealth || '01-052343921-4',
        hdmf: employee.hdmf || '121249288489',
        position: employee.position || 'DIGITAL CREATOR II',
        basicSalary: this.formatNumber(basicSalary),
        totalDeductions: this.formatNumber(totalDeductions),
        netSalary: this.formatNumber(netSalary),
        sssDeduction: this.formatNumber(sss),
        philhealthDeduction: this.formatNumber(philhealth),
        hdmfDeduction: this.formatNumber(hdmf),
        paidLeavesDays: paidLeavesDays || 0,
        absencesDays: absencesDays || 0,
        paidLeavesAmount: this.formatNumber(paidLeavesAmount),
        absencesAmount: this.formatNumber(absencesAmount),
        withholdingTax: this.formatNumber(this.calculateWithholdingTax(employee) || 0)
      };
    },
    formatNumber(value) {
      // Ensure value is a number, default to 0 if NaN or undefined
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
      addFormattedText(doc, 'Salary PHP', 120, y); addFormattedText(doc, `Php${payslipData.netSalary}`, 150, y); // Match SSS, TIN, Philhealth, HDMF alignment
      y += lineHeight; addFormattedText(doc, 'Total Misc', leftMargin, y); addFormattedText(doc, 'Php0.00', leftMargin + 50, y);

      // Deductions (left-aligned)
      y += lineHeight + 5;
      addFormattedText(doc, 'Deductions', leftMargin, y, { fontSize: 14, fontStyle: 'bold' });
      y += lineHeight; addFormattedText(doc, 'SSS', leftMargin, y); addFormattedText(doc, `Php${payslipData.sssDeduction}`, leftMargin + 50, y);
      addFormattedText(doc, 'Withholding Tax', 120, y); addFormattedText(doc, `Php${payslipData.withholdingTax}`, 150, y); // Match SSS, TIN, Philhealth, HDMF alignment
      y += lineHeight; addFormattedText(doc, 'Philhealth', leftMargin, y); addFormattedText(doc, `Php${payslipData.philhealthDeduction}`, leftMargin + 50, y);
      y += lineHeight; addFormattedText(doc, 'HDMF', leftMargin, y); addFormattedText(doc, `Php${payslipData.hdmfDeduction}`, leftMargin + 50, y);

      // Miscellaneous Computations (left-aligned, table remains left-aligned by default)
      y += lineHeight + 5;
      addFormattedText(doc, 'Miscellaneous', leftMargin, y, { fontSize: 14, fontStyle: 'bold' });
      y += lineHeight; addFormattedText(doc, 'Computations', leftMargin, y);
      doc.autoTable({
        startY: y + 5,
        head: [['Description', 'description2', 'Amount']],
        body: [
          ['Paid Leaves', `${payslipData.paidLeavesDays} day(s)`, `Php${payslipData.paidLeavesAmount}`],
          ['Absences', `${payslipData.absencesDays} day(s)`, `Php${payslipData.absencesAmount}`]
        ],
        theme: 'grid',
        styles: { fontSize: 12, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 70 }, // Wider description column
          1: { cellWidth: 50 }, // Narrower description2 column
          2: { cellWidth: 50, halign: 'right' } // Wider amount column
        }
      });

      // Footer
      addFormattedText(doc, 'This being a computer generated payslip, no signature required.', doc.internal.pageSize.getWidth() / 2, 270, { fontSize: 10, align: 'center' });

      const pdfBlob = doc.output('blob');
      return pdfBlob;
    },
    viewPayslip(employee) {
      this.selectedEmployee = employee;
      const payslipUrl = this.payslips[employee.id];
      if (payslipUrl) {
        this.payslipDataUrl = payslipUrl;
        this.showPayslipModal = true;
        this.iframeError = false;
        this.showSuccessMessage(`Viewing payslip for ${employee.name} for ${employee.salaryMonth}`);
      } else {
        this.showErrorMessage(`No payslip found for ${employee.name} for ${employee.salaryMonth}. Please generate it first.`);
      }
    },
    hasPayslip(employee) {
      return !!this.payslips[employee.id];
    },
    async sendPayslipEmail(employee) {
      this.payslipGenerationStatus[employee.id] = { sending: true };
      this.statusMessage = '';
      try {
        if (!this.payslips[employee.id]) {
          await this.generatePayslip(employee);
        }
        const payslipData = this.payslips[employee.id].split(',')[1]; // Extract Base64 data
        if (!payslipData) throw new Error('Invalid payslip data');

        const response = await axios.post('http://localhost:7777/api/payslips/send-email', {
          employeeId: employee.id,
          employeeEmail: employee.email,
          payslipData: `data:application/pdf;base64,${payslipData}`,
          salaryMonth: employee.salaryMonth
        });

        if (response.status === 200) {
          this.showSuccessMessage(`Payslip email sent to ${employee.name} at ${employee.email}`);
        }
      } catch (error) {
        console.error('Error sending payslip email:', error);
        this.showErrorMessage(`Failed to send payslip email to ${employee.name}: ${error.message}`);
      } finally {
        this.payslipGenerationStatus[employee.id] = { sending: false };
      }
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
      setTimeout(() => {
        this.statusMessage = '';
      }, 3000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => {
        this.statusMessage = '';
      }, 5000);
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