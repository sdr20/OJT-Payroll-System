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

    <!-- Request Info Modal -->
    <div v-if="showRequestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex justify-between items-center">
          <h2 class="text-2xl font-semibold text-gray-800">Application Details</h2>
          <button
            @click="closeRequestModal"
            class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Personal Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Info</h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">Full Name</label>
                  <input
                    v-if="isEditingRequest"
                    v-model="selectedRequest.name"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p v-else class="text-base text-gray-900">{{ `${selectedRequest.firstName} ${selectedRequest.middleName || ''} ${selectedRequest.lastName}`.trim() }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Email</label>
                  <input
                    v-if="isEditingRequest"
                    v-model="selectedRequest.email"
                    type="email"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p v-else class="text-base text-gray-900">{{ selectedRequest.email }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Contact Number</label>
                  <input
                    v-if="isEditingRequest"
                    v-model="selectedRequest.contactNumber"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                    pattern="\d{11}"
                    title="Please enter an 11-digit phone number (e.g., 09123456789)"
                  />
                  <p v-else class="text-base text-gray-900">{{ selectedRequest.contactNumber }}</p>
                </div>
              </div>
            </div>

            <!-- Employment Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Employment Info</h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">Position</label>
                  <select
                    v-if="isEditingRequest"
                    v-model="selectedRequest.position"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option v-for="position in adminPositions" :key="position" :value="position">{{ position }}</option>
                  </select>
                  <p v-else class="text-base text-gray-900">{{ selectedRequest.position }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">SSS ID</label>
                  <input
                    v-if="isEditingRequest"
                    v-model="selectedRequest.sss"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{10}"
                    title="Please enter a 10-digit SSS ID (e.g., 1234567890)"
                  />
                  <p v-else class="text-base text-gray-900">{{ selectedRequest.sss || 'Not provided' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">PhilHealth ID</label>
                  <input
                    v-if="isEditingRequest"
                    v-model="selectedRequest.philhealth"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{12}"
                    title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)"
                  />
                  <p v-else class="text-base text-gray-900">{{ selectedRequest.philhealth || 'Not provided' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Pag-IBIG ID</label>
                  <input
                    v-if="isEditingRequest"
                    v-model="selectedRequest.pagibig"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{12}"
                    title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)"
                  />
                  <p v-else class="text-base text-gray-900">{{ selectedRequest.pagibig || 'Not provided' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">TIN</label>
                  <input
                    v-if="isEditingRequest"
                    v-model="selectedRequest.tin"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{9,12}"
                    title="Please enter a 9-12 digit TIN (e.g., 123456789)"
                  />
                  <p v-else class="text-base text-gray-900">{{ selectedRequest.tin || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <!-- Financial Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Info</h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">Proposed Salary</label>
                  <input
                    v-if="isEditingRequest"
                    v-model.number="selectedRequest.salary"
                    type="number"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                  />
                  <p v-else class="text-base text-gray-900">₱{{ selectedRequest.salary.toLocaleString() }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Hourly Rate</label>
                  <input
                    v-if="isEditingRequest"
                    :value="selectedRequest.hourlyRate.toLocaleString()"
                    type="text"
                    class="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                  <p v-else class="text-base text-gray-900">₱{{ selectedRequest.hourlyRate.toLocaleString() }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">SSS Contribution</label>
                  <p class="text-base text-gray-900">₱{{ calculateSSSContribution(selectedRequest.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">PhilHealth Contribution</label>
                  <p class="text-base text-gray-900">₱{{ calculatePhilHealthContribution(selectedRequest.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Pag-IBIG Contribution</label>
                  <p class="text-base text-gray-900">₱{{ calculatePagIBIGContribution(selectedRequest.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Withholding Tax</label>
                  <p class="text-base text-gray-900">₱{{ calculateWithholdingTax(selectedRequest.salary).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Net Salary Preview -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Net Salary Preview:</span>
              <span class="text-lg font-semibold text-gray-900">₱{{ calculateRequestNetSalary(selectedRequest).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            v-if="isEditingRequest"
            @click="saveRequestChanges"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            :disabled="isUpdating"
          >
            {{ isUpdating ? 'Saving...' : 'Save' }}
          </button>
          <button
            v-else
            @click="isEditingRequest = true"
            class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Edit
          </button>
          <button
            @click="closeRequestModal"
            class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Employee Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex justify-between items-center">
          <h2 class="text-2xl font-semibold text-gray-800">Employee Details</h2>
          <button
            @click="showDetailsModal = false"
            class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Personal Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-600">Full Name</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">Email</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.email }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">Contact Info</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.contactInfo }}</p>
                </div>
              </div>
            </div>

            <!-- Employment Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Employment Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-600">Position</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.position }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">SSS ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.sss || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">PhilHealth ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.philhealth || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">Pag-IBIG ID</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.pagibig || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">TIN</p>
                  <p class="text-base text-gray-900">{{ selectedEmployee.tin || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <!-- Financial Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Info</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-600">Base Salary</p>
                  <p class="text-base text-gray-900">₱{{ selectedEmployee.salary.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">Hourly Rate</p>
                  <p class="text-base text-gray-900">₱{{ selectedEmployee.hourlyRate.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">SSS Contribution</p>
                  <p class="text-base text-gray-900">₱{{ calculateSSSContribution(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">PhilHealth Contribution</p>
                  <p class="text-base text-gray-900">₱{{ calculatePhilHealthContribution(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">Pag-IBIG Contribution</p>
                  <p class="text-base text-gray-900">₱{{ calculatePagIBIGContribution(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-600">Withholding Tax</p>
                  <p class="text-base text-gray-900">₱{{ calculateWithholdingTax(selectedEmployee.salary).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Net Salary Preview -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Net Salary:</span>
              <span class="text-lg font-semibold text-gray-900">₱{{ calculateNetSalary(selectedEmployee).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            @click="editEmployee(selectedEmployee)"
            class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Edit Details
          </button>
          <button
            @click="showDetailsModal = false"
            class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-semibold text-gray-800">Edit Employee</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Personal Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Personal Info</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">First Name</label>
                  <input
                    v-model="selectedEmployee.firstName"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Last Name</label>
                  <input
                    v-model="selectedEmployee.lastName"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Email</label>
                  <input
                    v-model="selectedEmployee.email"
                    type="email"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Contact Info</label>
                  <input
                    v-model="selectedEmployee.contactInfo"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                    pattern="\d{11}"
                    title="Please enter an 11-digit phone number (e.g., 09123456789)"
                  />
                </div>
              </div>
            </div>

            <!-- Employment Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Employment Info</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Position</label>
                  <select
                    v-model="selectedEmployee.position"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option v-for="position in adminPositions" :key="position" :value="position">{{ position }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">SSS ID</label>
                  <input
                    v-model="selectedEmployee.sss"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{10}"
                    title="Please enter a 10-digit SSS ID (e.g., 1234567890)"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">PhilHealth ID</label>
                  <input
                    v-model="selectedEmployee.philhealth"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{12}"
                    title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Pag-IBIG ID</label>
                  <input
                    v-model="selectedEmployee.pagibig"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{12}"
                    title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">TIN</label>
                  <input
                    v-model="selectedEmployee.tin"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    pattern="\d{9,12}"
                    title="Please enter a 9-12 digit TIN (e.g., 123456789)"
                  />
                </div>
              </div>
            </div>

            <!-- Financial Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Info</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Base Salary</label>
                  <input
                    v-model.number="selectedEmployee.salary"
                    type="number"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Hourly Rate</label>
                  <input
                    :value="selectedEmployee.hourlyRate.toLocaleString()"
                    type="text"
                    class="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">SSS Contribution</label>
                  <input
                    :value="calculateSSSContribution(selectedEmployee.salary).toLocaleString()"
                    class="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">PhilHealth Contribution</label>
                  <input
                    :value="calculatePhilHealthContribution(selectedEmployee.salary).toLocaleString()"
                    class="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Pag-IBIG Contribution</label>
                  <input
                    :value="calculatePagIBIGContribution(selectedEmployee.salary).toLocaleString()"
                    class="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Withholding Tax</label>
                  <input
                    :value="calculateWithholdingTax(selectedEmployee.salary).toLocaleString()"
                    class="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Travel Expenses</label>
                  <input
                    v-model.number="selectedEmployee.earnings.travelExpenses"
                    type="number"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Other Earnings</label>
                  <input
                    v-model.number="selectedEmployee.earnings.otherEarnings"
                    type="number"
                    class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
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
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            @click="updateEmployee"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            :disabled="isUpdating"
          >
            {{ isUpdating ? 'Saving...' : 'Save Changes' }}
          </button>
          <button
            @click="showEditModal = false"
            class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-gray-600">
            Are you sure you want to remove {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}? This action cannot be undone.
          </p>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            @click="removeEmployee(selectedEmployee.id)"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
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
      isEditingRequest: false,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      searchQuery: '',
      positionFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      nextEmployeeId: 1,
      statusMessage: '',
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
    },
  },
  watch: {
    'selectedEmployee.salary'(newSalary) {
      this.selectedEmployee.hourlyRate = newSalary / (8 * 22);
    },
    'selectedRequest.salary'(newSalary) {
      this.selectedRequest.hourlyRate = newSalary / (8 * 22);
    },
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
      const withholdingTax = this.calculateWithholdingTax(employee.salary, sssContribution, philhealthContribution, pagibigContribution);
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

    async refreshEmployees() {
      await this.fetchEmployees();
      this.showSuccessMessage('Employee list refreshed successfully');
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

    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 3000);
    },

    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => (this.statusMessage = ''), 3000);
    },
  },
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