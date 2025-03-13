import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const routes = [
  { path: '/', component: () => import('../views/LoginSelection.vue') },
  { path: '/admin-login', component: () => import('../components/adminlogin/AdminLogin.vue') },
  { path: '/employee-login', component: () => import('../components/employeelogin/EmployeeLogin.vue') },
  { path: '/register', component: () => import('../components/employeelogin/EmployeeRegister.vue') },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', component: () => import('../views/admins/AdminDashboard.vue') },
      { path: 'manage-positions', component: () => import('../views/admins/ManagePositions.vue') },
      { path: 'employee-attendance', component: () => import('../views/admins/EmployeeAttendance.vue') },
      { path: 'manage-employees', component: () => import('../views/admins/ManageEmployees.vue') },
      { path: 'salary-slips', component: () => import('../views/admins/SalarySlips.vue') },
      { path: 'manage-pay-heads', component: () => import('../views/admins/ManagePayHeads.vue') },
      { path: 'month-selection', component: () => import('../views/admins/MonthSelection.vue') },
      { path: 'payroll-with-deductions', component: () => import('../views/admins/PayrollWithDeductions.vue') },
      { path: 'employee-leave-management', component: () => import('../views/admins/EmployeeLeaveManagement.vue') },
      { path: 'list-holidays', component: () => import('../views/admins/ListHolidays.vue') },
      { path: 'employee-reports', component: () => import('../views/employee/EmployeeReports.vue') },
      { path: 'records', component: () => import('../views/admins/EmployeeRecords.vue') },
    ],
  },
  {
    path: '/employee',
    component: () => import('../layouts/EmployeeLayout.vue'),
    meta: { requiresAuth: true, role: 'employee' },
    children: [
      { path: '', component: () => import('../views/employee/EmployeeDashboard.vue') },
      { path: 'attendance', component: () => import('../views/admins/EmployeeAttendance.vue') },
      { path: 'salary-slips', component: () => import('../views/employee/EmployeeSalarySlips.vue') },
      { path: 'leave-management', component: () => import('../views/admins/EmployeeLeaveManagement.vue') },
      { path: 'holidays', component: () => import('../views/employee/EmployeeHolidays.vue') },
      { path: 'reports', component: () => import('../views/employee/EmployeeReports.vue') },
      { path: 'employee-leave-request', name: 'EmployeeLeaveRequest', component: () => import('../views/employee/EmployeeLeaveRequest.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Access Pinia store

  // Restore session from localStorage if not already done
  if (!authStore.isAuthenticated) {
    authStore.restoreSession();
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const userRole = authStore.userRole; // Getter from Pinia store
  const isAuthenticated = authStore.isAuthenticated;

  // If the route requires authentication
  if (requiresAuth) {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to the root (login selection)
      next('/');
    } else if (to.meta.role && to.meta.role !== userRole) {
      // Redirect to the appropriate dashboard if role doesn't match
      next(userRole === 'admin' ? '/admin' : '/employee');
    } else {
      // Allow access if authenticated and role matches
      next();
    }
  } 
  // If navigating to a public route (e.g., login) while authenticated
  else if (isAuthenticated && ['/', '/admin-login', '/employee-login', '/register'].includes(to.path)) {
    // Redirect authenticated users to their respective dashboards
    next(userRole === 'admin' ? '/admin' : '/employee');
  } 
  // Allow access to public routes for unauthenticated users
  else {
    next();
  }
});

export default router;