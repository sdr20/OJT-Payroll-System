const adminRoutes = [
    {
        path: '/admin/login',
        name: 'admin-login',
        component: () => import('../views/admin/auth/AdminLogin.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/admin',
        component: () => import('../layouts/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'admin-dashboard',
                component: () => import('../views/admin/AdminDashboard.vue'),
                meta: { 
                    title: 'Admin Dashboard'
                }
            },
            {
                path: 'employee/attendance',
                name: 'admin-employee-attendance',
                component: () => import('../views/admin/employee-management/EmployeeAttendance.vue'),
                meta: {
                    title: 'Employee Attendance'
                }
            },
            {
                path: 'employee/manage',
                name: 'admin-employee-manage',
                component: () => import('../views/admin/employee-management/ManageEmployees.vue'),
                meta: {
                    title: 'Manage Employee'
                }
            },
            {
                path: 'employee/salary-slips',
                name: 'admin-employee-salary-slips',
                component: () => import('../views/admin/wage-management/SalarySlips.vue'),
                meta: {
                    title: 'Salary Slips'
                }
            },
            {
                path: 'employee/manage-pay-heads',
                name: 'admin-employee-manage-pay-heads',
                component: () => import('../views/admin/wage-management/ManagePayHeads.vue'),
                meta: {
                    title: 'Manage Pay Heads'
                }
            },
            {
                path: 'employee/leave-management',
                name: 'admin-employee-leave-management',
                component: () => import('../views/admin/employee-management/EmployeeLeaveManagement.vue'),
                meta: {
                    title: 'Leave Management'
                }
            },
            {
                path: 'employee/records',
                name: 'admin-employee-records',
                component: () => import('../views/admin/employee-management/EmployeeRecords.vue'),
                meta: {
                    title: 'Employee Records'
                }
            },
            {
                path: 'holiday-selection',
                name: 'admin-holiday-selection',
                component: () => import('../views/ListHolidays.vue'),
                meta: {
                    title: 'Holiday Selection'
                }
            },
            {
                path: 'settings',
                name: 'admin-settings',
                component: () => import('../views/admin/settings/AdminSettings.vue'),
                meta: {
                    title: 'Admin Settings'
                }
            },
        ],
    }
];

export default adminRoutes;