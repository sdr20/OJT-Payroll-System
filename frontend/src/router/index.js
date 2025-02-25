import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import LoginSelection from '../views/LoginSelection.vue';
import AdminLogin from '../components/adminlogin/AdminLogin.vue';
import EmployeeLogin from '../components/employeelogin/EmployeeLogin.vue';
import EmployeeRegister from '../components/employeelogin/EmployeeRegister.vue';
import AdminDashboard from '../views/admind/AdminDashboard.vue';
import EmployeeDashboard from '../views/employee/EmployeeDashboard.vue';
import ManagePositions from '../views/admind/ManagePositions.vue';
import EmployeeAttendance from '../views/admind/EmployeeAttendance.vue';
import ManageEmployees from '../views/admind/ManageEmployees.vue';
import SalarySlips from '../views/admind/SalarySlips.vue';
import ManagePayHeads from '../views/admind/ManagePayHeads.vue';
import MonthSelection from '../views/admind/MonthSelection.vue';
import PayrollWithDeductions from '../views/admind/PayrollWithDeductions.vue';
import EmployeeLeaveManagement from '../views/admind/EmployeeLeaveManagement.vue';
import ListHolidays from '../views/admind/ListHolidays.vue';
import EmployeeReports from '../views/employee/EmployeeReports.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import EmployeeLayout from '../layouts/EmployeeLayout.vue';
import EmployeeAttendanceView from '../views/admind/EmployeeAttendance.vue';
import EmployeeSalarySlips from '../views/employee/EmployeeSalarySlips.vue';
import EmployeeLeaveManagementView from '../views/admind/EmployeeLeaveManagement.vue';
import EmployeeHolidays from '../views/employee/EmployeeHolidays.vue';
import EmployeeReportsView from '../views/employee/EmployeeReports.vue';
import EmployeeLeaveRequest from '../views/employee/EmployeeLeaveRequest.vue';

const routes = [
  { path: '/', component: LoginSelection },
  { path: '/admin-login', component: AdminLogin },
  { path: '/employee-login', component: EmployeeLogin },
  { path: '/register', component: EmployeeRegister },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', component: AdminDashboard },
      { path: 'manage-positions', component: ManagePositions },
      { path: 'employee-attendance', component: EmployeeAttendance },
      { path: 'manage-employees', component: ManageEmployees },
      { path: 'salary-slips', component: SalarySlips },
      { path: 'manage-pay-heads', component: ManagePayHeads }, // ✅ Route for ManagePayHeads
      { path: 'month-selection', component: MonthSelection },
      { path: 'payroll-with-deductions', component: PayrollWithDeductions },
      { path: 'employee-leave-management', component: EmployeeLeaveManagement },
      { path: 'list-holidays', component: ListHolidays },
      { path: 'employee-reports', component: EmployeeReports },
    ],
  },
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, role: 'employee' },
    children: [
      { path: '', component: EmployeeDashboard },
      { path: 'attendance', component: EmployeeAttendanceView },
      { path: 'salary-slips', component: EmployeeSalarySlips },
      { path: 'leave-management', component: EmployeeLeaveManagementView },
      { path: 'holidays', component: EmployeeHolidays },
      { path: 'reports', component: EmployeeReportsView },
      { path: 'employee-leave-request', name: 'EmployeeLeaveRequest', component: EmployeeLeaveRequest },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const user = store.state.user;
    if (!user) {
      next('/');
    } else if (to.meta.role && to.meta.role !== user.role) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

// Prevent Back Navigation to Login
router.afterEach((to) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    window.history.pushState(null, '', window.location.href);
  }
});

window.addEventListener('popstate', (event) => {
  const user = store.state.user;
  if (user && (event.state === null || event.state === undefined)) {
    router.push(user.role === 'admin' ? '/admin' : '/employee');
  }
});

export default router;
