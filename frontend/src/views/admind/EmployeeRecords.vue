<template>
  <div class="min-h-screen p-1">
    <div class="max-w-8xl mx-auto">
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900">My Employee Records</h2>
          <input
            v-model="selectedMonth"
            type="month"
            class="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            @change="fetchEmployeeData"
          />
        </div>

        <table v-if="employee" class="min-w-full border border-gray-300">
          <thead class="bg-gray-200">
            <tr>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hire Date</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th class="border px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50">
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.id }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.name }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.position }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">{{ formatDate(employee.hireDate) }}</td>
              <td class="border px-4 py-2 text-sm text-gray-900">{{ employee.salaryMonth }}</td>
              <td class="border px-4 py-2 text-sm">
                <button 
                  @click="generateRecord" 
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition-all duration-200 mr-2"
                  :disabled="isGenerating"
                >
                  {{ isGenerating ? 'Generating...' : 'Generate Record' }}
                </button>
                <button 
                  @click="viewRecordHistory" 
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-all duration-200"
                  :disabled="isGenerating"
                >
                  View History
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading/Error State -->
        <div v-else class="text-center py-8 text-gray-500">
          {{ errorMessage || 'Loading employee data...' }}
        </div>

        <!-- Employee Record History Modal -->
        <div
          v-if="showRecordModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
            <div class="flex items-center justify-between p-4 border-b">
              <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
                <span class="material-icons text-sm">history</span>
                Record History - {{ employee?.name }}
              </h2>
              <button
                @click="showRecordModal = false"
                class="p-1 hover:bg-gray-100 rounded-full"
              >
                <span class="material-icons text-sm">close</span>
              </button>
            </div>
            <div class="flex flex-1 overflow-hidden">
              <div class="w-1/2 p-4 overflow-y-auto border-r">
                <div class="mb-4">
                  <h3 class="text-sm font-medium text-gray-700 mb-2">Position History</h3>
                  <ul class="text-sm text-gray-600">
                    <li v-for="history in employee.positionHistory" :key="history.startDate" class="mb-1">
                      {{ history.position }} ({{ formatDate(history.startDate) }} - {{ history.endDate ? formatDate(history.endDate) : 'Present' }})
                    </li>
                  </ul>
                </div>
                <div class="mb-4">
                  <label class="text-sm font-medium text-gray-700">Filter by Position:</label>
                  <select
                    v-model="modalFilterPosition"
                    class="w-full py-2 px-3 text-sm rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                  >
                    <option value="">All Positions</option>
                    <option v-for="pos in uniqueModalPositions" :key="pos" :value="pos">{{ pos }}</option>
                  </select>
                </div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Record Periods</h3>
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-200 sticky top-0">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Period</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Position</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr
                      v-for="record in filteredRecordHistory"
                      :key="record.salaryMonth"
                      class="hover:bg-gray-50 cursor-pointer"
                      :class="{ 'bg-blue-100': selectedRecord?.salaryMonth === record.salaryMonth }"
                      @click="selectRecord(record)"
                    >
                      <td class="px-4 py-2 text-sm text-gray-900">{{ record.salaryMonth }}</td>
                      <td class="px-4 py-2 text-sm text-gray-500">{{ record.position }}</td>
                      <td class="px-4 py-2">
                        <button
                          @click.stop="generateRecordForHistory(record)"
                          class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-700"
                          :disabled="recordGenerationStatus[record.salaryMonth]?.generating"
                        >
                          <span class="material-icons text-sm">description</span>
                          {{ recordGenerationStatus[record.salaryMonth]?.generating ? 'Generating...' : 'Generate' }}
                        </button>
                      </td>
                    </tr>
                    <tr v-if="filteredRecordHistory.length === 0">
                      <td colspan="3" class="px-4 py-4 text-center text-sm text-gray-500">No records available for this position.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="w-1/2 p-4 overflow-y-auto">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Record Preview</h3>
                <div v-if="selectedRecord && selectedRecord.recordDataUrl" class="flex flex-col h-full">
                  <iframe
                    :src="selectedRecord.recordDataUrl"
                    class="w-full h-[60vh] rounded border mb-4"
                    @load="onIframeLoad"
                    @error="onIframeError"
                  ></iframe>
                  <button
                    @click="downloadRecord"
                    class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md"
                  >
                    <span class="material-icons text-sm">download</span>
                    Download PDF
                  </button>
                  <div
                    v-if="iframeError"
                    class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm flex items-center gap-1"
                  >
                    <span class="material-icons text-sm">error</span>
                    Error loading record. Please try again.
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 text-center mt-4">
                  Select a record from the list to preview.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Message -->
        <div 
          v-if="statusMessage" 
          :class="statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
          class="mt-4 p-3 rounded-lg text-center"
        >
          {{ statusMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

jsPDF.prototype.autoTable = autoTable.default;

export default {
  name: 'EmployeeRecords',
  data() {
    return {
      employee: null,
      selectedMonth: new Date().toISOString().slice(0, 7),
      isGenerating: false,
      statusMessage: '',
      errorMessage: '',
      showRecordModal: false,
      recordDataUrl: '',
      iframeError: false,
      records: {}, // Store record URLs locally
      recordHistory: [],
      selectedRecord: null,
      recordGenerationStatus: {},
      modalFilterPosition: ''
    };
  },
  computed: {
    sortedRecordHistory() {
      return [...this.recordHistory].sort((a, b) => new Date(a.salaryMonth) - new Date(b.salaryMonth));
    },
    filteredRecordHistory() {
      return this.sortedRecordHistory.filter(record => 
        !this.modalFilterPosition || record.position === this.modalFilterPosition
      );
    },
    uniqueModalPositions() {
      return [...new Set(this.recordHistory.map(r => r.position))];
    }
  },
  mounted() {
    this.fetchEmployeeData();
  },
  methods: {
    async fetchEmployeeData() {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          this.errorMessage = 'User not logged in. Redirecting to login...';
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
          return;
        }

        const response = await axios.get(`http://localhost:7777/api/employees/${userId}/salary`, {
          params: { month: this.selectedMonth }
        });
        if (!response.data) {
          throw new Error('No employee data returned from server');
        }
        this.employee = {
          ...response.data,
          positionHistory: response.data.positionHistory || [
            { position: response.data.position || 'N/A', startDate: response.data.hireDate || new Date(), endDate: null }
          ],
          name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim()
        };
        this.recordDataUrl = this.records[`${this.employee.id}_${this.employee.salaryMonth}`] || '';
      } catch (error) {
        console.error('Error fetching employee data:', error);
        this.errorMessage = 'Failed to load employee records. Please check your connection or try again later.';
        this.employee = null;
      }
    },
    async generateRecord() {
      if (!this.employee) {
        this.statusMessage = 'No employee data available to generate record.';
        setTimeout(() => this.statusMessage = '', 3000);
        return;
      }

      this.isGenerating = true;
      this.statusMessage = '';
      try {
        const recordData = this.createRecordData(this.employee);
        const pdfBlob = await this.generatePdf(recordData);
        const url = URL.createObjectURL(pdfBlob);
        this.records[`${this.employee.id}_${this.employee.salaryMonth}`] = url;
        this.recordDataUrl = url;

        // Save to backend
        const pdfBase64 = await this.blobToBase64(pdfBlob);
        await this.saveEmployeeRecord({
          employeeId: this.employee.id,
          empNo: this.employee.empNo,
          recordData: pdfBase64,
          salaryMonth: this.employee.salaryMonth,
          position: this.employee.position,
          salary: this.employee.salary
        });

        this.showSuccessMessage('Record generated and saved successfully!');
        await this.viewRecordHistory(); // Refresh history after generation
      } catch (error) {
        console.error('Error generating record:', error);
        this.statusMessage = 'Failed to generate record. Please try again.';
      } finally {
        this.isGenerating = false;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    },
    async viewRecordHistory() {
      if (!this.employee) {
        this.statusMessage = 'No employee data available to view history.';
        setTimeout(() => this.statusMessage = '', 3000);
        return;
      }

      this.isGenerating = true;
      try {
        // Fetch historical records from the backend
        const response = await axios.get(`http://localhost:7777/api/employee-records/${this.employee.id}`);
        const serverRecords = response.data;

        const today = moment();
        const hireDate = moment(this.employee.hireDate);

        if (!hireDate.isValid()) {
          console.error('Invalid hireDate:', this.employee.hireDate);
          this.showErrorMessage('Invalid hire date for employee');
          this.isGenerating = false;
          return;
        }

        const recordHistory = [];
        let currentMonth = hireDate.clone().startOf('month');

        while (currentMonth.isSameOrBefore(today, 'month')) {
          const salaryMonth = currentMonth.format('YYYY-MM');
          const positionAtTime = this.employee.positionHistory.find(h => 
            moment(h.startDate).isSameOrBefore(salaryMonth, 'month') && 
            (!h.endDate || moment(h.endDate).isSameOrAfter(salaryMonth, 'month'))
          )?.position || this.employee.position;

          const serverRecord = serverRecords.find(r => r.salaryMonth === salaryMonth);
          const localUrl = this.records[`${this.employee.id}_${salaryMonth}`] || (serverRecord ? `data:application/pdf;base64,${serverRecord.recordData.split(',')[1]}` : null);

          recordHistory.push({
            salaryMonth,
            position: positionAtTime,
            recordDataUrl: localUrl || null,
            employee: { ...this.employee, salaryMonth }
          });

          currentMonth.add(1, 'month');
        }

        this.recordHistory = recordHistory;
        this.selectedRecord = this.filteredRecordHistory.find(r => r.recordDataUrl) || null;
        this.modalFilterPosition = '';
        this.showRecordModal = true;
      } catch (error) {
        console.error('Error fetching record history:', error);
        this.showErrorMessage('Failed to load record history. Please try again.');
      } finally {
        this.isGenerating = false;
      }
    },
    async generateRecordForHistory(record) {
      if (!record || !record.employee) {
        console.error('No record or employee data available:', record);
        this.showErrorMessage('Please select a valid record.');
        return;
      }

      const key = record.salaryMonth;
      this.recordGenerationStatus[key] = { generating: true };
      try {
        const recordData = this.createRecordData(record.employee);
        const pdfBlob = await this.generatePdf(recordData);
        const pdfBase64 = await this.blobToBase64(pdfBlob);
        const url = URL.createObjectURL(pdfBlob);
        this.records[`${record.employee.id}_${record.salaryMonth}`] = url;
        record.recordDataUrl = url;
        this.selectedRecord = record;

        // Save to backend
        await this.saveEmployeeRecord({
          employeeId: record.employee.id,
          empNo: record.employee.empNo,
          recordData: pdfBase64,
          salaryMonth: record.salaryMonth,
          position: record.position,
          salary: record.employee.salary || this.employee.salary
        });

        this.showSuccessMessage(`Record generated and saved for ${record.employee.name} - ${record.salaryMonth}!`);
      } catch (error) {
        console.error('Error generating record:', error);
        console.error('Server response:', error.response?.data);
        this.showErrorMessage(error.response?.data?.error || 'Failed to generate record. Please try again.');
      } finally {
        this.recordGenerationStatus[key] = { generating: false };
      }
    },
    async saveEmployeeRecord(payload) {
      try {
        const response = await axios.post('http://localhost:7777/api/employee-records/generate', payload);
        console.log('Employee record saved:', response.data);
      } catch (error) {
        console.error('Error saving employee record:', error);
        throw error;
      }
    },
    async blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
    selectRecord(record) {
      this.selectedRecord = record.recordDataUrl ? record : null;
      this.iframeError = false;
    },
    async downloadRecord() {
      if (!this.selectedRecord?.recordDataUrl) return;
      const response = await fetch(this.selectedRecord.recordDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Record_${this.employee.name}_${this.selectedRecord.salaryMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    createRecordData(employee) {
      const recordDate = moment(employee.salaryMonth, 'YYYY-MM').format('MM/DD/YYYY');
      return {
        recordDate,
        id: employee.id,
        name: employee.name,
        empNo: employee.empNo || 'N/A',
        lastName: employee.lastName || 'N/A',
        middleName: employee.middleName || 'N/A',
        firstName: employee.firstName || 'N/A',
        birthDate: employee.birthDate ? moment(employee.birthDate).format('MM/DD/YYYY') : 'N/A',
        hireDate: employee.hireDate ? moment(employee.hireDate).format('MM/DD/YYYY') : 'N/A',
        civilStatus: employee.civilStatus || 'SINGLE',
        dependents: employee.dependents || 0,
        sss: employee.sss || 'N/A',
        tin: employee.tin || 'N/A',
        philhealth: employee.philhealth || 'N/A',
        hdmf: employee.hdmf || 'N/A',
        position: employee.position || 'N/A',
        salaryMonth: employee.salaryMonth
      };
    },
    async generatePdf(recordData) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const lineHeight = 8;
      const leftMargin = 14;

      function addFormattedText(doc, text, x, y, options = {}) {
        doc.setFontSize(options.fontSize || 12);
        doc.setFont(undefined, options.fontStyle || 'normal');
        doc.setTextColor(options.textColor ? options.textColor[0] : 0, options.textColor ? options.textColor[1] : 0, options.textColor ? options.textColor[2] : 0);
        doc.text(text, x, y, { align: options.align || 'left' });
      }

      addFormattedText(doc, 'RIGHTJOB Solutions', leftMargin, 15, { fontSize: 16, fontStyle: 'bold', textColor: [0, 128, 0] });
      addFormattedText(doc, 'EMPLOYEE RECORD', doc.internal.pageSize.getWidth() / 2, 15, { fontSize: 18, align: 'center' });
      addFormattedText(doc, 'Record Date', 140, 15, { fontSize: 12 });
      addFormattedText(doc, recordData.recordDate, 170, 15, { fontSize: 12 });

      doc.line(leftMargin, 20, doc.internal.pageSize.getWidth() - leftMargin, 20);

      let y = 30;
      addFormattedText(doc, 'Personal Information', leftMargin, 25, { fontSize: 14, fontStyle: 'bold' });

      addFormattedText(doc, 'Emp No.', leftMargin, y); addFormattedText(doc, recordData.empNo, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Last Name', leftMargin, y); addFormattedText(doc, recordData.lastName, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Middle Name', leftMargin, y); addFormattedText(doc, recordData.middleName, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'First Name', leftMargin, y); addFormattedText(doc, recordData.firstName, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Birth Date', leftMargin, y); addFormattedText(doc, recordData.birthDate, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Hire Date', leftMargin, y); addFormattedText(doc, recordData.hireDate, leftMargin + 40, y);
      y += lineHeight; addFormattedText(doc, 'Position', leftMargin, y); addFormattedText(doc, recordData.position, leftMargin + 40, y);

      y = 30;
      addFormattedText(doc, 'Civil Status', 120, y); addFormattedText(doc, recordData.civilStatus, 150, y);
      y += lineHeight; addFormattedText(doc, 'Dependents', 120, y); addFormattedText(doc, recordData.dependents.toString(), 150, y);
      y += lineHeight * 2; addFormattedText(doc, 'SSS', 120, y); addFormattedText(doc, recordData.sss, 150, y);
      y += lineHeight; addFormattedText(doc, 'TIN', 120, y); addFormattedText(doc, recordData.tin, 150, y);
      y += lineHeight; addFormattedText(doc, 'Philhealth', 120, y); addFormattedText(doc, recordData.philhealth, 150, y);
      y += lineHeight; addFormattedText(doc, 'HDMF', 120, y); addFormattedText(doc, recordData.hdmf, 150, y);

      addFormattedText(doc, 'This is a computer-generated employee record, no signature required.', doc.internal.pageSize.getWidth() / 2, 270, { fontSize: 10, align: 'center' });

      return doc.output('blob');
    },
    onIframeLoad() {
      console.log('iFrame loaded successfully');
      this.iframeError = false;
    },
    onIframeError() {
      console.error('iFrame failed to load');
      this.iframeError = true;
    },
    showSuccessMessage(message) {
      this.statusMessage = message;
      setTimeout(() => this.statusMessage = '', 3000);
    },
    showErrorMessage(message) {
      this.statusMessage = message;
      setTimeout(() => this.statusMessage = '', 3000);
    },
    formatDate(date) {
      return moment(date).format('MMM DD, YYYY');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined');

table {
  border-collapse: collapse;
  width: 100%;
}

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