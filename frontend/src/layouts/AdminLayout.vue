<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <!-- Modern Header with Glassmorphism -->
    <header class="sticky top-0 z-50 backdrop-blur-sm bg-gradient-to-r from-blue-700/95 to-indigo-700/95 text-white shadow-lg">
      <div class="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
        <!-- Brand Section -->
        <div class="flex items-center">
          <div class="bg-white rounded-lg p-1 sm:p-2">
            <img src="@/assets/pic1.png" alt="LutzPayroll.inc Logo" class="h-10 sm:h-12 w-auto object-contain" />
          </div>
        </div>

        <!-- User Controls -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <div class="flex items-center bg-white/5 rounded-lg p-1 sm:p-2 hover:bg-white/10 transition-all">
            <div class="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center shadow-inner">
              <span class="text-base sm:text-lg font-semibold">{{ userInitial }}</span>
            </div>
            <div class="ml-2 sm:ml-3 hidden sm:block">
              <p class="text-xs sm:text-sm font-medium">{{ username }}</p>
              <p class="text-xs text-blue-100">Administrator</p>
            </div>
          </div>

          <button @click="logout" 
                  class="flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95 whitespace-nowrap">
            <span class="material-icons text-sm">logout</span>
            <span class="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 h-[calc(100vh-4rem)]">
      <!-- Enhanced Sidebar -->
      <aside class="w-20 md:w-64 bg-white shadow-lg flex flex-col transition-all duration-300">
        <nav class="flex-1 py-4 px-2 md:px-4 overflow-y-auto">
          <div class="space-y-1">
            <router-link v-for="link in navigationLinks" 
                         :key="link.path" 
                         :to="link.path"
                         class="flex items-center px-3 py-3 rounded-xl text-gray-600 hover:bg-blue-50 
                                hover:text-blue-700 transition-all group">
              <span class="material-icons text-xl md:text-lg text-gray-400 
                           group-hover:text-blue-600">{{ getLinkIcon(link.name) }}</span>
              <span class="ml-3 text-sm font-medium hidden md:block">{{ link.name }}</span>
            </router-link>
          </div>

          <!-- Special Holiday Section -->
          <div class="mt-6 pt-6 border-t border-gray-100">
            <router-link to="/admin/List-Holidays"
                         class="flex items-center px-3 py-3 rounded-xl text-gray-600 
                                hover:bg-blue-50 hover:text-blue-700 transition-all group">
              <span class="material-icons text-xl md:text-lg text-gray-400 
                           group-hover:text-blue-600">event</span>
              <span class="ml-3 text-sm font-medium hidden md:block">Holiday Selection</span>
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-auto bg-slate-50 p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  data() {
    return {
      username: 'Admin',
      navigationLinks: [
        { path: '/admin', name: 'Dashboard' },
        { path: '/admin/employee-attendance', name: 'Employee Attendance' },
        { path: '/admin/manage-employees', name: 'Manage Employees' },
        { path: '/admin/salary-slips', name: 'Salary Slips' },
        { path: '/admin/manage-pay-heads', name: 'Manage Pay Heads' },
        { path: '/admin/employee-leave-management', name: 'Leave Management' },
        { path: '/admin/records', name: 'Records' },
      ],
    };
  },
  computed: {
    userInitial() {
      return this.username.charAt(0).toUpperCase();
    },
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    updateDateTime() {
      const now = new Date();
      this.currentDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/admin-login');
    },
    getLinkIcon(name) {
      return {
        'Dashboard': 'dashboard',
        'Employee Attendance': 'schedule',
        'Manage Employees': 'people',
        'Salary Slips': 'receipt',
        'Manage Pay Heads': 'attach_money',
        'Leave Management': 'event_available',
        'Records': 'archive',
      }[name] || 'widgets';
    },
  },
  mounted() {
    this.updateDateTime();
    setInterval(this.updateDateTime, 1000);
  },
  beforeUnmount() {
    clearInterval(this.updateDateTime);
  },
};
</script>

<style scoped>
/* Remove @apply directives and use direct Tailwind classes */
.router-link-active {
  background-color: #bfdbfe; /* bg-blue-50 */
  color: #1d4ed8; /* text-blue-700 */
}

.router-link-active .material-icons {
  color: #2563eb; /* text-blue-600 */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out; /* transition-opacity duration-200 */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 0.5rem; /* w-2 */
}

::-webkit-scrollbar-track {
  background-color: transparent; /* bg-transparent */
}

::-webkit-scrollbar-thumb {
  background-color: #d1d5db; /* bg-gray-300 */
  border-radius: 9999px; /* rounded-full */
}

::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af; /* bg-gray-400 */
  transition: background-color 0.2s ease-in-out; /* transition-colors */
}

/* Ensure header content doesn’t overflow */
header {
  min-height: 4rem; /* Minimum height for small screens */
}

/* Responsive Sidebar Adjustments */
@media (max-width: 768px) {
  aside {
    width: 80px; /* Fixed width on mobile */
  }
  .md\\:w-64 {
    width: 80px; /* Override Tailwind's md:w-64 on mobile */
  }
  nav {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>