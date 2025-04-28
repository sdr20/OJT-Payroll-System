<template>
    <div class="min-h-screen p-1">
        <div class="max-w-8xl mx-auto">
            <!-- Header Section -->
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div class="relative">
                        <span class="material-icons absolute left-2 top-2 text-gray-400 text-sm">search</span>
                        <input v-model="searchQuery" type="text" placeholder="Search employee by name..."
                            class="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
                    </div>
                    <button @click="refreshData"
                        class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading">
                        <span class="material-icons text-sm">{{ isLoading ? 'sync' : 'refresh' }}</span>
                        {{ isLoading ? 'Refreshing...' : 'Refresh Data' }}
                    </button>
                    <button @click="generateAllPayslips"
                        class="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading || isGeneratingAll">
                        <span class="material-icons text-sm">{{ isGeneratingAll ? 'sync' : 'description' }}</span>
                        {{ isGeneratingAll ? 'Generating...' : 'Generate All' }}
                    </button>
                    <button @click="showPrintModal"
                        class="flex items-center justify-center gap-1 bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading">
                        <span class="material-icons text-sm">print</span>
                        Print All
                    </button>
                    <button @click="showUpdatePositionModal"
                        class="flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading">
                        <span class="material-icons text-sm">edit</span>
                        Update Position
                    </button>
                    <button @click="showDeductionModal"
                        class="flex items-center justify-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading">
                        <span class="material-icons text-sm">money_off</span>
                        Deduction
                    </button>
                </div>
            </div>

            <!-- Employee List -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 mb-4">
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
                            <tr v-for="employee in paginatedEmployees" :key="employee.id"
                                class="hover:bg-blue-50 transition-colors cursor-pointer"
                                @click="showPayslipHistory(employee)">
                                <td class="px-4 py-3 text-sm text-gray-900">{{ employee.name }}</td>
                                <td class="px-4 py-3 text-sm text-gray-500">{{ employee.empNo }}</td>
                                <td class="px-4 py-3 text-sm text-gray-500">
                                    {{ getPositionName(employee.position) }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900">
                                    ₱{{ getHourlyRate(employee.position).toLocaleString() }}
                                </td>
                                <td class="px-4 py-3 text-sm text-blue-600">
                                    ₱{{ getPositionSalary(employee.position).toLocaleString() }}
                                </td>
                            </tr>
                            <tr v-if="paginatedEmployees.length === 0 && !isLoading">
                                <td colspan="5" class="px-4 py-8 text-center">
                                    <div class="flex flex-col items-center gap-2">
                                        <span class="material-icons text-gray-400 text-3xl">search_off</span>
                                        <p class="text-sm text-gray-500">No employees found.</p>
                                    </div>
                                </td>
                            </tr>
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
                <div class="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <div class="text-xs text-gray-700">
                        Showing page {{ currentPage }} of {{ totalPages }}
                    </div>
                    <div class="flex gap-2">
                        <button @click="prevPage" :disabled="currentPage === 1 || isLoading"
                            class="inline-flex items-center px-3 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                            <span class="material-icons text-sm mr-1">chevron_left</span>
                            Previous
                        </button>
                        <button @click="nextPage" :disabled="currentPage === totalPages || isLoading"
                            class="inline-flex items-center px-3 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                            Next
                            <span class="material-icons text-sm ml-1">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Payslip History Modal -->
            <div v-if="showHistoryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
                            <span class="material-icons text-sm">history</span>
                            Payslip History - {{ selectedEmployee?.name }}
                        </h2>
                        <div class="flex items-center gap-2">
                            <button @click.stop="generatePayslipNow(selectedEmployee)"
                                class="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-4 rounded-md"
                                :disabled="isLoading || payslipGenerationStatus.generating">
                                <span class="material-icons text-sm">play_arrow</span>
                                {{ payslipGenerationStatus.generating ? 'Generating...' : 'Generate Now' }}
                            </button>
                            <button @click="showHistoryModal = false" class="p-1 hover:bg-gray-100 rounded-full">
                                <span class="material-icons text-sm">close</span>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-1 overflow-hidden">
                        <div class="w-1/2 p-4 overflow-y-auto border-r">
                            <!-- Previous Position Payslips (Initial Position) -->
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Previous Position Payslips</h3>
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer"
                                            @click="sortPreviousPayslips('payDate')">
                                            Pay Date <span class="material-icons text-xs">{{ sortPreviousField ===
                                                'payDate' ?
                                                (sortPreviousAsc ? 'arrow_upward' : 'arrow_downward') : '' }}</span>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer"
                                            @click="sortPreviousPayslips('position')">
                                            Position <span class="material-icons text-xs">{{ sortPreviousField ===
                                                'position' ?
                                                (sortPreviousAsc ? 'arrow_upward' : 'arrow_downward') : '' }}</span>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Salary</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr v-for="payslip in sortedPreviousPayslips"
                                        :key="`${payslip.salaryMonth}-${payslip.paydayType}`"
                                        class="hover:bg-blue-50 cursor-pointer"
                                        :class="{ 'bg-blue-100': selectedPayslip?.salaryMonth === payslip.salaryMonth && selectedPayslip?.paydayType === payslip.paydayType }"
                                        @click="selectPayslip(payslip)">
                                        <td class="px-4 py-2 text-sm text-gray-900">
                                            {{ payslip.paydayType === 'mid-month' ?
                                                payslip.expectedPaydays.midMonthPayday :
                                                payslip.expectedPaydays.endMonthPayday }}
                                        </td>
                                        <td class="px-4 py-2 text-sm text-gray-500">
                                            {{ getPositionName(payslip.position) }}
                                        </td>
                                        <td class="px-4 py-2 text-sm text-gray-500">
                                            ₱{{ payslip.salary.toLocaleString() }}
                                        </td>
                                        <td class="px-4 py-2 text-sm text-gray-500">
                                            {{ payslip.payslipDataUrl ? 'Generated' : 'Pending' }}
                                        </td>
                                        <td class="px-4 py-2">
                                            <button v-if="!payslip.payslipDataUrl"
                                                @click.stop="generatePayslip(payslip)"
                                                class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                                :disabled="!canGeneratePayslip(payslip) || payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating">
                                                <span class="material-icons text-sm">description</span>
                                                {{
                                                    payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating
                                                        ? 'Generating...' : 'Generate'
                                                }}
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="sortedPreviousPayslips.length === 0">
                                        <td colspan="5" class="px-4 py-4 text-center text-sm text-gray-500">No previous
                                            payslips available.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <!-- New Position Payslips (Only After Update) -->
                            <div v-if="hasUpdatedPosition">
                                <h3 class="text-sm font-medium text-gray-700 mt-6 mb-2">New Position Payslips</h3>
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer"
                                                @click="sortNewPayslips('payDate')">
                                                Pay Date <span class="material-icons text-xs">{{ sortNewField ===
                                                    'payDate' ? (sortNewAsc ?
                                                        'arrow_upward' : 'arrow_downward') : '' }}</span>
                                            </th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer"
                                                @click="sortNewPayslips('position')">
                                                Position <span class="material-icons text-xs">{{ sortNewField ===
                                                    'position' ? (sortNewAsc ?
                                                        'arrow_upward' : 'arrow_downward') : '' }}</span>
                                            </th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Salary
                                            </th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Status
                                            </th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr v-for="payslip in sortedNewPayslips"
                                            :key="`${payslip.salaryMonth}-${payslip.paydayType}`"
                                            class="hover:bg-blue-50 cursor-pointer"
                                            :class="{ 'bg-blue-100': selectedPayslip?.salaryMonth === payslip.salaryMonth && selectedPayslip?.paydayType === payslip.paydayType }"
                                            @click="selectPayslip(payslip)">
                                            <td class="px-4 py-2 text-sm text-gray-900">
                                                {{ payslip.paydayType === 'mid-month' ?
                                                    payslip.expectedPaydays.midMonthPayday :
                                                    payslip.expectedPaydays.endMonthPayday }}
                                            </td>
                                            <td class="px-4 py-2 text-sm text-gray-500">
                                                {{ getPositionName(payslip.position) }}
                                            </td>
                                            <td class="px-4 py-2 text-sm text-gray-500">
                                                ₱{{ payslip.salary.toLocaleString() }}
                                            </td>
                                            <td class="px-4 py-2 text-sm text-gray-500">
                                                {{ payslip.payslipDataUrl ? 'Generated' : 'Pending' }}
                                            </td>
                                            <td class="px-4 py-2">
                                                <button v-if="!payslip.payslipDataUrl"
                                                    @click.stop="generatePayslip(payslip)"
                                                    class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                                    :disabled="!canGeneratePayslip(payslip) || payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating">
                                                    <span class="material-icons text-sm">description</span>
                                                    {{
                                                        payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating
                                                            ? 'Generating...' : 'Generate'
                                                    }}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr v-if="sortedNewPayslips.length === 0">
                                            <td colspan="5" class="px-4 py-4 text-center text-sm text-gray-500">No new
                                                payslips available.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="w-1/2 p-4 overflow-y-auto">
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Payslip Preview</h3>
                            <div v-if="selectedPayslip && selectedPayslip.payslipDataUrl" class="flex flex-col h-full">
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600">
                                        Position: {{ getPositionName(selectedPayslip.position) }} |
                                        Salary: ₱{{ selectedPayslip.salary.toLocaleString() }}
                                    </p>
                                </div>
                                <iframe :src="selectedPayslip.payslipDataUrl"
                                    class="w-full h-[50vh] rounded border mb-4" @load="onIframeLoad"
                                    @error="onIframeError"></iframe>
                                <button @click="downloadPayslip"
                                    class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md">
                                    <span class="material-icons text-sm">download</span>
                                    Download PDF
                                </button>
                                <div v-if="iframeError"
                                    class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm flex items-center gap-1">
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

            <!-- Update Position Modal -->
            <div v-if="showUpdateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h2 class="text-base font-medium text-gray-800 mb-4 flex items-center gap-1">
                        <span class="material-icons text-sm">edit</span>
                        Update Employee Position
                    </h2>
                    <div class="mb-4">
                        <label class="block text-sm text-gray-700 mb-1">Select Employee</label>
                        <select v-model="selectedEmployeeForUpdate" class="w-full p-2 border rounded text-sm">
                            <option value="" disabled>Select an employee</option>
                            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                                {{ emp.name }} ({{ getPositionName(emp.position) }})
                            </option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm text-gray-700 mb-1">New Position</label>
                        <select v-model="newPosition" class="w-full p-2 border rounded text-sm">
                            <option value="" disabled>Select a position</option>
                            <option v-for="pos in positions" :key="pos.name" :value="pos.name">
                                {{ pos.name }} (₱{{ pos.salary.toLocaleString() }})
                            </option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button @click="showUpdateModal = false"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                            Cancel
                        </button>
                        <button @click="updateEmployeePosition"
                            class="flex items-center gap-1 px-4 py-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-600"
                            :disabled="!selectedEmployeeForUpdate || !newPosition || isLoading">
                            <span class="material-icons text-sm">save</span>
                            Update
                        </button>
                    </div>
                </div>
            </div>

            <!-- Deduction Modal -->
            <div v-if="showDeductionModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
                            <span class="material-icons text-sm">money_off</span>
                            Manage Deductions
                        </h2>
                        <button @click="showDeductionModal = false" class="p-1 hover:bg-gray-100 rounded-full">
                            <span class="material-icons text-sm">close</span>
                        </button>
                    </div>
                    <div class="flex flex-1 overflow-hidden">
                        <!-- Available Deductions -->
                        <div class="w-1/3 p-4 overflow-y-auto border-r">
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Available Deductions</h3>
                            <div v-if="availableDeductions.length > 0" class="mb-4">
                                <label class="flex items-center">
                                    <input type="checkbox" v-model="selectAllDeductions" @change="toggleSelectAllDeductions"
                                        class="large-checkbox mr-2" />
                                    <span class="text-sm text-gray-900 font-medium">Select All</span>
                                </label>
                            </div>
                            <div v-if="availableDeductions.length > 0">
                                <div v-for="deduction in availableDeductions" :key="deduction._id"
                                    class="flex items-center py-2 border-b">
                                    <input type="checkbox" v-model="selectedDeductions" :value="deduction"
                                        class="large-checkbox mr-2" />
                                    <span class="text-sm text-gray-900">{{ deduction.name }} (₱{{ deduction.amount.toLocaleString() }})</span>
                                </div>
                            </div>
                            <div v-else class="text-sm text-gray-500 text-center py-4">
                                No deductions available.
                            </div>
                        </div>
                        <!-- Employee List with Lates/Absences -->
                        <div class="w-2/3 p-4 overflow-y-auto">
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Employees</h3>
                            <div v-if="employeesWithAttendance.length > 0" class="mb-4">
                                <label class="flex items-center">
                                    <input type="checkbox" v-model="selectAllEmployees" @change="toggleSelectAllEmployees"
                                        class="large-checkbox mr-2" />
                                    <span class="text-sm text-gray-900 font-medium">Select All</span>
                                </label>
                            </div>
                            <table v-if="employeesWithAttendance.length > 0" class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Select</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Position</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Lates (min)</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Absences (days)</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr v-for="emp in employeesWithAttendance" :key="emp.id">
                                        <td class="px-4 py-2">
                                            <input type="checkbox" v-model="selectedEmployeesForDeduction" :value="emp"
                                                class="large-checkbox" />
                                        </td>
                                        <td class="px-4 py-2 text-sm text-gray-900">{{ emp.name }}</td>
                                        <td class="px-4 py-2 text-sm text-gray-500">{{ getPositionName(emp.position) }}</td>
                                        <td class="px-4 py-2 text-sm text-gray-500">{{ emp.totalLates || 0 }}</td>
                                        <td class="px-4 py-2 text-sm text-gray-500">{{ emp.absences?.days || 0 }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div v-else class="text-sm text-gray-500 text-center py-4">
                                No employees available.
                            </div>
                        </div>
                    </div>
                    <div class="p-4 border-t flex justify-end gap-2">
                        <button @click="showDeductionModal = false"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                            Cancel
                        </button>
                        <button @click="saveDeductions"
                            class="flex items-center gap-1 px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
                            :disabled="selectedDeductions.length === 0 || selectedEmployeesForDeduction.length === 0 || isLoading">
                            <span class="material-icons text-sm">save</span>
                            Apply Deductions
                        </button>
                    </div>
                </div>
            </div>

            <!-- Print All Modal -->
            <div v-if="showPrintAllModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
                            <span class="material-icons text-sm">print</span>
                            Print Payslips
                        </h2>
                        <button @click="showPrintAllModal = false" class="p-1 hover:bg-gray-100 rounded-full">
                            <span class="material-icons text-sm">close</span>
                        </button>
                    </div>
                    <div class="p-4 overflow-y-auto">
                        <h3 class="text-sm font-medium text-gray-700 mb-2">Select Employees to Print</h3>
                        <div v-if="employeesWithPayslips.length > 0" class="mb-4">
                            <label class="flex items-center">
                                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                                    class="large-checkbox mr-2" />
                                <span class="text-sm text-gray-900 font-medium">Select All</span>
                            </label>
                        </div>
                        <div v-if="employeesWithPayslips.length > 0">
                            <div v-for="emp in employeesWithPayslips" :key="emp.id"
                                class="flex items-center py-2 border-b">
                                <input type="checkbox" v-model="selectedEmployeesForPrint" :value="emp.id"
                                    class="large-checkbox mr-2" />
                                <span class="text-sm text-gray-900">{{ emp.name }} - Most Recent: {{
                                    emp.latestPayslipDate }}</span>
                            </div>
                        </div>
                        <div v-else class="text-sm text-gray-500 text-center py-4">
                            No employees with generated payslips found in history.
                        </div>
                    </div>
                    <div class="p-4 border-t flex justify-end gap-2">
                        <button @click="showPrintAllModal = false"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                            Cancel
                        </button>
                        <button @click="printSelectedPayslips"
                            class="flex items-center gap-1 px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
                            :disabled="selectedEmployeesForPrint.length === 0 || isPrinting">
                            <span class="material-icons text-sm">print</span>
                            {{ isPrinting ? 'Printing...' : 'Print Selected' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Toast Messages -->
            <div v-if="statusMessage" :class="[
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
import { applyPlugin } from 'jspdf-autotable';
import moment from 'moment';
import { BASE_API_URL } from '@/utils/constants.js';
import { useAuthStore } from '@/stores/auth.store.js';

applyPlugin(jsPDF);

export default {
    name: 'SalarySlips',
    data() {
        return {
            employees: [],
            positions: [],
            payHeads: [],
            availableDeductions: [],
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10,
            payslipGenerationStatus: {},
            isLoading: false,
            isGeneratingAll: false,
            statusMessage: '',
            showHistoryModal: false,
            showDeductionModal: false,
            selectedEmployee: null,
            selectedPayslip: null,
            payslipHistory: [],
            allPayslipHistories: {},
            iframeError: false,
            showPrintAllModal: false,
            employeesWithPayslips: [],
            selectedEmployeesForPrint: [],
            isPrinting: false,
            selectAll: false,
            showUpdateModal: false,
            selectedEmployeeForUpdate: '',
            newPosition: '',
            selectedDeductions: [],
            selectedEmployeesForDeduction: [],
            selectAllDeductions: false,
            selectAllEmployees: false,
            employeesWithAttendance: [],
            sortPreviousField: 'payDate',
            sortPreviousAsc: true,
            sortNewField: 'payDate',
            sortNewAsc: true,
            currentDate: new Date().toISOString().split('T')[0],
            config: {
                minimumWage: 610,
                deMinimisLimit: 10000,
                regularHolidays: [],
                specialNonWorkingDays: [],
            },
        };
    },
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    computed: {
        filteredEmployees() {
            return this.employees.filter((employee) => {
                const name = employee && employee.name ? employee.name : '';
                return name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        },
        totalPages() {
            return Math.ceil(this.filteredEmployees.length / this.itemsPerPage) || 1;
        },
        paginatedEmployees() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredEmployees.slice(start, end).sort((a, b) => {
                return a.position.localeCompare(b.position);
            });
        },
        sortedPositionHistory() {
            if (!this.selectedEmployee || !this.selectedEmployee.positionHistory) {
                return [{
                    position: this.selectedEmployee?.position || 'N/A',
                    salary: this.selectedEmployee?.salary || 0,
                    startDate: this.selectedEmployee?.hireDate || this.currentDate,
                    endDate: null
                }];
            }
            return [...this.selectedEmployee.positionHistory].sort((a, b) =>
                new Date(a.startDate) - new Date(b.startDate)
            );
        },
        initialPosition() {
            return this.sortedPositionHistory[0];
        },
        latestPosition() {
            return this.sortedPositionHistory[this.sortedPositionHistory.length - 1];
        },
        hasUpdatedPosition() {
            return this.sortedPositionHistory.length > 1;
        },
        sortedPreviousPayslips() {
            const previousPayslips = this.payslipHistory.filter(payslip =>
                payslip.position === this.initialPosition.position
            );
            return previousPayslips.sort((a, b) => {
                if (this.sortPreviousField === 'payDate') {
                    const dateA = moment(a.payDate, 'YYYY-MM-DD');
                    const dateB = moment(b.payDate, 'YYYY-MM-DD');
                    return this.sortPreviousAsc ? dateA - dateB : dateB - dateA;
                } else if (this.sortPreviousField === 'position') {
                    const posA = this.getPositionName(a.position);
                    const posB = this.getPositionName(b.position);
                    return this.sortPreviousAsc ? posA.localeCompare(posB) : posB.localeCompare(posA);
                }
                return 0;
            });
        },
        sortedNewPayslips() {
            const newPayslips = this.payslipHistory.filter(payslip =>
                payslip.position === this.latestPosition.position &&
                this.hasUpdatedPosition &&
                moment(payslip.salaryMonth, 'YYYY-MM').isSameOrAfter(moment(this.latestPosition.startDate, 'YYYY-MM-DD'), 'month')
            );
            return newPayslips.sort((a, b) => {
                if (this.sortNewField === 'payDate') {
                    const dateA = moment(a.payDate, 'YYYY-MM-DD');
                    const dateB = moment(b.payDate, 'YYYY-MM-DD');
                    return this.sortNewAsc ? dateA - dateB : dateB - dateA;
                } else if (this.sortNewField === 'position') {
                    const posA = this.getPositionName(a.position);
                    const posB = this.getPositionName(b.position);
                    return this.sortNewAsc ? posA.localeCompare(posB) : posB.localeCompare(posA);
                }
                return 0;
            });
        }
    },
    async created() {
        if (!this.authStore.isAuthenticated) {
            console.error('User is not authenticated. Redirecting to login...');
            this.showErrorMessage('Please log in to access this page.');
            this.$router.push(this.authStore.userRole === 'employee' ? '/employee-login' : '/admin-login');
            return;
        }

        this.isLoading = true;
        try {
            await Promise.all([
                this.fetchPositionsWithRetry(),
                this.fetchEmployees(),
                this.fetchPayHeads()
            ]);
        } catch (error) {
            console.error('Error in created hook:', error);
            this.showErrorMessage('Failed to initialize component. Please try again.');
        } finally {
            this.isLoading = false;
        }
    },
    methods: {
        async fetchPositionsWithRetry(retries = 3, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const userId = this.authStore.admin?._id || localStorage.getItem('userId') || '';
                    const token = this.authStore.accessToken || localStorage.getItem('token') || '';
                    if (!token) throw new Error('No authentication token found');

                    const headers = {
                        'Authorization': `Bearer ${token}`,
                        'user-role': 'admin'
                    };

                    if (userId) {
                        headers['user-id'] = userId;
                    }

                    console.log('Fetching positions with:', { userId, token: token.slice(0, 20) + '...' });
                    const response = await axios.get(`${BASE_API_URL}/api/positions`, { headers });

                    this.positions = response.data.map(position => ({
                        name: position.name,
                        salary: position.salary
                    }));
                    return;
                } catch (error) {
                    console.error(`Attempt ${i + 1} to fetch positions failed:`, error);
                    if (i === retries - 1) {
                        this.showErrorMessage('Failed to load positions after multiple attempts.');
                    } else {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
        },
        async fetchPayHeads() {
            this.isLoading = true;
            try {
                const token = this.authStore.accessToken || localStorage.getItem('token');
                const userId = this.authStore.admin?._id || localStorage.getItem('userId') || '';
                const response = await axios.get(`${BASE_API_URL}/api/payheads`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'user-role': 'admin',
                        'user-id': userId
                    }
                });
                this.payHeads = response.data.map(item => ({
                    _id: item._id,
                    id: item.id,
                    name: item.name,
                    amount: Number(item.amount || 0),
                    type: item.type,
                    isRecurring: item.isRecurring || false,
                    appliedThisCycle: item.appliedThisCycle || false
                }));
                this.availableDeductions = this.payHeads.filter(p => p.type === 'Deductions');
                console.log('Fetched payHeads:', this.payHeads);
            } catch (error) {
                console.error('Error fetching pay heads:', error.response?.data || error.message);
                this.showErrorMessage('Failed to load deductions.');
                this.payHeads = [];
                this.availableDeductions = [];
            } finally {
                this.isLoading = false;
            }
        },
        getPositionName(positionName) {
            const position = this.positions.find(p => p.name.trim().toLowerCase() === positionName?.trim().toLowerCase());
            return position ? position.name : positionName || 'Unknown Position';
        },
        getPositionSalary(positionName) {
            const position = this.positions.find(p => p.name.trim().toLowerCase() === positionName?.trim().toLowerCase());
            return position ? position.salary : 0;
        },
        getHourlyRate(positionName) {
            const salary = this.getPositionSalary(positionName);
            return Number((salary / (8 * 22)).toFixed(2));
        },
        async fetchEmployees() {
            this.isLoading = true;
            this.statusMessage = '';
            const userId = this.authStore.admin?._id || localStorage.getItem('userId') || '';
            const token = this.authStore.accessToken || localStorage.getItem('token') || '';
            console.log('Fetching employees with:', { userId, token: token.slice(0, 20) + '...' });
            try {
                if (!token) throw new Error('No authentication token found');
                const response = await axios.get(`${BASE_API_URL}/api/employees`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'user-role': 'admin',
                        'user-id': userId,
                    },
                });
                this.employees = response.data
                    .filter(employee => employee.status !== 'pending' && employee.status !== 'trashed')
                    .map((employee) => {
                        const latestPosition = this.getLatestPosition(employee);
                        const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unnamed Employee';
                        const payheads = (employee.payheads || []).map(ph => ({
                            _id: ph._id,
                            id: ph.id || -1,
                            name: ph.name || 'Unknown',
                            amount: Number(ph.amount || 0),
                            type: ph.type || 'Earnings',
                            isRecurring: ph.isRecurring || false,
                            appliedThisCycle: ph.appliedThisCycle || false,
                            uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        }));
                        const mappedEmployee = {
                            ...employee,
                            id: employee._id,
                            name,
                            position: latestPosition.position,
                            salary: latestPosition.salary,
                            payheads,
                            totalLates: employee.lates?.totalMinutes || 0,
                            positionHistory: Array.isArray(employee.positionHistory) && employee.positionHistory.length > 0 ? employee.positionHistory : [{
                                position: employee.position || 'N/A',
                                salary: employee.salary || 0,
                                startDate: employee.hireDate || this.currentDate,
                                endDate: null
                            }],
                            createdAt: employee.createdAt || employee.hireDate,
                            updatedAt: employee.updatedAt
                        };
                        if (employee._id === '67e4d967fc64c58822e13774') {
                            console.log('Position history for employee 67e4d967fc64c58822e13774:', mappedEmployee.positionHistory);
                        }
                        return mappedEmployee;
                    });
                this.showSuccessMessage('Employees loaded successfully!');
            } catch (error) {
                console.error('Error fetching employees:', error);
                this.showErrorMessage(`Failed to load employees: ${error.message}`);
            } finally {
                this.isLoading = false;
            }
        },
        async refreshData() {
            this.isLoading = true;
            try {
                await Promise.all([
                    this.fetchPositionsWithRetry(),
                    this.fetchEmployees(),
                    this.fetchPayHeads()
                ]);
                if (this.showHistoryModal && this.selectedEmployee) {
                    await this.showPayslipHistory(this.selectedEmployee);
                }
            } catch (error) {
                console.error('Error refreshing data:', error);
                this.showErrorMessage(`Failed to refresh data: ${error.message}`);
            } finally {
                this.isLoading = false;
            }
        },
        showDeductionModal() {
            this.selectedDeductions = [];
            this.selectedEmployeesForDeduction = [];
            this.selectAllDeductions = false;
            this.selectAllEmployees = false;
            this.employeesWithAttendance = this.employees.map(emp => ({
                ...emp,
                totalLates: emp.lates?.totalMinutes || 0,
                absences: emp.absences || { days: 0 }
            }));
            this.showDeductionModal = true;
        },
        toggleSelectAllDeductions() {
            if (this.selectAllDeductions) {
                this.selectedDeductions = [...this.availableDeductions];
            } else {
                this.selectedDeductions = [];
            }
        },
        toggleSelectAllEmployees() {
            if (this.selectAllEmployees) {
                this.selectedEmployeesForDeduction = [...this.employeesWithAttendance];
            } else {
                this.selectedEmployeesForDeduction = [];
            }
        },
        async saveDeductions() {
            if (this.selectedDeductions.length === 0 || this.selectedEmployeesForDeduction.length === 0) return;
            this.isLoading = true;
            try {
                const token = this.authStore.accessToken || localStorage.getItem('token');
                if (!token) throw new Error('No authentication token available');
                for (const employee of this.selectedEmployeesForDeduction) {
                    const existingPayheads = this.employees.find(e => e.id === employee.id)?.payheads || [];
                    const updatedPayheads = [...existingPayheads];
                    for (const deduction of this.selectedDeductions) {
                        if (!updatedPayheads.some(ph => ph._id === deduction._id && !ph.isRecurring)) {
                            updatedPayheads.push({
                                _id: deduction._id,
                                id: deduction.id,
                                name: deduction.name,
                                amount: Number(deduction.amount || 0),
                                type: deduction.type,
                                isRecurring: false,
                                appliedThisCycle: false,
                                uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                            });
                        }
                    }
                    const payheadsForBackend = updatedPayheads.map(ph => ph._id).filter(id => id);
                    const updatedEmployee = {
                        payheads: payheadsForBackend,
                        salary: Number(employee.salary || 0) +
                            this.calculateEarnings(updatedPayheads) -
                            this.calculateDeductions(updatedPayheads) -
                            this.calculateRecurringDeductions(updatedPayheads)
                    };
                    console.log('Saving deductions for employee:', employee.id, updatedEmployee);
                    await axios.put(
                        `${BASE_API_URL}/api/employees/update/${employee.id}`,
                        updatedEmployee,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'user-role': 'admin',
                                'user-id': this.authStore.admin?._id || localStorage.getItem('userId') || ''
                            }
                        }
                    );
                    const employeeIndex = this.employees.findIndex(e => e.id === employee.id);
                    if (employeeIndex !== -1) {
                        this.employees[employeeIndex] = {
                            ...this.employees[employeeIndex],
                            payheads: updatedPayheads,
                            salary: updatedEmployee.salary
                        };
                    }
                }
                this.showDeductionModal = false;
                this.showSuccessMessage('Deductions applied successfully!');
                await this.fetchEmployees();
            } catch (error) {
                console.error('Error saving deductions:', error.response?.data || error.message);
                this.showErrorMessage('Failed to apply deductions: ' + (error.response?.data?.message || error.message));
            } finally {
                this.isLoading = false;
            }
        },
        async showPayslipHistory(employee) {
            this.isLoading = true;
            if (!employee?.id || !employee?.empNo) {
                this.showErrorMessage('Invalid employee data');
                console.error('Invalid employee:', employee);
                this.isLoading = false;
                return;
            }

            const token = this.authStore.accessToken || localStorage.getItem('token');
            if (!token) {
                this.showErrorMessage('Authentication required. Please log in.');
                this.$router.push('/admin-login');
                return;
            }

            this.selectedEmployee = {
                ...employee,
                positionHistory: Array.isArray(employee.positionHistory) && employee.positionHistory.length > 0
                    ? employee.positionHistory
                    : [{
                        position: employee.position || 'N/A',
                        salary: employee.salary || 0,
                        startDate: employee.hireDate || this.currentDate,
                        endDate: null
                    }]
            };

            const today = moment(this.currentDate);
            const hireDate = moment(this.selectedEmployee.hireDate || this.currentDate);
            let backendPayslips = [];
            try {
                const response = await axios.get(`${BASE_API_URL}/api/payslips/${this.selectedEmployee.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'user-role': 'admin',
                    },
                });
                backendPayslips = response.data || [];
            } catch (error) {
                console.error('Error fetching payslips:', error);
            }

            const payslipHistory = [];
            let currentDate = hireDate.clone().startOf('month');

            while (currentDate.isSameOrBefore(today, 'day')) {
                const salaryMonth = currentDate.format('YYYY-MM');
                const expectedPaydays = this.getExpectedPayday(hireDate.toDate(), salaryMonth);

                // Mid-month payslip (15th)
                const midMonthDate = moment(`${salaryMonth}-15`, 'YYYY-MM-DD');
                if (midMonthDate.isSameOrAfter(hireDate, 'day')) {
                    const midPosition = this.getActivePositionForDate(this.selectedEmployee.positionHistory, midMonthDate);
                    const midPayslip = backendPayslips.find(p =>
                        p.salaryMonth === salaryMonth && p.paydayType === 'mid-month'
                    ) || {};

                    payslipHistory.push({
                        salaryMonth,
                        paydayType: 'mid-month',
                        payDate: midMonthDate.format('YYYY-MM-DD'),
                        position: midPosition.position,
                        salary: midPosition.salary,
                        totalSalary: midPayslip.salary ? this.calculateNetSalary({
                            ...this.selectedEmployee,
                            position: midPosition.position,
                            salary: midPosition.salary
                        }) : null,
                        payslipDataUrl: midPayslip.payslipData ? `data:application/pdf;base64,${midPayslip.payslipData}` : null,
                        employee: {
                            ...this.selectedEmployee,
                            position: midPosition.position,
                            salary: midPosition.salary,
                            salaryMonth: salaryMonth
                        },
                        expectedPaydays
                    });
                }

                // End-month payslip (last day of the month)
                const endMonthDate = moment(salaryMonth).endOf('month');
                if (endMonthDate.isSameOrAfter(hireDate, 'day')) {
                    const endPosition = this.getActivePositionForDate(this.selectedEmployee.positionHistory, endMonthDate);
                    const endPayslip = backendPayslips.find(p =>
                        p.salaryMonth === salaryMonth && p.paydayType === 'end-of-month'
                    ) || {};

                    payslipHistory.push({
                        salaryMonth,
                        paydayType: 'end-of-month',
                        payDate: endMonthDate.format('YYYY-MM-DD'),
                        position: endPosition.position,
                        salary: endPosition.salary,
                        totalSalary: endPayslip.salary ? this.calculateNetSalary({
                            ...this.selectedEmployee,
                            position: endPosition.position,
                            salary: endPosition.salary
                        }) : null,
                        payslipDataUrl: endPayslip.payslipData ? `data:application/pdf;base64,${endPayslip.payslipData}` : null,
                        employee: {
                            ...this.selectedEmployee,
                            position: endPosition.position,
                            salary: endPosition.salary,
                            salaryMonth: salaryMonth
                        },
                        expectedPaydays
                    });
                }

                currentDate.add(15, 'days').startOf('day');
                if (currentDate.date() > 15) {
                    currentDate.startOf('month').add(1, 'month');
                }
            }

            this.allPayslipHistories[this.selectedEmployee.id] = payslipHistory;
            this.payslipHistory = payslipHistory;
            this.selectedPayslip = payslipHistory.find(p => p.payslipDataUrl) || payslipHistory[0] || null;
            this.showHistoryModal = true;
            this.isLoading = false;

            for (const payslip of payslipHistory) {
                if (!payslip.payslipDataUrl && today.isSameOrAfter(moment(payslip.payDate), 'day')) {
                    await this.generatePayslip(payslip);
                }
            }
        },
        canGeneratePayslip(payslip) {
            const today = moment(this.currentDate);
            const payDate = moment(payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday, 'D MMMM YYYY');
            return today.isSameOrAfter(payDate, 'day') && !payslip.payslipDataUrl;
        },
        async generatePayslip(payslip) {
            const employee = payslip.employee;
            if (!employee?.id || !employee?.empNo) {
                this.showErrorMessage('Employee data is incomplete.');
                return;
            }

            const payDate = moment(payslip.payDate, 'YYYY-MM-DD');
            const positionHistory = Array.isArray(employee.positionHistory) ? employee.positionHistory : [];
            const activePosition = this.getActivePositionForDate(positionHistory, payDate);

            if (!activePosition?.position || activePosition.salary === undefined) {
                this.showErrorMessage('Invalid position or salary for this date.');
                return;
            }

            const updatedEmployee = { ...employee, position: activePosition.position, salary: activePosition.salary };
            const key = `${payslip.salaryMonth}-${payslip.paydayType}`;
            this.payslipGenerationStatus[key] = { generating: true };

            try {
                const payslipData = this.createPayslipData(updatedEmployee);
                const pdfBlob = await this.generatePdf(payslipData);
                const base64Data = await this.blobToBase64(pdfBlob);
                const url = URL.createObjectURL(pdfBlob);

                const payload = {
                    employeeId: employee.id,
                    empNo: String(employee.empNo),
                    payslipData: base64Data.split(',')[1],
                    salaryMonth: payslip.salaryMonth,
                    paydayType: payslip.paydayType,
                    position: activePosition.position,
                    salary: Number(activePosition.salary),
                    payDate: payDate.format('YYYY-MM-DD')
                };

                const token = this.authStore.accessToken || localStorage.getItem('token');
                if (!token) throw new Error('No authentication token available');

                console.log('Generating payslip with payload:', payload);

                const response = await axios.post(`${BASE_API_URL}/api/payslips/generate`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'user-role': 'admin'
                    },
                });

                if (response.status === 201 || response.status === 200) {
                    payslip.payslipDataUrl = url;
                    payslip.position = activePosition.position;
                    payslip.salary = activePosition.salary;
                    payslip.totalSalary = this.calculateNetSalary(updatedEmployee);
                    this.selectedPayslip = payslip;

                    const employeeHistory = this.allPayslipHistories[employee.id] || [];
                    const updatedHistory = employeeHistory.map(p =>
                        p.salaryMonth === payslip.salaryMonth && p.paydayType === payslip.paydayType ? payslip : p
                    );
                    if (!employeeHistory.some(p => p.salaryMonth === payslip.salaryMonth && p.paydayType === payslip.paydayType)) {
                        updatedHistory.push(payslip);
                    }
                    this.allPayslipHistories[employee.id] = updatedHistory;
                    this.payslipHistory = updatedHistory;

                    this.showSuccessMessage(`Payslip generated for ${employee.name} - ${payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday}!`);
                }
            } catch (error) {
                console.error('Error generating payslip:', error.response?.data || error.message);
                this.showErrorMessage(`Failed to generate payslip: ${error.response?.data?.message || error.message}`);
            } finally {
                this.payslipGenerationStatus[key] = { generating: false };
            }
        },
        async generateAllPayslips() {
            this.isGeneratingAll = true;
            this.statusMessage = '';
            try {
                for (const employee of this.employees) {
                    if (!this.allPayslipHistories[employee.id]) {
                        await this.showPayslipHistory(employee);
                        this.showHistoryModal = false;
                    }
                }

                const payslipsToGenerate = [];
                for (const employee of this.employees) {
                    const history = this.allPayslipHistories[employee.id] || [];
                    const duePayslips = history.filter(payslip => this.canGeneratePayslip(payslip));
                    payslipsToGenerate.push(...duePayslips);
                }

                if (payslipsToGenerate.length === 0) {
                    this.showErrorMessage('No payslips are due for generation.');
                    return;
                }

                for (const payslip of payslipsToGenerate) {
                    await this.generatePayslip(payslip);
                }

                this.showSuccessMessage(`Generated ${payslipsToGenerate.length} payslips successfully!`);
            } catch (error) {
                console.error('Error generating all payslips:', error);
                this.showErrorMessage(`Failed to generate all payslips: ${error.message}`);
            } finally {
                this.isGeneratingAll = false;
            }
        },
        async generatePayslipNow(employee) {
            this.payslipGenerationStatus.generating = true;
            try {
                const today = moment(this.currentDate);
                const salaryMonth = today.format('YYYY-MM');
                const lastDayOfMonth = today.clone().endOf('month').date();
                const payDate = today.isBefore(moment(`${salaryMonth}-15`, 'YYYY-MM-DD').endOf('day'))
                    ? moment(`${salaryMonth}-15`, 'YYYY-MM-DD')
                    : moment(`${salaryMonth}-${lastDayOfMonth}`, 'YYYY-MM-DD');
                const activePosition = this.getActivePositionForDate(employee.positionHistory, payDate);
                if (!activePosition || !activePosition.position || activePosition.salary === undefined) {
                    this.showErrorMessage('No valid position for current date.');
                    console.error('Invalid activePosition:', activePosition);
                    return;
                }
                const updatedEmployee = { ...employee, position: activePosition.position, salary: activePosition.salary };
                const expectedPaydays = this.getExpectedPayday(employee.hireDate, salaryMonth);

                const paydayType = payDate.date() === 15 ? 'mid-month' : 'end-of-month';
                const employeeSalaryMonth = `${salaryMonth}-${paydayType === 'mid-month' ? '15' : lastDayOfMonth}`;

                let payslipData = {
                    salaryMonth,
                    paydayType,
                    position: activePosition.position,
                    salary: activePosition.salary,
                    employee: { ...updatedEmployee, salaryMonth: employeeSalaryMonth },
                    expectedPaydays,
                    payDate: payDate.format('YYYY-MM-DD')
                };

                const pdfPayslipData = this.createPayslipData(payslipData.employee);
                const pdfBlob = await this.generatePdf(pdfPayslipData);
                const base64Data = await this.blobToBase64(pdfBlob);
                const url = URL.createObjectURL(pdfBlob);

                const payload = {
                    employeeId: employee.id,
                    empNo: String(employee.empNo),
                    payslipData: base64Data.split(',')[1],
                    salaryMonth: payslipData.salaryMonth,
                    paydayType: payslipData.paydayType,
                    position: activePosition.position,
                    salary: Number(activePosition.salary),
                    payDate: payDate.format('YYYY-MM-DD')
                };

                const token = this.authStore.accessToken || localStorage.getItem('token');
                if (!token) throw new Error('No authentication token available');

                console.log('Sending payload to backend (generatePayslipNow):', payload);

                const response = await axios.post(`${BASE_API_URL}/api/payslips/generate`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'user-role': 'admin'
                    },
                });

                if (response.status === 201 || response.status === 200) {
                    payslipData.payslipDataUrl = url;
                    payslipData.totalSalary = this.calculateNetSalary(updatedEmployee);

                    const employeeHistory = this.allPayslipHistories[employee.id] || [];
                    const updatedHistory = employeeHistory.map(p =>
                        p.salaryMonth === payslipData.salaryMonth && p.paydayType === payslipData.paydayType ? payslipData : p
                    );
                    if (!employeeHistory.some(p => p.salaryMonth === payslipData.salaryMonth && p.paydayType === payslipData.paydayType)) {
                        updatedHistory.push(payslipData);
                    }
                    this.allPayslipHistories[employee.id] = updatedHistory;
                    this.payslipHistory = updatedHistory;
                    this.selectedPayslip = payslipData;

                    this.showSuccessMessage(`Payslip generated for ${employee.name} - ${payslipData.paydayType === 'mid-month' ? payslipData.expectedPaydays.midMonthPayday : payslipData.expectedPaydays.endMonthPayday}!`);
                }
            } catch (error) {
                console.error('Error generating payslip now:', error.response?.data || error.message);
                this.showErrorMessage(`Failed to generate payslip: ${error.response?.data?.message || error.message}`);
            } finally {
                this.payslipGenerationStatus.generating = false;
            }
        },
        getLatestPosition(employee) {
            if (!Array.isArray(employee.positionHistory) || employee.positionHistory.length === 0) {
                return {
                    position: employee.position || 'N/A',
                    salary: employee.salary || 0,
                    startDate: employee.hireDate || this.currentDate
                };
            }
            const sortedHistory = [...employee.positionHistory].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            return sortedHistory.find(h => !h.endDate) || sortedHistory[0];
        },
        getActivePositionForDate(positionHistory, date) {
            if (!Array.isArray(positionHistory) || positionHistory.length === 0) {
                return {
                    position: 'N/A',
                    salary: 0,
                    startDate: this.selectedEmployee?.hireDate || this.currentDate
                };
            }
            const targetDate = moment(date);
            const sortedHistory = [...positionHistory].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            const activePosition = sortedHistory.find(history => {
                const startDate = moment(history.startDate);
                const endDate = history.endDate ? moment(history.endDate) : moment('9999-12-31');
                return targetDate.isSameOrAfter(startDate, 'day') && targetDate.isSameOrBefore(endDate, 'day');
            });
            return activePosition || sortedHistory[sortedHistory.length - 1];
        },
        calculateEarnings(payheads = []) {
            return payheads
                .filter(ph => ph.type === 'Earnings' && Number(ph.amount) > 0)
                .reduce((sum, ph) => sum + Number(ph.amount || 0), 0);
        },
        calculateDeductions(payheads = []) {
            return payheads
                .filter(ph => ph.type === 'Deductions' && !ph.isRecurring && Number(ph.amount) > 0)
                .reduce((sum, ph) => sum + Number(ph.amount || 0), 0);
        },
        calculateRecurringDeductions(payheads = []) {
            return payheads
                .filter(ph => ph.type === 'Deductions' && ph.isRecurring && Number(ph.amount) > 0)
                .reduce((sum, ph) => sum + Number(ph.amount || 0), 0);
        },
        calculateNonTaxableIncome(employee) {
            const deMinimis = Math.min(this.calculateEarnings(employee.payheads), this.config.deMinimisLimit);
            return deMinimis;
        },
        calculateTax(employee) {
            const monthlySalary = Number(employee.salary || 0);
            const nonTaxable = this.calculateNonTaxableIncome(employee);
            const taxableIncome = Math.max(0, monthlySalary + this.calculateEarnings(employee.payheads) - nonTaxable - this.calculateDeductions(employee.payheads) - this.calculateRecurringDeductions(employee.payheads));

            // Simplified Philippine tax brackets (2025, monthly)
            const taxBrackets = [
                { threshold: 20833, taxRate: 0, baseTax: 0 }, // Up to 250,000 annually
                { threshold: 33333, taxRate: 0.15, baseTax: 0 }, // 250,001 - 400,000
                { threshold: 66667, taxRate: 0.20, baseTax: 2250 }, // 400,001 - 800,000
                { threshold: 166667, taxRate: 0.25, baseTax: 10250 }, // 800,001 - 2,000,000
                { threshold: 666667, taxRate: 0.30, baseTax: 40250 }, // 2,000,001 - 8,000,000
                { threshold: Infinity, taxRate: 0.35, baseTax: 220250 } // Above 8,000,000
            ];

            for (const bracket of taxBrackets) {
                if (taxableIncome <= bracket.threshold) {
                    return Number((bracket.baseTax + (taxableIncome - (bracket.threshold === Infinity ? 0 : taxBrackets[taxBrackets.indexOf(bracket) - 1]?.threshold || 0)) * bracket.taxRate).toFixed(2));
                }
            }
            return 0;
        },
        calculateNetSalary(employee) {
            const basicSalary = Number(employee.salary || 0);
            const earnings = this.calculateEarnings(employee.payheads);
            const deductions = this.calculateDeductions(employee.payheads);
            const recurringDeductions = this.calculateRecurringDeductions(employee.payheads);
            const tax = this.calculateTax(employee);

            // Adjust for lates and absences
            const hourlyRate = this.getHourlyRate(employee.position);
            const lateDeduction = (employee.totalLates || 0) * (hourlyRate / 60);
            const absenceDeduction = (employee.absences?.days || 0) * (basicSalary / 22);

            const netSalary = basicSalary + earnings - deductions - recurringDeductions - tax - lateDeduction - absenceDeduction;
            return Number(netSalary.toFixed(2));
        },
        createPayslipData(employee) {
            const payDate = moment(employee.salaryMonth.split('-').slice(0, 2).join('-') + '-15').endOf('month').format('YYYY-MM-DD');
            const earnings = this.calculateEarnings(employee.payheads);
            const deductions = this.calculateDeductions(employee.payheads);
            const recurringDeductions = this.calculateRecurringDeductions(employee.payheads);
            const tax = this.calculateTax(employee);
            const netSalary = this.calculateNetSalary(employee);

            return {
                employeeName: employee.name,
                employeeId: employee.empNo,
                position: this.getPositionName(employee.position),
                payPeriod: employee.salaryMonth,
                payDate,
                basicSalary: Number(employee.salary || 0),
                earnings: employee.payheads
                    .filter(ph => ph.type === 'Earnings')
                    .map(ph => ({ name: ph.name, amount: Number(ph.amount || 0) })),
                deductions: employee.payheads
                    .filter(ph => ph.type === 'Deductions')
                    .map(ph => ({ name: ph.name, amount: Number(ph.amount || 0), isRecurring: ph.isRecurring })),
                tax,
                netSalary,
                totalEarnings: earnings,
                totalDeductions: deductions + recurringDeductions,
                lateDeduction: (employee.totalLates || 0) * (this.getHourlyRate(employee.position) / 60),
                absenceDeduction: (employee.absences?.days || 0) * (Number(employee.salary || 0) / 22)
            };
        },
        async generatePdf(payslipData) {
            const doc = new jsPDF();
            doc.setFontSize(12);
            doc.text('Payslip', 105, 20, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Employee: ${payslipData.employeeName}`, 20, 30);
            doc.text(`Employee ID: ${payslipData.employeeId}`, 20, 40);
            doc.text(`Position: ${payslipData.position}`, 20, 50);
            doc.text(`Pay Period: ${payslipData.payPeriod}`, 20, 60);
            doc.text(`Pay Date: ${payslipData.payDate}`, 20, 70);

            const tableY = 80;
            const earningsTable = payslipData.earnings.map(e => [e.name, `₱${e.amount.toLocaleString()}`]);
            earningsTable.unshift(['Basic Salary', `₱${payslipData.basicSalary.toLocaleString()}`]);

            doc.autoTable({
                startY: tableY,
                head: [['Earnings', 'Amount']],
                body: earningsTable,
                theme: 'grid',
                margin: { left: 20, right: 100 },
                styles: { fontSize: 8 }
            });

            const deductionsTable = payslipData.deductions.map(d => [d.name, `₱${d.amount.toLocaleString()}`]);
            if (payslipData.lateDeduction > 0) {
                deductionsTable.push(['Lates', `₱${payslipData.lateDeduction.toFixed(2)}`]);
            }
            if (payslipData.absenceDeduction > 0) {
                deductionsTable.push(['Absences', `₱${payslipData.absenceDeduction.toFixed(2)}`]);
            }
            deductionsTable.push(['Tax', `₱${payslipData.tax.toFixed(2)}`]);

            doc.autoTable({
                startY: tableY,
                head: [['Deductions', 'Amount']],
                body: deductionsTable,
                theme: 'grid',
                margin: { left: 110, right: 20 },
                styles: { fontSize: 8 }
            });

            const finalY = Math.max(
                doc.lastAutoTable.finalY || tableY,
                doc.lastAutoTable.finalY || tableY
            );

            doc.text(`Total Earnings: ₱${payslipData.totalEarnings.toLocaleString()}`, 20, finalY + 10);
            doc.text(`Total Deductions: ₱${payslipData.totalDeductions.toLocaleString()}`, 20, finalY + 20);
            doc.text(`Net Pay: ₱${payslipData.netSalary.toLocaleString()}`, 20, finalY + 30);

            return doc.output('blob');
        },
        getExpectedPayday(hireDate, salaryMonth) {
            const midMonthPayday = moment(`${salaryMonth}-15`).format('D MMMM YYYY');
            const endMonthPayday = moment(salaryMonth).endOf('month').format('D MMMM YYYY');
            return { midMonthPayday, endMonthPayday };
        },
        async blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        },
        showSuccessMessage(message) {
            this.statusMessage = message;
            setTimeout(() => { this.statusMessage = ''; }, 5000);
        },
        showErrorMessage(message) {
            this.statusMessage = message;
            setTimeout(() => { this.statusMessage = ''; }, 5000);
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        selectPayslip(payslip) {
            this.selectedPayslip = payslip;
            this.iframeError = false;
        },
        onIframeLoad() {
            this.iframeError = false;
        },
        onIframeError() {
            this.iframeError = true;
        },
        showPrintModal() {
            this.selectedEmployeesForPrint = [];
            this.selectAll = false;
            this.employeesWithPayslips = this.employees
                .filter(emp => this.allPayslipHistories[emp.id]?.some(p => p.payslipDataUrl))
                .map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    latestPayslipDate: this.allPayslipHistories[emp.id]
                        .filter(p => p.payslipDataUrl)
                        .sort((a, b) => moment(b.payDate).diff(moment(a.payDate)))[0]?.payDate
                }));
            this.showPrintAllModal = true;
        },
        toggleSelectAll() {
            if (this.selectAll) {
                this.selectedEmployeesForPrint = this.employeesWithPayslips.map(emp => emp.id);
            } else {
                this.selectedEmployeesForPrint = [];
            }
        },
        async printSelectedPayslips() {
            this.isPrinting = true;
            try {
                for (const empId of this.selectedEmployeesForPrint) {
                    const payslip = this.allPayslipHistories[empId]
                        ?.filter(p => p.payslipDataUrl)
                        .sort((a, b) => moment(b.payDate).diff(moment(a.payDate)))[0];
                    if (payslip) {
                        const iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        iframe.src = payslip.payslipDataUrl;
                        document.body.appendChild(iframe);
                        iframe.contentWindow.print();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        document.body.removeChild(iframe);
                    }
                }
                this.showSuccessMessage('Payslips sent to printer successfully!');
                this.showPrintAllModal = false;
            } catch (error) {
                console.error('Error printing payslips:', error);
                this.showErrorMessage('Failed to print payslips.');
            } finally {
                this.isPrinting = false;
            }
        },
        downloadPayslip() {
            if (!this.selectedPayslip?.payslipDataUrl) {
                this.showErrorMessage('No payslip selected for download.');
                return;
            }
            const link = document.createElement('a');
            link.href = this.selectedPayslip.payslipDataUrl;
            link.download = `payslip_${this.selectedPayslip.employee.name}_${this.selectedPayslip.salaryMonth}_${this.selectedPayslip.paydayType}.pdf`;
            link.click();
        },
        showUpdatePositionModal() {
            this.selectedEmployeeForUpdate = '';
            this.newPosition = '';
            this.showUpdateModal = true;
        },
        async updateEmployeePosition() {
            if (!this.selectedEmployeeForUpdate || !this.newPosition) {
                this.showErrorMessage('Please select an employee and a new position.');
                return;
            }
            this.isLoading = true;
            try {
                const employee = this.employees.find(emp => emp.id === this.selectedEmployeeForUpdate);
                if (!employee) throw new Error('Employee not found.');
                const newPositionData = this.positions.find(pos => pos.name === this.newPosition);
                if (!newPositionData) throw new Error('Position not found.');

                const token = this.authStore.accessToken || localStorage.getItem('token');
                if (!token) throw new Error('No authentication token available');

                // Prepare updated position history
                const positionHistory = Array.isArray(employee.positionHistory) ? [...employee.positionHistory] : [{
                    position: employee.position || 'N/A',
                    salary: employee.salary || 0,
                    startDate: employee.hireDate || this.currentDate,
                    endDate: null
                }];

                // Close the current position by setting an end date
                const currentPosition = positionHistory.find(pos => !pos.endDate);
                if (currentPosition) {
                    currentPosition.endDate = moment(this.currentDate).format('YYYY-MM-DD');
                }

                // Add the new position
                const newPositionEntry = {
                    position: newPositionData.name,
                    salary: Number(newPositionData.salary),
                    startDate: moment(this.currentDate).format('YYYY-MM-DD'),
                    endDate: null
                };
                positionHistory.push(newPositionEntry);

                // Prepare updated employee data
                const updatedEmployeeData = {
                    position: newPositionData.name,
                    salary: Number(newPositionData.salary),
                    positionHistory,
                    payheads: employee.payheads.map(ph => ph._id).filter(id => id),
                    updatedAt: new Date().toISOString()
                };

                // Update employee in backend
                console.log('Updating employee:', employee.id, updatedEmployeeData);
                const response = await axios.put(
                    `${BASE_API_URL}/api/employees/update/${employee.id}`,
                    updatedEmployeeData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'user-role': 'admin',
                            'user-id': this.authStore.admin?._id || localStorage.getItem('userId') || ''
                        }
                    }
                );

                if (response.status === 200) {
                    // Update local employee data
                    const employeeIndex = this.employees.findIndex(e => e.id === employee.id);
                    if (employeeIndex !== -1) {
                        this.employees[employeeIndex] = {
                            ...this.employees[employeeIndex],
                            position: newPositionData.name,
                            salary: Number(newPositionData.salary),
                            positionHistory,
                            updatedAt: new Date().toISOString()
                        };
                    }

                    // Refresh payslip history if the employee is currently selected
                    if (this.selectedEmployee?.id === employee.id) {
                        this.selectedEmployee = {
                            ...this.selectedEmployee,
                            position: newPositionData.name,
                            salary: Number(newPositionData.salary),
                            positionHistory
                        };
                        await this.showPayslipHistory(this.selectedEmployee);
                    }

                    this.showSuccessMessage(`Position updated successfully for ${employee.name}!`);
                    this.showUpdateModal = false;
                    this.selectedEmployeeForUpdate = '';
                    this.newPosition = '';
                }
            } catch (error) {
                console.error('Error updating employee position:', error.response?.data || error.message);
                this.showErrorMessage(`Failed to update position: ${error.response?.data?.message || error.message}`);
            } finally {
                this.isLoading = false;
            }
        },
        sortPreviousPayslips(field) {
            if (this.sortPreviousField === field) {
                this.sortPreviousAsc = !this.sortPreviousAsc;
            } else {
                this.sortPreviousField = field;
                this.sortPreviousAsc = true;
            }
        },
        sortNewPayslips(field) {
            if (this.sortNewField === field) {
                this.sortNewAsc = !this.sortNewAsc;
            } else {
                this.sortNewField = field;
                this.sortNewAsc = true;
            }
        }
    }
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.loader {
    border-top-color: #3b82f6;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
}
</style>