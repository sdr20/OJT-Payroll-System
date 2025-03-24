<template>
  <div class="bg-white p-5 rounded-xl shadow-md mb-8">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Head Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-if="!payHeads || payHeads.length === 0">
          <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
            No pay heads available.
          </td>
        </tr>
        <tr v-for="payHead in payHeads" :key="payHead.id || payHead.uniqueId" v-else>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payHead.name || 'Unnamed' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            P {{ Number(payHead.amount || 0).toLocaleString() }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ payHead.type || 'N/A' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ payHead.isRecurring ? 'Yes' : 'No' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
            <button 
              @click="$emit('update', payHead)" 
              class="p-1.5 text-yellow-600 hover:text-yellow-800 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
              title="Update Pay Head"
            >
              <span class="material-icons-outlined text-base">edit</span>
              Edit
            </button>
            <button 
              @click="$emit('delete', payHead.id)" 
              class="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
              title="Delete Pay Head"
            >
              <span class="material-icons-outlined text-base">delete</span>
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'PayHeadTable',
  props: {
    payHeads: {
      type: Array,
      required: true,
      default: () => [] // Fallback to empty array
    }
  }
};
</script>

<style scoped>
</style>