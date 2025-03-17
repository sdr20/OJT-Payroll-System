<script setup>
import { useAuthStore } from '@/stores/auth.store.js';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import Dropdown from '../components/Dropdown.vue';
import { BASE_API_URL } from '@/utils/constants';
import DropdownLink from '../components/DropdownLink.vue';

const router = useRouter();
const authStore = useAuthStore();
const employee = computed(() => authStore.employee);

const menuItems = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: 'home' },
    { name: 'Salary Slips', path: '/employee/salary-slips', icon: 'description' },
    { name: 'Leave Management', path: '/employee/leave/request', icon: 'event' },
    { name: 'Holidays', path: '/employee/holidays', icon: 'beach_access' },
];

const user = computed(() => authStore.employee);

const logout = () => {
    authStore.logout();
    router.push('/employee/login');
};

const settingsRoute = computed(() => {
    return employee.value?.id ? `/employee/settings/${employee.value.id}` : '/employee/login';
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-slate-50">
        <!-- Modern Header with gradient and glass effect -->
        <header
            class="sticky top-0 z-[1000] backdrop-blur-sm bg-gradient-to-r from-teal-600 to-lime-500 text-white shadow-lg">
            <div class="mx-auto px-2 sm:px-14 py-2 sm:py-3 flex justify-between items-center">
                <div class="flex items-center">
                    <div class="bg-white rounded-lg p-1 sm:p-2">
                        <img src="@/assets/pic1.png" alt="right-jobs-logo" class="h-10 sm:h-12 w-auto object-contain" />
                    </div>
                </div>

                <div class="flex items-center space-x-2 sm:space-x-4">
                    <Dropdown align="right" width="56">
                        <template #trigger>
                            <div
                                class="flex items-center bg-white/5 rounded-lg p-1 sm:p-2 hover:bg-white/10 transition-all cursor-pointer">
                                <div class="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center overflow-hidden">
                                    <img v-if="employee.profilePicture"
                                        :src="`${BASE_API_URL}${employee.profilePicture}`" :alt="employee.firstName"
                                        class="h-full w-full object-cover rounded-full" @error="handleImageError">
                                    <div v-else
                                        class="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-teal-600 flex items-center justify-center">
                                        <span class="text-white font-semibold text-lg">
                                            {{ employee?.username?.[0]?.toUpperCase() }}
                                        </span>
                                    </div>
                                </div>
                                <div class="ml-2 sm:ml-3 hidden sm:block">
                                    <p class="text-xs sm:text-sm font-medium">{{ employee?.username }}</p>
                                    <p class="text-xs text-blue-100">{{ employee?.firstName }} {{ employee?.lastName }}
                                    </p>
                                </div>
                            </div>
                        </template>

                        <template #content>
                            <DropdownLink :href="settingsRoute">
                                Settings
                            </DropdownLink>
                            <DropdownLink :href="'/employee/login'" @click.prevent="logout" as="button">
                                Logout
                            </DropdownLink>
                        </template>
                    </Dropdown>

                    <button @click="logout"
                        class="flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95 whitespace-nowrap">
                        <span class="material-icons text-sm">logout</span>
                        <span class="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Modern Sidebar with subtle shadows -->
        <div class="flex flex-1 overflow-hidden">
            <aside
                class="fixed top-[4rem] left-0 w-72 h-[calc(100vh-4rem)] bg-white shadow-sm border-r border-gray-100 overflow-y-auto">
                <nav class="py-8 px-2 md:px-4">
                    <ul class="space-y-2">
                        <li v-for="(item, index) in menuItems" :key="index">
                            <router-link :to="item.path"
                                class="flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-teal-50 hover:text-teal-600"
                                active-class="bg-teal-50 text-teal-600 font-medium shadow-sm">
                                <span :class="['material-icons', 'mr-3 w-5 text-center text-cyan-600']">{{ item.icon
                                    }}</span>
                                <span>{{ item.name }}</span>
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </aside>

            <!-- Modern Main Content Area -->
            <main class="flex-1 ml-72 overflow-auto bg-slate-50 px-6 py-4">
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