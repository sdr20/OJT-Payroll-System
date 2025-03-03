<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
        <div class="text-center space-y-2">
          <div class="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div></div>
          <h1 class="text-2xl font-bold text-gray-900">Employee Portal</h1>
          <p class="text-gray-500 text-sm">Welcome to your workspace</p>
        </div>

        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-1">
            <label for="username" class="text-sm font-medium text-gray-700">Username</label>
            <input
              v-model="username"
              type="text"
              id="username"
              class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>

          <div class="space-y-1">
            <label for="password" class="text-sm font-medium text-gray-700">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showLoginPassword ? 'text' : 'password'"
                id="password"
                class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                @click="toggleLoginPasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 text-gray-500"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="loginError" class="text-red-500 text-sm text-center">
            {{ loginError }}
          </div>

          <!-- Forgot Password Link -->
          <div class="text-right">
            <a href="#" @click="forgotPassword" class="text-sm text-blue-500 hover:underline">Forgot Password?</a>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition duration-200"
            :disabled="isLoggingIn"
          >
            {{ isLoggingIn ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="text-center">
          <p class="text-sm text-gray-700">
            Don't have an account?
            <a href="#" @click="showRegisterModal = true" class="text-blue-500 hover:underline">Request an account</a>
          </p>
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
                  <label for="empNo" class="text-sm font-medium text-gray-700">Employee Number</label>
                  <input
                    v-model="newRequest.empNo"
                    type="text"
                    id="empNo"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your employee number"
                    required
                  />
                </div>
                <div class="space-y-1">
                  <label for="firstName" class="text-sm font-medium text-gray-700">First Name</label>
                  <input
                    v-model="newRequest.firstName"
                    type="text"
                    id="firstName"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div class="space-y-1">
                  <label for="middleName" class="text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    v-model="newRequest.middleName"
                    type="text"
                    id="middleName"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your middle name"
                  />
                </div>
                <div class="space-y-1">
                  <label for="lastName" class="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    v-model="newRequest.lastName"
                    type="text"
                    id="lastName"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                <div class="space-y-1">
                  <label for="email" class="text-sm font-medium text-gray-700">Email</label>
                  <input
                    v-model="newRequest.email"
                    type="email"
                    id="email"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    @input="validateEmail"
                  />
                  <p v-if="emailError" class="text-red-500 text-xs mt-1">{{ emailError }}</p>
                </div>
                <div class="space-y-1">
                  <label for="contactNumber" class="text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    v-model="newRequest.contactNumber"
                    type="text"
                    id="contactNumber"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="09123456789"
                    required
                    title="Please enter an 11-digit phone number (e.g., 09123456789)"
                    @input="validatePhoneNumber"
                  />
                  <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
                </div>
                <div class="space-y-1">
                  <label for="position" class="text-sm font-medium text-gray-700">Position</label>
                  <select
                    v-model="newRequest.position"
                    id="position"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option v-for="position in positions" :key="position" :value="position">{{ position }}</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label for="civilStatus" class="text-sm font-medium text-gray-700">Civil Status</label>
                  <select
                    v-model="newRequest.civilStatus"
                    id="civilStatus"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label for="sss" class="text-sm font-medium text-gray-700">SSS ID</label>
                  <input
                    v-model="newRequest.sss"
                    type="text"
                    id="sss"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234567890"
                    title="Please enter a 10-digit SSS ID (e.g., 1234567890)"
                  />
                </div>
                <div class="space-y-1">
                  <label for="philhealth" class="text-sm font-medium text-gray-700">PhilHealth ID</label>
                  <input
                    v-model="newRequest.philhealth"
                    type="text"
                    id="philhealth"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456789012"
                    title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)"
                  />
                </div>
                <div class="space-y-1">
                  <label for="hdmf" class="text-sm font-medium text-gray-700">HDMF ID</label>
                  <input
                    v-model="newRequest.hdmf"
                    type="text"
                    id="hdmf"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456789012"
                    title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)"
                  />
                </div>
                <div class="space-y-1">
                  <label for="tin" class="text-sm font-medium text-gray-700">TIN</label>
                  <input
                    v-model="newRequest.tin"
                    type="text"
                    id="tin"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456789"
                    title="Please enter a 9-12 digit TIN (e.g., 123456789)"
                  />
                </div>
              </div>
            </div>

            <!-- Financial Information -->
            <div class="col-span-2">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label for="salary" class="text-sm font-medium text-gray-700">Proposed Monthly Salary</label>
                  <input
                    v-model.number="newRequest.salary"
                    type="number"
                    id="salary"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter proposed salary"
                    required
                    min="0"
                  />
                </div>
                <div class="space-y-1">
                  <label for="hourlyRate" class="text-sm font-medium text-gray-700">Hourly Rate (Auto-Calculated)</label>
                  <input
                    v-model="newRequest.hourlyRate"
                    type="number"
                    id="hourlyRate"
                    class="block w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">SSS Contribution (Employee Share)</label>
                  <input
                    :value="calculateSSSContribution(newRequest.salary).toLocaleString()"
                    type="text"
                    class="block w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">PhilHealth Contribution (Employee Share)</label>
                  <input
                    :value="calculatePhilHealthContribution(newRequest.salary).toLocaleString()"
                    type="text"
                    class="block w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">HDMF Contribution (Employee Share)</label>
                  <input
                    :value="calculatePagIBIGContribution(newRequest.salary).toLocaleString()"
                    type="text"
                    class="block w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">Withholding Tax</label>
                  <input
                    :value="calculateWithholdingTax(newRequest.salary).toLocaleString()"
                    type="text"
                    class="block w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>

            <!-- Credentials -->
            <div class="col-span-2">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Login Credentials</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label for="newUsername" class="text-sm font-medium text-gray-700">Username</label>
                  <input
                    v-model="newRequest.username"
                    type="text"
                    id="newUsername"
                    class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Choose a username"
                    required
                  />
                </div>
                <div class="space-y-1">
                  <label for="newPassword" class="text-sm font-medium text-gray-700">Password</label>
                  <div class="relative">
                    <input
                      v-model="newRequest.password"
                      :type="showPassword ? 'text' : 'password'"
                      id="newPassword"
                      class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Choose a password"
                      required
                      @input="validatePassword"
                    />
                    <button
                      type="button"
                      @click="togglePasswordVisibility"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5 text-gray-500"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <div class="text-sm text-gray-600 mt-2">
                    Password strength: <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
                  </div>
                </div>
                <div class="space-y-1">
                  <label for="confirmPassword" class="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div class="relative">
                    <input
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="confirmPassword"
                      class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Confirm your password"
                      required
                      @input="validatePassword"
                    />
                    <button
                      type="button"
                      @click="toggleConfirmPasswordVisibility"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5 text-gray-500"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <div class="text-sm text-red-500 mt-1" v-if="!passwordsMatch">
                    Passwords do not match
                  </div>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="col-span-2 flex justify-end space-x-2 mt-6">
              <button
                type="button"
                @click="showRegisterModal = false"
                class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                :disabled="isSubmitting || !passwordsMatch"
              >
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
          <div
            v-if="statusMessage"
            :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
            class="mt-4 p-3 rounded-lg text-center"
          >
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
        empNo: '',
        username: '',
        password: '',
        firstName: '',
        middleName: '',
        lastName: '',
        position: '',
        civilStatus: '',
        contactNumber: '',
        email: '',
        salary: 0,
        hourlyRate: 0,
        sss: '',
        philhealth: '',
        hdmf: '',
        tin: '',
        status: 'pending'
      },
      positions: ['Manager', 'Assistant', 'Developer'],
      showLoginPassword: false,
      showPassword: false,
      showConfirmPassword: false,
      confirmPassword: '',
      emailError: '',
      phoneError: '',
      passwordError: '',
      minimumWage: 610
    };
  },
  watch: {
    'newRequest.salary'(newSalary) {
      this.newRequest.hourlyRate = newSalary / (8 * 22); // DOLE: 8-hour workday, 22 days/month
    }
  },
  computed: {
    passwordStrength() {
      const password = this.newRequest.password;
      if (password.length < 8) return 'Weak';
      if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        return 'Strong';
      }
      return 'Medium';
    },
    passwordStrengthClass() {
      return {
        'text-red-500': this.passwordStrength === 'Weak',
        'text-yellow-500': this.passwordStrength === 'Medium',
        'text-green-500': this.passwordStrength === 'Strong'
      };
    },
    passwordsMatch() {
      return this.newRequest.password === this.confirmPassword;
    }
  },
  methods: {
    async login() {
      this.isLoggingIn = true;
      this.loginError = '';
      try {
        const response = await axios.post('http://localhost:7777/api/auth/login', {
          username: this.username.trim(),
          password: this.password
        });

        console.log('Login response:', response.data);

        if (!response.data || typeof response.data.id === 'undefined') {
          throw new Error('Invalid response from server');
        }

        const userData = {
          id: response.data.id,
          empNo: response.data.empNo || 'N/A',
          username: this.username,
          name: response.data.name || `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim(),
          email: response.data.email || 'N/A',
          role: response.data.role
        };
        this.$store.dispatch('login', userData);

        console.log('Storing user data:', userData);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('userEmpNo', response.data.empNo || 'N/A');
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', response.data.email || 'N/A');
        console.log('Verified localStorage userRole:', localStorage.getItem('userRole'));

        if (userData.role === 'admin') {
          this.$router.push('/admin');
        } else {
          this.$router.push('/employee');
        }
      } catch (error) {
        console.error('Login error:', error.response || error);
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data.error || 'An error occurred';
          if (status === 401) {
            this.loginError = 'Invalid username or password. Please try again.';
          } else {
            this.loginError = message;
          }
        } else if (error.request) {
          this.loginError = 'Unable to connect to the server. Please try again later.';
        } else {
          this.loginError = 'An unexpected error occurred. Please try again.';
        }
        this.password = '';
      } finally {
        this.isLoggingIn = false;
      }
    },
    toggleLoginPasswordVisibility() {
      this.showLoginPassword = !this.showLoginPassword;
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.newRequest.email) ? '' : 'Please enter a valid email address.';
    },
    validatePhoneNumber() {
      const phoneRegex = /^\d{11}$/;
      this.phoneError = phoneRegex.test(this.newRequest.contactNumber) ? '' : 'Please enter a valid 11-digit phone number.';
    },
    validatePassword() {
      this.passwordError = this.newRequest.password.length >= 8 ? '' : 'Password must be at least 8 characters long.';
    },
    async submitRequest() {
      if (!this.passwordsMatch) {
        this.statusMessage = 'Passwords do not match';
        return;
      }
      this.isSubmitting = true;
      this.statusMessage = '';
      try {
        const maxIdResponse = await axios.get('http://localhost:7777/api/pending-requests/max-id');
        const response = await axios.post('http://localhost:7777/api/pending-requests', {
          ...this.newRequest,
          name: `${this.newRequest.firstName} ${this.newRequest.middleName || ''} ${this.newRequest.lastName}`.trim(),
          id: maxIdResponse.data.maxId + 1
        });
        if (response.status === 201) {
          this.showRegisterModal = false;
          this.resetNewRequest();
          this.showSuccessMessage('Account request submitted successfully! Please wait for admin approval.');
        }
      } catch (error) {
        console.error('Request submission error:', error);
        if (error.response) {
          this.statusMessage = error.response.data.error || 'Failed to submit request. Please try again.';
        } else {
          this.statusMessage = 'Failed to connect to server. Please try again.';
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    resetNewRequest() {
      this.newRequest = {
        empNo: '',
        username: '',
        password: '',
        firstName: '',
        middleName: '',
        lastName: '',
        position: '',
        civilStatus: '',
        contactNumber: '',
        email: '',
        salary: 0,
        hourlyRate: 0,
        sss: '',
        philhealth: '',
        hdmf: '',
        tin: '',
        status: 'pending'
      };
      this.confirmPassword = '';
      this.showPassword = false;
      this.showConfirmPassword = false;
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => {
        this.statusMessage = '';
      }, 5000);
    },
    calculateSSSContribution(salary) {
      const salaryCredit = Math.min(Math.max(salary || 0, 5000), 35000);
      return (salaryCredit * 0.045).toFixed(2); // 4.5% employee share per SSS 2025
    },
    calculatePhilHealthContribution(salary) {
      const cappedSalary = Math.min(salary || 0, 100000);
      return (cappedSalary * 0.025).toFixed(2); // 2.5% employee share (half of 5%) per PhilHealth 2025
    },
    calculatePagIBIGContribution(salary) {
      const cappedSalary = Math.min(salary || 0, 10000);
      return (cappedSalary * 0.02).toFixed(2); // 2% employee share per Pag-IBIG 2025
    },
    calculateWithholdingTax(salary) {
      const taxableIncome = salary || 0;
      if (taxableIncome <= 20833) return 0;
      if (taxableIncome <= 33333) return Math.round((taxableIncome - 20833) * 0.15);
      if (taxableIncome <= 66667) return Math.round(1875 + (taxableIncome - 33333) * 0.20);
      return 0; // Placeholder for higher brackets
    },
    forgotPassword() {
      this.loginError = 'Forgot Password feature not implemented yet.';
    }
  }
};
</script>

<style scoped>
/* No specific styles needed, using Tailwind CSS classes */
</style>