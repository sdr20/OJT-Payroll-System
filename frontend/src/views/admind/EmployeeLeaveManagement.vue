<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Employee Leave Management</h2>
          <button @click="refreshLeaveRequests" 
                  class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200">
            Refresh
          </button>
        </div>

        <!-- Leave Requests Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Start Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave End Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="leave in leaveRequests" :key="leave.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ leave.employeeName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ leave.startDate }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ leave.endDate }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                    :class="getStatusClass(leave.status)">
                  {{ leave.status }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button @click="showDetailsModal(leave)" 
                          class="bg-blue-50 text-blue-600 py-1.5 px-3 rounded-lg hover:bg-blue-100 transition-all duration-200">
                    View Details
                  </button>
                  <button v-if="leave.status === 'Pending'" @click="approveLeave(leave.id)" 
                          class="bg-green-50 text-green-600 py-1.5 px-3 rounded-lg hover:bg-green-100 transition-all duration-200">
                    Approve
                  </button>
                  <button v-if="leave.status === 'Pending'" @click="disapproveLeave(leave.id)" 
                          class="bg-red-50 text-red-600 py-1.5 px-3 rounded-lg hover:bg-red-100 transition-all duration-200">
                    Disapprove
                  </button>
                </td>
              </tr>
              <tr v-if="leaveRequests.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No leave requests found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Details Modal -->
      <div v-if="showDetailsModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded-xl shadow-md max-w-lg w-full">
          <h2 class="text-xl font-bold mb-4">Leave Request Details</h2>
          <div class="space-y-2">
            <p><strong>Employee:</strong> {{ selectedLeave.employeeName }}</p>
            <p><strong>Employee ID:</strong> {{ selectedLeave.employeeId }}</p>
            <p><strong>Start Date:</strong> {{ selectedLeave.startDate }}</p>
            <p><strong>End Date:</strong> {{ selectedLeave.endDate }}</p>
            <p><strong>Reason:</strong> {{ selectedLeave.reason }}</p>
            <p><strong>Status:</strong> <span :class="getStatusClass(selectedLeave.status)">{{ selectedLeave.status }}</span></p>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeDetailsModal" 
                    class="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminLeaveManagement',
  data() {
    return {
      leaveRequests: [],
      showDetailsModalVisible: false,
      selectedLeave: {}
    };
  },
  mounted() {
    this.fetchLeaveRequests();
  },
  methods: {
    async fetchLeaveRequests() {
      try {
        const response = await axios.get('http://localhost:7777/api/leaves/all');
        this.leaveRequests = response.data || [];
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        alert('Failed to load leave requests. Please try again.');
      }
    },
    async refreshLeaveRequests() {
      await this.fetchLeaveRequests();
      alert('Leave requests refreshed!');
    },
    showDetailsModal(leave) {
      this.selectedLeave = { ...leave };
      this.showDetailsModalVisible = true;
    },
    closeDetailsModal() {
      this.showDetailsModalVisible = false;
      this.selectedLeave = {};
    },
    async approveLeave(id) {
      try {
        const response = await axios.put(`http://localhost:7777/api/leaves/${id}/approve`);
        if (response.status === 200) {
          this.leaveRequests = this.leaveRequests.map(leave => 
            leave.id === id ? { ...leave, status: 'Approved' } : leave
          );
          alert('Leave approved successfully!');
        }
      } catch (error) {
        console.error('Failed to approve leave:', error);
        alert('Failed to approve leave. Please try again.');
      }
    },
    async disapproveLeave(id) {
      try {
        const response = await axios.put(`http://localhost:7777/api/leaves/${id}/disapprove`);
        if (response.status === 200) {
          this.leaveRequests = this.leaveRequests.map(leave => 
            leave.id === id ? { ...leave, status: 'Disapproved' } : leave
          );
          alert('Leave disapproved successfully!');
        }
      } catch (error) {
        console.error('Failed to disapprove leave:', error);
        alert('Failed to disapprove leave. Please try again.');
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 'Pending':
          return 'text-yellow-600';
        case 'Approved':
          return 'text-green-600';
        case 'Disapproved':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    }
  }
};
</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}
</style>