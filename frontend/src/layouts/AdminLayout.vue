<script setup>
import { useRouter, useRoute } from 'vue-router';
import Dropdown from '@/components/Dropdown.vue';
import DropdownLink from '@/components/DropdownLink.vue';
import { useAuthStore } from '@/stores/auth.store.js';
import { ref, computed, watch, onMounted } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const navigationLinks = ref([
    { path: '/admin/dashboard', name: 'Dashboard' },
    { path: '/admin/employee-attendance', name: 'Employee Attendance' },
    { path: '/admin/manage-employees', name: 'Manage Employees' },
    { path: '/admin/salary-slips', name: 'Salary Slips' },
    { path: '/admin/manage-pay-heads', name: 'Manage Pay Heads' },
    { path: '/admin/employee-leave-management', name: 'Leave Management' },
    { path: '/admin/employee-records', name: 'Records' },
    { path: '/admin/trash', name: 'Trash' },
]);

const username = computed(() => authStore.admin?.username || 'Admin');
const adminInitial = computed(() => username.value.charAt(0).toUpperCase());

const logout = () => {
    authStore.logout();
    router.push('/admin-login');
};

const getLinkIcon = (name) => {
    return {
        'Dashboard': 'dashboard',
        'Employee Attendance': 'schedule',
        'Manage Employees': 'people',
        'Salary Slips': 'receipt',
        'Manage Pay Heads': 'attach_money',
        'Leave Management': 'event_available',
        'Trash': 'delete_sweep',
    }[name] || 'widgets';
};

const isSidebarMinimized = ref(false);
const isMobile = ref(window.innerWidth < 640); // 640px as mobile breakpoint (Tailwind's sm:)

const toggleSidebar = () => {
    isSidebarMinimized.value = !isSidebarMinimized.value;
};

// Update isMobile when window resizes
const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 640;
};

// Watch for mobile state changes and auto-toggle sidebar
watch(isMobile, (newValue) => {
    if (newValue) {
        isSidebarMinimized.value = true; // Minimize on mobile
    } else {
        isSidebarMinimized.value = false; // Expand on wide screens
    }
});

// Set up initial state and resize listener
onMounted(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-slate-50 relative z-0">
        <header class="sticky top-0 z-30 backdrop-blur-sm bg-gradient-to-r from-blue-700/95 to-indigo-700/95 text-white shadow-lg">
            <div class="mx-auto px-2 sm:px-10 py-2 sm:py-3 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="bg-white rounded-lg p-1">
                        <img src="@/assets/pic1.png" alt="right-jobs-logo" class="h-10 sm:h-12 w-auto object-contain" />
                    </div>
                </div>
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <Dropdown align="right" width="56">
                        <template #trigger>
                            <div class="flex items-center bg-white/5 rounded-lg p-1 sm:p-2 hover:bg-white/10 transition-all cursor-pointer">
                                <div class="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center shadow-inner">
                                    <span class="text-base sm:text-lg font-semibold">{{ adminInitial }}</span>
                                </div>
                                <div class="ml-2 sm:ml-3 hidden sm:block">
                                    <p class="text-xs sm:text-sm font-medium">{{ username }}</p>
                                    <p class="text-xs text-blue-100">Administrator</p>
                                </div>
                            </div>
                        </template>
                        <template #content>
                            <DropdownLink :href="'/admin/settings'" as="router-link">Settings</DropdownLink>
                            <DropdownLink :href="'/admin-login'" @click.prevent="logout" as="button">Logout</DropdownLink>
                        </template>
                    </Dropdown>
                    <button @click="logout" class="flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95 whitespace-nowrap">
                        <span class="material-icons text-sm">logout</span>
                        <span class="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>

        <div class="flex flex-1 overflow-hidden">
            <aside :class="[
                'fixed top-0 left-0 h-full bg-white shadow-sm border-r border-gray-100 overflow-y-auto transition-all duration-300 z-20',
                isSidebarMinimized ? 'w-16' : 'w-72'
            ]">
                <nav class="pt-20 pb-4 px-2">
                    <button @click="toggleSidebar" class="w-full flex justify-end px-2 mb-4">
                        <span class="material-icons text-gray-600 hover:text-blue-700">
                            {{ isSidebarMinimized ? 'chevron_right' : 'chevron_left' }}
                        </span>
                    </button>
                    <div class="space-y-1">
                        <router-link v-for="link in navigationLinks" :key="link.path" :to="link.path"
                            class="flex items-center px-3 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                            active-class="bg-blue-50 text-blue-700">
                            <span class="material-icons text-xl text-gray-400 group-hover:text-blue-600">
                                {{ getLinkIcon(link.name) }}
                            </span>
                            <span class="ml-3 text-sm font-medium" :class="{ 'hidden': isSidebarMinimized }">
                                {{ link.name }}
                            </span>
                        </router-link>
                    </div>
                    <div class="mt-6 pt-6 border-t border-gray-100">
                        <router-link :to="{ name: 'ListHolidays' }"
                            class="flex items-center px-3 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all group"
                            active-class="bg-blue-50">
                            <span class="material-icons text-xl text-gray-400 group-hover:text-blue-600">event</span>
                            <span class="ml-3 text-sm font-medium" :class="{ 'hidden': isSidebarMinimized }">
                                Holiday Selection
                            </span>
                        </router-link>
                    </div>
                </nav>
            </aside>

            <main class="flex-1 overflow-auto bg-slate-50 px-6 py-4" :class="[
                isSidebarMinimized ? 'ml-16' : 'ml-72'
            ]">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>