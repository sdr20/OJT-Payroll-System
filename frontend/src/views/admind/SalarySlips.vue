<template>
  <div class="min-h-screen p-1">
    <div class="max-w-8xl mx-auto">
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
             statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
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
      selectedMonth: new Date().toISOString().slice(0, 7), // e.g., "2025-03"
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
    this.fetchPayslips();
  },
  methods: {
    async fetchEmployees() {
      this.isLoading = true;
      this.statusMessage = '';
      try {
        if (!/^\d{4}-\d{2}$/.test(this.selectedMonth)) {
          throw new Error('Invalid month format. Expected YYYY-MM');
        }
        console.log('Fetching employees for month:', this.selectedMonth);

        const response = await axios.get('http://localhost:7777/api/employees', {
          headers: {
            'user-role': 'admin'
          },
          params: { month: this.selectedMonth }
        });
        console.log('Fetched employees response:', JSON.stringify(response.data, null, 2));
        this.employees = response.data.map((employee) => ({
          id: employee.id,
          empNo: employee.empNo || 'N/A',
          name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
          lastName: employee.lastName || 'N/A',
          middleName: employee.middleName || 'N/A',
          firstName: employee.firstName || 'N/A',
          birthDate: employee.birthDate || 'N/A',
          hireDate: employee.hireDate || new Date().toISOString(),
          civilStatus: employee.civilStatus || 'SINGLE',
          dependents: employee.dependents || 0,
          sss: employee.sss || 'N/A',
          tin: employee.tin || 'N/A',
          philhealth: employee.philhealth || 'N/A',
          hdmf: employee.hdmf || 'N/A',
          hourlyRate: employee.hourlyRate || (employee.salary / (8 * 22)) || 0,
          totalEarnings: this.calculateTotalEarnings(employee) || 0,
          totalDeductions: this.calculateTotalDeductions(employee) || 0,
          totalSalary: this.calculateNetSalary(employee) || 0,
          salaryMonth: this.formatSalaryMonth(this.selectedMonth),
          email: employee.email || 'N/A',
          position: employee.position || 'N/A',
          payheads: employee.payheads || [],
          salary: employee.salary || 0,
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
          absences: employee.absences || { days: 0, amount: 0 },
          earnings: employee.earnings || { travelExpenses: 0, otherEarnings: 0 }
        }));
        this.showSuccessMessage('Employees loaded successfully!');
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showErrorMessage(`Failed to load employees: ${error.message || 'Unknown error'}`);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPayslips() {
      try {
        const response = await axios.get('http://localhost:7777/api/payslips', {
          headers: { 'user-role': 'admin' },
          params: { month: this.selectedMonth }
        });
        response.data.forEach(payslip => {
          this.payslips[payslip.employeeId] = payslip.payslipData; // Store base64 URL
        });
      } catch (error) {
        console.error('Error fetching payslips:', error);
        this.showErrorMessage('Failed to fetch existing payslips.');
      }
    },
    async refreshData() {
      await this.fetchEmployees();
      await this.fetchPayslips();
    },
    calculateTotalEarnings(employee) {
      const baseEarnings = (employee.earnings?.travelExpenses || 0) + (employee.earnings?.otherEarnings || 0);
      const monthlySalary = employee.salary || 0;
      const holidayPay = this.calculateHolidayPay(employee) || 0;
      const overtimePay = this.calculateOvertimePay(employee) || 0;
      const payheadEarnings = this.calculatePayheadEarnings(employee.payheads) || 0;
      const taxableSupplementary = this.calculateSupplementaryIncome(employee)?.taxable || 0;
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
      const commission = employee.commission || 0;
      const profitSharing = employee.profitSharing || 0;
      const fees = employee.fees || 0;
      const thirteenthMonthPay = employee.thirteenthMonthPay || 0;
      const hazardPay = employee.hazardPay || 0;
      const overtimePay = this.calculateOvertimePay(employee) || 0;
      const otherTaxable = employee.otherTaxable || 0;

      const totalSupplementary = commission + profitSharing + fees + thirteenthMonthPay + hazardPay + overtimePay + otherTaxable;
      const exemptThirteenthMonth = Math.min(thirteenthMonthPay, 90000) || 0;
      const taxableThirteenthMonth = Math.max(0, thirteenthMonthPay - 90000) || 0;

      const taxableSupplementaryIncome = commission + profitSharing + fees + taxableThirteenthMonth + hazardPay + overtimePay + otherTaxable;

      return {
        taxable: taxableSupplementaryIncome || 0,
        nonTaxable: exemptThirteenthMonth || 0,
        totalSupplementary: totalSupplementary || 0
      };
    },
    calculateNonTaxableIncome(employee) {
      const isMWE = (employee.salary / 30) <= this.minimumWage;
      const basicSalaryMWE = isMWE ? employee.salary : 0;
      const holidayPayMWE = isMWE ? this.calculateHolidayPay(employee) : 0;
      const overtimePayMWE = isMWE ? this.calculateOvertimePay(employee) : 0;
      const nightShiftDiffMWE = isMWE ? employee.nightShiftDiff || 0 : 0;
      const hazardPayMWE = isMWE ? employee.hazardPay || 0 : 0;
      const thirteenthMonthExempt = Math.min(employee.thirteenthMonthPay || 0, 90000) || 0;
      const deMinimis = Math.min(employee.deMinimis || 0, this.deMinimisLimit) || 0;
      const sssContribution = this.calculateSSSContribution(employee.salary) || 0;
      const philhealthContribution = this.calculatePhilHealthContribution(employee.salary) || 0;
      const pagibigContribution = this.calculatePagIBIGContribution(employee.salary) || 0;

      return {
        totalNonTaxable: basicSalaryMWE + holidayPayMWE + overtimePayMWE + nightShiftDiffMWE + hazardPayMWE + thirteenthMonthExempt + deMinimis + sssContribution + philhealthContribution + pagibigContribution || 0
      };
    },
    calculateTotalDeductions(employee) {
      const sssContribution = this.calculateSSSContribution(employee.salary) || 0;
      const philhealthContribution = this.calculatePhilHealthContribution(employee.salary) || 0;
      const pagibigContribution = this.calculatePagIBIGContribution(employee.salary) || 0;
      const withholdingTax = this.calculateWithholdingTax(employee) || 0;
      const payheadDeductions = this.calculatePayheadDeductions(employee.payheads) || 0;

      return sssContribution + philhealthContribution + pagibigContribution + withholdingTax + payheadDeductions || 0;
    },
    calculateNetSalary(employee) {
      const totalEarnings = this.calculateTotalEarnings(employee) || 0;
      const totalDeductions = this.calculateTotalDeductions(employee) || 0;
      return totalEarnings - totalDeductions || 0;
    },
    calculateHolidayPay(employee) {
      const dailyRate = (employee.salary / 30) || 0;
      const salaryMonth = this.formatSalaryMonth(this.selectedMonth).split(' ')[0];
      const regularHolidays = this.regularHolidays || [];
      const specialNonWorkingDays = this.specialNonWorkingDays || [];
      const isRegularHoliday = regularHolidays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('MMMM') === salaryMonth);
      const isSpecialHoliday = specialNonWorkingDays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('MMMM') === salaryMonth);
      if (isRegularHoliday) return dailyRate * 2 || 0; // 200% for regular holiday
      if (isSpecialHoliday) return dailyRate * 1.3 || 0; // 130% for special non-working day
      return 0;
    },
    calculateOvertimePay(employee) {
      const hourlyRate = employee.hourlyRate || (employee.salary / (8 * 22)) || 0;
      const regularOTHours = employee.overtimeHours?.regular || 0;
      const holidayOTHours = employee.overtimeHours?.holiday || 0;
      const regularOTPay = regularOTHours * hourlyRate * 1.25 || 0; // 25% OT rate
      const holidayOTPay = holidayOTHours * hourlyRate * 1.3 || 0; // 30% OT on holiday
      return regularOTPay + holidayOTPay || 0;
    },
    calculateSSSContribution(salary) {
      const monthlySalaryCredit = Math.min(Math.max(salary || 0, 5000), 35000) || 0;
      const employeeShareRate = 0.045; // 4.5% per SSS 2025
      return Math.round(monthlySalaryCredit * employeeShareRate) || 0;
    },
    calculatePhilHealthContribution(salary) {
      const rate = 0.05; // 5% total premium
      const monthlySalary = Math.min(salary || 0, 100000) || 0;
      return Math.round((monthlySalary * rate) / 2) || 0; // 2.5% employee share
    },
    calculatePagIBIGContribution(salary) {
      const rate = 0.02; // 2% employee share
      const cappedSalary = Math.min(salary || 0, 10000) || 0;
      return Math.round(cappedSalary * rate) || 0;
    },
    calculateWithholdingTax(employee) {
      const nonTaxable = this.calculateNonTaxableIncome(employee).totalNonTaxable || 0;
      const taxableIncome = (this.calculateTotalEarnings(employee) || 0) - nonTaxable || 0;
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
    getExpectedPayday(hireDate, salaryMonth) {
      const [year, month] = salaryMonth.split('-');
      const lastDay = new Date(year, month, 0).getDate();
      let payday1 = new Date(year, month - 1, 15); // Mid-month
      let payday2 = new Date(year, month - 1, lastDay); // End-of-month

      const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
      while (isWeekend(payday1)) payday1.setDate(payday1.getDate() + 1);
      while (isWeekend(payday2)) payday2.setDate(payday2.getDate() + 1);

      return {
        midMonthPayday: payday1.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        endMonthPayday: payday2.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      };
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
        const base64Data = await this.blobToBase64(pdfBlob);
        this.payslips[employee.id] = url;

        await axios.post('http://localhost:7777/api/payslips/generate', {
          employeeId: employee.id,
          empNo: employee.empNo,
          payslipData: base64Data,
          salaryMonth: this.selectedMonth
        }, {
          headers: { 'user-role': 'admin' }
        });

        this.showSuccessMessage(`Payslip generated and saved for ${employee.name}!`);
      } catch (error) {
        console.error('Error generating payslip:', error);
        this.showErrorMessage(`Failed to generate payslip for ${employee.name}: ${error.message}`);
      } finally {
        this.payslipGenerationStatus[employee.id] = { generating: false };
      }
    },
    createPayslipData(employee) {
      const salaryDate = moment(employee.salaryMonth, 'MM/YYYY').format('MM/DD/YYYY');
      const basicSalary = employee.salary || 0;
      const sss = this.calculateSSSContribution(employee.salary) || 0;
      const philhealth = this.calculatePhilHealthContribution(employee.salary) || 0;
      const hdmf = this.calculatePagIBIGContribution(employee.salary) || 0;
      const totalDeductions = sss + philhealth + hdmf + (this.calculateWithholdingTax(employee) || 0) || 0;
      const netSalary = this.calculateNetSalary(employee) || 0;
      const paidLeavesDays = employee.paidLeaves?.days || 0;
      const absencesDays = employee.absences?.days || 0;
      const paidLeavesAmount = employee.paidLeaves?.amount || 0;
      const absencesAmount = -(employee.absences?.amount || 0);
      const paydays = this.getExpectedPayday(employee.hireDate, this.selectedMonth);

      return {
        salaryDate,
        empNo: employee.empNo || 'N/A',
        lastName: employee.lastName || 'N/A',
        middleName: employee.middleName || 'N/A',
        firstName: employee.firstName || 'N/A',
        birthDate: moment(employee.birthDate).isValid() ? moment(employee.birthDate).format('MM/DD/YYYY') : 'N/A',
        hireDate: moment(employee.hireDate).isValid() ? moment(employee.hireDate).format('MM/DD/YYYY') : 'N/A',
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
        paidLeavesDays,
        absencesDays,
        paidLeavesAmount: this.formatNumber(paidLeavesAmount),
        absencesAmount: this.formatNumber(absencesAmount),
        withholdingTax: this.formatNumber(this.calculateWithholdingTax(employee) || 0),
        payheads: employee.payheads || [],
        expectedPaydays: paydays
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
        format: [216, 279] // 8.5" x 11"
      });
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 2 * margin;
      const columnWidth = (contentWidth - 10) / 2; // Two columns with 10mm gap
      const lineHeight = 6;
      const pageHeight = doc.internal.pageSize.getHeight();

      // Helper function to add text with options
      function addText(doc, text, x, y, options = {}) {
        text = text || 'N/A';
        doc.setFontSize(options.fontSize || 10);
        doc.setFont(undefined, options.fontStyle || 'normal');
        doc.setTextColor(...(options.textColor || [0, 0, 0]));
        doc.text(text, x, y, { align: options.align || 'left', maxWidth: options.maxWidth });
      }

      // Helper function to add label-value pair
      function addLabelValue(doc, label, value, x, y) {
        addText(doc, label, x, y, { fontStyle: 'bold' });
        addText(doc, value, x + 25, y, { maxWidth: columnWidth - 25 });
      }

      // Header
      doc.setFillColor(0, 128, 0);
      doc.rect(margin, margin, contentWidth, 10, 'F');
      addText(doc, 'RIGHTJOB Solutions', margin + 5, margin + 7, { fontSize: 12, fontStyle: 'bold', textColor: [255, 255, 255] });
      addText(doc, 'PAYSLIP', margin + contentWidth / 2, margin + 7, { fontSize: 12, align: 'center', textColor: [255, 255, 255] });

      // Salary Date (Top Right)
      let y = margin + 15;
      addText(doc, 'Salary Date:', margin + contentWidth - 40, y, { fontSize: 10 });
      addText(doc, payslipData.salaryDate, margin + contentWidth - 20, y, { fontSize: 10 });

      // Two-Column Layout
      y += 10;

      // Personal Information (Left Column)
      addText(doc, 'Personal Information', margin, y, { fontSize: 11, fontStyle: 'bold' });
      y += lineHeight;
      const leftPersonalInfo = [
        ['Emp No.', payslipData.empNo],
        ['Last Name', payslipData.lastName],
        ['Middle Name', payslipData.middleName],
        ['First Name', payslipData.firstName],
        ['Birth Date', payslipData.birthDate],
        ['Hire Date', payslipData.hireDate],
        ['Position', payslipData.position],
        ['Basic Salary', `₱${payslipData.basicSalary}`]
      ];
      leftPersonalInfo.forEach(([label, value], index) => {
        addLabelValue(doc, label, value, margin, y + index * lineHeight);
      });

      // Right Column (Civil Status, Dependents, IDs)
      let yRight = y;
      addText(doc, 'Additional Info', margin + columnWidth + 10, yRight, { fontSize: 11, fontStyle: 'bold' });
      yRight += lineHeight;
      const rightPersonalInfo = [
        ['Civil Status', payslipData.civilStatus],
        ['Dependents', payslipData.dependents.toString()],
        ['SSS', payslipData.sss],
        ['TIN', payslipData.tin],
        ['Philhealth', payslipData.philhealth],
        ['HDMF', payslipData.hdmf]
      ];
      rightPersonalInfo.forEach(([label, value], index) => {
        addLabelValue(doc, label, value, margin + columnWidth + 10, yRight + index * lineHeight);
      });

      // Adjust y to the tallest column
      y = Math.max(y + leftPersonalInfo.length * lineHeight, yRight + rightPersonalInfo.length * lineHeight) + 10;

      // Expected Paydays (Two Columns)
      addText(doc, 'Expected Paydays', margin, y, { fontSize: 11, fontStyle: 'bold' });
      addText(doc, 'Mid-Month:', margin, y + lineHeight);
      addText(doc, payslipData.expectedPaydays.midMonthPayday, margin + 25, y + lineHeight, { maxWidth: columnWidth - 25 });
      addText(doc, 'End-of-Month:', margin + columnWidth + 10, y + lineHeight);
      addText(doc, payslipData.expectedPaydays.endMonthPayday, margin + columnWidth + 35, y + lineHeight, { maxWidth: columnWidth - 25 });
      y += 2 * lineHeight + 10;

      // Deductions (Two Columns)
      addText(doc, 'Deductions', margin, y, { fontSize: 11, fontStyle: 'bold' });
      y += lineHeight;
      const leftDeductions = [
        ['SSS', `₱${payslipData.sssDeduction}`],
        ['Philhealth', `₱${payslipData.philhealthDeduction}`],
        ['HDMF', `₱${payslipData.hdmfDeduction}`]
      ];
      leftDeductions.forEach(([label, value], index) => {
        addLabelValue(doc, label, value, margin, y + index * lineHeight);
      });

      const rightDeductions = [
        ['Withholding Tax', `₱${payslipData.withholdingTax}`]
      ];
      rightDeductions.forEach(([label, value], index) => {
        addLabelValue(doc, label, value, margin + columnWidth + 10, y + index * lineHeight);
      });
      y += Math.max(leftDeductions.length, rightDeductions.length) * lineHeight + 10;

      // Summary (Two Columns)
      addText(doc, 'Summary', margin, y, { fontSize: 11, fontStyle: 'bold' });
      y += lineHeight;
      addText(doc, 'Total Deductions:', margin, y);
      addText(doc, `(₱${payslipData.totalDeductions})`, margin + 35, y);
      addText(doc, 'Net Salary:', margin + columnWidth + 10, y);
      addText(doc, `₱${payslipData.netSalary}`, margin + columnWidth + 35, y);
      y += lineHeight + 10;

      // Miscellaneous Computations (Full Width Table)
      if (payslipData.payheads.length > 0) {
        addText(doc, 'Miscellaneous Computations', margin, y, { fontSize: 11, fontStyle: 'bold' });
        y += lineHeight;

        const miscTableData = payslipData.payheads.map(payhead => [
          payhead.name || 'N/A',
          payhead.type === 'Earnings' ? `${payhead.amount || 0} day(s)` : '',
          `₱${this.formatNumber(payhead.amount || 0)}`
        ]);

        doc.autoTable({
          startY: y,
          head: [['Description', 'Details', 'Amount']],
          body: miscTableData,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: columnWidth + 5 },
            1: { cellWidth: columnWidth - 15 },
            2: { cellWidth: 30, halign: 'right' }
          },
          headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
          margin: { left: margin, right: margin }
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // Footer
      const footerY = pageHeight - margin - 5;
      addText(doc, 'This is a computer-generated payslip; no signature required.', margin + contentWidth / 2, footerY, { fontSize: 8, align: 'center' });

      return doc.output('blob');
    },
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
    viewPayslip(employee) {
      this.selectedEmployee = employee;
      const payslipUrl = this.payslips[employee.id];
      if (payslipUrl) {
        console.log(`Viewing payslip for ${employee.id}:`, payslipUrl);
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
        let payslipUrl = this.payslips[employee.id];
        if (!payslipUrl) {
          await this.generatePayslip(employee);
          payslipUrl = this.payslips[employee.id];
        }
        const payslipData = payslipUrl.includes('base64,') ? payslipUrl : await this.blobToBase64(await (await fetch(payslipUrl)).blob());

        const response = await axios.post('http://localhost:7777/api/payslips/send-email', {
          employeeId: employee.id,
          employeeEmail: employee.email,
          payslipData,
          salaryMonth: employee.salaryMonth
        }, {
          headers: { 'user-role': 'admin' }
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
      console.log('Iframe loaded successfully');
      this.iframeError = false;
    },
    onIframeError() {
      console.error('Iframe failed to load');
      this.iframeError = true;
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 3000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      console.error(message);
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