<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-40">
      <h1 class="text-1xl font-bold text-gray-800">Employee Management</h1>
      <div class="flex items-center gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search employees..."
          class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
        <button
          @click="refreshAll"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span class="material-icons-outlined">refresh</span>
          Refresh
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6">
      <div class="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Employee List -->
        <section class="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 flex justify-between items-center border-b">
            <h2 class="text-xl font-semibold text-gray-800">Employee List</h2>
            <div class="flex gap-4">
              <button
                @click="showAddModal = true"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <span class="material-icons-outlined">add</span>
                Add Employee
              </button>
              <select
                v-model="positionFilter"
                class="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Positions</option>
                <option v-for="pos in adminPositions" :key="pos" :value="pos">{{ pos }}</option>
              </select>
            </div>
          </div>
          <div v-if="isLoading" class="p-6 text-center text-gray-500 flex justify-center items-center">
            <span class="material-icons-outlined animate-spin mr-2">autorenew</span>
            Loading...
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-600">ID</th>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-600">Position</th>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-600">Hourly Rate</th>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-600">Net Salary</th>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="employee in paginatedEmployees"
                  :key="employee.id"
                  class="hover:bg-gray-50 transition duration-150"
                >
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.id || 'N/A' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.firstName }} {{ employee.lastName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.position || 'N/A' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">₱{{ employee.hourlyRate.toLocaleString() }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">₱{{ calculateNetSalary(employee).toLocaleString() }}</td>
                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      @click="viewEmployeeDetails(employee)"
                      class="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100 transition"
                    >
                      <span class="material-icons-outlined">visibility</span>
                    </button>
                    <button
                      @click="editEmployee(employee)"
                      class="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-100 transition"
                    >
                      <span class="material-icons-outlined">edit</span>
                    </button>
                    <button
                      @click="confirmDelete(employee)"
                      class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition"
                    >
                      <span class="material-icons-outlined">delete</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="paginatedEmployees.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-gray-500">No employees found</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!isLoading" class="p-4 flex justify-between items-center border-t">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        </section>

        <!-- Pending Approvals -->
        <aside class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-800">Pending Approvals</h2>
            <button
              @click="refreshPendingRequests"
              class="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100 transition"
            >
              <span class="material-icons-outlined">refresh</span>
            </button>
          </div>
          <div v-if="isLoading" class="p-6 text-center text-gray-500 flex justify-center items-center">
            <span class="material-icons-outlined animate-spin mr-2">autorenew</span>
            Loading...
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="request in pendingRequests"
              :key="request.id"
              class="p-4 hover:bg-gray-50 transition duration-150"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ request.firstName }} {{ request.lastName }}</h3>
                  <p class="text-xs text-gray-500">{{ request.position }}</p>
                </div>
                <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="viewRequestInfo(request)"
                  class="text-xs px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                >
                  View
                </button>
                <button
                  @click="approveRequest(request)"
                  class="text-xs px-3 py-1 text-green-600 hover:bg-green-50 rounded-md transition"
                >
                  Approve
                </button>
                <button
                  @click="rejectRequest(request.id)"
                  class="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  Reject
                </button>
              </div>
            </div>
            <div v-if="pendingRequests.length === 0" class="p-4 text-center text-sm text-gray-500">
              No pending approvals
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Add Employee Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-semibold text-gray-800">Add New Employee</h2>
        </div>
        <div class="p-6">
          <div class="space-y-6">
            <!-- Personal Info Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Employee Number *</label>
                  <input v-model="newEmployee.empNo" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">First Name *</label>
                  <input v-model="newEmployee.firstName" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Middle Name</label>
                  <input v-model="newEmployee.middleName" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Last Name *</label>
                  <input v-model="newEmployee.lastName" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Email *</label>
                  <input v-model="newEmployee.email" type="email" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Contact Number *</label>
                  <input v-model="newEmployee.contactInfo" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required pattern="\d{11}" title="Please enter an 11-digit phone number (e.g., 09123456789)" />
                </div>
              </div>
            </div>

            <!-- Account Info Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Username *</label>
                  <input v-model="newEmployee.username" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Password *</label>
                  <input v-model="newEmployee.password" type="password" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
              </div>
            </div>

            <!-- Employment Info Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Employment Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Position *</label>
                  <select v-model="newEmployee.position" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                    <option v-for="position in adminPositions" :key="position" :value="position">{{ position }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Hire Date *</label>
                  <input v-model="newEmployee.hireDate" type="date" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">SSS ID</label>
                  <input v-model="newEmployee.sss" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" pattern="\d{10}" title="Please enter a 10-digit SSS ID (e.g., 1234567890)" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">PhilHealth ID</label>
                  <input v-model="newEmployee.philhealth" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" pattern="\d{12}" title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Pag-IBIG ID</label>
                  <input v-model="newEmployee.pagibig" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" pattern="\d{12}" title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">TIN</label>
                  <input v-model="newEmployee.tin" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" pattern="\d{9,12}" title="Please enter a 9-12 digit TIN (e.g., 123456789)" />
                </div>
              </div>
            </div>

            <!-- Financial Info Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Monthly Salary *</label>
                  <input v-model.number="newEmployee.salary" type="number" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required min="0" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Hourly Rate</label>
                  <input :value="newEmployee.hourlyRate.toLocaleString()" type="text" class="w-full p-2 border rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">SSS Contribution</label>
                  <input :value="calculateSSSContribution(newEmployee.salary).toLocaleString()" class="w-full p-2 border rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">PhilHealth Contribution</label>
                  <input :value="calculatePhilHealthContribution(newEmployee.salary).toLocaleString()" class="w-full p-2 border rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Pag-IBIG Contribution</label>
                  <input :value="calculatePagIBIGContribution(newEmployee.salary).toLocaleString()" class="w-full p-2 border rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Withholding Tax</label>
                  <input :value="calculateWithholdingTax(newEmployee.salary).toLocaleString()" class="w-full p-2 border rounded-lg bg-gray-100" disabled />
                </div>
              </div>
            </div>

            <!-- Net Salary Preview -->
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Net Salary Preview:</span>
                <span class="text-lg font-semibold text-gray-900">₱{{ calculateNewEmployeeNetSalary().toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button @click="addEmployee" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" :disabled="isAdding">
            {{ isAdding ? 'Adding...' : 'Add Employee' }}
          </button>
          <button @click="showAddModal = false" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Request Info Modal -->
    <div v-if="showRequestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <!-- Existing Request Info Modal content -->
      </div>
    </div>

    <!-- Employee Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <!-- Existing Employee Details Modal content -->
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <!-- Existing Edit Employee Modal content -->
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
        <!-- Existing Delete Confirmation Modal content -->
      </div>
    </div>

    <!-- Status Toast -->
    <div
      v-if="statusMessage"
      :class="statusMessage.includes('successfully') ? 'bg-green-500' : 'bg-red-500'"
      class="fixed bottom-6 right-6 p-4 text-white rounded-lg shadow-lg animate-fade-in"
    >
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      employees: [],
      pendingRequests: [],
      adminPositions: ['Manager', 'Assistant', 'Developer'],
      selectedEmployee: {},
      selectedRequest: {},
      showRequestModal: false,
      showEditModal: false,
      showDetailsModal: false,
      showDeleteModal: false,
      showAddModal: false,
      isEditingRequest: false,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isAdding: false,
      searchQuery: '',
      positionFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      nextEmployeeId: 1,
      statusMessage: '',
      newEmployee: {
        empNo: '',
        firstName: '',
        middleName: '',
        lastName: '',
        position: '',
        salary: 0,
        hourlyRate: 0,
        email: '',
        contactInfo: '',
        sss: '',
        philhealth: '',
        pagibig: '',
        tin: '',
        hireDate: new Date().toISOString().slice(0, 10),
        earnings: { travelExpenses: 0, otherEarnings: 0 },
        username: '',
        password: ''
      }
    };
  },
  computed: {
    filteredEmployees() {
      return this.employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        (this.positionFilter ? emp.position === this.positionFilter : true)
      );
    },
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredEmployees.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    }
  },
  watch: {
    'selectedEmployee.salary'(newSalary) {
      this.selectedEmployee.hourlyRate = newSalary / (8 * 22);
    },
    'selectedRequest.salary'(newSalary) {
      this.selectedRequest.hourlyRate = newSalary / (8 * 22);
    },
    'newEmployee.salary'(newSalary) {
      this.newEmployee.hourlyRate = newSalary ? newSalary / (8 * 22) : 0;
    }
  },
  mounted() {
    this.fetchEmployees();
    this.fetchPendingRequests();
  },
  methods: {
    calculateTotalEarnings(employee) {
      const baseEarnings = (employee.earnings?.travelExpenses || 0) + (employee.earnings?.otherEarnings || 0);
      return employee.salary + baseEarnings;
    },
    calculateTotalDeductions(employee) {
      const sssContribution = this.calculateSSSContribution(employee.salary);
      const philhealthContribution = this.calculatePhilHealthContribution(employee.salary);
      const pagibigContribution = this.calculatePagIBIGContribution(employee.salary);
      const withholdingTax = this.calculateWithholdingTax(employee.salary);
      return sssContribution + philhealthContribution + pagibigContribution + withholdingTax;
    },
    calculateNetSalary(employee) {
      if (!employee || !employee.salary) return 0;
      return this.calculateTotalEarnings(employee) - this.calculateTotalDeductions(employee);
    },
    calculateRequestNetSalary(request) {
      if (!request || !request.salary) return 0;
      const totalEarnings = (request.earnings?.travelExpenses || 0) + (request.earnings?.otherEarnings || 0) + (request.salary || 0);
      const sssContribution = this.calculateSSSContribution(request.salary);
      const philhealthContribution = this.calculatePhilHealthContribution(request.salary);
      const pagibigContribution = this.calculatePagIBIGContribution(request.salary);
      const withholdingTax = this.calculateWithholdingTax(request.salary);
      return totalEarnings - (sssContribution + philhealthContribution + pagibigContribution + withholdingTax);
    },
    calculateNewEmployeeNetSalary() {
      if (!this.newEmployee.salary) return 0;
      const totalEarnings = this.newEmployee.salary + 
        (this.newEmployee.earnings.travelExpenses || 0) + 
        (this.newEmployee.earnings.otherEarnings || 0);
      const sssContribution = this.calculateSSSContribution(this.newEmployee.salary);
      const philhealthContribution = this.calculatePhilHealthContribution(this.newEmployee.salary);
      const pagibigContribution = this.calculatePagIBIGContribution(this.newEmployee.salary);
      const withholdingTax = this.calculateWithholdingTax(this.newEmployee.salary);
      return totalEarnings - (sssContribution + philhealthContribution + pagibigContribution + withholdingTax);
    },
    calculateSSSContribution(salary) {
      const monthlySalary = Math.max(salary || 0, 0);
      if (monthlySalary < 5000) {
        return 250;
      }
      const salaryCredit = Math.min(Math.max(monthlySalary, 5000), 35000);
      const regularSSContribution = Math.round(salaryCredit * 0.05);
      let mpfContribution = 0;
      if (salaryCredit > 20000) {
        const mpfBase = Math.min(salaryCredit, 35000) - 20000;
        mpfContribution = Math.round(mpfBase * 0.025);
      }
      let totalEmployeeContribution = regularSSContribution + mpfContribution;
      if (salaryCredit > 34750) {
        totalEmployeeContribution = 1750;
      }
      return totalEmployeeContribution;
    },
    calculatePhilHealthContribution(salary) {
      const monthlySalary = Math.max(salary || 0, 0);
      const minSalary = 10000;
      const maxSalary = 100000;
      const cappedSalary = Math.min(Math.max(monthlySalary, minSalary), maxSalary);
      return Math.round(cappedSalary * 0.025);
    },
    calculatePagIBIGContribution(salary) {
      const monthlySalary = Math.max(salary || 0, 0);
      const maxSalary = 5000;
      const cappedSalary = Math.min(monthlySalary, maxSalary);
      let rate = 0.02;
      if (cappedSalary <= 1500) {
        rate = 0.01;
      }
      return Math.round(cappedSalary * rate);
    },
    calculateWithholdingTax(salary) {
      const taxableIncome = salary || 0;
      if (taxableIncome <= 20833) return 0;
      if (taxableIncome <= 33333) return Math.round((taxableIncome - 20833) * 0.15);
      if (taxableIncome <= 66667) return Math.round(1875 + (taxableIncome - 33333) * 0.20);
      if (taxableIncome <= 166667) return Math.round(13541.80 + (taxableIncome - 66667) * 0.25);
      if (taxableIncome <= 666667) return Math.round(90841.80 + (taxableIncome - 166667) * 0.30);
      return Math.round(408841.80 + (taxableIncome - 666667) * 0.35);
    },

    async fetchEmployees() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://localhost:7777/api/employees', {
          headers: { 'user-role': 'admin' },
        });
        this.employees = response.data.map(emp => ({
          ...emp,
          hourlyRate: emp.hourlyRate || (emp.salary / (8 * 22)),
        })) || [];
        this.nextEmployeeId = Math.max(...this.employees.map(e => e.id || 0), 0) + 1;
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showErrorMessage('Failed to load employees');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPendingRequests() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://localhost:7777/api/pending-requests', {
          headers: { 'user-role': 'admin' },
        });
        this.pendingRequests = response.data || [];
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        this.showErrorMessage('Failed to load pending requests');
      } finally {
        this.isLoading = false;
      }
    },

    async refreshAll() {
      await Promise.all([this.fetchEmployees(), this.fetchPendingRequests()]);
      this.showSuccessMessage('Data refreshed successfully');
    },

    async refreshPendingRequests() {
      await this.fetchPendingRequests();
      this.showSuccessMessage('Pending requests refreshed successfully');
    },

    viewEmployeeDetails(employee) {
      this.selectedEmployee = { ...employee };
      this.showDetailsModal = true;
    },

    editEmployee(employee) {
      this.selectedEmployee = {
        ...employee,
        earnings: {
          travelExpenses: employee.earnings?.travelExpenses || 0,
          otherEarnings: employee.earnings?.otherEarnings || 0,
        },
      };
      this.showDetailsModal = false;
      this.showEditModal = true;
    },

    async updateEmployee() {
      if (!this.selectedEmployee.firstName || !this.selectedEmployee.lastName) {
        this.showErrorMessage('First and Last names are required');
        return;
      }
      if (!this.selectedEmployee.email || !this.selectedEmployee.contactInfo) {
        this.showErrorMessage('Email and Contact Info are required');
        return;
      }
      if (this.selectedEmployee.salary < 0) {
        this.showErrorMessage('Salary cannot be negative');
        return;
      }

      this.isUpdating = true;
      try {
        const response = await axios.put(`http://localhost:7777/api/employees/${this.selectedEmployee.id}`, this.selectedEmployee, {
          headers: { 'user-role': 'admin' },
        });
        if (response.status === 200) {
          const index = this.employees.findIndex(emp => emp.id === this.selectedEmployee.id);
          if (index !== -1) {
            this.employees[index] = { ...this.selectedEmployee };
          }
          this.showEditModal = false;
          this.showSuccessMessage('Employee updated successfully');
        }
      } catch (error) {
        console.error('Error updating employee:', error);
        this.showErrorMessage('Failed to update employee');
      } finally {
        this.isUpdating = false;
      }
    },

    confirmDelete(employee) {
      this.selectedEmployee = employee;
      this.showDeleteModal = true;
    },

    async removeEmployee(id) {
      this.isDeleting = true;
      try {
        const response = await axios.delete(`http://localhost:7777/api/employees/${id}`, {
          headers: { 'user-role': 'admin' },
        });
        if (response.status === 200 || response.status === 204) {
          this.employees = this.employees.filter(emp => emp.id !== id);
          this.showDeleteModal = false;
          this.showSuccessMessage('Employee removed successfully');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        this.showErrorMessage('Failed to delete employee');
      } finally {
        this.isDeleting = false;
      }
    },

    viewRequestInfo(request) {
      this.selectedRequest = {
        ...request,
        earnings: {
          travelExpenses: request.earnings?.travelExpenses || 0,
          otherEarnings: request.earnings?.otherEarnings || 0,
        },
      };
      this.showRequestModal = true;
      this.isEditingRequest = false;
    },

    async saveRequestChanges() {
      if (!`${this.selectedRequest.firstName} ${this.selectedRequest.middleName} ${this.selectedRequest.lastName}`.trim()) {
        this.showErrorMessage('Name is required');
        return;
      }
      if (!this.selectedRequest.email || !this.selectedRequest.contactNumber) {
        this.showErrorMessage('Email and Contact Number are required');
        return;
      }
      if (this.selectedRequest.salary < 0) {
        this.showErrorMessage('Salary cannot be negative');
        return;
      }

      this.isUpdating = true;
      try {
        const response = await axios.put(`http://localhost:7777/api/pending-requests/${this.selectedRequest.id}`, this.selectedRequest, {
          headers: { 'user-role': 'admin' },
        });
        if (response.status === 200) {
          const index = this.pendingRequests.findIndex(req => req.id === this.selectedRequest.id);
          if (index !== -1) {
            this.pendingRequests[index] = { ...this.selectedRequest };
          }
          this.showSuccessMessage('Request updated successfully');
          this.isEditingRequest = false;
        }
      } catch (error) {
        console.error('Error saving request changes:', error);
        this.showErrorMessage('Failed to save request changes');
      } finally {
        this.isUpdating = false;
      }
    },

    async approveRequest(request) {
      try {
        const requiredFields = ['empNo', 'firstName', 'lastName', 'position', 'salary', 'email', 'contactNumber', 'username', 'password'];
        const missingFields = requiredFields.filter(field => !request[field]);
        if (missingFields.length > 0) {
          this.showErrorMessage(`Missing required fields: ${missingFields.join(', ')}`);
          return;
        }

        const newEmployee = {
          empNo: request.empNo,
          firstName: request.firstName,
          lastName: request.lastName,
          middleName: request.middleName || '',
          position: request.position,
          salary: Number(request.salary),
          hourlyRate: Number(request.hourlyRate || (request.salary / (8 * 22))),
          email: request.email,
          contactInfo: request.contactNumber,
          sss: request.sss || '',
          philhealth: request.philhealth || '',
          pagibig: request.pagibig || '',
          tin: request.tin || '',
          earnings: {
            travelExpenses: Number(request.earnings?.travelExpenses || 0),
            otherEarnings: Number(request.earnings?.otherEarnings || 0),
          },
          payheads: request.payheads || [],
          username: request.username,
          password: request.password,
          role: 'employee',
          hireDate: new Date(),
        };

        const response = await axios.post('http://localhost:7777/api/employees', newEmployee, {
          headers: { 'user-role': 'admin' },
        });

        if (response.status === 201) {
          this.employees.push({ ...response.data, hourlyRate: response.data.hourlyRate || (response.data.salary / (8 * 22)) });
          await axios.delete(`http://localhost:7777/api/pending-requests/${request.id}`, {
            headers: { 'user-role': 'admin' },
          });
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== request.id);
          this.showRequestModal = false;
          this.showSuccessMessage('Employee approved and added successfully');
          this.nextEmployeeId = Math.max(...this.employees.map(e => e.id || 0), 0) + 1;
        }
      } catch (error) {
        console.error('Error approving request:', error);
        this.showErrorMessage('Failed to approve employee');
      }
    },

    async rejectRequest(id) {
      try {
        const response = await axios.delete(`http://localhost:7777/api/pending-requests/${id}`, {
          headers: { 'user-role': 'admin' },
        });
        if (response.status === 200 || response.status === 204) {
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== id);
          this.showRequestModal = false;
          this.showSuccessMessage('Application rejected successfully');
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
        this.showErrorMessage('Failed to reject application');
      }
    },

    closeRequestModal() {
      this.showRequestModal = false;
      this.isEditingRequest = false;
    },

    async addEmployee() {
      if (!this.newEmployee.firstName || !this.newEmployee.lastName || !this.newEmployee.empNo) {
        this.showErrorMessage('Employee Number, First and Last names are required');
        return;
      }
      if (!this.newEmployee.email || !this.newEmployee.contactInfo) {
        this.showErrorMessage('Email and Contact Info are required');
        return;
      }
      if (!this.newEmployee.username || !this.newEmployee.password) {
        this.showErrorMessage('Username and Password are required');
        return;
      }
      if (this.newEmployee.salary < 0) {
        this.showErrorMessage('Salary cannot be negative');
        return;
      }

      this.isAdding = true;
      try {
        const employeeData = {
          ...this.newEmployee,
          hourlyRate: this.newEmployee.hourlyRate,
          role: 'employee'
        };
        
        const response = await axios.post('http://localhost:7777/api/employees', employeeData, {
          headers: { 'user-role': 'admin' }
        });

        if (response.status === 201) {
          this.employees.push(response.data);
          this.showAddModal = false;
          this.resetNewEmployee();
          this.showSuccessMessage('Employee added successfully');
          this.nextEmployeeId = Math.max(...this.employees.map(e => e.id || 0), 0) + 1;
        }
      } catch (error) {
        console.error('Error adding employee:', error);
        this.showErrorMessage('Failed to add employee');
      } finally {
        this.isAdding = false;
      }
    },

    resetNewEmployee() {
      this.newEmployee = {
        empNo: '',
        firstName: '',
        middleName: '',
        lastName: '',
        position: '',
        salary: 0,
        hourlyRate: 0,
        email: '',
        contactInfo: '',
        sss: '',
        philhealth: '',
        pagibig: '',
        tin: '',
        hireDate: new Date().toISOString().slice(0, 10),
        earnings: { travelExpenses: 0, otherEarnings: 0 },
        username: '',
        password: ''
      };
    },

    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 3000);
    },

    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 3000);
    }
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.material-icons-outlined {
  font-size: 24px;
}

input:focus:invalid,
select:focus:invalid {
  border-color: #ef4444;
  ring: 2px solid #ef4444;
}
</style>