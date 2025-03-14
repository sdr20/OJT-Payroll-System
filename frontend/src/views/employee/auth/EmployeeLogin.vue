<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <div
                class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 transform transition-all duration-500 ease-out animate-fadeIn">
                <div class="text-center space-y-2">
                    <div
                        class="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900">Employee Portal</h1>
                    <p class="text-gray-500 text-sm">Welcome to your workspace</p>
                </div>

                <form @submit.prevent="login" class="space-y-4">
                    <div class="space-y-1">
                        <label for="username" class="text-sm font-medium text-gray-700">Username</label>
                        <input v-model="username" type="text" id="username"
                            class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:border-blue-300"
                            placeholder="Enter your username" required />
                    </div>

                    <div class="space-y-1">
                        <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                        <div class="relative">
                            <input v-model="password" :type="showLoginPassword ? 'text' : 'password'" id="password"
                                class="block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-all duration-300 ease-in-out hover:border-blue-300"
                                placeholder="Enter your password" required />
                            <button type="button" @click="toggleLoginPasswordVisibility"
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
                    </div>

                    <div v-if="loginError" class="text-red-500 text-sm text-center animate-pulse-fast">
                        {{ loginError }}
                    </div>

                    <div class="text-right">
                        <a href="#" @click.prevent="forgotPassword"
                            class="text-sm text-blue-500 hover:underline transition-colors duration-300 hover:text-blue-700">Forgot
                            Password?</a>
                    </div>

                    <button type="submit"
                        class="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        :disabled="isLoggingIn">
                        {{ isLoggingIn ? 'Signing in...' : 'Sign in' }}
                    </button>
                </form>

                <div class="text-center">
                    <p class="text-sm text-gray-700">
                        Don't have an account?
                        <a href="#" @click.prevent="showRegisterModal = true"
                            class="text-blue-500 hover:underline transition-colors duration-300 hover:text-blue-700">Request
                            an account</a>
                    </p>
                </div>
            </div>
        </div>

        <!-- Signup Modal -->
        <Modal :show="showRegisterModal" max-width="4xl" max-height="80vh" @close="showRegisterModal = false">
            <EmployeeSignup @close="showRegisterModal = false" @success="handleSignupSuccess" />
        </Modal>
    </div>
</template>

<script>
import axios from 'axios';
import Modal from '@/components/Modal.vue';
import EmployeeSignup from './EmployeeSignup.vue';
import { useAuthStore } from '@/stores/auth.store.js';

export default {
    name: 'EmployeeLogin',
    components: {
        Modal,
        EmployeeSignup,
    },
    data() {
        return {
            username: '',
            password: '',
            loginError: '',
            showRegisterModal: false,
            isLoggingIn: false,
            showLoginPassword: false,
        };
    },
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    methods: {
        async login() {
            this.isLoggingIn = true;
            this.loginError = '';
            try {
                const response = await axios.post('http://localhost:7777/api/employee/login', {
                    username: this.username.trim(),
                    password: this.password,
                });
                const userData = {
                    id: response.data.employee.id,
                    empNo: response.data.employee.empNo,
                    username: response.data.employee.username,
                    name: response.data.employee.name,
                    email: response.data.employee.email,
                    role: response.data.employee.role,
                    hireDate: response.data.employee.hireDate,
                };
                this.authStore.setEmployee(userData);
                this.authStore.setAccessToken(response.data.token);
                this.$router.push(userData.role === 'admin' ? '/admin' : '/employee');
            } catch (error) {
                this.loginError = error.response?.data?.message || 'Unable to connect to the server.';
                this.password = '';
            } finally {
                this.isLoggingIn = false;
            }
        },
        toggleLoginPasswordVisibility() {
            this.showLoginPassword = !this.showLoginPassword;
        },
        forgotPassword() {
            this.loginError = 'Forgot Password feature not implemented yet. Contact your admin.';
        },
        handleSignupSuccess(message) {
            this.showRegisterModal = false;
            this.loginError = message; // Display success message on login screen
            setTimeout(() => { this.loginError = ''; }, 5000);
        },
    },
};
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulseSlow {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
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

.animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
}

.animate-pulse-slow {
    animation: pulseSlow 2s infinite ease-in-out;
}

.animate-pulse-fast {
    animation: pulseFast 1s infinite ease-in-out;
}

input:focus,
button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.disabled:bg-gray-400:disabled {
    opacity: 0.7;
}
</style>