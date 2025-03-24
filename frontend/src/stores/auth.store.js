import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // State
    const admin = ref(JSON.parse(localStorage.getItem('admin') || 'null'));
    const employee = ref(JSON.parse(localStorage.getItem('employee') || 'null'));
    const accessToken = ref(localStorage.getItem('token') || null);

    // Restore session immediately on store initialization
    restoreSession();

    // Restore session from localStorage
    function restoreSession() {
        const storedAdmin = JSON.parse(localStorage.getItem('admin') || 'null');
        const storedEmployee = JSON.parse(localStorage.getItem('employee') || 'null');
        const storedToken = localStorage.getItem('token') || null;

        admin.value = storedAdmin;
        employee.value = storedEmployee;
        accessToken.value = storedToken;

        console.log('Session restored:', { admin: admin.value, employee: employee.value, token: accessToken.value });
    }

    // Save state to localStorage
    function saveAdmin(newAdmin) {
        admin.value = newAdmin;
        localStorage.setItem('admin', JSON.stringify(admin.value));
        console.log('Admin saved:', admin.value);
    }

    function saveEmployee(newEmployee) {
        employee.value = newEmployee;
        localStorage.setItem('employee', JSON.stringify(employee.value));
        console.log('Employee saved:', employee.value);
    }

    function saveAccessToken(newToken) {
        accessToken.value = newToken;
        localStorage.setItem('token', newToken);
        console.log('Access token saved:', accessToken.value);
    }

    // Setters
    function setAdmin(newAdmin) {
        saveAdmin(newAdmin);
        employee.value = null;
        localStorage.removeItem('employee');
    }

    function setEmployee(newEmployee) {
        saveEmployee(newEmployee);
        admin.value = null; 
        localStorage.removeItem('admin');
    }

    function setAccessToken(newToken) {
        saveAccessToken(newToken);
    }

    // Logout
    function logout() {
        admin.value = null;
        employee.value = null;
        accessToken.value = null;
        localStorage.removeItem('admin');
        localStorage.removeItem('employee');
        localStorage.removeItem('token');
        console.log('Logged out');
    }

    // Computed properties
    const isAuthenticated = computed(() => !!accessToken.value && (!!admin.value || !!employee.value));
    const userRole = computed(() => {
        if (admin.value) return 'admin';
        if (employee.value) return 'employee';
        return null;
    });

    const isAdmin = computed(() => userRole.value === 'admin');

    return {
        admin,
        employee,
        accessToken,
        setAdmin,
        setEmployee,
        setAccessToken,
        logout,
        restoreSession,
        isAuthenticated,
        userRole,
        isAdmin,
        saveAdmin,
        saveEmployee,
        saveAccessToken,
    };
});