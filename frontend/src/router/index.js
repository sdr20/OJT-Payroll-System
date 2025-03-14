import { createRouter, createWebHistory } from 'vue-router';
import employeeRoutes from './employee.routes.js';
import adminRoutes from './admin.routes.js';
import { useAuthStore } from '@/stores/auth.store.js';

const routes = [
    {
        path: '/',
        name: 'login-selection',
        component: () => import('../views/LoginSelection.vue'),
        meta: {
            requiresGuest: true,
            title: 'Landing page'
        }
    },
    ...employeeRoutes,
    ...adminRoutes,
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: {
            title: '404 | Not Found'
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { top: 0 };
    }
});

router.beforeEach((to, from) => {
    const auth = useAuthStore();
    document.title = to.meta.title ? `${to.meta.title} - Payroll` : 'Payroll';

    if (to.meta.requiresAuth) {
        if (to.path.startsWith('/employee') && !auth.employee) {
            return { name: 'employee-login', query: { redirect: to.fullPath } };
        }
        if (to.path.startsWith('/admin') && !auth.admin) {
            return { name: 'admin-login', query: { redirect: to.fullPath } };
        }
    }

    if (to.meta.requiresGuest) {
        if (to.path.startsWith('/employee') && auth.employee) {
            return { name: 'employee-dashboard' };
        }
        if (to.path.startsWith('/admin') && auth.admin) {
            return { name: 'admin-dashboard' };
        }
    }
});

export default router;