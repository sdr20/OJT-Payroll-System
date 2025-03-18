import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { BASE_API_URL } from '../utils/constants.js';

export const useAuthStore = defineStore('auth', () => {
    const admin = ref(JSON.parse(localStorage.getItem('admin') || 'null'));
    const employee = ref(JSON.parse(localStorage.getItem('employee') || 'null'));
    const accessToken = ref(localStorage.getItem('token') || null);

    restoreSession();

    function restoreSession() {
        const storedAdmin = JSON.parse(localStorage.getItem('admin') || 'null');
        const storedEmployee = JSON.parse(localStorage.getItem('employee') || 'null');
        const storedToken = localStorage.getItem('token') || null;

        if (storedAdmin) admin.value = storedAdmin;
        if (storedEmployee) employee.value = storedEmployee;
        if (storedToken) accessToken.value = storedToken;
    }

    async function fetchEmployeeDetails(id) {
        try {
            const response = await fetch(`${BASE_API_URL}/api/employee/${id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken.value}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch employee details');
            const employeeData = await response.json();
            if (employeeData.status === 'pending') {
                throw new Error('Account is pending approval');
            }
            employee.value = { ...employee.value, ...employeeData };
            saveEmployee();
        } catch (error) {
            console.error('Error fetching employee details:', error);
            throw error;
        }
    }

    function saveAdmin() {
        console.log('Saving admin:', admin.value);
        localStorage.setItem('admin', JSON.stringify(admin.value));
    }

    function saveEmployee() {
        if (employee.value) {
            localStorage.setItem('employee', JSON.stringify(employee.value));
        }
    }

    function saveAccessToken() {
        if (accessToken.value) {
            localStorage.setItem('token', accessToken.value);
        }
    }

    function setAdmin(newAdmin) {
        admin.value = newAdmin;
        saveAdmin();
    }

    function setEmployee(newEmployee) {
        employee.value = newEmployee;
        saveEmployee();
    }

    function setAccessToken(newToken) {
        console.log(`access token ${newToken}`);
        accessToken.value = newToken;
        saveAccessToken();
    }

    function logout() {
        admin.value = null;
        employee.value = null;
        accessToken.value = null;
        localStorage.removeItem('admin');
        localStorage.removeItem('employee');
        localStorage.removeItem('token');
    }

    const isAuthenticated = computed(() => !!admin.value || !!employee.value);
    const userRole = computed(() => {
        if (admin.value) return 'admin';
        if (employee.value) return 'employee';
        return null;
    });

    return { 
        admin,
        employee, 
        accessToken, 
        setEmployee, 
        setAccessToken, 
        logout, 
        fetchEmployeeDetails,
        setAdmin,
        saveAdmin,
        saveEmployee,
        saveAccessToken,
        restoreSession,
        isAuthenticated,
        userRole
    };
});