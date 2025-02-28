<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
        <div class="text-center space-y-2">
          <div class="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Employee Portal</h1>
          <p class="text-gray-500 text-sm">Welcome to your workspace</p>
        </div>

        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-1">
            <label for="username" class="text-sm font-medium text-gray-700">Username</label>
            <input v-model="username" type="text" id="username" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your username" required>
          </div>

          <div class="space-y-1">
            <label for="password" class="text-sm font-medium text-gray-700">Password</label>
            <input v-model="password" type="password" id="password" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your password" required>
          </div>

          <!-- Error Message -->
          <div v-if="loginError" class="text-red-500 text-sm text-center">
            {{ loginError }}
          </div>

          <button type="submit" class="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition duration-200" :disabled="isLoggingIn">
            {{ isLoggingIn ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="text-center">
          <p class="text-sm text-gray-700">Don't have an account? <a href="#" @click="showRegisterModal = true" class="text-blue-500 hover:underline">Request an account</a></p>
        </div>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegisterModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6 text-gray-900">Request Account Creation</h2>
        <form @submit.prevent="submitRequest" class="grid grid-cols-2 gap-6">
          <!-- Basic Information -->
          <div class="col-span-2">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="firstName" class="text-sm font-medium text-gray-700">First Name</label>
                <input v-model="newRequest.firstName" type="text" id="firstName" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your first name" required>
              </div>
              <div class="space-y-1">
                <label for="lastName" class="text-sm font-medium text-gray-700">Last Name</label>
                <input v-model="newRequest.lastName" type="text" id="lastName" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your last name" required>
              </div>
              <div class="space-y-1">
                <label for="email" class="text-sm font-medium text-gray-700">Email</label>
                <input v-model="newRequest.email" type="email" id="email" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your email" required>
              </div>
              <div class="space-y-1">
                <label for="contactNumber" class="text-sm font-medium text-gray-700">Contact Number</label>
                <input v-model="newRequest.contactNumber" type="text" id="contactNumber" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="09123456789" required pattern="\d{11}" title="Please enter an 11-digit phone number (e.g., 09123456789)">
              </div>
              <div class="space-y-1">
                <label for="positionApplied" class="text-sm font-medium text-gray-700">Position Applying For</label>
                <select v-model="newRequest.positionApplied" id="positionApplied" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option v-for="position in positions" :key="position" :value="position">{{ position }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label for="civilStatus" class="text-sm font-medium text-gray-700">Civil Status</label>
                <select v-model="newRequest.civilStatus" id="civilStatus" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div class="space-y-1">
                <label for="sss" class="text-sm font-medium text-gray-700">SSS ID</label>
                <input v-model="newRequest.sss" type="text" id="sss" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="1234567890" pattern="\d{10}" title="Please enter a 10-digit SSS ID (e.g., 1234567890)">
              </div>
              <div class="space-y-1">
                <label for="philhealth" class="text-sm font-medium text-gray-700">PhilHealth ID</label>
                <input v-model="newRequest.philhealth" type="text" id="philhealth" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="123456789012" pattern="\d{12}" title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)">
              </div>
              <div class="space-y-1">
                <label for="pagibig" class="text-sm font-medium text-gray-700">Pag-IBIG ID</label>
                <input v-model="newRequest.pagibig" type="text" id="pagibig" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="123456789012" pattern="\d{12}" title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)">
              </div>
              <div class="space-y-1">
                <label for="tin" class="text-sm font-medium text-gray-700">TIN</label>
                <input v-model="newRequest.tin" type="text" id="tin" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="123456789" pattern="\d{9,12}" title="Please enter a 9-12 digit TIN (e.g., 123456789)">
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="col-span-2">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="salary" class="text-sm font-medium text-gray-700">Proposed Monthly Salary</label>
                <input v-model.number="newRequest.salary" type="number" id="salary" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter proposed salary" required min="0">
              </div>
              <div class="space-y-1">
                <label for="hourlyRate" class="text-sm font-medium text-gray-700">Hourly Rate (Auto-Calculated)</label>
                <input v-model="newRequest.hourlyRate" type="number" id="hourlyRate" class="block w-full p-2 border rounded-lg bg-gray-100" disabled>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">SSS Contribution (Employee Share)</label>
                <input :value="calculateSSSContribution(newRequest.salary).toLocaleString()" type="text" class="block w-full p-2 border rounded-lg bg-gray-100" disabled>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">PhilHealth Contribution (Employee Share)</label>
                <input :value="calculatePhilHealthContribution(newRequest.salary).toLocaleString()" type="text" class="block w-full p-2 border rounded-lg bg-gray-100" disabled>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">Pag-IBIG Contribution (Employee Share)</label>
                <input :value="calculatePagIBIGContribution(newRequest.salary).toLocaleString()" type="text" class="block w-full p-2 border rounded-lg bg-gray-100" disabled>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">Withholding Tax</label>
                <input :value="calculateWithholdingTax(newRequest.salary).toLocaleString()" type="text" class="block w-full p-2 border rounded-lg bg-gray-100" disabled>
              </div>
            </div>
          </div>

          <!-- Credentials -->
          <div class="col-span-2">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Login Credentials</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="username" class="text-sm font-medium text-gray-700">Username</label>
                <input v-model="newRequest.username" type="text" id="username" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Choose a username" required>
              </div>
              <div class="space-y-1">
                <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                <input v-model="newRequest.password" type="password" id="password" class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Choose a password" required>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="col-span-2 flex justify-end space-x-2 mt-6">
            <button type="button" @click="showRegisterModal = false" class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200" :disabled="isSubmitting">Cancel</button>
            <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </form>
        <div v-if="statusMessage" 
             :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
             class="mt-4 p-3 rounded-lg text-center">
          {{ statusMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EmployeeLogin',
  data() {
    return {
      username: '',
      password: '',
      loginError: '',
      showRegisterModal: false,
      isSubmitting: false,
      isLoggingIn: false,
      statusMessage: '',
      newRequest: {
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        positionApplied: '',
        civilStatus: '',
        contactNumber: '',
        email: '',
        salary: 0,
        hourlyRate: 0,
        sss: '',
        philhealth: '',
        pagibig: '',
        tin: '',
        earnings: { travelExpenses: 0, otherEarnings: 0 },
        status: 'pending'
      },
      positions: ['Manager', 'Assistant', 'Developer'],
      testCredentials: {
        username: 'employee',
        password: 'employee123'
      }
    };
  },
  watch: {
    'newRequest.salary'(newSalary) {
      this.newRequest.hourlyRate = newSalary / (8 * 22); // DOLE: 8-hour workday, 22 days/month
    }
  },
  methods: {
    async login() {
      this.isLoggingIn = true;
      this.loginError = '';
      try {
        console.log('Attempting login with:', { username: this.username, password: this.password });
        const response = await axios.post('http://localhost:7777/api/auth/login', {
          username: this.username,
          password: this.password
        });
        console.log('Login response:', response.data);
        this.$store.dispatch('login', { username: this.username, role: 'employee' });
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('userName', response.data.name);
        this.$router.push('/employee');
      } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
          console.error('Error details:', error.response.data);
          this.loginError = error.response.data.error || 'Wrong username or password. Please try again.';
        } else {
          this.loginError = 'Failed to connect to server. Please try again.';
        }
        this.password = '';
      } finally {
        this.isLoggingIn = false;
      }
    },
    async submitRequest() {
      this.isSubmitting = true;
      this.statusMessage = '';
      try {
        console.log('Fetching max ID...');
        const maxIdResponse = await axios.get('http://localhost:7777/api/pending-requests/max-id');
        console.log('Max ID response:', maxIdResponse.data);
        if (maxIdResponse.status !== 200) {
          throw new Error('Failed to fetch max ID');
        }
        const newId = (maxIdResponse.data.maxId || 0) + 1;

        const requestData = {
          id: newId,
          name: `${this.newRequest.firstName} ${this.newRequest.lastName}`,
          positionApplied: this.newRequest.positionApplied,
          email: this.newRequest.email,
          contactNumber: this.newRequest.contactNumber,
          salary: this.newRequest.salary,
          hourlyRate: this.newRequest.hourlyRate,
          sss: this.newRequest.sss || '',
          philhealth: this.newRequest.philhealth || '',
          pagibig: this.newRequest.pagibig || '',
          tin: this.newRequest.tin || '',
          earnings: { travelExpenses: 0, otherEarnings: 0 },
          status: 'pending',
          username: this.newRequest.username,
          password: this.newRequest.password
        };

        console.log('Submitting request:', requestData);
        const response = await axios.post('http://localhost:7777/api/pending-requests', requestData);
        console.log('POST response:', response.data);
        if (response.status === 201) {
          this.showRegisterModal = false;
          this.resetNewRequest();
          this.showSuccessMessage('Account request submitted successfully! Please wait for admin approval.');
        }
      } catch (error) {
        console.error('Failed to submit request:', error);
        if (error.response) {
          console.error('Error details:', error.response.data);
          this.showErrorMessage(`Endpoint failed: ${error.response.config.url} with status ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
          this.showErrorMessage('Failed to connect to server. Ensure backend is running on port 7777.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    calculateSSSContribution(salary) {
      const monthlySalaryCredit = Math.min(Math.max(salary, 5000), 35000); // SSS MSC cap at ₱35,000 in 2025
      const employeeShareRate = 0.05; // 5% employee share per SSS Circular 2024-06
      return Math.round(monthlySalaryCredit * employeeShareRate); // Rounded employee share
    },
    calculatePhilHealthContribution(salary) {
      const rate = 0.05; // 5% total rate in 2025 per PhilHealth Circular
      const monthlySalary = Math.min(salary, 100000); // Cap at ₱100,000
      return Math.round((monthlySalary * rate) / 2); // 2.5% employee share
    },
    calculatePagIBIGContribution(salary) {
      const rate = 0.02; // 2% employee share per Pag-IBIG Circular 460
      const cappedSalary = Math.min(salary, 10000); // Cap at ₱10,000
      return Math.round(cappedSalary * rate); // Max ₱200
    },
    calculateWithholdingTax(salary) {
      // Simplified BIR tax table for 2025 (TRAIN Law, RA 10963)
      const taxableIncome = salary - (this.calculateSSSContribution(salary) + this.calculatePhilHealthContribution(salary) + this.calculatePagIBIGContribution(salary));
      if (taxableIncome <= 20833) return 0; // Bracket 1: No tax
      if (taxableIncome <= 33333) return (taxableIncome - 20833) * 0.15; // Bracket 2: 15% over ₱20,833
      if (taxableIncome <= 66667) return 1875 + (taxableIncome - 33333) * 0.20; // Bracket 3: ₱1,875 + 20% over ₱33,333
      // Add more brackets as needed per BIR table
      return 0; // Placeholder for higher brackets
    },
    resetNewRequest() {
      this.newRequest = {
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        positionApplied: '',
        civilStatus: '',
        contactNumber: '',
        email: '',
        salary: 0,
        hourlyRate: 0,
        sss: '',
        philhealth: '',
        pagibig: '',
        tin: '',
        earnings: { travelExpenses: 0, otherEarnings: 0 },
        status: 'pending'
      };
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

input, select {
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>