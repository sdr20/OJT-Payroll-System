<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <!-- Enhanced Header with subtle gradient -->
        <header class="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md">
            <div class="flex items-center">
                <span class="material-icons text-3xl mr-2">account_balance</span>
                <div class="text-2xl font-bold">LutzPayroll.inc</div>
            </div>
            <div class="flex items-center space-x-6">
                <!-- Enhanced User Profile -->
                <div class="flex items-center group cursor-pointer hover:bg-blue-700 rounded-lg p-2 transition-all">
                    <div class="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 text-lg font-medium shadow-sm">
                        {{ user?.username?.charAt(0).toUpperCase() }}
                    </div>
                    <span class="ml-3 font-medium">{{ user?.username }}</span>
                </div>

                <!-- Enhanced Logout Button -->
                <button 
                    @click="logout" 
                    class="flex items-center px-4 py-2 rounded-lg transition-all duration-200
                         bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium
                         focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                    <span class="material-icons mr-2">logout</span>
                    Logout
                </button>
            </div>
        </header>

        <div class="flex flex-1">
            <!-- Enhanced Sidebar with Material Icons -->
            <aside class="w-72 bg-white shadow-lg">
                <nav class="p-4">
                    <ul class="space-y-1">
                        <li v-for="(link, index) in navigationLinks" :key="index">
                            <router-link 
                                :to="link.path" 
                                class="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 
                                       hover:text-blue-600 transition-all duration-200 group"
                                active-class="bg-blue-50 text-blue-600 font-medium"
                            >
                                <span class="material-icons mr-3 text-gray-400 group-hover:text-blue-600">
                                    {{ getLinkIcon(link.name) }}
                                </span>
                                <span>{{ link.name }}</span>
                            </router-link>
                        </li>
                        <!-- Holiday Selection -->
                        <li>
                            <router-link 
                                to="/admin/List-Holidays" 
                                class="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 
                                       hover:text-blue-600 transition-all duration-200 group"
                                active-class="bg-blue-50 text-blue-600 font-medium"
                            >
                                <span class="material-icons mr-3 text-gray-400 group-hover:text-blue-600">
                                    calendar_today
                                </span>
                                <span>Holiday Selection</span>
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </aside>

            <!-- Enhanced Main Content Area -->
            <div class="flex-1 p-6 overflow-y-auto bg-gray-50">
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
    getLinkIcon(name) {
      const iconMap = {
        'Dashboard': 'dashboard',
        'Employee Attendance': 'schedule',
        'Manage Employees': 'people',
        'Salary Slips': 'receipt',
        'Manage Pay Heads': 'attach_money',
        'Employee Leave Management': 'event',
        'Holiday Selection': 'calendar_today'
      };
      return iconMap[name] || 'default_icon'; // Fallback icon if no match
    }
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