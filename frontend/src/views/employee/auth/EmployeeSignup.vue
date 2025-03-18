<template>
    <div class="p-6">
        <h2 class="text-xl font-bold mb-4 text-gray-900">Request Account Creation</h2>
        <form @submit.prevent="submitRequest" class="space-y-6">
            <!-- Basic Information -->
            <div>
                <h3 class="text-base font-semibold text-gray-800 mb-3">Basic Information</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div class="space-y-1">
                        <label for="empNo" class="text-sm font-medium text-gray-700">Employee Number</label>
                        <input v-model="newRequest.empNo" type="text" id="empNo"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="Enter your employee number" required />
                    </div>
                    <div class="space-y-1">
                        <label for="firstName" class="text-sm font-medium text-gray-700">First Name</label>
                        <input v-model="newRequest.firstName" type="text" id="firstName"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="Enter your first name" required />
                    </div>
                    <div class="space-y-1">
                        <label for="middleName" class="text-sm font-medium text-gray-700">Middle Name</label>
                        <input v-model="newRequest.middleName" type="text" id="middleName"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="Enter your middle name" />
                    </div>
                    <div class="space-y-1">
                        <label for="lastName" class="text-sm font-medium text-gray-700">Last Name</label>
                        <input v-model="newRequest.lastName" type="text" id="lastName"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="Enter your last name" required />
                    </div>
                    <div class="space-y-1">
                        <label for="email" class="text-sm font-medium text-gray-700">Email</label>
                        <input v-model="newRequest.email" type="email" id="email"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="Enter your email" required @input="validateEmail" />
                        <p v-if="emailError" class="text-red-500 text-xs mt-1 animate-pulse-fast">{{ emailError }}</p>
                    </div>
                    <div class="space-y-1">
                        <label for="contactNumber" class="text-sm font-medium text-gray-700">Contact Number</label>
                        <input v-model="newRequest.contactNumber" type="text" id="contactNumber"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="09123456789" required pattern="\d{11}"
                            title="Please enter an 11-digit phone number (e.g., 09123456789)"
                            @input="validatePhoneNumber" />
                        <p v-if="phoneError" class="text-red-500 text-xs mt-1 animate-pulse-fast">{{ phoneError }}</p>
                    </div>
                    <div class="space-y-1">
                        <label for="position" class="text-sm font-medium text-gray-700">Position</label>
                        <select v-model="newRequest.position" id="position"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            required @change="updateSalaryFromPosition">
                            <option value="" disabled>Select a position</option>
                            <option v-for="position in adminPositions" :key="position._id" :value="position.name">{{
                                position.name }}</option>
                        </select>
                        <p v-if="adminPositions.length === 0" class="text-red-500 text-xs mt-1">No positions available.
                            Contact your admin.</p>
                    </div>
                    <div class="space-y-1">
                        <label for="civilStatus" class="text-sm font-medium text-gray-700">Civil Status</label>
                        <select v-model="newRequest.civilStatus" id="civilStatus"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            required>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label for="hireDate" class="text-sm font-medium text-gray-700">Hire Date</label>
                        <input v-model="newRequest.hireDate" type="date" id="hireDate"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            required />
                    </div>
                    <div class="space-y-1">
                        <label for="sss" class="text-sm font-medium text-gray-700">SSS ID</label>
                        <input v-model="newRequest.sss" type="text" id="sss"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="1234567890" pattern="\d{10}"
                            title="Please enter a 10-digit SSS ID (e.g., 1234567890)" />
                    </div>
                    <div class="space-y-1">
                        <label for="philhealth" class="text-sm font-medium text-gray-700">PhilHealth ID</label>
                        <input v-model="newRequest.philhealth" type="text" id="philhealth"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="123456789012" pattern="\d{12}"
                            title="Please enter a 12-digit PhilHealth ID (e.g., 123456789012)" />
                    </div>
                    <div class="space-y-1">
                        <label for="hdmf" class="text-sm font-medium text-gray-700">HDMF ID</label>
                        <input v-model="newRequest.hdmf" type="text" id="hdmf"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="123456789012" pattern="\d{12}"
                            title="Please enter a 12-digit Pag-IBIG ID (e.g., 123456789012)" />
                    </div>
                    <div class="space-y-1">
                        <label for="tin" class="text-sm font-medium text-gray-700">TIN</label>
                        <input v-model="newRequest.tin" type="text" id="tin"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="123456789" pattern="\d{9,12}"
                            title="Please enter a 9-12 digit TIN (e.g., 123456789)" />
                    </div>
                </div>
            </div>

            <!-- Login Credentials -->
            <div>
                <h3 class="text-base font-semibold text-gray-800 mb-3">Login Credentials</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div class="space-y-1">
                        <label for="newUsername" class="text-sm font-medium text-gray-700">Username</label>
                        <input v-model="newRequest.username" type="text" id="newUsername"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="Choose a username" required minlength="4" />
                    </div>
                    <div class="space-y-1">
                        <label for="newPassword" class="text-sm font-medium text-gray-700">Password</label>
                        <div class="relative">
                            <input v-model="newRequest.password" :type="showPassword ? 'text' : 'password'"
                                id="newPassword"
                                class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-all duration-300 ease-in-out hover:border-blue-300"
                                placeholder="Choose a password" required minlength="8" @input="validatePassword" />
                            <button type="button" @click="togglePasswordVisibility"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center transition-transform duration-300 hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                        <div class="text-sm text-gray-600 mt-2">
                            Password strength: <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
                        </div>
                        <p v-if="passwordError" class="text-red-500 text-xs mt-1 animate-pulse-fast">{{ passwordError }}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <label for="confirmPassword" class="text-sm font-medium text-gray-700">Confirm Password</label>
                        <div class="relative">
                            <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                                id="confirmPassword"
                                class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-all duration-300 ease-in-out hover:border-blue-300"
                                placeholder="Confirm your password" required @input="validatePassword" />
                            <button type="button" @click="toggleConfirmPasswordVisibility"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center transition-transform duration-300 hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                        <div class="text-sm text-red-500 mt-1 animate-pulse-fast" v-if="!passwordsMatch">
                            Passwords do not match
                        </div>
                    </div>
                </div>
            </div>

            <!-- Buttons and Status Message -->
            <div class="flex justify-end space-x-2 mt-4">
                <button type="button" @click="$emit('close')"
                    class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    :disabled="isSubmitting">
                    Cancel
                </button>
                <button type="submit"
                    class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    :disabled="isSubmitDisabled">
                    {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
                </button>
            </div>
            <div v-if="statusMessage"
                :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                class="mt-4 p-3 rounded-lg text-center animate-bounce-in">
                {{ statusMessage }}
            </div>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'EmployeeSignup',
    emits: ['close', 'success'],
    data() {
        return {
            isSubmitting: false,
            statusMessage: '',
            adminPositions: [],
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
                earnings: { travelExpenses: 0, otherEarnings: 0 },
            },
            showPassword: false,
            showConfirmPassword: false,
            confirmPassword: '',
            emailError: '',
            phoneError: '',
            passwordError: '',
        };
    },
    watch: {
        'newRequest.salary'(newSalary) {
            this.newRequest.hourlyRate = newSalary ? newSalary / (8 * 22) : 0;
        },
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
                'text-green-500': this.passwordStrength === 'Strong',
            };
        },
        passwordsMatch() {
            return this.newRequest.password === this.confirmPassword;
        },
        isSubmitDisabled() {
            return this.isSubmitting || !this.passwordsMatch || !!this.emailError || !!this.phoneError || !!this.passwordError || !this.newRequest.position || this.adminPositions.length === 0;
        },
    },
    mounted() {
        this.fetchPositions();
    },
    methods: {
        async fetchPositions() {
            try {
                const response = await axios.get('http://localhost:7777/api/positions');
                this.adminPositions = response.data.map(pos => ({
                    _id: pos._id,
                    name: pos.name,
                    salary: pos.salary,
                }));
                if (this.adminPositions.length === 0) {
                    this.showErrorMessage('No positions available. Contact your admin.');
                }
            } catch (error) {
                console.error('Error fetching positions:', error.response?.data || error.message);
                this.showErrorMessage('Failed to load positions. Contact your admin.');
                this.adminPositions = [];
            }
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
        updateSalaryFromPosition() {
            const selectedPosition = this.adminPositions.find(pos => pos.name === this.newRequest.position);
            if (selectedPosition) {
                this.newRequest.salary = selectedPosition.salary;
                this.newRequest.hourlyRate = selectedPosition.salary / (8 * 22);
            } else {
                this.newRequest.salary = 0;
                this.newRequest.hourlyRate = 0;
            }
        },
        async submitRequest() {
            if (!this.passwordsMatch || this.emailError || this.phoneError || this.passwordError) {
                this.showErrorMessage('Please fix all validation errors before submitting.');
                return;
            }
            this.isSubmitting = true;
            this.statusMessage = '';
            try {
                const requestData = {
                    empNo: this.newRequest.empNo,
                    username: this.newRequest.username,
                    password: this.newRequest.password,
                    firstName: this.newRequest.firstName,
                    middleName: this.newRequest.middleName || '',
                    lastName: this.newRequest.lastName,
                    email: this.newRequest.email,
                    contactInfo: this.newRequest.contactNumber,
                    civilStatus: this.newRequest.civilStatus,
                    position: this.newRequest.position,
                    salary: this.newRequest.salary,
                    sss: this.newRequest.sss || '',
                    philHealth: this.newRequest.philhealth || '',
                    pagIbig: this.newRequest.hdmf || '',
                    tin: this.newRequest.tin || '',
                    hireDate: this.newRequest.hireDate,
                    role: 'employee',
                    status: 'pending',
                };
                console.log('Sending request data:', requestData);
                const response = await axios.post('http://localhost:7777/api/employee/register', requestData);
                if (response.status === 201) {
                    this.resetNewRequest();
                    this.showSuccessMessage('Account request submitted successfully! Awaiting admin approval.');
                    this.$emit('success', 'Account request submitted successfully!');
                    this.$emit('close');
                }
            } catch (error) {
                console.error('Submit request error:', error.response?.data || error.message); 
                this.showErrorMessage(error.response?.data?.error || 'Failed to submit request. Please try again.');
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
                earnings: { travelExpenses: 0, otherEarnings: 0 },
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
            setTimeout(() => { this.statusMessage = ''; }, 5000);
        },
    },
};
</script>

<style scoped>
@keyframes bounceIn {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

@keyframes pulseFast {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.animate-bounce-in {
    animation: bounceIn 0.5s ease-out;
}

.animate-pulse-fast {
    animation: pulseFast 1s infinite ease-in-out;
}

input:focus,
select:focus,
button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.disabled:bg-gray-400:disabled {
    opacity: 0.7;
}
</style>