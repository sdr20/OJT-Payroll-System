<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Leave Request Form -->
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h2 class="text-2xl font-semibold mb-4">Request Leave</h2>

                    <form @submit.prevent="submitLeaveRequest">
                        <div class="mb-4">
                            <label class="block text-gray-700 font-medium mb-2">Start Date:</label>
                            <input type="date" v-model="newLeave.startDate"
                                class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-300 outline-none"
                                required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-medium mb-2">End Date:</label>
                            <input type="date" v-model="newLeave.endDate"
                                class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-300 outline-none"
                                required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-medium mb-2">Reason for Leave:</label>
                            <textarea v-model="newLeave.reason"
                                class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-300 outline-none min-h-[100px]"
                                required></textarea>
                        </div>
                        <button type="submit"
                            class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium"
                            :disabled="isSubmitting">
                            {{ isSubmitting ? 'Submitting...' : 'Send Request' }}
                        </button>
                    </form>

                    <div v-if="statusMessage"
                        :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                        class="mt-4 p-3 rounded-lg text-center">
                        {{ statusMessage }}
                    </div>
                </div>

                <!-- Leave Requests List with Pagination -->
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h2 class="text-2xl font-semibold mb-4">My Leave Requests</h2>

                    <div class="space-y-4">
                        <div v-for="request in paginatedRequests" :key="request.id"
                            class="border rounded-lg p-4 hover:shadow-sm transition-all">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-medium">{{ request.employeeName }}</h3>
                                    <p class="text-sm text-gray-600">
                                        {{ request.startDate }} to {{ request.endDate }}
                                    </p>
                                    <p class="mt-2 text-gray-700">{{ request.reason }}</p>
                                </div>
                                <span :class="{
                                    'bg-yellow-100 text-yellow-700': request.status === 'Pending',
                                    'bg-green-100 text-green-700': request.status === 'Approved',
                                    'bg-red-100 text-red-700': request.status === 'Disapproved'
                                }" class="px-3 py-1 rounded-full text-sm font-medium">
                                    {{ request.status }}
                                </span>
                            </div>
                        </div>

                        <div v-if="leaveRequests.length === 0" class="text-center text-gray-500 py-8">
                            No leave requests yet
                        </div>

                        <!-- Pagination Controls -->
                        <div v-if="leaveRequests.length > 0" class="mt-6 flex justify-between items-center">
                            <button @click="previousPage" :disabled="currentPage === 1"
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                                Previous
                            </button>
                            <span class="text-gray-600">
                                Page {{ currentPage }} of {{ totalPages }}
                            </span>
                            <button @click="nextPage" :disabled="currentPage === totalPages"
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'EmployeeLeaveRequest',
    data() {
        return {
            newLeave: {
                startDate: '',
                endDate: '',
                reason: ''
            },
            statusMessage: '',
            leaveRequests: [],
            currentPage: 1,
            requestsPerPage: 5,
            isSubmitting: false
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.leaveRequests.length / this.requestsPerPage);
        },
        paginatedRequests() {
            const start = (this.currentPage - 1) * this.requestsPerPage;
            const end = start + this.requestsPerPage;
            return this.leaveRequests.slice(start, end);
        }
    },
    created() {
        this.fetchLeaveRequests();
    },
    methods: {
        async fetchLeaveRequests() {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) throw new Error('User not authenticated');

                const response = await axios.get(`http://localhost:7777/api/leaves/employee/${userId}`);
                this.leaveRequests = response.data || [];
            } catch (error) {
                console.error('Failed to fetch leave requests:', error);
                this.statusMessage = 'Failed to load leave requests. Please try again.';
                setTimeout(() => this.statusMessage = '', 3000);
            }
        },
        async submitLeaveRequest() {
            this.isSubmitting = true;
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) throw new Error('User not authenticated');

                const leaveData = {
                    employeeId: userId,
                    employeeName: localStorage.getItem('userName') || 'Unknown', // Should be set during login
                    startDate: this.newLeave.startDate,
                    endDate: this.newLeave.endDate,
                    reason: this.newLeave.reason,
                    status: 'Pending'
                };

                const response = await axios.post('http://localhost:7777/api/leaves', leaveData);
                if (response.status === 201) {
                    this.leaveRequests.unshift(response.data);
                    this.statusMessage = 'Request submitted successfully!';
                    this.resetForm();
                    this.currentPage = 1; // Reset to first page to show new request
                }
            } catch (error) {
                console.error('Failed to submit leave request:', error);
                this.statusMessage = 'Failed to submit leave request. Please try again.';
            } finally {
                this.isSubmitting = false;
                setTimeout(() => this.statusMessage = '', 3000);
            }
        },
        resetForm() {
            this.newLeave = {
                startDate: '',
                endDate: '',
                reason: ''
            };
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        }
    }
};
</script>

<style scoped>
button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.transition-all {
    transition: all 0.2s ease-in-out;
}
</style>