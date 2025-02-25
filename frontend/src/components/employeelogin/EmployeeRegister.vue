<template>
  <div>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <!-- Error and success messages -->
        <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {{ error }}
        </div>
        <div v-if="success" class="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Registration successful! Redirecting to login...
        </div>

        <h1 class="text-2xl font-bold mb-4 text-center">Employee Registration</h1>
        <form @submit.prevent="validateAndRegister">
          <!-- Login Information -->
          <div class="mb-6 bg-gray-50 p-4 rounded">
            <h2 class="text-lg font-semibold mb-3">Login Information</h2>
            <div class="mb-4">
              <label for="username" class="block text-gray-700">Username/Email</label>
              <input 
                v-model="username" 
                type="text" 
                id="username" 
                class="w-full p-2 border rounded mt-1" 
                :class="{'border-red-500': usernameError}"
                placeholder="username or user@example.com"
                required
              >
              <p v-if="usernameError" class="text-red-500 text-sm mt-1">{{ usernameError }}</p>
            </div>
            <div class="mb-4">
              <label for="password" class="block text-gray-700">Password</label>
              <input 
                v-model="password" 
                type="password" 
                id="password" 
                class="w-full p-2 border rounded mt-1"
                :class="{'border-red-500': passwordError}"
                required
              >
              <p class="text-sm text-gray-500 mt-1">Must be at least 8 characters long</p>
              <p v-if="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="mb-6 bg-gray-50 p-4 rounded">
            <h2 class="text-lg font-semibold mb-3">Personal Information</h2>
            <div class="mb-4">
              <label for="firstName" class="block text-gray-700">First Name</label>
              <input v-model="firstName" type="text" id="firstName" class="w-full p-2 border rounded mt-1" required>
            </div>
            <div class="mb-4">
              <label for="lastName" class="block text-gray-700">Last Name</label>
              <input v-model="lastName" type="text" id="lastName" class="w-full p-2 border rounded mt-1" required>
            </div>
            <div class="mb-4">
              <label for="birthday" class="block text-gray-700">Birthday</label>
              <input v-model="birthday" type="date" id="birthday" class="w-full p-2 border rounded mt-1" required>
            </div>
            <div class="mb-4">
              <label for="civilStatus" class="block text-gray-700">Civil Status</label>
              <select v-model="civilStatus" id="civilStatus" class="w-full p-2 border rounded mt-1" required>
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
          </div>

          <!-- Employment Information -->
          <div class="mb-6 bg-gray-50 p-4 rounded">
            <h2 class="text-lg font-semibold mb-3">Employment Information</h2>
            <div class="mb-4">
              <label for="hireDate" class="block text-gray-700">Hire Date</label>
              <input v-model="hireDate" type="date" id="hireDate" class="w-full p-2 border rounded mt-1" required>
            </div>
            <div class="mb-4">
              <label for="position" class="block text-gray-700">Position</label>
              <input v-model="position" type="text" id="position" class="w-full p-2 border rounded mt-1" required>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="mb-6 bg-gray-50 p-4 rounded">
            <h2 class="text-lg font-semibold mb-3">Contact Information</h2>
            <div class="mb-4">
              <label for="email" class="block text-gray-700">Email Address</label>
              <input 
                v-model="email" 
                type="email" 
                id="email" 
                class="w-full p-2 border rounded mt-1"
                :class="{'border-red-500': emailError}"
                required
              >
              <p v-if="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
            </div>
            <div class="mb-4">
              <label for="contactInfo" class="block text-gray-700">Contact Number</label>
              <input 
                v-model="contactInfo" 
                type="text" 
                id="contactInfo" 
                class="w-full p-2 border rounded mt-1"
                placeholder="Enter mobile number"
                required
              >
            </div>
          </div>

          <button 
            type="submit" 
            class="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EmployeeRegister',
  data() {
    return {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      birthday: '',
      hireDate: '',
      position: '',
      civilStatus: '',
      contactInfo: '',
      email: '',
      error: null,
      success: false,
      usernameError: '',
      passwordError: '',
      emailError: ''
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      
      // Reset errors
      this.usernameError = '';
      this.passwordError = '';
      this.emailError = '';

      // Username validation
      if (!this.username) {
        this.usernameError = 'Username is required';
        isValid = false;
      } else if (!this.isValidUsername(this.username)) {
        this.usernameError = 'Enter a valid username or email address';
        isValid = false;
      }

      // Password validation
      if (this.password.length < 8) {
        this.passwordError = 'Password must be at least 8 characters long';
        isValid = false;
      }

      // Email validation
      if (!this.isValidEmail(this.email)) {
        this.emailError = 'Please enter a valid email address';
        isValid = false;
      }

      return isValid;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    isValidUsername(username) {
      // Allow either email format or simple username format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return emailRegex.test(username) || usernameRegex.test(username);
    },

    async validateAndRegister() {
      if (this.validateForm()) {
        await this.register();
      }
    },

    async register() {
      try {
        this.error = null;
        this.success = false;
        
        const response = await axios.post('http://localhost:3000/api/register', {
          username: this.username,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          birthday: this.birthday,
          hireDate: this.hireDate,
          position: this.position,
          civilStatus: this.civilStatus,
          contactInfo: this.contactInfo,
          email: this.email
        });

        if (response.status === 200) {
          this.success = true;
          // Clear form
          Object.keys(this.$data).forEach(key => {
            if (typeof this.$data[key] === 'string') {
              this.$data[key] = '';
            }
          });
          // Redirect to login
          setTimeout(() => {
            this.$router.push('/employee-login');
          }, 1500);
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed';
        console.error('Failed to register:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Add any additional custom styles here */
</style>