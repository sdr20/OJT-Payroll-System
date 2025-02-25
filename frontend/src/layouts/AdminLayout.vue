<template>
    <div class="flex flex-col h-screen bg-cyan-50">
        <!-- Modern Header with gradient and glass effect -->
        <header class="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white backdrop-blur-sm shadow-lg">
            <div class="text-2xl font-bold tracking-tight">LutzPayroll.inc</div>
            <div class="flex items-center space-x-6">
                <!-- User Profile -->
                <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-teal-700 flex items-center justify-center text-white text-lg font-medium shadow-sm">
                        {{ user?.username?.charAt(0).toUpperCase() }}
                    </div>
                    <span class="ml-3 font-medium text-gray-50">{{ user?.username }}</span>
                </div>

                <!-- Logout Button -->
                <button 
                    @click="logout" 
                    class="flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200
                         bg-white border border-gray-200 hover:bg-lime-50 text-gray-700 font-medium
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
                         shadow-sm hover:shadow"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </header>

        <div class="flex flex-1">
            <!-- Modern Sidebar -->
            <aside class="w-72 bg-white shadow-sm border-r border-gray-100">
                <nav class="p-4">
                    <ul class="space-y-1">
                        <li v-for="(link, index) in navigationLinks" :key="index">
                            <router-link 
                                :to="link.path" 
                                class="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-lime-50 
                                             hover:text-cyan-600 transition-all duration-200"
                                active-class="bg-lime-50 text-cyan-600 font-medium"
                            >
                                <span>{{ link.name }}</span>
                            </router-link>
                        </li>
                        <!-- Holiday Selection -->
                        <li>
                            <router-link 
                                to="/admin/List-Holidays" 
                                class="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-lime-50 
                                             hover:text-cyan-600 transition-all duration-200"
                                active-class="bg-lime-50 text-cyan-600 font-medium"
                            >
                                <span>Holiday Selection</span>
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </aside>

            <!-- Main Content Area -->
            <div class="flex-1 p-6 overflow-y-auto bg-cyan-50">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AdminLayout',
    data() {
        return {
            navigationLinks: [
                { path: '/admin', name: 'Dashboard' },
                // { path: '/admin/manage-positions', name: 'Manage Positions' },
                { path: '/admin/employee-attendance', name: 'Employee Attendance' },
                { path: '/admin/manage-employees', name: 'Manage Employees' },
                { path: '/admin/salary-slips', name: 'Salary Slips' },
                { path: '/admin/manage-pay-heads', name: 'Manage Pay Heads' },
                { path: '/admin/employee-leave-management', name: 'Employee Leave Management' },
            ]
        }
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
    },
    methods: {
        logout() {
            this.$store.dispatch('logout');
            this.$router.push('/admin-login');
        },
    },
};
</script>

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
