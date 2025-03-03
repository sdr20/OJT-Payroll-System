<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search Box -->
          <div class="relative">
            <span class="material-icons absolute left-2 top-2 text-gray-400 text-sm">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search employee by name..."
              class="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <!-- Month Selector -->
          <div class="relative">
            <span class="material-icons absolute left-2 top-2 text-gray-400 text-sm">calendar_today</span>
            <input
              v-model="selectedMonth"
              type="month"
              class="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-400"
              @change="fetchEmployees"
            />
          </div>

          <!-- Refresh Button -->
          <button
            @click="refreshData"
            class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md"
            :disabled="isLoading"
          >
            <span class="material-icons text-sm">{{ isLoading ? 'sync' : 'refresh' }}</span>
            {{ isLoading ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="header in tableHeaders" :key="header.key"
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-gray-400 text-sm">{{ header.icon }}</span>
                    {{ header.label }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="employee in paginatedEmployees" 
                  :key="employee.id"
                  class="hover:bg-blue-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-gray-400 text-sm">person</span>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
                      <div class="text-xs text-gray-500">ID: {{ employee.empNo }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">₱{{ employee.hourlyRate.toLocaleString() }}</td>
                <td class="px-4 py-3 text-sm text-green-600">₱{{ employee.totalEarnings.toLocaleString() }}</td>
                <td class="px-4 py-3 text-sm text-red-600">₱{{ employee.totalDeductions.toLocaleString() }}</td>
                <td class="px-4 py-3 text-sm text-blue-600 font-medium">₱{{ employee.totalSalary.toLocaleString() }}</td>
                <td class="px-4 py-3 text-sm">{{ employee.salaryMonth }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      @click="generatePayslip(employee)"
                      class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      :disabled="payslipGenerationStatus[employee.id]?.generating"
                    >
                      <span class="material-icons text-sm">description</span>
                      {{ payslipGenerationStatus[employee.id]?.generating ? 'Generating...' : 'Generate' }}
                    </button>
                    <button
                      @click="viewPayslip(employee)"
                      class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
                      :disabled="!hasPayslip(employee)"
                    >
                      <span class="material-icons text-sm">visibility</span>
                      View
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="paginatedEmployees.length === 0 && !isLoading">
                <td colspan="7" class="px-4 py-8 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <span class="material-icons text-gray-400 text-3xl">search_off</span>
                    <p class="text-sm text-gray-500">No employees found for this month.</p>
                  </div>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="isLoading">
                <td colspan="7" class="px-4 py-8 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <span class="material-icons text-blue-500 animate-spin text-3xl">sync</span>
                    <p class="text-sm text-gray-500">Loading employees...</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div class="text-xs text-gray-700">
            Showing page {{ currentPage }} of {{ totalPages }}
          </div>
          <div class="flex gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1 || isLoading"
              class="inline-flex items-center px-3 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              <span class="material-icons text-sm mr-1">chevron_left</span>
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages || isLoading"
              class="inline-flex items-center px-3 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Next
              <span class="material-icons text-sm ml-1">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Payslip Modal -->
      <div v-if="showPayslipModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl">
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
              <span class="material-icons text-sm">description</span>
              Payslip - {{ selectedEmployee?.name }}
            </h2>
            <button
              @click="showPayslipModal = false"
              class="p-1 hover:bg-gray-100 rounded-full"
            >
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
          <div class="p-4">
            <iframe
              :src="payslipDataUrl"
              class="w-full h-[60vh] rounded border"
              @load="onIframeLoad"
              @error="onIframeError"
            ></iframe>
            <div v-if="iframeError" class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm flex items-center gap-1">
              <span class="material-icons text-sm">error</span>
              Error loading payslip. Please try again.
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Messages -->
      <div v-if="statusMessage"
           :class="[
             statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-green-700',
             'fixed bottom-4 right-4 p-3 rounded shadow-lg z-50 flex items-center gap-1 animate-fade-in text-sm'
           ]">
        <span class="material-icons text-sm">
          {{ statusMessage.includes('successfully') ? 'check_circle' : 'error' }}
        </span>
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

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
      payslips: {},
      regularHolidays: [
        '01/01/2025', '04/09/2025', '04/17/2025', '04/18/2025', '05/01/2025',
        '06/12/2025', '08/25/2025', '11/30/2025', '12/25/2025', '12/30/2025'
      ],
      specialNonWorkingDays: ['02/08/2025', '04/19/2025', '08/26/2025'],
      tableHeaders: [
        { key: 'name', label: 'Employee Name', icon: 'person' },
        { key: 'rate', label: 'Hourly Rate', icon: 'payments' },
        { key: 'earnings', label: 'Total Earnings', icon: 'trending_up' },
        { key: 'deductions', label: 'Total Deductions', icon: 'trending_down' },
        { key: 'salary', label: 'Net Salary', icon: 'account_balance_wallet' },
        { key: 'month', label: 'Salary Month', icon: 'event' },
        { key: 'actions', label: 'Actions', icon: 'more_horiz' },
      ],
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
          name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
          lastName: employee.lastName || 'N/A',
          middleName: employee.middleName || 'N/A',
          firstName: employee.firstName || 'N/A',
          birthDate: employee.birthDate || 'N/A',
          hireDate: employee.hireDate || 'N/A',
          civilStatus: employee.civilStatus || 'SINGLE',
          dependents: employee.dependents || 0,
          sss: employee.sss || 'N/A',
          tin: employee.tin || 'N/A',
          philhealth: employee.philhealth || 'N/A',
          hdmf: employee.hdmf || 'N/A',
          hourlyRate: employee.hourlyRate || (employee.salary / (8 * 22)) || 0,
          totalEarnings: employee.totalEarnings || this.calculateTotalEarnings(employee) || 0,
          totalDeductions: employee.totalDeductions || this.calculateTotalDeductions(employee) || 0,
          totalSalary: employee.netSalary || this.calculateNetSalary(employee) || 0,
          salaryMonth: this.formatSalaryMonth(this.selectedMonth),
          email: employee.email || 'N/A',
          position: employee.position || 'N/A',
          payheads: employee.payheads || [],
          rawData: employee,
          salary: employee.salary || 0, // Ensure salary is available for calculations
          commission: employee.commission || 0,
          profitSharing: employee.profitSharing || 0,
          fees: employee.fees || 0,
          thirteenthMonthPay: employee.thirteenthMonthPay || 0,
          hazardPay: employee.hazardPay || 0,
          overtimeHours: employee.overtimeHours || { regular: 0, holiday: 0 },
          nightShiftDiff: employee.nightShiftDiff || 0,
          deMinimis: employee.deMinimis || 0,
          otherTaxable: employee.otherTaxable || 0,
          paidLeaves: employee.paidLeaves || { days: 0, amount: 0 },
          absences: employee.absences || { days: 0, amount: 0 }
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
      const monthlySalary = (employee.salary || 0) || 0;
      const holidayPay = this.calculateHolidayPay(employee) || 0;
      const overtimePay = this.calculateOvertimePay(employee) || 0;
      const payheadEarnings = this.calculatePayheadEarnings(employee.payheads) || 0;
      const taxableSupplementary = (this.calculateSupplementaryIncome(employee)?.taxable || 0) || 0;
      return monthlySalary + baseEarnings + holidayPay + overtimePay + payheadEarnings + taxableSupplementary || 0;
    },
    calculatePayheadEarnings(payheads) {
      return payheads
        .filter(p => p.type === 'Earnings')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    },
    calculatePayheadDeductions(payheads) {
      return payheads
        .filter(p => p.type === 'Deductions')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
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
      const payheadDeductions = this.calculatePayheadDeductions(employee.payheads) || 0;

      return sssContribution + philhealthContribution + pagibigContribution + withholdingTax + payheadDeductions || 0;
    },
    calculateNetSalary(employee) {
      const totalEarnings = (this.calculateTotalEarnings(employee) || 0) || 0;
      const totalDeductions = (this.calculateTotalDeductions(employee) || 0) || 0;

      return totalEarnings - totalDeductions || 0;
    },
    calculateHolidayPay(employee) {
      const dailyRate = ((employee.salary || 0) / 30) || 0;
      const salaryMonth = this.formatSalaryMonth(this.selectedMonth).split(' ')[0];
      const regularHolidays = this.regularHolidays || [];
      const specialNonWorkingDays = this.specialNonWorkingDays || [];
      const isRegularHoliday = regularHolidays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('MMMM') === salaryMonth);
      const isSpecialHoliday = specialNonWorkingDays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('MMMM') === salaryMonth);
      if (isRegularHoliday) return dailyRate * 2 || 0; // DOLE: 200% for worked regular holiday
      if (isSpecialHoliday) return dailyRate * 1.3 || 0; // Updated to 130% for special non-working day per DOLE
      return 0;
    },
    calculateOvertimePay(employee) {
      const hourlyRate = ((employee.hourlyRate || (employee.salary / (8 * 22))) || 0) || 0;
      const regularOTHours = (employee.overtimeHours?.regular || 0) || 0; // Use actual value from employee data
      const holidayOTHours = (employee.overtimeHours?.holiday || 0) || 0; // Use actual value from employee data
      const regularOTPay = regularOTHours * hourlyRate * 1.25 || 0; // DOLE: 25% OT rate
      const holidayOTPay = holidayOTHours * hourlyRate * 1.3 || 0; // DOLE: 30% OT on holiday/rest day
      return regularOTPay + holidayOTPay || 0;
    },
    calculateSSSContribution(salary) {
      const monthlySalaryCredit = Math.min(Math.max((salary || 0), 5000), 35000) || 0;
      const employeeShareRate = 0.045; // Updated to 4.5% per SSS 2025
      return Math.round(monthlySalaryCredit * employeeShareRate) || 0;
    },
    calculatePhilHealthContribution(salary) {
      const rate = 0.05; // 5% total premium
      const monthlySalary = Math.min((salary || 0), 100000) || 0;
      return Math.round((monthlySalary * rate) / 2) || 0; // 2.5% employee share
    },
    calculatePagIBIGContribution(salary) {
      const rate = 0.02; // 2% employee share
      const cappedSalary = Math.min((salary || 0), 10000) || 0;
      return Math.round(cappedSalary * rate) || 0; // Capped at ₱10,000
    },
    calculateWithholdingTax(employee) {
      const nonTaxable = this.calculateNonTaxableIncome(employee);
      const taxableIncome = ((this.calculateTotalEarnings(employee) || 0) - (nonTaxable.totalNonTaxable || 0)) || 0;
      if (taxableIncome <= 20833) return 0;
      if (taxableIncome <= 33333) return Math.round((taxableIncome - 20833) * 0.15) || 0;
      if (taxableIncome <= 66667) return Math.round(1875 + (taxableIncome - 33333) * 0.20) || 0;
      if (taxableIncome <= 166667) return Math.round(13541.80 + (taxableIncome - 66667) * 0.25) || 0;
      if (taxableIncome <= 666667) return Math.round(90841.80 + (taxableIncome - 166667) * 0.30) || 0;
      return Math.round(408841.80 + (taxableIncome - 666667) * 0.35) || 0;
    },
    formatSalaryMonth(month) {
      const date = new Date(month + '-01');
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
      const basicSalary = (employee.salary || 0) || 0; // Use actual salary from employee data
      const sss = (this.calculateSSSContribution(employee.salary) || 0) || 0; // Use calculated SSS
      const philhealth = (this.calculatePhilHealthContribution(employee.salary) || 0) || 0; // Use calculated PhilHealth
      const hdmf = (this.calculatePagIBIGContribution(employee.salary) || 0) || 0; // Use calculated Pag-IBIG
      const totalDeductions = (sss + philhealth + hdmf + (this.calculateWithholdingTax(employee) || 0)) || 0; // Use calculated total
      const netSalary = (employee.totalSalary || this.calculateNetSalary(employee) || 0) || 0; // Use calculated net salary
      const paidLeavesDays = (employee.paidLeaves?.days || 0) || 0;
      const absencesDays = (employee.absences?.days || 0) || 0;
      const paidLeavesAmount = (employee.paidLeaves?.amount || 0) || 0;
      const absencesAmount = -((employee.absences?.amount || 0) || 0);

      return {
        salaryDate,
        empNo: employee.empNo || 'N/A',
        lastName: employee.lastName || 'N/A',
        middleName: employee.middleName || 'N/A',
        firstName: employee.firstName || 'N/A',
        birthDate: moment(employee.birthDate).isValid() ? moment(employee.birthDate).format('MM/DD/YYYY') : 'Invalid date',
        hireDate: moment(employee.hireDate).isValid() ? moment(employee.hireDate).format('MM/DD/YYYY') : 'Invalid date',
        civilStatus: employee.civilStatus || 'SINGLE',
        dependents: employee.dependents || 0,
        sss: employee.sss || 'N/A',
        tin: employee.tin || 'N/A',
        philhealth: employee.philhealth || 'N/A',
        hdmf: employee.hdmf || 'N/A',
        position: employee.position || 'N/A',
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
        withholdingTax: this.formatNumber(this.calculateWithholdingTax(employee) || 0),
        payheads: employee.payheads || [] // Use actual payheads from employee data
      };
    },
    formatNumber(value) {
      const num = Number(value) || 0;
      return num.toFixed(2);
    },
    async generatePdf(payslipData) {
      // Standard letter-sized paper (8.5" x 11" or 21.59cm x 27.94cm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [216, 279] // 8.5" x 11" in mm
      });
      const lineHeight = 5; // Adjusted to match the image's tight spacing
      const margin = 10; // Uniform margin of 10mm on all sides
      const contentWidth = doc.internal.pageSize.getWidth() - (2 * margin); // 196mm content width
      const pageHeight = doc.internal.pageSize.getHeight();

      function addFormattedText(doc, text, x, y, options = {}) {
        if (!text || typeof text !== 'string') {
          console.warn('Invalid text passed to addFormattedText:', text);
          text = 'N/A'; // Fallback for invalid text
        }
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
          console.warn('Invalid coordinates passed to addFormattedText:', { x, y });
          x = margin; // Default to left margin if invalid
          y = y || margin; // Default to top margin if invalid
        }
        doc.setFontSize(options.fontSize || 12); // Default font size from image
        doc.setFont(undefined, options.fontStyle || 'normal');
        doc.setTextColor(options.textColor ? options.textColor[0] : 0, options.textColor ? options.textColor[1] : 0, options.textColor ? options.textColor[2] : 0);
        doc.text(text, x, y, { align: options.align || 'left' });
      }

      function addValue(doc, label, value, x, y) {
        if (!label || typeof label !== 'string' || !value || typeof value !== 'string') {
          console.warn('Invalid label or value passed to addValue:', { label, value });
          label = 'N/A';
          value = 'N/A';
        }
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
          console.warn('Invalid coordinates passed to addValue:', { x, y });
          x = margin; // Default to left margin if invalid
          y = y || margin; // Default to top margin if invalid
        }
        addFormattedText(doc, label, x, y, { fontSize: 12, textColor: [0, 0, 0] }); // Black text for labels
        addFormattedText(doc, value, x + 60, y, { fontSize: 12, textColor: [0, 0, 0] }); // Black text for values, 60mm gap
      }

      // Header with margin
      doc.setFillColor(0, 128, 0); // Green background
      doc.rect(margin, margin, contentWidth, 15, 'F'); // 10mm top margin, 196mm width
      addFormattedText(doc, 'RIGHTJOB Solutions', margin + 5, margin + 10, { fontSize: 14, fontStyle: 'bold', textColor: [255, 255, 255] });
      addFormattedText(doc, 'PAYSLIP', margin + (contentWidth / 2), margin + 10, { fontSize: 14, align: 'center', textColor: [255, 255, 255] });

      // Personal Information and Salary Date (Two side-by-side containers) with margin
      let y = margin + 20; // Start 10mm below header (20mm from top)
      addFormattedText(doc, 'Personal Information', margin, y, { fontSize: 12, fontStyle: 'bold', textColor: [0, 0, 0] });
      y += 5;
      addFormattedText(doc, 'Salary Date', margin + contentWidth - 60, y, { fontSize: 12, textColor: [0, 0, 0] });
      addFormattedText(doc, payslipData.salaryDate, margin + contentWidth - 20, y, { fontSize: 12, textColor: [0, 0, 0] });
      y += 10;

      const leftInfo = [
        ['Emp No.', payslipData.empNo || 'N/A'],
        ['Last Name', payslipData.lastName || 'N/A'],
        ['Middle Name', payslipData.middleName || 'N/A'],
        ['First Name', payslipData.firstName || 'N/A'],
        ['Birth Date', payslipData.birthDate || 'N/A'],
        ['Hire Date', payslipData.hireDate || 'N/A'],
        ['Position', payslipData.position || 'N/A'],
        ['Basic Salary', `Php${payslipData.basicSalary || '0.00'}`]
      ];

      const rightInfo = [
        ['Civil Status', payslipData.civilStatus || 'N/A'],
        ['Dependents', (payslipData.dependents || 0).toString()],
        ['SSS', payslipData.sss || 'N/A'],
        ['TIN', payslipData.tin || 'N/A'],
        ['Philhealth', payslipData.philhealth || 'N/A'],
        ['HDMF', payslipData.hdmf || 'N/A']
      ];

      // Draw two containers side by side with margin
      const containerWidth = (contentWidth - 10) / 2; // 93mm each, 10mm gap between containers

      // Left Container
      leftInfo.forEach(([label, value], index) => {
        addValue(doc, label, value.toString(), margin, y + index * lineHeight);
      });

      // Right Container (aligned upward with left container)
      rightInfo.forEach(([label, value], index) => {
        addValue(doc, label, value.toString(), margin + containerWidth + 10, y + index * lineHeight);
      });

      // Adjust y to account for the height of the containers
      y += Math.max(leftInfo.length, rightInfo.length) * lineHeight + 5;

      // Combined Deductions and Summary in a single container with margin
      y += 5; // Small gap (10mm total from top margin + Personal Info)
      doc.setFillColor(240, 240, 240); // Light gray background
      doc.rect(margin, y - 5, contentWidth, 45, 'F'); // 45mm height, 196mm width
      addFormattedText(doc, 'Deductions', margin, y, { fontSize: 12, fontStyle: 'bold', textColor: [0, 0, 0] });
      addValue(doc, 'SSS', `Php${payslipData.sssDeduction || '0.00'}`, margin, y + lineHeight);
      addValue(doc, 'Philhealth', `Php${payslipData.philhealthDeduction || '0.00'}`, margin, y + 2 * lineHeight);
      addValue(doc, 'HDMF', `Php${payslipData.hdmfDeduction || '0.00'}`, margin, y + 3 * lineHeight);
      addValue(doc, 'Withholding Tax', `Php${payslipData.withholdingTax || '0.00'}`, margin + (contentWidth / 2), y + 2 * lineHeight);

      // Summary content within the same container, below Deductions
      y += 25; // Move below Deductions details within the same container
      addFormattedText(doc, 'Summary', margin, y, { fontSize: 12, fontStyle: 'bold', textColor: [0, 0, 0] });
      // Align fields to match the image snippet exactly with margin
      addFormattedText(doc, `(Php${payslipData.totalDeductions || '0.00'})`, margin + 20, y, { fontSize: 12, textColor: [0, 0, 0] });
      addFormattedText(doc, `Total Php${payslipData.totalDeductions || '0.00'}`, margin + (contentWidth / 2) - 20, y, { fontSize: 12, textColor: [0, 0, 0] });
      addFormattedText(doc, `Php${this.formatNumber(this.calculatePayheadEarnings(payslipData.payheads) || 0)}`, margin + contentWidth - 20, y, { fontSize: 12, textColor: [0, 0, 0] });

      // Separate Miscellaneous Computations container with margin
      y += 30; // Add space between Summary and Miscellaneous Computations
      doc.setFillColor(0, 0, 0, 0); // Light gray background
      doc.rect(margin, y - 5, contentWidth, 30, 'F'); // 30mm height, 196mm width for separate container
      addFormattedText(doc, 'Miscellaneous Computations', margin, y, { fontSize: 12, fontStyle: 'bold', textColor: [0, 0, 0] });

      const miscTableData = payslipData.payheads.map(payhead => [
        payhead.name || 'N/A',
        payhead.type === 'Earnings' ? `${payhead.amount || 0} day(s)` : '',
        `Php${this.formatNumber(payhead.amount || 0)}`
      ]);

      doc.autoTable({
        startY: y + 10,
        head: [['Description', 'description2', 'Amount']],
        body: miscTableData,
        theme: 'grid',
        styles: { fontSize: 12, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50, halign: 'right' }
        },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }, // Light gray header
        tableLineColor: [200, 200, 200], // Light gray borders for table
        tableLineWidth: 0.5,
        margin: { left: margin, right: margin } // Apply margin to table
      });

      // Footer with margin
      y = pageHeight - margin - 5; // 10mm bottom margin, 5mm above text
      addFormattedText(doc, 'This being a computer generated payslip, no signature required.', margin + (contentWidth / 2), y, { fontSize: 10, align: 'center', textColor: [0, 0, 0] });

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
        if (!this.payslipDataUrl) {
          await this.generatePayslip(employee);
        }
        const payslipData = this.payslips[employee.id].split(',')[1];
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
      setTimeout(() => { this.statusMessage = ''; }, 3000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 5000);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined');

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
@keyframes fade-in {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>