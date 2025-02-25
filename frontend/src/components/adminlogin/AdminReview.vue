
<!-- WALA NA TO -->

<!-- <template>
    <div class="min-h-screen bg-gray-100 p-8">
      <h1 class="text-2xl font-bold mb-4">Review Employee Registrations</h1>
      <div v-if="registrations.length === 0" class="text-gray-700">No pending registrations.</div>
      <div v-else>
        <div v-for="registration in registrations" :key="registration.username" class="bg-white p-4 rounded shadow-md mb-4">
          <h2 class="text-xl font-bold mb-2">{{ registration.firstName }} {{ registration.lastName }}</h2>
          <p><strong>Username:</strong> {{ registration.username }}</p>
          <p><strong>Birthday:</strong> {{ registration.birthday }}</p>
          <p><strong>Hire Date:</strong> {{ registration.hireDate }}</p>
          <p><strong>Position:</strong> <input type="text" v-model="registration.position" class="border border-gray-300 p-2 rounded w-full"></p>
          <p><strong>Civil Status:</strong> {{ registration.civilStatus }}</p>
          <p><strong>Contact Info:</strong> {{ registration.contactInfo }}</p>
          <p><strong>Email:</strong> {{ registration.email }}</p>
          <p><strong>SSS:</strong> {{ registration.sss }}</p>
          <p><strong>Philhealth:</strong> {{ registration.philhealth }}</p>
          <p><strong>HDMF:</strong> {{ registration.hdmf }}</p>
          <div class="flex mt-4">
            <button @click="approve(registration)" class="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 mr-2">Approve</button>
            <button @click="reject(registration)" class="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700">Reject</button>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminReview',
  data() {
    return {
      registrations: [],
    };
  },
  async created() {
    try {
      const response = await axios.get('/api/registrations');
      this.registrations = response.data;
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  },
  methods: {
    async approve(registration) {
      try {
        await axios.post('/api/approve', registration);
        this.registrations = this.registrations.filter(r => r.username !== registration.username);
      } catch (error) {
        console.error('Failed to approve registration:', error);
      }
    },
    async reject(registration) {
      try {
        await axios.post('/api/reject', registration);
        this.registrations = this.registrations.filter(r => r.username !== registration.username);
      } catch (error) {
        console.error('Failed to reject registration:', error);
      }
    },
  },
};
</script>

<style scoped>
</style> -->
