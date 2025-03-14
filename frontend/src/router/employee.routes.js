const employeeRoutes = [
    {
        path: '/employee/login',
        name: 'employee-login',
        component: () => import('../views/employee/auth/EmployeeLogin.vue'),
        meta: {
            requiresGuest: true,
            title: 'Employee Login'
        }
    },
    {
        path: '/employee/signup',
        name: 'employee-signup',
        component: () => import('../views/employee/auth/EmployeeSignup.vue'),
        meta: {
            requiresGuest: true,
            title: 'Employee Signup'
        }
    },
    {
        path: '/employee',
        component: () => import('../layouts/EmployeeLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'employee-dashboard',
                component: () => import('../views/employee/EmployeeDashboard.vue'),
                meta: {
                    title: 'Employee Dashboard'
                }
            },
            {
                path: 'attendance',
                name: 'employee-attendance',
                component: () => import('../views/employee/EmployeeAttendance.vue'),
                meta: {
                    title: 'Attendance'
                }
            },
            {
                path: 'leave/request',
                name: 'employee-leave-request',
                component: () => import('../views/employee/leave-management/EmployeeLeaveRequest.vue'),
                meta: {
                    title: 'Leave Request'
                }
            },
            {
                path: 'salary-slips',
                name: 'salary-slips',
                component: () => import('../views/employee/salary-slips/EmployeeSalarySlips.vue'),
                meta: {
                    title: 'Salary slips'
                }
            },
            {
                path: 'holidays',
                name: 'list-of-holidays',
                component: () => import('../views/ListHolidays.vue'),
                meta: {
                    title: 'Holiday Selection'
                }
            },
            {
                path: 'settings/:id',
                name: 'employee-settings',
                component: () => import('../views/employee/settings/EmployeeSettings.vue'),
                props: true,
                meta: {
                    title: 'Employee Settings'
                }
            },
        ],
    }
];

export default employeeRoutes;