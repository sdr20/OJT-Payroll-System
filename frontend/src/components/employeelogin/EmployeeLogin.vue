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
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="loginError" class="text-red-500 text-sm text-center">
            {{ loginError }}
          </div>

          <div class="text-right">
            <a href="#" @click.prevent="forgotPassword" class="text-sm text-blue-500 hover:underline">Forgot Password?</a>
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
            <a href="#" @click.prevent="showRegisterModal = true" class="text-blue-500 hover:underline">Request an account</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegisterModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6 text-gray-900">Request Account Creation</h2>
        <form @submit.prevent="submitRequest" class="grid grid-cols-2 gap-6">
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
                  pattern="\d{11}"
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
                <label for="hireDate" class="text-sm font-medium text-gray-700">Hire Date</label>
                <input
                  v-model="newRequest.hireDate"
                  type="date"
                  id="hireDate"
                  class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div class="space-y-1">
                <label for="sss" class="text-sm font-medium text-gray-700">SSS ID</label>
                <input
                  v-model="newRequest.sss"
                  type="text"
                  id="sss"
                  class="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567890"
                  pattern="\d{10}"
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
                  pattern="\d{12}"
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
                  pattern="\d{12}"
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
                  pattern="\d{9,12}"
                  title="Please enter a 9-12 digit TIN (e.g., 123456789)"
                />
              </div>
            </div>
          </div>

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
                  :value="newRequest.hourlyRate.toLocaleString()"
                  type="text"
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
                  minlength="4"
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
                    minlength="8"
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
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
                <div class="text-sm text-gray-600 mt-2">
                  Password strength: <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
                </div>
                <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p>
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
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
                <div class="text-sm text-red-500 mt-1" v-if="!passwordsMatch">
                  Passwords do not match
                </div>
              </div>
            </div>
          </div>

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
              :disabled="isSubmitDisabled"
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
        civilStatus: 'Single',
        contactNumber: '',
        email: '',
        salary: 0,
        hourlyRate: 0,
        sss: '',
        philhealth: '',
        hdmf: '',
        tin: '',
        hireDate: new Date().toISOString().slice(0, 10),
        status: 'pending',
        role: 'employee',
        earnings: { travelExpenses: 0, otherEarnings: 0 }
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
      this.newRequest.hourlyRate = newSalary ? newSalary / (8 * 22) : 0;
    }
  },
  computed: {
    passwordStrength() {
      const password = this.newRequest.password;
      if (!password) return 'Weak';
      if (password.length < 8) return 'Weak';
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      const strengthScore = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
      if (password.length >= 12 && strengthScore >= 3) return 'Strong';
      if (password.length >= 8 && strengthScore >= 2) return 'Medium';
      return 'Weak';
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
    },
    isSubmitDisabled() {
      const disabled = this.isSubmitting || !this.passwordsMatch || !!this.emailError || !!this.phoneError || !!this.passwordError;
      console.log('isSubmitDisabled:', {
        isSubmitting: this.isSubmitting,
        passwordsMatch: this.passwordsMatch,
        emailError: this.emailError,
        phoneError: this.phoneError,
        passwordError: this.passwordError,
        result: disabled
      });
      return disabled;
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
          empNo: response.data.empNo,
          username: response.data.username,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          hireDate: response.data.hireDate
        };

        if (this.$store) {
          this.$store.dispatch('login', userData);
        }

        console.log('Storing user data in localStorage:', userData);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userEmpNo', userData.empNo);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userHireDate', userData.hireDate);

        this.$router.push(userData.role === 'admin' ? '/admin' : '/employee');
      } catch (error) {
        console.error('Login error:', error.response || error);
        this.loginError = error.response?.data?.error || 'Unable to connect to the server. Please try again later.';
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
      const password = this.newRequest.password;
      if (!password) {
        this.passwordError = 'Password is required.';
      } else if (password.length < 8) {
        this.passwordError = 'Password must be at least 8 characters long.';
      } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        this.passwordError = 'Password must contain letters and numbers.';
      } else {
        this.passwordError = '';
      }
    },
    async submitRequest() {
      console.log('Form submitted, calling submitRequest');
      if (!this.passwordsMatch) {
        this.showErrorMessage('Passwords do not match.');
        return;
      }
      if (this.emailError || this.phoneError || this.passwordError) {
        this.showErrorMessage('Please fix all validation errors before submitting.');
        return;
      }

      this.isSubmitting = true;
      this.statusMessage = '';
      try {
        console.log('Step 1: Fetching max ID');
        const maxIdResponse = await axios.get('http://localhost:7777/api/pending-requests/max-id');
        console.log('Step 2: Max ID fetched:', maxIdResponse.data);
        const newId = (maxIdResponse.data.maxId || 0) + 1;

        const requestData = {
          ...this.newRequest,
          id: newId,
          earnings: { travelExpenses: 0, otherEarnings: 0 }
        };
        console.log('Step 3: Submitting request with data:', requestData);

        const response = await axios.post('http://localhost:7777/api/pending-requests', requestData);
        console.log('Step 4: Submission response:', response.data);

        if (response.status === 201) {
          console.log('Step 5: Success, closing modal');
          this.showRegisterModal = false;
          this.resetNewRequest();
          this.showSuccessMessage('Account request submitted successfully! Please wait for admin approval.');
        }
      } catch (error) {
        console.error('Submission error:', error.response || error);
        this.showErrorMessage(error.response?.data?.error || 'Failed to submit request. Please check your connection or try again.');
      } finally {
        this.isSubmitting = false;
        console.log('Step 6: Submission complete, isSubmitting set to false');
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
        civilStatus: 'Single',
        contactNumber: '',
        email: '',
        salary: 0,
        hourlyRate: 0,
        sss: '',
        philhealth: '',
        hdmf: '',
        tin: '',
        hireDate: new Date().toISOString().slice(0, 10),
        status: 'pending',
        role: 'employee',
        earnings: { travelExpenses: 0, otherEarnings: 0 }
      };
      this.confirmPassword = '';
      this.showPassword = false;
      this.showConfirmPassword = false;
      this.emailError = '';
      this.phoneError = '';
      this.passwordError = '';
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => { this.statusMessage = ''; }, 5000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      console.error(message);
      setTimeout(() => { this.statusMessage = ''; }, 5000);
    },
    calculateSSSContribution(salary) {
  const monthlySalary = Math.max(salary || 0, 0);
  if (monthlySalary < 5000) {
    return 250; // Fixed contribution for salaries below 5,000
  }
  
  // Calculate salary credit (capped between 5,000 and 35,000)
  const salaryCredit = Math.min(Math.max(monthlySalary, 5000), 35000);
  
  // Calculate regular SSS contribution (5% of salary credit, matching the table)
  const regularSSContribution = Math.round(salaryCredit * 0.05);
  
  // Calculate MPF contribution (2.5% of amount above 20,000, up to 35,000)
  let mpfContribution = 0;
  if (salaryCredit > 20000) {
    const mpfBase = Math.min(salaryCredit, 35000) - 20000;
    mpfContribution = Math.round(mpfBase * 0.025);
  }
  
  // Calculate total employee contribution
  let totalEmployeeContribution = regularSSContribution + mpfContribution;
  
  // Cap total contribution at 1,750 for salary credits above 34,750
  if (salaryCredit > 34750) {
    totalEmployeeContribution = 1750;
  }
  
  return totalEmployeeContribution;
},

calculatePhilHealthContribution(salary) {
  const monthlySalary = Math.max(salary || 0, 0);
  const minSalary = 10000; // PhilHealth minimum salary base for employed individuals
  const maxSalary = 100000; // PhilHealth maximum salary base for employed individuals
  const cappedSalary = Math.min(Math.max(monthlySalary, minSalary), maxSalary);
  return Math.round(cappedSalary * 0.025); // Employee’s 2.5% share
},
    calculatePagIBIGContribution(salary) {
      const cappedSalary = Math.min(salary || 0, 10000);
      return Math.round(cappedSalary * 0.02);
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
    forgotPassword() {
      this.loginError = 'Forgot Password feature not implemented yet. Contact your admin.';
    }
  }
};
</script>

<style scoped>
/* Tailwind CSS classes are sufficient */
</style>