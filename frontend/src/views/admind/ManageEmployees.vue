<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-40">
      <h1 class="text-lg font-bold text-gray-800">Employee Management</h1>
      <div class="flex items-center gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search employees..."
          class="p-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
        />
        <button
          @click="refreshAll"
          class="bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700 transition flex items-center gap-1"
        >
          <span class="material-icons-outlined text-lg">refresh</span>
          Refresh
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-4">
      <div class="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Employee List -->
        <section class="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 flex justify-between items-center border-b">
            <h2 class="text-lg font-semibold text-gray-800">Employee List</h2>
            <div class="flex gap-2">
              <button
                @click="showAddModal = true"
                class="bg-green-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-green-700 transition flex items-center gap-1"
              >
                <span class="material-icons-outlined text-lg">add</span>
                Add
              </button>
              <button
                @click="showPositionModal = true"
                class="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700 transition flex items-center gap-1"
              >
                <span class="material-icons-outlined text-lg">work</span>
                Positions
              </button>
              <select
                v-model="positionFilter"
                class="p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All</option>
                <option v-for="pos in adminPositions" :key="pos.name" :value="pos.name">{{ pos.name }}</option>
              </select>
            </div>
          </div>
          <div v-if="isLoading" class="p-4 text-center text-gray-500 flex justify-center items-center">
            <span class="material-icons-outlined animate-spin mr-1 text-lg">autorenew</span>
            Loading...
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 font-semibold text-gray-600">ID</th>
                  <th class="px-4 py-2 font-semibold text-gray-600">Name</th>
                  <th class="px-4 py-2 font-semibold text-gray-600">Position</th>
                  <th class="px-4 py-2 font-semibold text-gray-600">Hourly Rate</th>
                  <th class="px-4 py-2 font-semibold text-gray-600">Net Salary</th>
                  <th class="px-4 py-2 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="employee in paginatedEmployees" :key="employee.id" class="hover:bg-gray-50 transition">
                  <td class="px-4 py-2">{{ employee.id || 'N/A' }}</td>
                  <td class="px-4 py-2">{{ employee.firstName }} {{ employee.lastName }}</td>
                  <td class="px-4 py-2">{{ employee.position || 'N/A' }}</td>
                  <td class="px-4 py-2">₱{{ employee.hourlyRate.toLocaleString() }}</td>
                  <td class="px-4 py-2">₱{{ calculateNetSalary(employee).toLocaleString() }}</td>
                  <td class="px-4 py-2 text-right flex justify-end gap-1">
                    <button @click="viewEmployeeDetails(employee)" class="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100">
                      <span class="material-icons-outlined text-lg">visibility</span>
                    </button>
                    <button @click="editEmployee(employee)" class="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-100">
                      <span class="material-icons-outlined text-lg">edit</span>
                    </button>
                    <button @click="confirmDelete(employee)" class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100">
                      <span class="material-icons-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="paginatedEmployees.length === 0">
                  <td colspan="6" class="px-4 py-2 text-center text-gray-500">No employees found</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!isLoading" class="p-3 flex justify-between items-center border-t text-sm">
            <button @click="currentPage--" :disabled="currentPage === 1" class="px-2 py-1 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300">Prev</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-2 py-1 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300">Next</button>
          </div>
        </section>

        <!-- Pending Approvals -->
        <aside class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">Pending Approvals</h2>
            <button @click="refreshPendingRequests" class="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100">
              <span class="material-icons-outlined text-lg">refresh</span>
            </button>
          </div>
          <div v-if="isLoading" class="p-4 text-center text-gray-500 flex justify-center items-center">
            <span class="material-icons-outlined animate-spin mr-1 text-lg">autorenew</span>
            Loading...
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="request in pendingRequests" :key="request.id" class="p-3 hover:bg-gray-50 transition">
              <div class="flex justify-between items-start mb-1">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ request.firstName }} {{ request.lastName }}</h3>
                  <p class="text-xs text-gray-500">{{ request.position }}</p>
                </div>
                <span class="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
              </div>
              <div class="flex gap-1">
                <button @click="viewRequestInfo(request)" class="text-xs px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md">View</button>
                <button @click="approveRequest(request)" class="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded-md">Approve</button>
                <button @click="rejectRequest(request.id)" class="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded-md">Reject</button>
              </div>
            </div>
            <div v-if="pendingRequests.length === 0" class="p-3 text-center text-sm text-gray-500">No pending approvals</div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Employee Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">Employee Details</h2>
        </div>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Personal Information</h3>
              <div class="space-y-2">
                <p><span class="font-medium text-gray-700">Name:</span> {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</p>
                <p><span class="font-medium text-gray-700">Position:</span> {{ selectedEmployee.position }}</p>
                <p><span class="font-medium text-gray-700">Email:</span> {{ selectedEmployee.email }}</p>
                <p><span class="font-medium text-gray-700">Contact:</span> {{ selectedEmployee.contactInfo }}</p>
              </div>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Financial Information</h3>
              <div class="space-y-2">
                <p><span class="font-medium text-gray-700">Monthly Salary:</span> ₱{{ selectedEmployee.salary?.toLocaleString() }}</p>
                <p><span class="font-medium text-gray-700">Hourly Rate:</span> ₱{{ selectedEmployee.hourlyRate?.toLocaleString() }}</p>
                <p><span class="font-medium text-gray-700">Net Salary:</span> ₱{{ calculateNetSalary(selectedEmployee).toLocaleString() }}</p>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-gray-50 rounded-md">
            <h3 class="text-base font-semibold text-gray-800 mb-2">Deductions</h3>
            <div class="space-y-2">
              <p><span class="font-medium text-gray-700">SSS:</span> ₱{{ calculateSSSContribution(selectedEmployee.salary).toLocaleString() }}</p>
              <p><span class="font-medium text-gray-700">PhilHealth:</span> ₱{{ calculatePhilHealthContribution(selectedEmployee.salary).toLocaleString() }}</p>
              <p><span class="font-medium text-gray-700">Pag-IBIG:</span> ₱{{ calculatePagIBIGContribution(selectedEmployee.salary).toLocaleString() }}</p>
              <p><span class="font-medium text-gray-700">Withholding Tax:</span> ₱{{ calculateWithholdingTax(selectedEmployee.salary).toLocaleString() }}</p>
            </div>
          </div>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end">
          <button @click="showDetailsModal = false" class="px-3 py-1.5 border text-sm rounded-md text-gray-700 hover:bg-gray-100">Close</button>
        </div>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">Add New Employee</h2>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Employee Number *</label>
                  <input v-model="newEmployee.empNo" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">First Name *</label>
                  <input v-model="newEmployee.firstName" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Middle Name</label>
                  <input v-model="newEmployee.middleName" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Last Name *</label>
                  <input v-model="newEmployee.lastName" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Email *</label>
                  <input v-model="newEmployee.email" type="email" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Contact Number *</label>
                  <input v-model="newEmployee.contactInfo" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required pattern="\d{11}" />
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Account Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Username *</label>
                  <input v-model="newEmployee.username" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Password *</label>
                  <input v-model="newEmployee.password" type="password" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Employment Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Position *</label>
                  <select v-model="newEmployee.position" @change="updateSalaryFromPosition" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required>
                    <option v-for="position in adminPositions" :key="position.name" :value="position.name">{{ position.name }}</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Hire Date *</label>
                  <input v-model="newEmployee.hireDate" type="date" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">SSS ID</label>
                  <input v-model="newEmployee.sss" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{10}" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">PhilHealth ID</label>
                  <input v-model="newEmployee.philhealth" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{12}" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Pag-IBIG ID</label>
                  <input v-model="newEmployee.pagibig" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{12}" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">TIN</label>
                  <input v-model="newEmployee.tin" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{9,12}" />
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Financial Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Monthly Salary *</label>
                  <input v-model.number="newEmployee.salary" type="number" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required min="0" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Hourly Rate</label>
                  <input :value="newEmployee.hourlyRate.toLocaleString()" type="text" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">SSS Contribution</label>
                  <input :value="calculateSSSContribution(newEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">PhilHealth Contribution</label>
                  <input :value="calculatePhilHealthContribution(newEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Pag-IBIG Contribution</label>
                  <input :value="calculatePagIBIGContribution(newEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Withholding Tax</label>
                  <input :value="calculateWithholdingTax(newEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
              </div>
            </div>
            <div class="mt-4 p-3 bg-gray-50 rounded-md">
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium text-gray-700">Net Salary Preview:</span>
                <span class="font-semibold text-gray-900">₱{{ calculateNewEmployeeNetSalary().toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button @click="addEmployee" class="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700" :disabled="isAdding">
            {{ isAdding ? 'Adding...' : 'Add' }}
          </button>
          <button @click="showAddModal = false" class="px-3 py-1.5 border text-sm rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Edit Employee Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">Edit Employee - {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</h2>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Employee Number *</label>
                  <input v-model="selectedEmployee.empNo" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">First Name *</label>
                  <input v-model="selectedEmployee.firstName" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Middle Name</label>
                  <input v-model="selectedEmployee.middleName" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Last Name *</label>
                  <input v-model="selectedEmployee.lastName" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Email *</label>
                  <input v-model="selectedEmployee.email" type="email" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Contact Number *</label>
                  <input v-model="selectedEmployee.contactInfo" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required pattern="\d{11}" />
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Employment Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Position *</label>
                  <select v-model="selectedEmployee.position" @change="updateSalaryFromPositionEdit" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required>
                    <option v-for="position in adminPositions" :key="position.name" :value="position.name">{{ position.name }}</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Hire Date *</label>
                  <input v-model="selectedEmployee.hireDate" type="date" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">SSS ID</label>
                  <input v-model="selectedEmployee.sss" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{10}" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">PhilHealth ID</label>
                  <input v-model="selectedEmployee.philhealth" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{12}" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Pag-IBIG ID</label>
                  <input v-model="selectedEmployee.pagibig" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{12}" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">TIN</label>
                  <input v-model="selectedEmployee.tin" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" pattern="\d{9,12}" />
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-800 mb-2">Financial Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Monthly Salary *</label>
                  <input v-model.number="selectedEmployee.salary" type="number" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required min="0" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Hourly Rate</label>
                  <input :value="selectedEmployee.hourlyRate.toLocaleString()" type="text" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Travel Expenses</label>
                  <input v-model.number="selectedEmployee.earnings.travelExpenses" type="number" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" min="0" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Other Earnings</label>
                  <input v-model.number="selectedEmployee.earnings.otherEarnings" type="number" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" min="0" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">SSS Contribution</label>
                  <input :value="calculateSSSContribution(selectedEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">PhilHealth Contribution</label>
                  <input :value="calculatePhilHealthContribution(selectedEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Pag-IBIG Contribution</label>
                  <input :value="calculatePagIBIGContribution(selectedEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-gray-600">Withholding Tax</label>
                  <input :value="calculateWithholdingTax(selectedEmployee.salary).toLocaleString()" class="w-full p-1.5 text-sm border rounded-md bg-gray-100" disabled />
                </div>
              </div>
            </div>
            <div class="mt-4 p-3 bg-gray-50 rounded-md">
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium text-gray-700">Net Salary Preview:</span>
                <span class="font-semibold text-gray-900">₱{{ calculateNetSalary(selectedEmployee).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button @click="updateEmployee" class="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700" :disabled="isUpdating">
            {{ isUpdating ? 'Updating...' : 'Update' }}
          </button>
          <button @click="showEditModal = false" class="px-3 py-1.5 border text-sm rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Manage Positions Modal -->
    <div v-if="showPositionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">Manage Positions</h2>
        </div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-gray-800">Create Position</h3>
            <div class="space-y-2">
              <div class="space-y-1">
                <label class="text-xs font-medium text-gray-600">Position Name *</label>
                <input v-model="newPosition.name" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-gray-600">Monthly Salary *</label>
                <input v-model.number="newPosition.salary" type="number" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required min="0" />
              </div>
              <button @click="createPosition" class="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700" :disabled="isAddingPosition">
                {{ isAddingPosition ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </div>
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-gray-800">Available Positions</h3>
            <div v-if="adminPositions.length === 0" class="text-gray-500 text-sm text-center">No positions</div>
            <div v-else class="space-y-2 max-h-[50vh] overflow-y-auto">
              <div v-for="position in adminPositions" :key="position.id" class="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ position.name }}</p>
                  <p class="text-xs text-gray-600">₱{{ position.salary.toLocaleString() }}</p>
                </div>
                <div class="flex gap-1">
                  <button @click="editPosition(position)" class="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-100">
                    <span class="material-icons-outlined text-lg">edit</span>
                  </button>
                  <button @click="confirmDeletePosition(position)" class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100">
                    <span class="material-icons-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end">
          <button @click="showPositionModal = false" class="px-3 py-1.5 border text-sm rounded-md text-gray-700 hover:bg-gray-100">Close</button>
        </div>
      </div>
    </div>

    <!-- Edit Position Modal -->
    <div v-if="showEditPositionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">Edit Position</h2>
        </div>
        <div class="p-4 space-y-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-600">Position Name *</label>
            <input v-model="editPositionData.name" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-600">Monthly Salary *</label>
            <input v-model.number="editPositionData.salary" type="number" class="w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500" required min="0" />
          </div>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button @click="updatePosition" class="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700" :disabled="isUpdatingPosition">
            {{ isUpdatingPosition ? 'Updating...' : 'Update' }}
          </button>
          <button @click="showEditPositionModal = false" class="px-3 py-1.5 border text-sm rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Position Confirmation Modal -->
    <div v-if="showDeletePositionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">Confirm Delete</h2>
        </div>
        <div class="p-4">
          <p class="text-sm text-gray-700">Delete <strong>{{ selectedPosition.name }}</strong>?</p>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button @click="deletePosition" class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700" :disabled="isDeletingPosition">
            {{ isDeletingPosition ? 'Deleting...' : 'Delete' }}
          </button>
          <button @click="showDeletePositionModal = false" class="px-3 py-1.5 border text-sm rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Employee Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-4 border-b"><h2 class="text-lg font-semibold text-gray-800">Confirm Delete</h2></div>
        <div class="p-4"><p class="text-sm text-gray-700">Delete {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}?</p></div>
        <div class="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button @click="removeEmployee(selectedEmployee.id)" class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700" :disabled="isDeleting">{{ isDeleting ? 'Deleting...' : 'Delete' }}</button>
          <button @click="showDeleteModal = false" class="px-3 py-1.5 border text-sm rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Status Toast -->
    <div v-if="statusMessage" :class="statusMessage.includes('successfully') ? 'bg-green-500' : 'bg-red-500'" class="fixed bottom-4 right-4 p-3 text-white text-sm rounded-md shadow-lg animate-fade-in">
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
      adminPositions: [],
      selectedEmployee: {},
      selectedRequest: {},
      selectedPosition: {},
      showRequestModal: false,
      showEditModal: false,
      showDetailsModal: false,
      showDeleteModal: false,
      showAddModal: false,
      showPositionModal: false,
      showEditPositionModal: false,
      showDeletePositionModal: false,
      isEditingRequest: false,
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      isAdding: false,
      isAddingPosition: false,
      isUpdatingPosition: false,
      isDeletingPosition: false,
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
      },
      newPosition: { name: '', salary: 0 },
      editPositionData: { id: null, name: '', salary: 0 }
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
    'selectedEmployee.salary'(newSalary) { this.selectedEmployee.hourlyRate = newSalary / (8 * 22); },
    'selectedRequest.salary'(newSalary) { this.selectedRequest.hourlyRate = newSalary / (8 * 22); },
    'newEmployee.salary'(newSalary) { this.newEmployee.hourlyRate = newSalary ? newSalary / (8 * 22) : 0; }
  },
  mounted() {
    this.fetchEmployees();
    this.fetchPendingRequests();
    this.fetchPositions();
  },
  methods: {
    calculateTotalEarnings(employee) {
      const baseEarnings = (employee.earnings?.travelExpenses || 0) + (employee.earnings?.otherEarnings || 0);
      return employee.salary + baseEarnings;
    },
    calculateTotalDeductions(employee) {
      return this.calculateSSSContribution(employee.salary) + 
             this.calculatePhilHealthContribution(employee.salary) + 
             this.calculatePagIBIGContribution(employee.salary) + 
             this.calculateWithholdingTax(employee.salary);
    },
    calculateNetSalary(employee) {
      return employee && employee.salary ? this.calculateTotalEarnings(employee) - this.calculateTotalDeductions(employee) : 0;
    },
    calculateRequestNetSalary(request) {
      if (!request || !request.salary) return 0;
      const totalEarnings = (request.earnings?.travelExpenses || 0) + (request.earnings?.otherEarnings || 0) + (request.salary || 0);
      return totalEarnings - (this.calculateSSSContribution(request.salary) + this.calculatePhilHealthContribution(request.salary) + 
                             this.calculatePagIBIGContribution(request.salary) + this.calculateWithholdingTax(request.salary));
    },
    calculateNewEmployeeNetSalary() {
      if (!this.newEmployee.salary) return 0;
      const totalEarnings = this.newEmployee.salary + (this.newEmployee.earnings.travelExpenses || 0) + (this.newEmployee.earnings.otherEarnings || 0);
      return totalEarnings - (this.calculateSSSContribution(this.newEmployee.salary) + this.calculatePhilHealthContribution(this.newEmployee.salary) + 
                             this.calculatePagIBIGContribution(this.newEmployee.salary) + this.calculateWithholdingTax(this.newEmployee.salary));
    },
    calculateSSSContribution(salary) {
      const monthlySalary = Math.max(salary || 0, 0);
      if (monthlySalary < 5000) return 250;
      const salaryCredit = Math.min(Math.max(monthlySalary, 5000), 35000);
      const regularSSContribution = Math.round(salaryCredit * 0.05);
      let mpfContribution = salaryCredit > 20000 ? Math.round((Math.min(salaryCredit, 35000) - 20000) * 0.025) : 0;
      return salaryCredit > 34750 ? 1750 : regularSSContribution + mpfContribution;
    },
    calculatePhilHealthContribution(salary) {
      const monthlySalary = Math.max(salary || 0, 0);
      return Math.round(Math.min(Math.max(monthlySalary, 10000), 100000) * 0.025);
    },
    calculatePagIBIGContribution(salary) {
      const monthlySalary = Math.max(salary || 0, 0);
      const cappedSalary = Math.min(monthlySalary, 5000);
      return Math.round(cappedSalary * (cappedSalary <= 1500 ? 0.01 : 0.02));
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
        const response = await axios.get('http://localhost:7777/api/employees', { headers: { 'user-role': 'admin' } });
        this.employees = response.data.map(emp => ({ ...emp, hourlyRate: emp.hourlyRate || (emp.salary / (8 * 22)) })) || [];
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
        const response = await axios.get('http://localhost:7777/api/pending-requests', { headers: { 'user-role': 'admin' } });
        this.pendingRequests = response.data || [];
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        this.showErrorMessage('Failed to load pending requests');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPositions() {
      try {
        const response = await axios.get('http://localhost:7777/api/positions', { headers: { 'user-role': 'admin' } });
        this.adminPositions = response.data || [];
      } catch (error) {
        console.error('Error fetching positions:', error);
        this.showErrorMessage('Failed to load positions');
      }
    },

    async refreshAll() {
      await Promise.all([this.fetchEmployees(), this.fetchPendingRequests(), this.fetchPositions()]);
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
          otherEarnings: employee.earnings?.otherEarnings || 0 
        } 
      };
      this.showDetailsModal = false;
      this.showEditModal = true;
    },

    async updateEmployee() {
      if (!this.selectedEmployee.firstName || !this.selectedEmployee.lastName || !this.selectedEmployee.email || 
          !this.selectedEmployee.contactInfo || this.selectedEmployee.salary < 0) {
        this.showErrorMessage('Required fields missing or invalid salary');
        return;
      }
      this.isUpdating = true;
      try {
        const response = await axios.put(
          `http://localhost:7777/api/employees/${this.selectedEmployee.id}`, 
          this.selectedEmployee, 
          { headers: { 'user-role': 'admin' } }
        );
        if (response.status === 200) {
          const index = this.employees.findIndex(emp => emp.id === this.selectedEmployee.id);
          if (index !== -1) this.employees[index] = { ...this.selectedEmployee };
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
        const response = await axios.delete(`http://localhost:7777/api/employees/${id}`, { headers: { 'user-role': 'admin' } });
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
      this.selectedRequest = { ...request, earnings: { travelExpenses: request.earnings?.travelExpenses || 0, otherEarnings: request.earnings?.otherEarnings || 0 } };
      this.showRequestModal = true;
      this.isEditingRequest = false;
    },

    async saveRequestChanges() {
      if (!`${this.selectedRequest.firstName} ${this.selectedRequest.middleName} ${this.selectedRequest.lastName}`.trim() || !this.selectedRequest.email || !this.selectedRequest.contactNumber || this.selectedRequest.salary < 0) {
        this.showErrorMessage('Required fields missing or invalid salary');
        return;
      }
      this.isUpdating = true;
      try {
        const response = await axios.put(`http://localhost:7777/api/pending-requests/${this.selectedRequest.id}`, this.selectedRequest, { headers: { 'user-role': 'admin' } });
        if (response.status === 200) {
          const index = this.pendingRequests.findIndex(req => req.id === this.selectedRequest.id);
          if (index !== -1) this.pendingRequests[index] = { ...this.selectedRequest };
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
      const requiredFields = ['empNo', 'firstName', 'lastName', 'position', 'salary', 'email', 'contactNumber', 'username', 'password'];
      if (requiredFields.some(field => !request[field])) {
        this.showErrorMessage(`Missing required fields: ${requiredFields.filter(field => !request[field]).join(', ')}`);
        return;
      }
      try {
        const newEmployee = {
          empNo: request.empNo, firstName: request.firstName, lastName: request.lastName, middleName: request.middleName || '',
          position: request.position, salary: Number(request.salary), hourlyRate: Number(request.hourlyRate || (request.salary / (8 * 22))),
          email: request.email, contactInfo: request.contactNumber, sss: request.sss || '', philhealth: request.philhealth || '',
          pagibig: request.pagibig || '', tin: request.tin || '', earnings: { travelExpenses: Number(request.earnings?.travelExpenses || 0), otherEarnings: Number(request.earnings?.otherEarnings || 0) },
          payheads: request.payheads || [], username: request.username, password: request.password, role: 'employee', hireDate: new Date()
        };
        const response = await axios.post('http://localhost:7777/api/employees', newEmployee, { headers: { 'user-role': 'admin' } });
        if (response.status === 201) {
          this.employees.push({ ...response.data, hourlyRate: response.data.hourlyRate || (response.data.salary / (8 * 22)) });
          await axios.delete(`http://localhost:7777/api/pending-requests/${request.id}`, { headers: { 'user-role': 'admin' } });
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
        const response = await axios.delete(`http://localhost:7777/api/pending-requests/${id}`, { headers: { 'user-role': 'admin' } });
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

    async addEmployee() {
      if (!this.newEmployee.firstName || !this.newEmployee.lastName || !this.newEmployee.empNo || !this.newEmployee.email || !this.newEmployee.contactInfo || !this.newEmployee.username || !this.newEmployee.password || this.newEmployee.salary < 0) {
        this.showErrorMessage('Required fields missing or invalid salary');
        return;
      }
      this.isAdding = true;
      try {
        const employeeData = { ...this.newEmployee, hourlyRate: this.newEmployee.hourlyRate, role: 'employee' };
        const response = await axios.post('http://localhost:7777/api/employees', employeeData, { headers: { 'user-role': 'admin' } });
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

    async createPosition() {
      if (!this.newPosition.name || this.newPosition.salary < 0) {
        this.showErrorMessage('Position Name and a non-negative Salary are required');
        return;
      }
      this.isAddingPosition = true;
      try {
        const response = await axios.post('http://localhost:7777/api/positions', this.newPosition, { headers: { 'user-role': 'admin' } });
        if (response.status === 201) {
          this.adminPositions.push(response.data);
          this.resetNewPosition();
          this.showSuccessMessage('Position created successfully');
        }
      } catch (error) {
        console.error('Error creating position:', error);
        this.showErrorMessage('Failed to create position');
      } finally {
        this.isAddingPosition = false;
      }
    },

    editPosition(position) {
      this.editPositionData = { ...position };
      this.showEditPositionModal = true;
    },

    async updatePosition() {
      if (!this.editPositionData.name || this.editPositionData.salary < 0) {
        this.showErrorMessage('Position Name and a non-negative Salary are required');
        return;
      }
      this.isUpdatingPosition = true;
      try {
        const response = await axios.put(`http://localhost:7777/api/positions/${this.editPositionData.id}`, this.editPositionData, { headers: { 'user-role': 'admin' } });
        if (response.status === 200) {
          const index = this.adminPositions.findIndex(pos => pos.id === this.editPositionData.id);
          if (index !== -1) this.adminPositions[index] = { ...this.editPositionData };
          this.showEditPositionModal = false;
          this.showSuccessMessage('Position updated successfully');
        }
      } catch (error) {
        console.error('Error updating position:', error);
        this.showErrorMessage('Failed to update position');
      } finally {
        this.isUpdatingPosition = false;
      }
    },

    confirmDeletePosition(position) {
      this.selectedPosition = position;
      this.showDeletePositionModal = true;
    },

    async deletePosition() {
      this.isDeletingPosition = true;
      try {
        const response = await axios.delete(`http://localhost:7777/api/positions/${this.selectedPosition.id}`, { headers: { 'user-role': 'admin' } });
        if (response.status === 200 || response.status === 204) {
          this.adminPositions = this.adminPositions.filter(pos => pos.id !== this.selectedPosition.id);
          this.showDeletePositionModal = false;
          this.showSuccessMessage('Position deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting position:', error);
        this.showErrorMessage('Failed to delete position');
      } finally {
        this.isDeletingPosition = false;
      }
    },

    updateSalaryFromPosition() {
      const selectedPosition = this.adminPositions.find(pos => pos.name === this.newEmployee.position);
      if (selectedPosition) {
        this.newEmployee.salary = selectedPosition.salary;
        this.newEmployee.hourlyRate = selectedPosition.salary / (8 * 22);
      }
    },

    updateSalaryFromPositionEdit() {
      const selectedPosition = this.adminPositions.find(pos => pos.name === this.selectedEmployee.position);
      if (selectedPosition) {
        this.selectedEmployee.salary = selectedPosition.salary;
        this.selectedEmployee.hourlyRate = selectedPosition.salary / (8 * 22);
      }
    },

    resetNewEmployee() {
      this.newEmployee = { empNo: '', firstName: '', middleName: '', lastName: '', position: '', salary: 0, hourlyRate: 0, email: '', contactInfo: '', sss: '', philhealth: '', pagibig: '', tin: '', hireDate: new Date().toISOString().slice(0, 10), earnings: { travelExpenses: 0, otherEarnings: 0 }, username: '', password: '' };
    },

    resetNewPosition() {
      this.newPosition = { name: '', salary: 0 };
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
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.material-icons-outlined { font-size: 18px; }
input:focus:invalid, select:focus:invalid { border-color: #ef4444; outline: 1px solid #ef4444; }
.hover\:bg-gray-50:hover { background-color: #f9fafb; }
.transition { transition: all 0.2s ease-in-out; }
</style>