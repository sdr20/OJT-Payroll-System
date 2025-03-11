<template>
  <div class="min-h-screen p-1">
    <div class="max-w-8xl mx-auto">
      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <!-- Employee List -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-gray-400 text-sm">person</span>
                    Name
                  </div>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-gray-400 text-sm">badge</span>
                    Employee ID
                  </div>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-gray-400 text-sm">work</span>
                    Position
                  </div>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-gray-400 text-sm">payments</span>
                    Hourly Rate
                  </div>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-gray-400 text-sm">account_balance_wallet</span>
                    Basic Salary
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="employee in paginatedEmployees"
                :key="employee.id"
                class="hover:bg-blue-50 transition-colors cursor-pointer"
                @click="showPayslipHistory(employee)"
              >
                <td class="px-4 py-3 text-sm text-gray-900">{{ employee.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ employee.empNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ employee.position }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">₱{{ employee.hourlyRate.toLocaleString() }}</td>
                <td class="px-4 py-3 text-sm text-blue-600">₱{{ employee.salary.toLocaleString() }}</td>
              </tr>

              <!-- Empty State -->
              <tr v-if="paginatedEmployees.length === 0 && !isLoading">
                <td colspan="5" class="px-4 py-8 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <span class="material-icons text-gray-400 text-3xl">search_off</span>
                    <p class="text-sm text-gray-500">No employees found.</p>
                  </div>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="isLoading">
                <td colspan="5" class="px-4 py-8 text-center">
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

      <!-- Payslip History Modal -->
      <div
        v-if="showHistoryModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
              <span class="material-icons text-sm">history</span>
              Payslip History - {{ selectedEmployee?.name }}
            </h2>
            <button
              @click="showHistoryModal = false"
              class="p-1 hover:bg-gray-100 rounded-full"
            >
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
          <div class="flex flex-1 overflow-hidden">
            <!-- Left Column: Payslip List -->
            <div class="w-1/2 p-4 overflow-y-auto border-r">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Payslip List</h3>
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Pay Date</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="payslip in sortedPayslipHistory"
                    :key="`${payslip.salaryMonth}-${payslip.paydayType}`"
                    class="hover:bg-blue-50 cursor-pointer"
                    :class="{ 'bg-blue-100': selectedPayslip?.salaryMonth === payslip.salaryMonth && selectedPayslip?.paydayType === payslip.paydayType }"
                    @click="selectPayslip(payslip)"
                  >
                    <td class="px-4 py-2 text-sm text-gray-900">
                      {{ payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday }}
                    </td>
                    <td class="px-4 py-2">
                      <button
                        @click.stop="generatePayslip(payslip)"
                        class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        :disabled="!canGeneratePayslip(payslip) || payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating"
                      >
                        <span class="material-icons text-sm">description</span>
                        {{ payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating ? 'Generating...' : 'Generate' }}
                      </button>
                    </td>
                  </tr>
                  <tr v-if="sortedPayslipHistory.length === 0">
                    <td colspan="2" class="px-4 py-4 text-center text-sm text-gray-500">No payslips available.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Right Column: Payslip Preview -->
            <div class="w-1/2 p-4 overflow-y-auto">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Payslip Preview</h3>
              <div v-if="selectedPayslip && selectedPayslip.payslipDataUrl" class="flex flex-col h-full">
                <iframe
                  :src="selectedPayslip.payslipDataUrl"
                  class="w-full h-[60vh] rounded border mb-4"
                  @load="onIframeLoad"
                  @error="onIframeError"
                ></iframe>
                <button
                  @click="downloadPayslip"
                  class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md"
                >
                  <span class="material-icons text-sm">download</span>
                  Download PDF
                </button>
                <div
                  v-if="iframeError"
                  class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm flex items-center gap-1"
                >
                  <span class="material-icons text-sm">error</span>
                  Error loading payslip. Please try again.
                </div>
              </div>
              <div v-else class="text-sm text-gray-500 text-center mt-4">
                Select a payslip from the list to preview.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Messages -->
      <div
        v-if="statusMessage"
        :class="[
          statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
          'fixed bottom-4 right-4 p-3 rounded shadow-lg z-50 flex items-center gap-1 animate-fade-in text-sm'
        ]"
      >
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

jsPDF.prototype.autoTable = autoTable.default;

export default {
  name: 'SalarySlips',
  data() {
    return {
      employees: [],
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      payslipGenerationStatus: {},
      isLoading: false,
      statusMessage: '',
      showHistoryModal: false,
      selectedEmployee: null,
      selectedPayslip: null,
      payslipHistory: [],
      iframeError: false,
      minimumWage: 610, // NCR minimum wage for 2025
      deMinimisLimit: 10000, // De minimis limit for 2025
      regularHolidays: [
        '01/01/2025', '04/09/2025', '04/17/2025', '04/18/2025', '05/01/2025',
        '06/12/2025', '08/25/2025', '11/30/2025', '12/25/2025', '12/30/2025'
      ],
      specialNonWorkingDays: ['02/08/2025', '04/19/2025', '08/26/2025'],
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
    },
    sortedPayslipHistory() {
      return [...this.payslipHistory].sort((a, b) => {
        const dateA = new Date(a.salaryMonth + (a.paydayType === 'mid-month' ? '-15' : '-28'));
        const dateB = new Date(b.salaryMonth + (b.paydayType === 'mid-month' ? '-15' : '-28'));
        return dateA - dateB; // Earliest first
      });
    },
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
          headers: { 'user-role': 'admin' },
        });
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
          salary: employee.salary || 0,
          position: employee.position || 'N/A',
          payheads: employee.payheads || [],
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
          earnings: employee.earnings || { travelExpenses: 0, otherEarnings: 0 },
        }));
        this.showSuccessMessage('Employees loaded successfully!');
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showErrorMessage(`Failed to load employees: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
    async refreshData() {
      await this.fetchEmployees();
    },
    async showPayslipHistory(employee) {
      this.selectedEmployee = employee;
      this.isLoading = true;
      try {
        const response = await axios.get(`http://localhost:7777/api/payslips/${employee.id}`, {
          headers: { 'user-role': 'admin' },
        });
        const backendPayslips = response.data;

        // Determine the next expected salary date from hireDate
        const hireDate = moment(employee.hireDate);
        const today = moment();
        const payslipHistory = [];

        // Start from the hire date and find the first future pay date
        let currentMonth = hireDate.clone().startOf('month');
        while (currentMonth.isBefore(today)) {
          currentMonth.add(1, 'month');
        }

        // Generate payslip entries for the next 3 months from the first future date
        for (let i = 0; i < 3; i++) {
          const salaryMonth = currentMonth.clone().add(i, 'months').format('YYYY-MM');
          const expectedPaydays = this.getExpectedPayday(employee.hireDate, `${salaryMonth}-01`);

          // Mid-month payslip
          const midMonthPayslip = backendPayslips.find(p => p.salaryMonth === salaryMonth && p.paydayType === 'mid-month');
          payslipHistory.push({
            salaryMonth,
            paydayType: 'mid-month',
            totalSalary: midMonthPayslip ? this.calculateNetSalary(employee) : null,
            payslipDataUrl: midMonthPayslip ? midMonthPayslip.payslipData : null,
            employee: { ...employee, salaryMonth: `${salaryMonth}-15` },
            expectedPaydays,
          });

          // End-of-month payslip
          const endMonthPayslip = backendPayslips.find(p => p.salaryMonth === salaryMonth && p.paydayType === 'end-of-month');
          payslipHistory.push({
            salaryMonth,
            paydayType: 'end-of-month',
            totalSalary: endMonthPayslip ? this.calculateNetSalary(employee) : null,
            payslipDataUrl: endMonthPayslip ? endMonthPayslip.payslipData : null,
            employee: { ...employee, salaryMonth: `${salaryMonth}-28` },
            expectedPaydays,
          });
        }

        this.payslipHistory = payslipHistory.filter(payslip => {
          const payDate = moment(payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday, 'D MMMM YYYY');
          return payDate.isSameOrAfter(today, 'day'); // Only future dates
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If no payslips exist, generate entries starting from the next expected date
          const hireDate = moment(employee.hireDate);
          const today = moment();
          const payslipHistory = [];
          let currentMonth = hireDate.clone().startOf('month');
          while (currentMonth.isBefore(today)) {
            currentMonth.add(1, 'month');
          }

          for (let i = 0; i < 3; i++) {
            const salaryMonth = currentMonth.clone().add(i, 'months').format('YYYY-MM');
            const expectedPaydays = this.getExpectedPayday(employee.hireDate, `${salaryMonth}-01`);
            payslipHistory.push(
              {
                salaryMonth,
                paydayType: 'mid-month',
                totalSalary: null,
                payslipDataUrl: null,
                employee: { ...employee, salaryMonth: `${salaryMonth}-15` },
                expectedPaydays,
              },
              {
                salaryMonth,
                paydayType: 'end-of-month',
                totalSalary: null,
                payslipDataUrl: null,
                employee: { ...employee, salaryMonth: `${salaryMonth}-28` },
                expectedPaydays,
              }
            );
          }

          this.payslipHistory = payslipHistory.filter(payslip => {
            const payDate = moment(payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday, 'D MMMM YYYY');
            return payDate.isSameOrAfter(today, 'day');
          });
        } else {
          console.error('Error fetching payslip history:', error);
          this.showErrorMessage(`Failed to load payslip history for ${employee.name}: ${error.message}`);
        }
      } finally {
        this.selectedPayslip = this.sortedPayslipHistory[0] || null;
        this.showHistoryModal = true;
        this.isLoading = false;
      }
    },
    canGeneratePayslip(payslip) {
      const today = moment();
      const payDate = moment(payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday, 'D MMMM YYYY');
      const oneDayBefore = payDate.clone().subtract(1, 'day');
      return today.isSameOrAfter(oneDayBefore, 'day') && !payslip.payslipDataUrl;
    },
    async generatePayslip(payslip) {
      const employee = payslip.employee;
      const key = `${payslip.salaryMonth}-${payslip.paydayType}`;
      this.payslipGenerationStatus[key] = { generating: true };
      try {
        const payslipData = this.createPayslipData(employee);
        const pdfBlob = await this.generatePdf(payslipData);
        const url = URL.createObjectURL(pdfBlob);
        const base64Data = await this.blobToBase64(pdfBlob);

        await axios.post('http://localhost:7777/api/payslips/generate', {
          employeeId: employee.id,
          empNo: employee.empNo,
          payslipData: base64Data,
          salaryMonth: payslip.salaryMonth,
          paydayType: payslip.paydayType,
        }, {
          headers: { 'user-role': 'admin' },
        });

        payslip.payslipDataUrl = url;
        payslip.totalSalary = this.calculateNetSalary(employee);
        this.selectedPayslip = payslip;
        this.showSuccessMessage(`Payslip generated for ${employee.name} - ${payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday}!`);
      } catch (error) {
        console.error('Error generating payslip:', error);
        this.showErrorMessage(`Failed to generate payslip: ${error.message}`);
      } finally {
        this.payslipGenerationStatus[key] = { generating: false };
      }
    },
    selectPayslip(payslip) {
      this.selectedPayslip = payslip.payslipDataUrl ? payslip : null;
      this.iframeError = false;
    },
    async downloadPayslip() {
      if (!this.selectedPayslip?.payslipDataUrl) return;
      const response = await fetch(this.selectedPayslip.payslipDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${this.selectedEmployee.name}_${this.selectedPayslip.paydayType === 'mid-month' ? this.selectedPayslip.expectedPaydays.midMonthPayday : this.selectedPayslip.expectedPaydays.endMonthPayday}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
      const salaryMonth = employee.salaryMonth.split('-')[0] + '-' + employee.salaryMonth.split('-')[1];
      const regularHolidays = this.regularHolidays || [];
      const specialNonWorkingDays = this.specialNonWorkingDays || [];
      const isRegularHoliday = regularHolidays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('YYYY-MM') === salaryMonth);
      const isSpecialHoliday = specialNonWorkingDays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('YYYY-MM') === salaryMonth);
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
      const date = new Date(month);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    },
    getExpectedPayday(hireDate, salaryMonth) {
      const [year, month] = salaryMonth.split('-');
      const lastDay = new Date(year, month, 0).getDate();
      let payday1 = new Date(year, month - 1, 15); // Mid-month
      let payday2 = new Date(year, month - 1, lastDay); // End-of-month

      const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
      while (isWeekend(payday1)) payday1.setDate(payday1.getDate() + 1);
      while (isWeekend(payday2)) payday2.setDate(payday2.getDate() - 1); // Adjust backward to avoid next month

      return {
        midMonthPayday: payday1.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        endMonthPayday: payday2.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      };
    },
    createPayslipData(employee) {
      const salaryDate = moment(employee.salaryMonth, 'YYYY-MM-DD').format('MM/DD/YYYY');
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
      const paydays = this.getExpectedPayday(employee.hireDate, employee.salaryMonth);

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
        format: [216, 279] // Letter size: 8.5" x 11"
      });

      doc.setFont('Helvetica');

      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 2 * margin;
      const columnWidth = (contentWidth - 20) / 2; // Two columns with 10mm gap
      const lineHeight = 5;
      const pageHeight = doc.internal.pageSize.getHeight();

      function addText(doc, text, x, y, options = {}) {
        text = text || 'N/A';
        text = text.replace('₱', 'P');
        doc.setFontSize(options.fontSize || 10);
        doc.setFont(options.font || 'Helvetica', options.fontStyle || 'normal');
        doc.setTextColor(...(options.textColor || [0, 0, 0]));
        doc.text(text, x, y, { align: options.align || 'left', maxWidth: options.maxWidth });
      }

      function addLabelValue(doc, label, value, x, y) {
        addText(doc, label, x, y, { fontSize: 9, fontStyle: 'bold' });
        addText(doc, value, x + 35, y, { fontSize: 9, maxWidth: columnWidth - 35 });
      }

      doc.setFillColor(0, 128, 0);
      doc.rect(margin, margin, contentWidth, 10, 'F');
      addText(doc, 'RIGHTJOB Solutions', margin + 5, margin + 7, { fontSize: 12, fontStyle: 'bold', textColor: [255, 255, 255] });
      addText(doc, 'PAYSLIP', margin + contentWidth / 2, margin + 7, { fontSize: 12, fontStyle: 'bold', textColor: [255, 255, 255], align: 'center' });

      let y = margin + 15;
      addText(doc, 'Salary Date:', margin + contentWidth - 40, y, { fontSize: 9 });
      addText(doc, payslipData.salaryDate, margin + contentWidth - 20, y, { fontSize: 9 });

      y += 10;

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
        ['Basic Salary', `P${payslipData.basicSalary}`]
      ];
      leftPersonalInfo.forEach(([label, value], index) => {
        addLabelValue(doc, label, value, margin, y + index * lineHeight);
      });

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

      y = Math.max(y + leftPersonalInfo.length * lineHeight, yRight + rightPersonalInfo.length * lineHeight) + 10;

      addText(doc, 'Expected Paydays', margin, y, { fontSize: 11, fontStyle: 'bold' });
      addText(doc, 'Mid-Month:', margin, y + lineHeight);
      addText(doc, payslipData.expectedPaydays.midMonthPayday, margin + 35, y + lineHeight, { maxWidth: columnWidth - 35 });
      addText(doc, 'End-of-Month:', margin + columnWidth + 10, y + lineHeight);
      addText(doc, payslipData.expectedPaydays.endMonthPayday, margin + columnWidth + 45, y + lineHeight, { maxWidth: columnWidth - 35 });
      y += 2 * lineHeight + 10;

      addText(doc, 'Deductions', margin, y, { fontSize: 11, fontStyle: 'bold' });
      y += lineHeight;
      const leftDeductions = [
        ['SSS', `P${payslipData.sssDeduction}`],
        ['Philhealth', `P${payslipData.philhealthDeduction}`],
        ['HDMF', `P${payslipData.hdmfDeduction}`]
      ];
      leftDeductions.forEach(([label, value], index) => {
        addLabelValue(doc, label, value, margin, y + index * lineHeight);
      });

      const rightDeductions = [
        ['Withholding Tax', `P${payslipData.withholdingTax}`]
      ];
      rightDeductions.forEach(([label, value], index) => {
        addLabelValue(doc, label, value, margin + columnWidth + 10, y + index * lineHeight);
      });
      y += Math.max(leftDeductions.length, rightDeductions.length) * lineHeight + 10;

      addText(doc, 'Summary', margin, y, { fontSize: 11, fontStyle: 'bold' });
      y += lineHeight;
      addText(doc, 'Total Deductions:', margin, y, { fontSize: 9, fontStyle: 'bold' });
      addText(doc, `(P${payslipData.totalDeductions})`, margin + 35, y, { fontSize: 9 });
      addText(doc, 'Net Salary:', margin + columnWidth + 10, y, { fontSize: 9, fontStyle: 'bold' });
      addText(doc, `P${payslipData.netSalary}`, margin + columnWidth + 45, y, { fontSize: 9 });

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
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    onIframeLoad() {
      this.iframeError = false;
    },
    onIframeError() {
      this.iframeError = true;
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 3000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 5000);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined');

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.transition-colors {
  transition: background-color 0.2s ease-in-out;
}
.hover\:bg-blue-50:hover {
  background-color: #eff6ff;
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