<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useAttendanceStore } from '@/stores/attendance.store.js';
import { BASE_API_URL } from '@/utils/constants.js';
import EmployeeAttendanceDetails from './employee-management/partials/EmployeeAttendanceDetails.vue';

export default {
    name: 'AttendanceDashboard',
    components: {
        EmployeeAttendanceDetails,
    },
    setup() {
        const router = useRouter();
        const attendanceStore = useAttendanceStore();
        const authStore = useAuthStore();
        const totalEmployees = ref(0);
        const isLoading = ref(false);
        const isProcessingPayroll = ref(false);
        const showModals = ref({});

        const fetchTotalEmployees = async () => {
            try {
                const response = await fetch(`${BASE_API_URL}/api/employee/total`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.accessToken}`,
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch total employees');
                const data = await response.json();
                totalEmployees.value = data.total;
            } catch (error) {
                console.error('Failed to fetch total employees:', error);
            }
        };

        const formatTime = (time) => {
            if (!time) return '--';
            const [hours, minutes] = time.split(':');
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes} ${period}`;
        };

        const refreshAttendance = async () => {
            isLoading.value = true;
            try {
                await attendanceStore.fetchAttendance();
                console.log('Fetched attendance records:', attendanceStore.attendanceRecords); // Debug log
            } catch (error) {
                console.error('Failed to refresh attendance:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const exportAttendance = () => {
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });

            const csvContent = [
                ['Date', 'Employee ID', 'Name', 'Position', 'Sign In Time', 'Sign Out Time', 'Status'],
                ...attendanceStore.attendanceRecords.map((record) => [
                    currentDate,
                    record.employeeId?.empNo || 'N/A',
                    `${record.employeeId?.firstName} ${record.employeeId?.lastName}`,
                    record.employeeId?.position || 'N/A',
                    formatTime(record.morningTimeIn), // Changed from timeIn to morningTimeIn
                    formatTime(record.morningTimeOut || record.afternoonTimeOut), // Changed to use model fields
                    record.status || 'N/A',
                ]),
            ]
                .map((row) => row.join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const processPayroll = async () => {
            isProcessingPayroll.value = true;
            try {
                console.log('Processing payroll...');
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } finally {
                isProcessingPayroll.value = false;
            }
        };

        const deleteAttendance = async (id) => {
            if (confirm('Are you sure you want to delete this attendance record?')) {
                try {
                    const response = await fetch(`${BASE_API_URL}/api/attendance/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authStore.accessToken}`, // Add token
                        },
                    });
                    if (!response.ok) throw new Error('Failed to delete attendance');
                    await attendanceStore.fetchAttendance();
                } catch (error) {
                    console.error('Failed to delete attendance:', error);
                }
            }
        };

        const logout = () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            router.push('/admin/login');
        };

        const openModal = (recordId) => {
            showModals.value[recordId] = true;
        };

        const closeModal = (recordId) => {
            showModals.value[recordId] = false;
        };

        const today = new Date().toISOString().split('T')[0];

        const todayRecords = computed(() => {
            return attendanceStore.attendanceRecords.filter(r => r.date === today);
        });

        const presentCount = computed(() => {
            return todayRecords.value.filter(r => r.morningTimeIn).length; // Changed to morningTimeIn
        });

        const lateCount = computed(() => {
            const OFFICE_START = "08:00:00";
            return todayRecords.value.filter(r => r.morningTimeIn && r.morningTimeIn > OFFICE_START).length; // Changed to morningTimeIn
        });

        const absentCount = computed(() => {
            const presentEmployeeIds = todayRecords.value
                .filter(r => r.morningTimeIn) // Changed to morningTimeIn
                .map(r => r.employeeId._id.toString());
            const absentEmployees = totalEmployees.value - new Set(presentEmployeeIds).size;
            return absentEmployees < 0 ? 0 : absentEmployees;
        });

        onMounted(() => {
            fetchTotalEmployees();
            refreshAttendance();
        });

        return {
            totalEmployees,
            isLoading,
            isProcessingPayroll,
            showModals,
            formatTime,
            refreshAttendance,
            exportAttendance,
            processPayroll,
            deleteAttendance,
            logout,
            openModal,
            closeModal,
            absentCount,
            presentCount,
            lateCount,
            todayRecords,
            today,
            attendanceStore,
        };
    },
    methods: {
        getStatusClass(status) {
            return {
                'text-red-500': status === 'Absent',
                'text-green-500': status === 'On Time' || status === 'Present',
                'text-yellow-500': status === 'Late',
                'text-orange-500': status === 'Early Departure',
            };
        },
    },
};
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Stats Overview (unchanged) -->
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div
                    class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="rounded-full bg-indigo-100 p-3">
                                <span class="material-icons text-indigo-600">groups</span>
                            </div>
                            <div class="ml-5">
                                <p class="text-sm font-medium text-gray-600">Total Employees</p>
                                <h3 class="text-2xl font-bold text-gray-900">{{ totalEmployees }}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center p-6 gap-4">
                        <div class="rounded-full bg-green-100 p-3">
                            <span class="material-icons text-green-600">how_to_reg</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600">Present Today</p>
                            <h3 class="text-2xl font-bold text-gray-900">
                                {{ presentCount }}
                            </h3>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="rounded-full bg-yellow-100 p-3">
                                <span class="material-icons text-yellow-600">schedule</span>
                            </div>
                            <div class="ml-5">
                                <p class="text-sm font-medium text-gray-600">Late Today</p>
                                <h3 class="text-2xl font-bold text-gray-900">
                                    {{ lateCount }}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="rounded-full bg-red-100 p-3">
                                <span class="material-icons text-red-600">cancel</span>
                            </div>
                            <div class="ml-5">
                                <p class="text-sm font-medium text-gray-600">Absent Today</p>
                                <h3 class="text-2xl font-bold text-gray-900">
                                    {{ absentCount }}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Buttons (unchanged) -->
            <div class="mt-8 flex space-x-4">
                <button @click="refreshAttendance"
                    class="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                    :disabled="isLoading">
                    <span v-if="isLoading" class="animate-spin material-icons">refresh</span>
                    <span v-else class="material-icons">refresh</span>
                    <span>Refresh Data</span>
                </button>
                <button @click="exportAttendance"
                    class="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    :disabled="isLoading">
                    <span class="material-icons">download</span>
                    <span>Export CSV</span>
                </button>
                <button @click="processPayroll"
                    class="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    :disabled="isProcessingPayroll">
                    <span class="material-icons">payment</span>
                    <span>{{ isProcessingPayroll ? 'Processing...' : 'Process Payroll' }}</span>
                </button>
            </div>

            <!-- Attendance Table -->
            <div class="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="p-6 border-b border-gray-300">
                    <h2 class="text-xl font-bold text-gray-900 flex items-center">
                        <span class="material-icons mr-2">event_note</span>
                        Today's Attendance
                    </h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">badge</span>
                                        <span>Employee</span>
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">work</span>
                                        <span>Position</span>
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">login</span>
                                        <span>Morning In</span>
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">logout</span>
                                        <span>Morning Out</span>
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">login</span>
                                        <span>Afternoon In</span>
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">logout</span>
                                        <span>Afternoon Out</span>
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">info</span>
                                        <span>Status</span>
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center space-x-2">
                                        <span class="material-icons text-gray-400">settings</span>
                                        <span>Actions</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <template v-if="isLoading">
                                <tr v-for="n in 5" :key="n" class="animate-pulse">
                                    <td v-for="m in 8" :key="m" class="px-6 py-4">
                                        <div class="h-4 bg-gray-200 rounded"></div>
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr v-for="record in todayRecords" :key="record._id" class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ record.employeeId?.firstName }} {{ record.employeeId?.lastName }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ record.employeeId?.position?.name || 'N/A' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ formatTime(record.morningTimeIn) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ formatTime(record.morningTimeOut) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ formatTime(record.afternoonTimeIn) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ formatTime(record.afternoonTimeOut) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium"
                                        :class="getStatusClass(record.status)">
                                        {{ record.morningTimeIn ? (record.status === 'Late' ? 'Late' : 'Present') :
                                            (record.status || 'N/A') }}
                                    </td>
                                    <td class="px-6 py-4 text-sm">
                                        <div class="flex space-x-2">
                                            <EmployeeAttendanceDetails :show="showModals[record._id] || false"
                                                :employee="record" @open="openModal(record._id)"
                                                @close="closeModal(record._id)" />
                                            <button @click.stop="deleteAttendance(record._id)"
                                                class="text-red-600 hover:text-red-800 transition cursor-pointer"
                                                title="Delete Record">
                                                <span class="material-icons">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.hover\:bg-gray-50:hover {
    background-color: #f9fafb;
}

.transition {
    transition: all 0.2s ease-in-out;
}
</style>