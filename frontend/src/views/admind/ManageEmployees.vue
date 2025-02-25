<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="flex gap-6">
      <!-- Left side - Employee List -->
      <div class="flex-1">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">Employee List</h2>
            <button @click="refreshEmployees" 
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
              Refresh
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Employee ID</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Position</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Total Salary</th>
                  <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="employee in employees" :key="employee.id" 
                    class="hover:bg-gray-50 transition duration-200">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.id }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.firstName }} {{ employee.lastName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.position }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">₱{{ calculateNetSalary(employee).toLocaleString() }}</td>
                  <td class="px-6 py-4 text-right flex justify-end gap-3">
                    <button @click="viewEmployeeDetails(employee)" 
                            class="text-blue-600 hover:text-blue-800 transition duration-200">
                      <span class="material-icons-outlined">info</span>
                    </button>
                    <button @click="editEmployee(employee)" 
                            class="text-yellow-600 hover:text-yellow-800 transition duration-200">
                      <span class="material-icons-outlined">edit</span>
                    </button>
                    <button @click="confirmDelete(employee)" 
                            class="text-red-600 hover:text-red-800 transition duration-200">
                      <span class="material-icons-outlined">delete</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="employees.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No employees found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right side - Pending Approvals -->
      <div class="w-96">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">Pending Approvals</h2>
            <button @click="refreshPendingRequests" 
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
              Refresh
            </button>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="request in pendingRequests" :key="request.id" class="p-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ request.name }}</h3>
                  <p class="text-sm text-gray-500">{{ request.positionApplied }}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
              <div class="flex gap-2">
                <button @click="viewRequestInfo(request)" 
                        class="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition duration-200">
                  View Info
                </button>
                <button @click="approveRequest(request)"
                        class="text-sm px-3 py-1 text-green-600 hover:bg-green-50 rounded-md transition duration-200">
                  Approve
                </button>
                <button @click="rejectRequest(request.id)"
                        class="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition duration-200">
                  Reject
                </button>
              </div>
            </div>
            <div v-if="pendingRequests.length === 0" class="p-4 text-center text-sm text-gray-500">
              No pending approvals.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Info Modal -->
    <div v-if="showRequestModal" 
         class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold text-gray-800">Application Details</h2>
        </div>
        <div class="p-6">
          <!-- Basic Information -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Full Name</p>
                <input v-if="isEditingRequest" v-model="selectedRequest.name" 
                       class="w-full p-2 border border-gray-200 rounded-lg" required />
                <p v-else class="text-lg text-gray-900">{{ selectedRequest.name }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Position Applied</p>
                <select v-if="isEditingRequest" v-model="selectedRequest.positionApplied" 
                        class="w-full p-2 border border-guard-200 rounded-lg" required>
                  <option v-for="position in adminPositions" :key="position" :value="position">
                    {{ position }}
                  </option>
                </select>
                <p v-else class="text-lg text-gray-900">{{ selectedRequest.positionApplied }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Email</p>
                <input v-if="isEditingRequest" v-model="selectedRequest.email" type="email"
                       class="w-full p-2 border border-gray-200 rounded-lg" required />
                <p v-else class="text-lg text-gray-900">{{ selectedRequest.email }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Contact Number</p>
                <input v-if="isEditingRequest" v-model="selectedRequest.contactNumber" 
                       class="w-full p-2 border border-gray-200 rounded-lg" required pattern="\d{11}" title="Please enter an 11-digit phone number (e.g., 09123456789)" />
                <p v-else class="text-lg text-gray-900">{{ selectedRequest.contactNumber }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">SSS ID</p>
                <input v-if="isEditingRequest" v-model="selectedRequest.sss" 
                       class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{10}" title="Please enter a 10-digit SSS ID (e.g., 1234567890)" />
                <p v-else class="text-lg text-gray-900">{{ selectedRequest.sss || 'Not provided' }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">PhilHealth ID</p>
                <input v-if="isEditingRequest" v-model="selectedRequest.philhealth" 
                       class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)" />
                <p v-else class="text-lg text-gray-900">{{ selectedRequest.philhealth || 'Not provided' }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Pag-IBIG ID</p>
                <input v-if="isEditingRequest" v-model="selectedRequest.pagibig" 
                       class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)" />
                <p v-else class="text-lg text-gray-900">{{ selectedRequest.pagibig || 'Not provided' }}</p>
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Proposed Salary</p>
                <input v-if="isEditingRequest" v-model.number="selectedRequest.salary" type="number"
                       class="w-full p-2 border border-gray-200 rounded-lg" required min="0" />
                <p v-else class="text-lg text-gray-900">₱{{ selectedRequest.salary.toLocaleString() }}</p>
              </div>
              <!-- Earnings -->
              <div class="space-y-4">
                <p class="text-sm font-medium text-gray-700">Additional Earnings</p>
                <div class="space-y-2">
                  <label class="text-sm text-gray-600">Travel Expenses</label>
                  <input v-if="isEditingRequest" v-model.number="selectedRequest.earnings.travelExpenses" type="number"
                         class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                  <p v-else class="text-sm text-gray-900">₱{{ selectedRequest.earnings?.travelExpenses || 0 }}</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm text-gray-600">Other Earnings</label>
                  <input v-if="isEditingRequest" v-model.number="selectedRequest.earnings.otherEarnings" type="number"
                         class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                  <p v-else class="text-sm text-gray-900">₱{{ selectedRequest.earnings?.otherEarnings || 0 }}</p>
                </div>
              </div>
            </div>
            <div v-if="isEditingRequest" class="mt-6 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Net Salary Preview:</span>
                <span class="text-lg font-semibold text-gray-900">₱{{ calculateRequestNetSalary(selectedRequest).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button v-if="isEditingRequest" @click="saveRequestChanges"
                    class="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-200">
              Save
            </button>
            <button v-else @click="isEditingRequest = true"
                    class="px-6 py-2.5 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition duration-200">
              Edit
            </button>
            <button @click="showRequestModal = false; isEditingRequest = false"
                    class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Details Modal -->
    <div v-if="showDetailsModal" 
         class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">Employee Details</h2>
          <button @click="showDetailsModal = false" 
                  class="text-gray-500 hover:text-gray-700">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="col-span-2">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Full Name</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Position</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.position }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Email</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.email }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Contact Info</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.contactInfo }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">SSS ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.sss || 'Not provided' }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">PhilHealth ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.philhealth || 'Not provided' }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Pag-IBIG ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.pagibig || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <!-- Financial Information -->
            <div class="col-span-2">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Base Salary</p>
                  <p class="text-base text-gray-900">₱{{ selectedEmployee.salary.toLocaleString() }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Additional Earnings</p>
                  <div class="space-y-1">
                    <p class="text-sm text-gray-900">Travel: ₱{{ selectedEmployee.earnings?.travelExpenses || 0 }}</p>
                    <p class="text-sm text-gray-900">Other: ₱{{ selectedEmployee.earnings?.otherEarnings || 0 }}</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Net Salary</p>
                  <p class="text-base font-semibold text-gray-900">₱{{ calculateNetSalary(selectedEmployee).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50">
          <div class="flex justify-end gap-3">
            <button @click="editEmployee(selectedEmployee)"
                    class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200">
              Edit Details
            </button>
            <button @click="showDetailsModal = false"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <div v-if="showEditModal" 
         class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold text-gray-800">Edit Employee</h2>
        </div>
        <div class="p-6">
          <!-- Basic Information -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">First Name</label>
                <input v-model="selectedEmployee.firstName" 
                       class="w-full p-2 border border-gray-200 rounded-lg" required />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Last Name</label>
                <input v-model="selectedEmployee.lastName" 
                       class="w-full p-2 border border-gray-200 rounded-lg" required />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Position</label>
                <select v-model="selectedEmployee.position" 
                        class="w-full p-2 border border-gray-200 rounded-lg" required>
                  <option v-for="position in adminPositions" :key="position" :value="position">
                    {{ position }}
                  </option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Base Salary</label>
                <input v-model.number="selectedEmployee.salary" type="number"
                       class="w-full p-2 border border-gray-200 rounded-lg" required min="0" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Email</label>
                <input v-model="selectedEmployee.email" type="email"
                       class="w-full p-2 border border-gray-200 rounded-lg" required />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Contact Info</label>
                <input v-model="selectedEmployee.contactInfo" 
                       class="w-full p-2 border border-gray-200 rounded-lg" required pattern="\d{11}" title="Please enter an 11-digit phone number (e.g., 09123456789)" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">SSS ID</label>
                <input v-model="selectedEmployee.sss" 
                       class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{10}" title="Please enter a 10-digit SSS ID (e.g., 1234567890)" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">PhilHealth ID</label>
                <input v-model="selectedEmployee.philhealth" 
                       class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Pag-IBIG ID</label>
                <input v-model="selectedEmployee.pagibig" 
                       class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)" />
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
            <div class="grid grid-cols-2 gap-6">
              <!-- Earnings -->
              <div class="space-y-4">
                <p class="text-sm font-medium text-gray-700">Additional Earnings</p>
                <div class="space-y-2">
                  <label class="text-sm text-gray-600">Travel Expenses</label>
                  <input v-model.number="selectedEmployee.earnings.travelExpenses" type="number"
                         class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm text-gray-600">Other Earnings</label>
                  <input v-model.number="selectedEmployee.earnings.otherEarnings" type="number"
                         class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                </div>
              </div>
            </div>
          </div>

          <!-- Net Salary Preview -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Net Salary Preview:</span>
              <span class="text-lg font-semibold text-gray-900">₱{{ calculateNetSalary(selectedEmployee).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50">
          <div class="flex justify-end gap-3">
            <button @click="updateEmployee"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    :disabled="isUpdating">
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </button>
            <button @click="showEditModal = false"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" 
         class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md m-4">
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-gray-600">
            Are you sure you want to remove {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }} 
            from the employee list? This action cannot be undone.
          </p>
        </div>
        <div class="p-6 border-t bg-gray-50">
          <div class="flex justify-end gap-3">
            <button @click="removeEmployee(selectedEmployee.id)"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                    :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="showDeleteModal = false"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" 
         :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
         class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50">
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
      adminPositions: ['Manager', 'Assistant', 'Developer'],
      selectedEmployee: {},
      showEditModal: false,
      showDetailsModal: false,
      showDeleteModal: false,
      pendingRequests: [],
      selectedRequest: {},
      showRequestModal: false,
      isEditingRequest: false,
      nextEmployeeId: 1,
      isUpdating: false,
      isDeleting: false,
      statusMessage: ''
    };
  },
  mounted() {
    this.fetchEmployees();
    this.fetchPendingRequests();
  },
  methods: {
    calculateNetSalary(employee) {
      if (!employee) return 0;
      const totalEarnings = (employee.earnings?.travelExpenses || 0) + 
                           (employee.earnings?.otherEarnings || 0);
      return employee.salary + totalEarnings; // No deductions to subtract
    },

    calculateRequestNetSalary(request) {
      if (!request) return 0;
      const totalEarnings = (request.earnings?.travelExpenses || 0) + 
                           (request.earnings?.otherEarnings || 0);
      return request.salary + totalEarnings; // No deductions to subtract
    },

    async fetchEmployees() {
      try {
        const response = await axios.get('http://localhost:7777/api/employees');
        console.log('Fetched employees:', response.data); // Debugging
        this.employees = response.data || [];
        this.nextEmployeeId = Math.max(...this.employees.map(e => e.id), 0) + 1;
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showErrorMessage('Failed to load employees. Please try again.');
      }
    },

    async refreshEmployees() {
      await this.fetchEmployees();
      this.showSuccessMessage('Employee list refreshed successfully!');
    },

    async fetchPendingRequests() {
      try {
        const response = await axios.get('http://localhost:7777/api/pending-requests');
        console.log('Fetched pending requests:', response.data); // Debugging
        this.pendingRequests = response.data || [];
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        this.showErrorMessage('Failed to load pending requests. Please try again.');
      }
    },

    async refreshPendingRequests() {
      await this.fetchPendingRequests();
      this.showSuccessMessage('Pending requests refreshed successfully!');
    },

    viewEmployeeDetails(employee) {
      this.selectedEmployee = { ...employee };
      console.log('Viewing employee details:', this.selectedEmployee); // Debugging
      this.showDetailsModal = true;
    },

    editEmployee(employee) {
      this.selectedEmployee = { 
        ...employee,
        earnings: { 
          travelExpenses: employee.earnings?.travelExpenses || 0,
          otherEarnings: employee.earnings?.otherEarnings || 0 
        }
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
        const response = await axios.put(`http://localhost:7777/api/employees/${this.selectedEmployee.id}`, this.selectedEmployee);
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
        this.showErrorMessage('Failed to update employee. Please try again.');
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
        const response = await axios.delete(`http://localhost:7777/api/employees/${id}`);
        if (response.status === 200 || response.status === 204) {
          this.employees = this.employees.filter(emp => emp.id !== id);
          this.showDeleteModal = false;
          this.showSuccessMessage('Employee removed successfully');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        this.showErrorMessage('Failed to delete employee. Please try again.');
      } finally {
        this.isDeleting = false;
      }
    },

    // Pending Requests Methods
    viewRequestInfo(request) {
      this.selectedRequest = { 
        ...request,
        earnings: { 
          travelExpenses: request.earnings?.travelExpenses || 0,
          otherEarnings: request.earnings?.otherEarnings || 0 
        }
      };
      console.log('Viewing request info:', this.selectedRequest); // Debugging
      this.showRequestModal = true;
      this.isEditingRequest = false;
    },

    async saveRequestChanges() {
      if (!this.selectedRequest.name) {
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

      try {
        const response = await axios.put(`http://localhost:7777/api/pending-requests/${this.selectedRequest.id}`, this.selectedRequest);
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
        this.showErrorMessage('Failed to save request changes. Please try again.');
      }
    },

    async approveRequest(request) {
      try {
        const newEmployee = {
          id: request.id, // Use the same ID as the pending request
          firstName: request.name.split(' ')[0],
          lastName: request.name.split(' ').slice(1).join(' ') || '',
          position: request.positionApplied,
          salary: request.salary,
          email: request.email,
          contactInfo: request.contactNumber,
          sss: request.sss || '',
          philhealth: request.philhealth || '',
          pagibig: request.pagibig || '',
          earnings: { 
            travelExpenses: request.earnings?.travelExpenses || 0,
            otherEarnings: request.earnings?.otherEarnings || 0 
          },
          payheads: [], // Assuming empty initially
          username: request.username,
          password: request.password
        };

        console.log('Approving employee with data:', newEmployee);
        const response = await axios.post('http://localhost:7777/api/employees', newEmployee);
        if (response.status === 201) {
          this.employees.push(response.data);
          await axios.delete(`http://localhost:7777/api/pending-requests/${request.id}`);
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== request.id);
          this.showRequestModal = false;
          this.showSuccessMessage('Employee approved and added successfully');
          this.nextEmployeeId = Math.max(...this.employees.map(e => e.id), 0) + 1; // Update next ID
        }
      } catch (error) {
        console.error('Error approving request:', error);
        this.showErrorMessage('Error approving employee. Please try again.');
      }
    },

    async rejectRequest(id) {
      try {
        const response = await axios.delete(`http://localhost:7777/api/pending-requests/${id}`);
        if (response.status === 200 || response.status === 204) {
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== id);
          this.showRequestModal = false;
          this.showSuccessMessage('Application rejected successfully');
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
        this.showErrorMessage('Error rejecting application. Please try again.');
      }
    },

    // Notification Methods
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
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>