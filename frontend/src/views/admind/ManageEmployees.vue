<template>
  <div class="min-h-screen bg-gray-50 p-1">
    <div class="max-w-8xl flex gap-6">
      <!-- Left side - Employee List -->
      <div class="flex-1">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">Employee List</h2>
            <button @click="refreshEmployees" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
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
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Hourly Rate</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Total Salary</th>
                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">TIN</th>
                  <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="employee in employees" :key="employee.id" class="hover:bg-gray-50 transition duration-200">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.id }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.firstName }} {{ employee.lastName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.position }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">₱{{ employee.hourlyRate.toLocaleString() }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">₱{{ calculateNetSalary(employee).toLocaleString() }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ employee.tin || 'Not provided' }}</td>
                  <td class="px-6 py-4 text-right flex justify-end gap-3">
                    <button @click="viewEmployeeDetails(employee)" class="text-blue-600 hover:text-blue-800 transition duration-200">
                      <span class="material-icons-outlined">info</span>
                    </button>
                    <button @click="editEmployee(employee)" class="text-yellow-600 hover:text-yellow-800 transition duration-200">
                      <span class="material-icons-outlined">edit</span>
                    </button>
                    <button @click="confirmDelete(employee)" class="text-red-600 hover:text-red-800 transition duration-200">
                      <span class="material-icons-outlined">delete</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="employees.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">No employees found.</td>
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
            <button @click="refreshPendingRequests" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
              Refresh
            </button>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="request in pendingRequests" :key="request.id" class="p-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ request.firstName }} {{ request.lastName }}</h3>
                  <p class="text-sm text-gray-500">{{ request.position }}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
              <div class="flex gap-2">
                <button @click="viewRequestInfo(request)" class="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition duration-200">
                  View Info
                </button>
                <button @click="approveRequest(request)" class="text-sm px-3 py-1 text-green-600 hover:bg-green-50 rounded-md transition duration-200">
                  Approve
                </button>
                <button @click="rejectRequest(request.id)" class="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition duration-200">
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
    <div v-if="showRequestModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold text-gray-800">Application Details</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-3 gap-6">
            <!-- Column 1: Personal Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-700">Full Name</p>
                  <input v-if="isEditingRequest" v-model="selectedRequest.name" class="w-full p-2 border border-gray-200 rounded-lg" required />
                  <p v-else class="text-lg text-gray-900">{{ `${selectedRequest.firstName} ${selectedRequest.middleName} ${selectedRequest.lastName}`.trim() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Email</p>
                  <input v-if="isEditingRequest" v-model="selectedRequest.email" type="email" class="w-full p-2 border border-gray-200 rounded-lg" required />
                  <p v-else class="text-lg text-gray-900">{{ selectedRequest.email }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Contact Number</p>
                  <input v-if="isEditingRequest" v-model="selectedRequest.contactNumber" class="w-full p-2 border border-gray-200 rounded-lg" required pattern="\d{11}" title="Please enter an 11-digit phone number (e.g., 09123456789)" />
                  <p v-else class="text-lg text-gray-900">{{ selectedRequest.contactNumber }}</p>
                </div>
              </div>
            </div>

            <!-- Column 2: Employment Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Employment Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-700">Position</p>
                  <select v-if="isEditingRequest" v-model="selectedRequest.position" class="w-full p-2 border border-gray-200 rounded-lg" required>
                    <option v-for="position in adminPositions" :key="position" :value="position">{{ position }}</option>
                  </select>
                  <p v-else class="text-lg text-gray-900">{{ selectedRequest.position }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">SSS ID</p>
                  <input v-if="isEditingRequest" v-model="selectedRequest.sss" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{10}" title="Please enter a 10-digit SSS ID (e.g., 1234567890)" />
                  <p v-else class="text-lg text-gray-900">{{ selectedRequest.sss || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">PhilHealth ID</p>
                  <input v-if="isEditingRequest" v-model="selectedRequest.philhealth" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)" />
                  <p v-else class="text-lg text-gray-900">{{ selectedRequest.philhealth || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Pag-IBIG ID</p>
                  <input v-if="isEditingRequest" v-model="selectedRequest.pagibig" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)" />
                  <p v-else class="text-lg text-gray-900">{{ selectedRequest.pagibig || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">TIN</p>
                  <input v-if="isEditingRequest" v-model="selectedRequest.tin" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{9,12}" title="Please enter a 9-12 digit TIN (e.g., 123456789)" />
                  <p v-else class="text-lg text-gray-900">{{ selectedRequest.tin || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <!-- Column 3: Financial Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-700">Proposed Salary</p>
                  <input v-if="isEditingRequest" v-model.number="selectedRequest.salary" type="number" class="w-full p-2 border border-gray-200 rounded-lg" required min="0" />
                  <p v-else class="text-lg text-gray-900">₱{{ selectedRequest.salary.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Hourly Rate</p>
                  <input v-if="isEditingRequest" :value="selectedRequest.hourlyRate.toLocaleString()" type="text" class="w-full p-2 border border-gray-200 rounded-lg bg-gray-100" disabled />
                  <p v-else class="text-lg text-gray-900">₱{{ selectedRequest.hourlyRate.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">SSS Contribution</p>
                  <p class="text-lg text-gray-900">₱{{ calculateSSSContribution(selectedRequest.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">PhilHealth Contribution</p>
                  <p class="text-lg text-gray-900">₱{{ calculatePhilHealthContribution(selectedRequest.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Pag-IBIG Contribution</p>
                  <p class="text-lg text-gray-900">₱{{ calculatePagIBIGContribution(selectedRequest.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Withholding Tax</p>
                  <p class="text-lg text-gray-900">₱{{ calculateWithholdingTax(selectedRequest.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Travel Expenses</p>
                  <input v-if="isEditingRequest" v-model.number="selectedRequest.earnings.travelExpenses" type="number" class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                  <p v-else class="text-lg text-gray-900">₱{{ selectedRequest.earnings?.travelExpenses || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Other Earnings</p>
                  <input v-if="isEditingRequest" v-model.number="selectedRequest.earnings.otherEarnings" type="number" class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                  <p v-else class="text-lg text-gray-900">₱{{ selectedRequest.earnings?.otherEarnings || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Net Salary Preview (Full Width) -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Net Salary Preview:</span>
              <span class="text-lg font-semibold text-gray-900">₱{{ calculateRequestNetSalary(selectedRequest).toLocaleString() }}</span>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button v-if="isEditingRequest" @click="saveRequestChanges" class="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-200">
              Save
            </button>
            <button v-else @click="isEditingRequest = true" class="px-6 py-2.5 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition duration-200">
              Edit
            </button>
            <button @click="showRequestModal = false; isEditingRequest = false" class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">Employee Details</h2>
          <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-3 gap-6">
            <!-- Column 1: Personal Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Full Name</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Email</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.email }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Contact Info</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.contactInfo }}</p>
                </div>
              </div>
            </div>

            <!-- Column 2: Employment Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Employment Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Position</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.position }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">SSS ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.sss || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">PhilHealth ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.philhealth || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Pag-IBIG ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.pagibig || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">TIN</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.tin || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <!-- Column 3: Financial Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Base Salary</p>
                  <p class="text-base text-gray-900">₱{{ selectedEmployee.salary.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Hourly Rate</p>
                  <p class="text-base text-gray-900">₱{{ selectedEmployee.hourlyRate.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">SSS Contribution</p>
                  <p class="text-base text-gray-900">₱{{ calculateSSSContribution(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">PhilHealth Contribution</p>
                  <p class="text-base text-gray-900">₱{{ calculatePhilHealthContribution(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Pag-IBIG Contribution</p>
                  <p class="text-base text-gray-900">₱{{ calculatePagIBIGContribution(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Withholding Tax</p>
                  <p class="text-base text-gray-900">₱{{ calculateWithholdingTax(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Travel Expenses</p>
                  <p class="text-base text-gray-900">₱{{ selectedEmployee.earnings?.travelExpenses || 0 }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Other Earnings</p>
                  <p class="text-base text-gray-900">₱{{ selectedEmployee.earnings?.otherEarnings || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Net Salary Preview (Full Width) -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Net Salary:</span>
              <span class="text-lg font-semibold text-gray-900">₱{{ calculateNetSalary(selectedEmployee).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50">
          <div class="flex justify-end gap-3">
            <button @click="editEmployee(selectedEmployee)" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200">
              Edit Details
            </button>
            <button @click="showDetailsModal = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <div v-if="showEditModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold text-gray-800">Edit Employee</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-3 gap-6">
            <!-- Column 1: Personal Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Info</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">First Name</label>
                  <input v-model="selectedEmployee.firstName" class="w-full p-2 border border-gray-200 rounded-lg" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Last Name</label>
                  <input v-model="selectedEmployee.lastName" class="w-full p-2 border border-gray-200 rounded-lg" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Email</label>
                  <input v-model="selectedEmployee.email" type="email" class="w-full p-2 border border-gray-200 rounded-lg" required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Contact Info</label>
                  <input v-model="selectedEmployee.contactInfo" class="w-full p-2 border border-gray-200 rounded-lg" required pattern="\d{11}" title="Please enter an 11-digit phone number (e.g., 09123456789)" />
                </div>
              </div>
            </div>

            <!-- Column 2: Employment Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Employment Info</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Position</label>
                  <select v-model="selectedEmployee.position" class="w-full p-2 border border-gray-200 rounded-lg" required>
                    <option v-for="position in adminPositions" :key="position" :value="position">{{ position }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">SSS ID</label>
                  <input v-model="selectedEmployee.sss" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{10}" title="Please enter a 10-digit SSS ID (e.g., 1234567890)" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">PhilHealth ID</label>
                  <input v-model="selectedEmployee.philhealth" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Pag-IBIG ID</label>
                  <input v-model="selectedEmployee.pagibig" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{12}" title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">TIN</label>
                  <input v-model="selectedEmployee.tin" class="w-full p-2 border border-gray-200 rounded-lg" pattern="\d{9,12}" title="Please enter a 9-12 digit TIN (e.g., 123456789)" />
                </div>
              </div>
            </div>

            <!-- Column 3: Financial Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Info</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Base Salary</label>
                  <input v-model.number="selectedEmployee.salary" type="number" class="w-full p-2 border border-gray-200 rounded-lg" required min="0" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Hourly Rate</label>
                  <input v-model="selectedEmployee.hourlyRate" type="number" class="w-full p-2 border border-gray-200 rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">SSS Contribution</label>
                  <input :value="calculateSSSContribution(selectedEmployee.salary).toLocaleString()" class="w-full p-2 border border-gray-200 rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">PhilHealth Contribution</label>
                  <input :value="calculatePhilHealthContribution(selectedEmployee.salary).toLocaleString()" class="w-full p-2 border border-gray-200 rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Pag-IBIG Contribution</label>
                  <input :value="calculatePagIBIGContribution(selectedEmployee.salary).toLocaleString()" class="w-full p-2 border border-gray-200 rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Withholding Tax</label>
                  <input :value="calculateWithholdingTax(selectedEmployee.salary).toLocaleString()" class="w-full p-2 border border-gray-200 rounded-lg bg-gray-100" disabled />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Travel Expenses</label>
                  <input v-model.number="selectedEmployee.earnings.travelExpenses" type="number" class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Other Earnings</label>
                  <input v-model.number="selectedEmployee.earnings.otherEarnings" type="number" class="w-full p-2 border border-gray-200 rounded-lg" min="0" />
                </div>
              </div>
            </div>
          </div>

          <!-- Net Salary Preview (Full Width) -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Net Salary Preview:</span>
              <span class="text-lg font-semibold text-gray-900">₱{{ calculateNetSalary(selectedEmployee).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50">
          <div class="flex justify-end gap-3">
            <button @click="updateEmployee" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200" :disabled="isUpdating">
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </button>
            <button @click="showEditModal = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md m-4">
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-gray-600">
            Are you sure you want to remove {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }} from the employee list? This action cannot be undone.
          </p>
        </div>
        <div class="p-6 border-t bg-gray-50">
          <div class="flex justify-end gap-3">
            <button @click="removeEmployee(selectedEmployee.id)" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="fixed bottom-4 right-4 p-4 rounded-lg shadow-md z-50">
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
  watch: {
    'selectedEmployee.salary'(newSalary) {
      this.selectedEmployee.hourlyRate = newSalary / (8 * 22);
    },
    'selectedRequest.salary'(newSalary) {
      this.selectedRequest.hourlyRate = newSalary / (8 * 22);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$watch(() => localStorage.getItem('userRole'), (newRole) => {
        if (newRole) {
          setTimeout(() => {
            this.fetchEmployees();
            this.fetchPendingRequests();
          }, 1000);
        }
      }, { immediate: true });
    });
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
      const withholdingTax = this.calculateWithholdingTax(employee.salary, sssContribution, philhealthContribution, pagibigContribution);
      return sssContribution + philhealthContribution + pagibigContribution + withholdingTax;
    },
    calculateNetSalary(employee) {
      if (!employee) return 0;
      return this.calculateTotalEarnings(employee) - this.calculateTotalDeductions(employee);
    },
    calculateRequestNetSalary(request) {
      if (!request) return 0;
      const totalEarnings = (request.earnings?.travelExpenses || 0) + (request.earnings?.otherEarnings || 0) + (request.salary || 0);
      const sssContribution = this.calculateSSSContribution(request.salary);
      const philhealthContribution = this.calculatePhilHealthContribution(request.salary);
      const pagibigContribution = this.calculatePagIBIGContribution(request.salary);
      const withholdingTax = this.calculateWithholdingTax(request.salary, sssContribution, philhealthContribution, pagibigContribution);
      return totalEarnings - (sssContribution + philhealthContribution + pagibigContribution + withholdingTax);
    },
    calculateSSSContribution(salary) {
      const monthlySalaryCredit = Math.min(Math.max(salary, 5000), 35000);
      const employeeShareRate = 0.05;
      return Math.round(monthlySalaryCredit * employeeShareRate);
    },
    calculatePhilHealthContribution(salary) {
      const rate = 0.05;
      const monthlySalary = Math.min(salary, 100000);
      return Math.round((monthlySalary * rate) / 2);
    },
    calculatePagIBIGContribution(salary) {
      const rate = 0.02;
      const cappedSalary = Math.min(salary, 10000);
      return Math.round(cappedSalary * rate);
    },
    calculateWithholdingTax(salary, sss = 0, philhealth = 0, pagibig = 0) {
      const taxableIncome = (salary || 0) - (sss + philhealth + pagibig);
      if (taxableIncome <= 0) return 0;
      if (taxableIncome <= 20833) return 0;
      if (taxableIncome <= 33333) return Math.round((taxableIncome - 20833) * 0.15);
      if (taxableIncome <= 66667) return Math.round(1875 + (taxableIncome - 33333) * 0.20);
      return 0;
    },
    async fetchEmployees() {
      try {
        const userRole = localStorage.getItem('userRole');
        console.log('Fetching employees with role:', userRole, 'Header:', { 'user-role': userRole || 'employee' });
        const response = await axios.get('http://localhost:7777/api/employees', {
          headers: {
            'user-role': userRole || 'employee'
          }
        });
        console.log('Fetched employees:', response.data);
        this.employees = response.data.map(emp => ({
          ...emp,
          hourlyRate: emp.hourlyRate || (emp.salary / (8 * 22))
        })) || [];
        this.nextEmployeeId = Math.max(...this.employees.map(e => e.id), 0) + 1;
      } catch (error) {
        console.error('Error fetching employees:', error.response ? error.response.data : error.message);
        this.showErrorMessage('Failed to load employees. Please try again.');
      }
    },
    async fetchPendingRequests() {
      try {
        const userRole = localStorage.getItem('userRole');
        console.log('LocalStorage state:', {
          userId: localStorage.getItem('userId'),
          userRole: userRole,
          userName: localStorage.getItem('userName'),
          userEmail: localStorage.getItem('userEmail')
        });
        console.log('Fetching pending requests with role:', userRole, 'Forced headers:', {
          'user-role': 'admin'
        });
        const response = await axios.get('http://localhost:7777/api/pending-requests', {
          headers: {
            'user-role': 'admin'
          }
        });
        this.pendingRequests = response.data || [];
        console.log('Fetched pending requests:', this.pendingRequests);
      } catch (error) {
        console.error('Error fetching pending requests:', error.response ? error.response.data : error.message, 'Response:', error.response);
        this.showErrorMessage('Failed to load pending requests.');
      }
    },
    async refreshEmployees() {
      await this.fetchEmployees();
      this.showSuccessMessage('Employee list refreshed successfully!');
    },
    async refreshPendingRequests() {
      await this.fetchPendingRequests();
      this.showSuccessMessage('Pending requests refreshed successfully!');
    },
    viewEmployeeDetails(employee) {
      this.selectedEmployee = { ...employee };
      console.log('Viewing employee details:', this.selectedEmployee);
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
        const response = await axios.put(`http://localhost:7777/api/employees/${this.selectedEmployee.id}`, this.selectedEmployee, {
          headers: {
            'user-role': localStorage.getItem('userRole') || 'employee'
          }
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
        const response = await axios.delete(`http://localhost:7777/api/employees/${id}`, {
          headers: {
            'user-role': localStorage.getItem('userRole') || 'employee'
          }
        });
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
    viewRequestInfo(request) {
      this.selectedRequest = {
        ...request,
        earnings: {
          travelExpenses: request.earnings?.travelExpenses || 0,
          otherEarnings: request.earnings?.otherEarnings || 0
        }
      };
      console.log('Viewing request info:', this.selectedRequest);
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

      try {
        const response = await axios.put(`http://localhost:7777/api/pending-requests/${this.selectedRequest.id}`, this.selectedRequest, {
          headers: {
            'user-role': localStorage.getItem('userRole') || 'employee'
          }
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
        this.showErrorMessage('Failed to save request changes. Please try again.');
      }
    },
    async approveRequest(request) {
      try {
        const newEmployee = {
          id: request.id,
          empNo: request.empNo, // Ensure empNo is included
          firstName: request.firstName,
          lastName: request.lastName,
          middleName: request.middleName,
          position: request.position,
          salary: request.salary,
          hourlyRate: request.hourlyRate || (request.salary / (8 * 22)),
          email: request.email,
          contactInfo: request.contactNumber,
          sss: request.sss || '',
          philhealth: request.philhealth || '',
          pagibig: request.pagibig || '',
          tin: request.tin || '',
          earnings: {
            travelExpenses: request.earnings?.travelExpenses || 0,
            otherEarnings: request.earnings?.otherEarnings || 0
          },
          payheads: [],
          username: request.username,
          password: request.password
        };

        console.log('Approving employee with data:', newEmployee); // Debug log
        const response = await axios.post('http://localhost:7777/api/employees', newEmployee, {
          headers: {
            'user-role': localStorage.getItem('userRole') || 'employee'
          }
        });
        if (response.status === 201) {
          this.employees.push({ ...response.data, hourlyRate: response.data.hourlyRate || (response.data.salary / (8 * 22)) });
          await axios.delete(`http://localhost:7777/api/pending-requests/${request.id}`, {
            headers: {
              'user-role': localStorage.getItem('userRole') || 'employee'
            }
          });
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== request.id);
          this.showRequestModal = false;
          this.showSuccessMessage('Employee approved and added successfully');
          this.nextEmployeeId = Math.max(...this.employees.map(e => e.id), 0) + 1;
        }
      } catch (error) {
        console.error('Error approving request:', error);
        if (error.response) {
          console.error('Server error details:', error.response.data);
          this.showErrorMessage(`Error approving employee: ${error.response.data.message || 'Unknown server error'}`);
        } else {
          this.showErrorMessage('Error approving employee. Please check server connection.');
        }
      }
    },
    async rejectRequest(id) {
      try {
        const response = await axios.delete(`http://localhost:7777/api/pending-requests/${id}`, {
          headers: {
            'user-role': localStorage.getItem('userRole') || 'employee'
          }
        });
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