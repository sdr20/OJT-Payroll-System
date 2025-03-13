<script>
import { useAuthStore } from '@/store/auth';

export default {
    name: 'EmployeeLayout',
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            menuItems: [
                { name: 'Dashboard', path: '/employee', icon: 'home' },
                { name: 'Salary Slips', path: '/employee/salary-slips', icon: 'description' },
                { name: 'Leave Management', path: '/employee/employee-leave-request', icon: 'event' },
                { name: 'Holidays', path: '/employee/holidays', icon: 'beach_access' },
            ]
        };
    },
    computed: {
        user() {
            return this.authStore.user;
        },
    },
    methods: {
        logout() {
            this.authStore.logout();
            this.$router.push('/employee-login');
        },
    },
};
</script>

<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <!-- Modern Header with gradient and glass effect -->
        <header
            class="flex justify-between items-center p-4 bg-gradient-to-r from-teal-600 to-lime-500 text-white backdrop-blur-sm shadow-lg">
            <div class="flex items-center">
                <div class="bg-white rounded-lg p-1 sm:p-2">
                    <img src="@/assets/pic1.png" alt="right-jobs-logo" class="h-10 sm:h-12 w-auto object-contain" />
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                    <span class="h-8 w-8 bg-white rounded-full flex items-center justify-center text-teal-600">
                        {{ user?.username?.[0]?.toUpperCase() }}
                    </span>
                    <span class="font-medium">{{ user?.username }}</span>
                </div>
                <button @click="logout"
                    class="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm">
                    Logout
                </button>
            </div>
        </header>

        <!-- Modern Sidebar with subtle shadows -->
        <div class="flex flex-1 overflow-hidden">
            <aside class="w-72 bg-white shadow-sm border-r border-gray-100">
                <nav class="p-4">
                    <ul class="space-y-2">
                        <li v-for="(item, index) in menuItems" :key="index">
                            <router-link :to="item.path"
                                class="flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-teal-50 hover:text-teal-600"
                                active-class="bg-teal-50 text-teal-600 font-medium shadow-sm">
                                <span :class="['material-icons', 'mr-3 w-5 text-center text-cyan-600']">{{ item.icon }}</span>
                                <span>{{ item.name }}</span>
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </aside>

            <!-- Modern Main Content Area -->
            <main class="flex-1 p-6 overflow-y-auto">
                <div class="max-w-7xl mx-auto">
                    <router-view v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>