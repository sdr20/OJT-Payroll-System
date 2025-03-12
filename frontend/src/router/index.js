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
import AdminLeaveManagement from '../views/admind/EmployeeLeaveManagement.vue';
import ListHolidays from '../views/admind/ListHolidays.vue';
import EmployeeReports from '../views/employee/EmployeeReports.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import EmployeeLayout from '../layouts/EmployeeLayout.vue';
import EmployeeSalarySlips from '../views/employee/EmployeeSalarySlips.vue';
import EmployeeHolidays from '../views/employee/EmployeeHolidays.vue';
import EmployeeReportsView from '../views/employee/EmployeeReports.vue';
import EmployeeLeaveRequest from '../views/employee/EmployeeLeaveRequest.vue';
import Records from '../views/admind/EmployeeRecords.vue';

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
      { path: 'manage-pay-heads', component: ManagePayHeads },
      { path: 'month-selection', component: MonthSelection },
      { path: 'payroll-with-deductions', component: PayrollWithDeductions },
      { path: 'employee-leave-management', component: AdminLeaveManagement },
      { path: 'list-holidays', component: ListHolidays },
      { path: 'employee-reports', component: EmployeeReports },
      { path: 'records', component: Records },
    ],
  },
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, role: 'employee' },
    children: [
      { path: '', component: EmployeeDashboard },
      { path: 'attendance', component: EmployeeAttendance },
      { path: 'salary-slips', component: EmployeeSalarySlips },
      { path: 'leave-management', component: AdminLeaveManagement },
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

// Navigation Guard
router.beforeEach((to, from, next) => {
  const user = store.state.user;
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      next('/');
    } else if (to.meta.role && to.meta.role !== user.role) {
      next('/');
    } else {
      next();
    }
  } else if (from.matched.some(record => record.meta.requiresAuth) && to.path === '/') {
    next(user.role === 'admin' ? '/admin' : '/employee');
  } else {
    next();
  }
});

export default router; // Single default export