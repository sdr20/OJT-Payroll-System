<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { useAuthStore } from '@/stores/auth.store';

jsPDF.prototype.autoTable = autoTable.default;

export default {
    name: 'SalarySlips',
    data() {
        return {
            employees: [],
            positions: [],
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10,
            payslipGenerationStatus: {},
            isLoading: false,
            isGeneratingAll: false,
            statusMessage: '',
            showHistoryModal: false,
            selectedEmployee: null,
            selectedPayslip: null,
            payslipHistory: [],
            allPayslipHistories: {},
            iframeError: false,
            minimumWage: 610,
            deMinimisLimit: 10000,
            regularHolidays: [
                '01/01/2025', '04/09/2025', '04/17/2025', '04/18/2025', '05/01/2025',
                '06/12/2025', '08/25/2025', '11/30/2025', '12/25/2025', '12/30/2025'
            ],
            specialNonWorkingDays: ['02/08/2025', '04/19/2025', '08/26/2025'],
            showPrintAllModal: false,
            employeesWithPayslips: [],
            selectedEmployeesForPrint: [],
            isPrinting: false,
            selectAll: false
        };
    },
    computed: {
        filteredEmployees() {
            return this.employees.filter((employee) =>
                employee.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        totalPages() {
            return Math.ceil(this.filteredEmployees.length / this.itemsPerPage) || 1;
        },
        paginatedEmployees() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredEmployees.slice(start, end);
        },
        sortedPositionHistory() {
            if (!this.selectedEmployee || !this.selectedEmployee.positionHistory) return [];
            return [...this.selectedEmployee.positionHistory].sort((a, b) =>
                new Date(a.startDate) - new Date(b.startDate)
            );
        }
    },
    async created() {
        const authStore = useAuthStore();
        authStore.restoreSession(); // Ensure session is restored
        if (!authStore.isAuthenticated) {
            this.$router.push('admin/login'); // Redirect if not authenticated
            return;
        }
        await this.fetchPositionsWithRetry();
        await this.fetchEmployees();
    },
    methods: {
        async fetchPositionsWithRetry(retries = 3, delay = 1000) {
            const authStore = useAuthStore();
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await axios.get('http://localhost:7777/api/positions', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authStore.accessToken}`
                        },
                    });
                    this.positions = response.data.map(position => ({
                        name: position.name?.toString() || 'Unknown',
                        salary: Number(position.salary) || 0
                    }));
                    return;
                } catch (error) {
                    console.error(`Attempt ${i + 1} to fetch positions failed:`, error);
                    if (error.response && error.response.status === 401) {
                        this.handleUnauthorized();
                        return;
                    }
                    if (i === retries - 1) {
                        this.showErrorMessage('Failed to load positions after multiple attempts.');
                    } else {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
        },
        getPositionName(position) {
            if (!position || typeof position !== 'string') {
                return 'Unknown Position';
            }
            const trimmedName = position.trim().toLowerCase();
            const positionMatch = this.positions.find(p => p.name.trim().toLowerCase() === trimmedName);
            return positionMatch ? positionMatch.name : position || 'Unknown Position';
        },
        getPositionSalary(positionName) {
            if (!positionName || typeof positionName !== 'string') {
                return 0;
            }
            const trimmedName = positionName.trim().toLowerCase();
            const position = this.positions.find(p => p.name.trim().toLowerCase() === trimmedName);
            return position ? position.salary : 0;
        },
        getHourlyRate(positionName) {
            const salary = this.getPositionSalary(positionName);
            return salary > 0 ? salary / (8 * 22) : 0;
        },
        async fetchEmployees() {
            this.isLoading = true;
            this.statusMessage = '';
            const authStore = useAuthStore();
            try {
                const response = await axios.get('http://localhost:7777/api/employee', {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.accessToken}`
                });
                this.employees = response.data.map((employee) => {
                    const positionData = employee.position && typeof employee.position === 'object'
                        ? employee.position.name
                        : employee.position || 'N/A';

                    return {
                        id: employee._id,
                        empNo: employee.empNo || 'N/A',
                        name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A',
                        lastName: employee.lastName || 'N/A',
                        middleName: employee.middleName || 'N/A',
                        firstName: employee.firstName || 'N/A',
                        birthDate: employee.birthDate || 'N/A',
                        hireDate: employee.hireDate || new Date(),
                        civilStatus: employee.civilStatus || 'SINGLE',
                        dependents: employee.dependents || 0,
                        sss: employee.sss || 'N/A',
                        philhealth: employee.philhealth || 'N/A',
                        pagibig: employee.pagibig || 'N/A',
                        tin: employee.tin || 'N/A',
                        hourlyRate: employee.hourlyRate || 0,
                        salary: employee.salary || 0,
                        position: positionData,
                        email: employee.email || 'N/A',
                        contactInfo: employee.contactInfo || 'N/A',
                        role: employee.role || 'employee',
                        payheads: employee.payheads || [],
                        commission: employee.commission || 0,
                        profitSharing: employee.profitSharing || 0,
                        fees: employee.fees || 0,
                        thirteenthMonthPay: employee.thirteenthMonthPay || 0,
                        hazardPay: employee.hazardPay || 0,
                        overtimeHours: employee.overtimeHours || { regular: 0, holiday: 0 },
                        nightShiftDiff: employee.nightShiftDiff || 0,
                        deMinimis: employee.deMinimis || 0,
                        otherTaxable: employee.otherTaxable || 0,
                        paidLeaves: employee.paidLeaves || { days: 0, amount: 0 },
                        absences: employee.absences || { days: 0, amount: 0 },
                        earnings: employee.earnings || { travelExpenses: 0, otherEarnings: 0 },
                        positionHistory: employee.positionHistory || [{
                            position: positionData,
                            salary: employee.salary || 0,
                            startDate: employee.hireDate || new Date(),
                            endDate: null
                        }]
                    };
                });
                this.showSuccessMessage('Employees loaded successfully!');
            } catch (error) {
                console.error('Error fetching employees:', error);
                this.showErrorMessage(`Failed to load employees: ${error.message}`);
            } finally {
                this.isLoading = false;
            }
        },
        async refreshData() {
            this.isLoading = true;
            try {
                await this.fetchPositionsWithRetry();
                await this.fetchEmployees();
            } catch (error) {
                console.error('Error refreshing data:', error);
                this.showErrorMessage(`Failed to refresh data: ${error.message}`);
            } finally {
                this.isLoading = false;
            }
        },
        async showPayslipHistory(employee) {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) {
                this.handleUnauthorized();
                return;
            }

            if (this.positions.length === 0) {
                await this.fetchPositionsWithRetry();
                if (this.positions.length === 0) {
                    this.showErrorMessage('Positions could not be loaded.');
                }
            }

            this.selectedEmployee = { ...employee };
            this.isLoading = true;

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:7777/api/payslips/${employee.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.accessToken}`
                    },
                });
                const backendPayslips = response.data || [];
                console.log('Fetched payslips:', backendPayslips);

                const payslipHistory = [];
                const today = moment();
                let currentMonth = moment(employee.hireDate).startOf('month');

                while (currentMonth.isSameOrBefore(today, 'month')) {
                    const salaryMonth = currentMonth.format('YYYY-MM');
                    const lastDayOfMonth = currentMonth.clone().endOf('month').date();
                    const midMonthPayDate = moment(`${salaryMonth}-15`, 'YYYY-MM-DD');
                    const endMonthPayDate = moment(`${salaryMonth}-${lastDayOfMonth}`, 'YYYY-MM-DD');
                    const expectedPaydays = this.getExpectedPayday(employee.hireDate, `${salaryMonth}-01`);

                    const historyAtTime = employee.positionHistory.find(h =>
                        moment(h.startDate).isSameOrBefore(salaryMonth, 'month') &&
                        (!h.endDate || moment(h.endDate).isSameOrAfter(salaryMonth, 'month'))
                    ) || { position: employee.position, salary: employee.salary };

                    if (midMonthPayDate.isSameOrAfter(moment(employee.hireDate), 'day') && midMonthPayDate.isSameOrBefore(today, 'day')) {
                        const midMonthPayslip = backendPayslips.find(p => p.salaryMonth === salaryMonth && p.paydayType === 'mid-month');
                        const positionAtTime = midMonthPayslip?.position || historyAtTime.position;
                        const salaryAtTime = midMonthPayslip?.salary || historyAtTime.salary;
                        payslipHistory.push({
                            salaryMonth,
                            paydayType: 'mid-month',
                            position: positionAtTime,
                            salary: salaryAtTime,
                            totalSalary: midMonthPayslip ? this.calculateNetSalary({ ...employee, salary: salaryAtTime, position: positionAtTime, salaryMonth: `${salaryMonth}-15` }) : null,
                            payslipDataUrl: midMonthPayslip ? midMonthPayslip.payslipDataUrl : null,
                            employee: { ...employee, position: positionAtTime, salary: salaryAtTime, salaryMonth: `${salaryMonth}-15` },
                            expectedPaydays,
                        });
                    }

                    if (endMonthPayDate.isSameOrAfter(moment(employee.hireDate), 'day') && endMonthPayDate.isSameOrBefore(today, 'day')) {
                        const endMonthPayslip = backendPayslips.find(p => p.salaryMonth === salaryMonth && p.paydayType === 'end-of-month');
                        const positionAtTime = endMonthPayslip?.position || historyAtTime.position;
                        const salaryAtTime = endMonthPayslip?.salary || historyAtTime.salary;
                        payslipHistory.push({
                            salaryMonth,
                            paydayType: 'end-of-month',
                            position: positionAtTime,
                            salary: salaryAtTime,
                            totalSalary: endMonthPayslip ? this.calculateNetSalary({ ...employee, salary: salaryAtTime, position: positionAtTime, salaryMonth: `${salaryMonth}-${lastDayOfMonth}` }) : null,
                            payslipDataUrl: endMonthPayslip ? endMonthPayslip.payslipDataUrl : null,
                            employee: { ...employee, position: positionAtTime, salary: salaryAtTime, salaryMonth: `${salaryMonth}-${lastDayOfMonth}` },
                            expectedPaydays,
                        });
                    }

                    currentMonth.add(1, 'month');
                }

                this.allPayslipHistories[employee.id] = payslipHistory;
                this.payslipHistory = payslipHistory;
                this.selectedPayslip = payslipHistory[0] || null;
                this.showHistoryModal = true;

                if (backendPayslips.length === 0) {
                    this.showErrorMessage('No payslips found. You can generate new ones.');
                }
            } catch (error) {
                console.error('Error fetching payslips:', error);
                if (error.response && error.response.status === 401) {
                    this.handleUnauthorized();
                } else if (error.response && error.response.status === 404) {
                    this.showErrorMessage('No payslips found for this employee yet.');
                    this.allPayslipHistories[employee.id] = this.payslipHistory;
                    this.showHistoryModal = true;
                } else {
                    this.showErrorMessage(`Failed to fetch payslips: ${error.message}`);
                    this.allPayslipHistories[employee.id] = this.payslipHistory;
                    this.showHistoryModal = true;
                }
            } finally {
                this.isLoading = false;
            }
        },
        canGeneratePayslip(payslip) {
            const today = moment();
            const payDate = moment(payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday, 'D MMMM YYYY');
            const oneDayBefore = payDate.clone().subtract(1, 'day');
            return today.isSameOrAfter(oneDayBefore, 'day') && !payslip.payslipDataUrl;
        },
        handleUnauthorized() {
            const authStore = useAuthStore();
            this.showErrorMessage('Session expired. Please log in again.');
            authStore.logout();
            this.$router.push('/login');
        },
        async generatePayslip(payslip) {
            const authStore = useAuthStore();
            const employee = payslip.employee;
            const key = `${payslip.salaryMonth}-${payslip.paydayType}`;
            this.payslipGenerationStatus[key] = { generating: true };
            try {
                const payslipData = this.createPayslipData(employee);
                const pdfBlob = await this.generatePdf(payslipData);
                const url = URL.createObjectURL(pdfBlob);
                const base64Data = await this.blobToBase64(pdfBlob);

                await axios.post('http://localhost:7777/api/payslips/generate', {
                    employeeId: employee.id,
                    empNo: employee.empNo,
                    payslipData: base64Data,
                    salaryMonth: payslip.salaryMonth,
                    paydayType: payslip.paydayType,
                    position: payslip.position,
                    salary: payslip.salary
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.accessToken}`
                    },
                });

                payslip.payslipDataUrl = url;
                payslip.totalSalary = this.calculateNetSalary(employee);
                this.selectedPayslip = payslip;

                const employeeHistory = this.allPayslipHistories[employee.id] || [];
                const updatedHistory = employeeHistory.map(p =>
                    p.salaryMonth === payslip.salaryMonth && p.paydayType === payslip.paydayType ? payslip : p
                );
                this.allPayslipHistories[employee.id] = updatedHistory;

                this.showSuccessMessage(`Payslip generated for ${employee.name} - ${payslip.paydayType === 'mid-month' ? payslip.expectedPaydays.midMonthPayday : payslip.expectedPaydays.endMonthPayday}!`);
            } catch (error) {
                console.error('Error generating payslip:', error);
                if (error.response && error.response.status === 401) {
                    this.handleUnauthorized();
                } else {
                    this.showErrorMessage(`Failed to generate payslip: ${error.message}`);
                }
            } finally {
                this.payslipGenerationStatus[key] = { generating: false };
            }
        },
        async generateAllPayslips() {
            this.isGeneratingAll = true;
            this.statusMessage = '';
            try {
                for (const employee of this.employees) {
                    if (!this.allPayslipHistories[employee.id]) {
                        await this.showPayslipHistory(employee);
                        this.showHistoryModal = false;
                    }
                }

                const payslipsToGenerate = [];
                for (const employee of this.employees) {
                    const history = this.allPayslipHistories[employee.id] || [];
                    const duePayslips = history.filter(payslip => this.canGeneratePayslip(payslip));
                    payslipsToGenerate.push(...duePayslips);
                }

                if (payslipsToGenerate.length === 0) {
                    this.showErrorMessage('No payslips are due for generation.');
                    return;
                }

                for (const payslip of payslipsToGenerate) {
                    await this.generatePayslip(payslip);
                }

                this.showSuccessMessage(`Generated ${payslipsToGenerate.length} payslips successfully!`);
            } catch (error) {
                console.error('Error generating all payslips:', error);
                this.showErrorMessage(`Failed to generate all payslips: ${error.message}`);
            } finally {
                this.isGeneratingAll = false;
            }
        },
        getLatestPosition(employee) {
            if (!employee.positionHistory || employee.positionHistory.length === 0) {
                return {
                    position: employee.position || 'N/A',
                    salary: employee.salary || 0
                };
            }

            const sortedHistory = [...employee.positionHistory].sort((a, b) => {
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);
                return dateB - dateA;
            });

            const today = new Date();
            const latestPosition = sortedHistory.find(history =>
                !history.endDate || new Date(history.endDate) >= today
            );

            return latestPosition || sortedHistory[0] || {
                position: employee.position || 'N/A',
                salary: employee.salary || 0
            };
        },
        async generatePayslipNow(employee) {
            const authStore = useAuthStore();
            if (!employee || !authStore.isAuthenticated) {
                this.handleUnauthorized();
                return;
            }

            this.payslipGenerationStatus.generating = true;
            try {
                const latestPositionData = this.getLatestPosition(employee);
                const positionAtTime = latestPositionData.position;
                const salaryAtTime = latestPositionData.salary;

                const today = moment();
                const salaryMonth = today.format('YYYY-MM');
                const lastDayOfMonth = today.clone().endOf('month').date();
                const midMonthPayDate = moment(`${salaryMonth}-15`, 'YYYY-MM-DD');
                const expectedPaydays = this.getExpectedPayday(employee.hireDate, `${salaryMonth}-01`);

                const paydayType = today.isBefore(midMonthPayDate.clone().endOf('day')) ? 'mid-month' : 'end-of-month';
                const employeeSalaryMonth = `${salaryMonth}-${paydayType === 'mid-month' ? '15' : lastDayOfMonth}`;

                let payslipData = {
                    salaryMonth: salaryMonth,
                    paydayType: paydayType,
                    position: positionAtTime,
                    salary: salaryAtTime,
                    employee: { ...employee, position: positionAtTime, salary: salaryAtTime, salaryMonth: employeeSalaryMonth },
                    expectedPaydays,
                };

                const pdfPayslipData = this.createPayslipData(payslipData.employee);
                const pdfBlob = await this.generatePdf(pdfPayslipData);
                const url = URL.createObjectURL(pdfBlob);
                const base64Data = await this.blobToBase64(pdfBlob);

                await axios.post('http://localhost:7777/api/payslips/generate', {
                    employeeId: employee.id,
                    empNo: employee.empNo,
                    payslipData: base64Data,
                    salaryMonth: payslipData.salaryMonth,
                    paydayType: payslipData.paydayType,
                    position: payslipData.position,
                    salary: payslipData.salary
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    'Authorization': `Bearer ${authStore.accessToken}`
                });

                payslipData.payslipDataUrl = url;
                payslipData.totalSalary = this.calculateNetSalary(payslipData.employee);
                let employeeHistory = this.allPayslipHistories[employee.id] || [];
                if (!employeeHistory.find(p => p.salaryMonth === payslipData.salaryMonth && p.paydayType === payslipData.paydayType)) {
                    employeeHistory.push(payslipData);
                } else {
                    employeeHistory = employeeHistory.map(p =>
                        p.salaryMonth === payslipData.salaryMonth && p.paydayType === payslipData.paydayType ? payslipData : p
                    );
                }
                this.allPayslipHistories[employee.id] = employeeHistory;
                this.payslipHistory = employeeHistory;
                this.selectedPayslip = payslipData;

                this.showSuccessMessage(`Payslip generated now for ${employee.name} - ${payslipData.paydayType === 'mid-month' ? expectedPaydays.midMonthPayday : expectedPaydays.endMonthPayday}!`);
            } catch (error) {
                console.error('Error generating payslip now:', error);
                if (error.response && error.response.status === 401) {
                    this.handleUnauthorized();
                } else {
                    this.showErrorMessage(`Failed to generate payslip: ${error.message}`);
                }
            } finally {
                this.payslipGenerationStatus.generating = false;
            }
        },
        showPrintModal() {
            this.employeesWithPayslips = [];
            this.selectedEmployeesForPrint = [];
            this.selectAll = false;

            for (const employee of this.employees) {
                const history = this.allPayslipHistories[employee.id] || [];
                const generatedPayslips = history.filter(p => p.payslipDataUrl);

                if (generatedPayslips.length > 0) {
                    const latestPayslip = generatedPayslips.reduce((latest, current) => {
                        const latestDate = moment(`${latest.salaryMonth}-${latest.paydayType === 'mid-month' ? '15' : moment(`${latest.salaryMonth}-01`).endOf('month').date()}`, 'YYYY-MM-DD');
                        const currentDate = moment(`${current.salaryMonth}-${current.paydayType === 'mid-month' ? '15' : moment(`${current.salaryMonth}-01`).endOf('month').date()}`, 'YYYY-MM-DD');
                        return currentDate.isAfter(latestDate) ? current : latest;
                    });
                    const latestDateStr = latestPayslip.paydayType === 'mid-month'
                        ? latestPayslip.expectedPaydays.midMonthPayday
                        : latestPayslip.expectedPaydays.endMonthPayday;

                    this.employeesWithPayslips.push({
                        id: employee.id,
                        name: employee.name,
                        latestPayslipDate: latestDateStr,
                        latestPayslip: latestPayslip,
                    });
                }
            }

            if (this.employeesWithPayslips.length === 0) {
                this.showErrorMessage('No employees with generated payslips in history.');
            } else {
                this.showPrintAllModal = true;
            }
        },
        toggleSelectAll() {
            if (this.selectAll) {
                this.selectedEmployeesForPrint = this.employeesWithPayslips.map(emp => emp.id);
            } else {
                this.selectedEmployeesForPrint = [];
            }
        },
        async printSelectedPayslips() {
            if (this.selectedEmployeesForPrint.length === 0) return;

            this.isPrinting = true;
            try {
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [216, 279]
                });

                for (let i = 0; i < this.selectedEmployeesForPrint.length; i++) {
                    const empId = this.selectedEmployeesForPrint[i];
                    const empData = this.employeesWithPayslips.find(e => e.id === empId);
                    const employee = this.employees.find(e => e.id === empId);
                    const payslip = empData.latestPayslip;

                    const payslipData = this.createPayslipData({ ...employee, salaryMonth: payslip.salaryMonth, salary: payslip.salary, position: payslip.position });
                    await this.generatePdf(payslipData, doc);

                    if (i < this.selectedEmployeesForPrint.length - 1) {
                        doc.addPage();
                    }
                }

                doc.autoPrint();
                window.open(doc.output('bloburl'), '_blank');
                this.showSuccessMessage('Payslips printed successfully!');
                this.showPrintAllModal = false;
            } catch (error) {
                console.error('Error printing payslips:', error);
                this.showErrorMessage(`Failed to print payslips: ${error.message}`);
            } finally {
                this.isPrinting = false;
            }
        },
        selectPayslip(payslip) {
            this.selectedPayslip = payslip.payslipDataUrl ? payslip : null;
            this.iframeError = false;
        },
        async downloadPayslip() {
            if (!this.selectedPayslip || !this.selectedPayslip.payslipDataUrl) return;
            const response = await fetch(this.selectedPayslip.payslipDataUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Payslip_${this.selectedEmployee.name}_${this.selectedPayslip.paydayType === 'mid-month' ? this.selectedPayslip.expectedPaydays.midMonthPayday : this.selectedPayslip.expectedPaydays.endMonthPayday}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
        getPayslipsForPosition(position, startDate, endDate) {
            return this.payslipHistory.filter(payslip => {
                const payslipDate = moment(payslip.salaryMonth, 'YYYY-MM');
                const start = moment(startDate);
                const end = endDate ? moment(endDate) : moment();
                return payslip.position === position &&
                    payslipDate.isSameOrAfter(start, 'month') &&
                    payslipDate.isSameOrBefore(end, 'month');
            });
        },
        formatDate(date) {
            return moment(date).format('D MMMM YYYY');
        },
        calculateTotalEarnings(employee) {
            const baseEarnings = (employee.earnings ? employee.earnings.travelExpenses : 0) + (employee.earnings ? employee.earnings.otherEarnings : 0);
            const monthlySalary = employee.salary || 0;
            const holidayPay = this.calculateHolidayPay(employee) || 0;
            const overtimePay = this.calculateOvertimePay(employee) || 0;
            const payheadEarnings = this.calculatePayheadEarnings(employee.payheads) || 0;
            const taxableSupplementary = this.calculateSupplementaryIncome(employee) ? this.calculateSupplementaryIncome(employee).taxable : 0;
            return monthlySalary + baseEarnings + holidayPay + overtimePay + payheadEarnings + taxableSupplementary || 0;
        },
        calculatePayheadEarnings(payheads) {
            return payheads
                .filter(p => p.type === 'Earnings')
                .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
        },
        calculatePayheadDeductions(payheads) {
            return payheads
                .filter(p => p.type === 'Deductions')
                .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
        },
        calculateSupplementaryIncome(employee) {
            const commission = employee.commission || 0;
            const profitSharing = employee.profitSharing || 0;
            const fees = employee.fees || 0;
            const thirteenthMonthPay = employee.thirteenthMonthPay || 0;
            const hazardPay = employee.hazardPay || 0;
            const overtimePay = this.calculateOvertimePay(employee) || 0;
            const otherTaxable = employee.otherTaxable || 0;

            const totalSupplementary = commission + profitSharing + fees + thirteenthMonthPay + hazardPay + overtimePay + otherTaxable;
            const exemptThirteenthMonth = Math.min(thirteenthMonthPay, 90000) || 0;
            const taxableThirteenthMonth = Math.max(0, thirteenthMonthPay - 90000) || 0;

            const taxableSupplementaryIncome = commission + profitSharing + fees + taxableThirteenthMonth + hazardPay + overtimePay + otherTaxable;

            return {
                taxable: taxableSupplementaryIncome || 0,
                nonTaxable: exemptThirteenthMonth || 0,
                totalSupplementary: totalSupplementary || 0
            };
        },
        calculateNonTaxableIncome(employee) {
            const isMWE = (employee.salary / 30) <= this.minimumWage;
            const basicSalaryMWE = isMWE ? employee.salary : 0;
            const holidayPayMWE = isMWE ? this.calculateHolidayPay(employee) : 0;
            const overtimePayMWE = isMWE ? this.calculateOvertimePay(employee) : 0;
            const nightShiftDiffMWE = isMWE ? (employee.nightShiftDiff || 0) : 0;
            const hazardPayMWE = isMWE ? (employee.hazardPay || 0) : 0;
            const thirteenthMonthExempt = Math.min(employee.thirteenthMonthPay || 0, 90000) || 0;
            const deMinimis = Math.min(employee.deMinimis || 0, this.deMinimisLimit) || 0;
            const sssContribution = this.calculateSSSContribution(employee.salary) || 0;
            const philhealthContribution = this.calculatePhilHealthContribution(employee.salary) || 0;
            const pagibigContribution = this.calculatePagIBIGContribution(employee.salary) || 0;

            return {
                totalNonTaxable: basicSalaryMWE + holidayPayMWE + overtimePayMWE + nightShiftDiffMWE + hazardPayMWE + thirteenthMonthExempt + deMinimis + sssContribution + philhealthContribution + pagibigContribution || 0
            };
        },
        calculateTotalDeductions(employee) {
            const sssContribution = this.calculateSSSContribution(employee.salary) || 0;
            const philhealthContribution = this.calculatePhilHealthContribution(employee.salary) || 0;
            const pagibigContribution = this.calculatePagIBIGContribution(employee.salary) || 0;
            const withholdingTax = this.calculateWithholdingTax(employee) || 0;
            const payheadDeductions = this.calculatePayheadDeductions(employee.payheads) || 0;

            return sssContribution + philhealthContribution + pagibigContribution + withholdingTax + payheadDeductions || 0;
        },
        calculateNetSalary(employee) {
            const totalEarnings = this.calculateTotalEarnings(employee) || 0;
            const totalDeductions = this.calculateTotalDeductions(employee) || 0;
            return totalEarnings - totalDeductions || 0;
        },
        calculateHolidayPay(employee) {
            const dailyRate = (employee.salary / 30) || 0;
            const salaryMonth = employee.salaryMonth
                ? employee.salaryMonth.split('-')[0] + '-' + employee.salaryMonth.split('-')[1]
                : moment().format('YYYY-MM');
            const regularHolidays = this.regularHolidays || [];
            const specialNonWorkingDays = this.specialNonWorkingDays || [];
            const isRegularHoliday = regularHolidays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('YYYY-MM') === salaryMonth);
            const isSpecialHoliday = specialNonWorkingDays.some(holiday => moment(holiday, 'MM/DD/YYYY').format('YYYY-MM') === salaryMonth);
            if (isRegularHoliday) return dailyRate * 2 || 0;
            if (isSpecialHoliday) return dailyRate * 1.3 || 0;
            return 0;
        },
        calculateOvertimePay(employee) {
            const hourlyRate = employee.salary / (8 * 22) || 0;
            const regularOTHours = employee.overtimeHours ? employee.overtimeHours.regular : 0;
            const holidayOTHours = employee.overtimeHours ? employee.overtimeHours.holiday : 0;
            const regularOTPay = regularOTHours * hourlyRate * 1.25 || 0;
            const holidayOTPay = holidayOTHours * hourlyRate * 1.3 || 0;
            return regularOTPay + holidayOTPay || 0;
        },
        calculateSSSContribution(salary) {
            const monthlySalaryCredit = Math.min(Math.max(salary || 0, 5000), 35000) || 0;
            const employeeShareRate = 0.045;
            return Math.round(monthlySalaryCredit * employeeShareRate) || 0;
        },
        calculatePhilHealthContribution(salary) {
            const rate = 0.05;
            const monthlySalary = Math.min(salary || 0, 100000) || 0;
            return Math.round((monthlySalary * rate) / 2) || 0;
        },
        calculatePagIBIGContribution(salary) {
            const rate = 0.02;
            const cappedSalary = Math.min(salary || 0, 10000) || 0;
            return Math.round(cappedSalary * rate) || 0;
        },
        calculateWithholdingTax(employee) {
            const nonTaxable = this.calculateNonTaxableIncome(employee).totalNonTaxable || 0;
            const taxableIncome = (this.calculateTotalEarnings(employee) || 0) - nonTaxable || 0;
            if (taxableIncome <= 20833) return 0;
            if (taxableIncome <= 33333) return Math.round((taxableIncome - 20833) * 0.15) || 0;
            if (taxableIncome <= 66667) return Math.round(1875 + (taxableIncome - 33333) * 0.20) || 0;
            if (taxableIncome <= 166667) return Math.round(13541.80 + (taxableIncome - 66667) * 0.25) || 0;
            if (taxableIncome <= 666667) return Math.round(90841.80 + (taxableIncome - 166667) * 0.30) || 0;
            return Math.round(408841.80 + (taxableIncome - 666667) * 0.35) || 0;
        },
        getExpectedPayday(hireDate, salaryMonth) {
            const [year, month] = salaryMonth.split('-');
            const lastDay = new Date(year, month, 0).getDate();
            let payday1 = new Date(year, month - 1, 15);
            let payday2 = new Date(year, month - 1, lastDay);

            const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
            while (isWeekend(payday1)) payday1.setDate(payday1.getDate() + 1);
            while (isWeekend(payday2)) payday2.setDate(payday2.getDate() - 1);

            return {
                midMonthPayday: payday1.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
                endMonthPayday: payday2.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
            };
        },
        createPayslipData(employee) {
            const salaryMonth = employee.salaryMonth.split('-').slice(0, 2).join('-'); // e.g., "2025-03"
            const paydayType = employee.salaryMonth.includes('15') ? 'mid-month' : 'end-of-month'; // Infer from salaryMonth
            const monthlySalary = employee.salary || 0;
            const basicSalary = monthlySalary / 2; // 15-day period (half of monthly salary)
            const paydays = this.getExpectedPayday(employee.hireDate, salaryMonth);
            const salaryDate = paydayType === 'mid-month'
                ? paydays.midMonthPayday
                : paydays.endMonthPayday;

            // Adjust deductions for 15-day period
            const sss = this.calculateSSSContribution(basicSalary) || 0;
            const philhealth = this.calculatePhilHealthContribution(basicSalary) || 0;
            const pagibig = this.calculatePagIBIGContribution(basicSalary) || 0;
            const withholdingTax = this.calculateWithholdingTax({ ...employee, salary: basicSalary }) || 0;
            const totalDeductions = sss + philhealth + pagibig + withholdingTax || 0;
            const netSalary = this.calculateNetSalary({ ...employee, salary: basicSalary }) || 0;

            const paidLeavesDays = employee.paidLeaves ? employee.paidLeaves.days : 0;
            const absencesDays = employee.absences ? employee.absences.days : 0;
            const paidLeavesAmount = employee.paidLeaves ? employee.paidLeaves.amount / 2 : 0; // Adjust for 15 days
            const absencesAmount = employee.absences ? -(employee.absences.amount / 2) : 0; // Adjust for 15 days

            return {
                salaryDate: moment(payslipData.salaryDate, 'D MMMM YYYY', true).format('MM/DD/YYYY'),
                empNo: employee.empNo || 'N/A',
                lastName: employee.lastName || 'N/A',
                middleName: employee.middleName || 'N/A',
                firstName: employee.firstName || 'N/A',
                birthDate: moment(employee.birthDate, 'YYYY-MM-DD', true).isValid() ? moment(employee.birthDate).format('MM/DD/YYYY') : 'N/A',
                hireDate: moment(employee.hireDate, 'YYYY-MM-DD', true).isValid() ? moment(employee.hireDate).format('MM/DD/YYYY') : 'N/A',
                civilStatus: employee.civilStatus || 'SINGLE',
                dependents: employee.dependents || 0,
                sss: employee.sss || 'N/A',
                tin: employee.tin || 'N/A',
                philhealth: employee.philhealth || 'N/A',
                pagibig: employee.pagibig || 'N/A',
                position: employee.position || 'N/A',
                basicSalary: this.formatNumber(basicSalary),
                totalDeductions: this.formatNumber(totalDeductions),
                netSalary: this.formatNumber(netSalary),
                sssDeduction: this.formatNumber(sss),
                philhealthDeduction: this.formatNumber(philhealth),
                pagibigDeduction: this.formatNumber(pagibig),
                paidLeavesDays: paidLeavesDays,
                absencesDays: absencesDays,
                paidLeavesAmount: this.formatNumber(paidLeavesAmount),
                absencesAmount: this.formatNumber(absencesAmount),
                withholdingTax: this.formatNumber(withholdingTax),
                payheads: employee.payheads || [],
                expectedPaydays: paydays
            };
        },
        formatNumber(value) {
            const num = Number(value) || 0;
            return num.toFixed(2);
        },
        async generatePdf(payslipData, doc) {
            const pdfDoc = doc || new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [216, 279]
            });

            pdfDoc.setFont('Helvetica');

            const margin = 10;
            const pageWidth = pdfDoc.internal.pageSize.getWidth();
            const contentWidth = pageWidth - 2 * margin;
            const columnWidth = (contentWidth - 20) / 2;
            const lineHeight = 5;
            const pageHeight = pdfDoc.internal.pageSize.getHeight();

            function addText(doc, text, x, y, options) {
                options = options || {};
                text = String(text || 'N/A').replace('₱', 'P'); // Ensure text is a string
                doc.setFontSize(options.fontSize || 10);
                doc.setFont(options.font || 'Helvetica', options.fontStyle || 'normal');
                doc.setTextColor(
                    options.textColor ? options.textColor[0] : 0,
                    options.textColor ? options.textColor[1] : 0,
                    options.textColor ? options.textColor[2] : 0
                );
                doc.text(text, x, y, { align: options.align || 'left', maxWidth: options.maxWidth });
            }

            function addLabelValue(doc, label, value, x, y) {
                addText(doc, label, x, y, { fontSize: 9, fontStyle: 'bold' });
                addText(doc, value, x + 35, y, { fontSize: 9, maxWidth: columnWidth - 35 });
            }

            pdfDoc.setFillColor(0, 128, 0);
            pdfDoc.rect(margin, margin, contentWidth, 10, 'F');
            addText(pdfDoc, 'RIGHTJOB Solutions', margin + 5, margin + 7, { fontSize: 12, fontStyle: 'bold', textColor: [255, 255, 255] });
            addText(pdfDoc, 'PAYSLIP', margin + contentWidth / 2, margin + 7, { fontSize: 12, fontStyle: 'bold', textColor: [255, 255, 255], align: 'center' });

            let y = margin + 15;
            addText(pdfDoc, 'Salary Date:', margin + contentWidth - 40, y, { fontSize: 9 });
            addText(pdfDoc, payslipData.salaryDate, margin + contentWidth - 20, y, { fontSize: 9 });

            y += 10;

            addText(pdfDoc, 'Personal Information', margin, y, { fontSize: 11, fontStyle: 'bold' });
            y += lineHeight;
            const leftPersonalInfo = [
                ['Emp No.', payslipData.empNo],
                ['Last Name', payslipData.lastName],
                ['Middle Name', payslipData.middleName],
                ['First Name', payslipData.firstName],
                ['Birth Date', payslipData.birthDate],
                ['Hire Date', payslipData.hireDate],
                ['Position', payslipData.position],
                ['Basic Salary', `P${payslipData.basicSalary}`]
            ];
            leftPersonalInfo.forEach(([label, value], index) => {
                addLabelValue(pdfDoc, label, value, margin, y + index * lineHeight);
            });

            let yRight = y;
            addText(pdfDoc, 'Additional Info', margin + columnWidth + 10, yRight, { fontSize: 11, fontStyle: 'bold' });
            yRight += lineHeight;
            const rightPersonalInfo = [
                ['Civil Status', payslipData.civilStatus],
                ['Dependents', payslipData.dependents.toString()],
                ['SSS', payslipData.sss],
                ['TIN', payslipData.tin],
                ['Philhealth', payslipData.philhealth],
                ['PAG-IBIG', payslipData.pagibig]
            ];
            rightPersonalInfo.forEach(([label, value], index) => {
                addLabelValue(pdfDoc, label, value, margin + columnWidth + 10, yRight + index * lineHeight);
            });

            y = Math.max(y + leftPersonalInfo.length * lineHeight, yRight + rightPersonalInfo.length * lineHeight) + 10;

            addText(pdfDoc, 'Expected Paydays', margin, y, { fontSize: 11, fontStyle: 'bold' });
            addText(pdfDoc, 'Mid-Month:', margin, y + lineHeight);
            addText(pdfDoc, payslipData.expectedPaydays.midMonthPayday, margin + 35, y + lineHeight, { maxWidth: columnWidth - 35 });
            addText(pdfDoc, 'End-of-Month:', margin + columnWidth + 10, y + lineHeight);
            addText(pdfDoc, payslipData.expectedPaydays.endMonthPayday, margin + columnWidth + 45, y + lineHeight, { maxWidth: columnWidth - 35 });
            y += 2 * lineHeight + 10;

            addText(pdfDoc, 'Deductions', margin, y, { fontSize: 11, fontStyle: 'bold' });
            y += lineHeight;
            const leftDeductions = [
                ['SSS', `P${payslipData.sssDeduction}`],
                ['Philhealth', `P${payslipData.philhealthDeduction}`],
                ['PAG-IBIG', `P${payslipData.pagibigDeduction}`]
            ];
            leftDeductions.forEach(([label, value], index) => {
                addLabelValue(pdfDoc, label, value, margin, y + index * lineHeight);
            });

            const rightDeductions = [
                ['Withholding Tax', `P${payslipData.withholdingTax}`]
            ];
            rightDeductions.forEach(([label, value], index) => {
                addLabelValue(pdfDoc, label, value, margin + columnWidth + 10, y + index * lineHeight);
            });
            y += Math.max(leftDeductions.length, rightDeductions.length) * lineHeight + 10;

            addText(pdfDoc, 'Summary', margin, y, { fontSize: 11, fontStyle: 'bold' });
            y += lineHeight;
            addText(pdfDoc, 'Total Deductions:', margin, y, { fontSize: 9, fontStyle: 'bold' });
            addText(pdfDoc, `(P${payslipData.totalDeductions})`, margin + 35, y, { fontSize: 9 });
            addText(pdfDoc, 'Net Salary:', margin + columnWidth + 10, y, { fontSize: 9, fontStyle: 'bold' });
            addText(pdfDoc, `P${payslipData.netSalary}`, margin + columnWidth + 45, y, { fontSize: 9 });

            const footerY = pageHeight - margin - 5;
            addText(pdfDoc, 'This is a computer-generated payslip; no signature required.', margin + contentWidth / 2, footerY, { fontSize: 8, align: 'center' });

            if (!doc) {
                return pdfDoc.output('blob');
            }
        },
        blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        onIframeLoad() {
            this.iframeError = false;
        },
        onIframeError() {
            this.iframeError = true;
        },
        showSuccessMessage(message) {
            this.statusMessage = message;
            setTimeout(() => { this.statusMessage = ''; }, 3000);
        },
        showErrorMessage(message) {
            this.statusMessage = message;
            setTimeout(() => { this.statusMessage = ''; }, 5000);
        }
    }
};
</script>

<template>
    <div class="min-h-screen p-1">
        <div class="max-w-8xl mx-auto">
            <!-- Header Section (Unchanged) -->
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="relative">
                        <span class="material-icons absolute left-2 top-2 text-gray-400 text-sm">search</span>
                        <input v-model="searchQuery" type="text" placeholder="Search employee by name..."
                            class="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
                    </div>
                    <button @click="refreshData"
                        class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading">
                        <span class="material-icons text-sm">{{ isLoading ? 'sync' : 'refresh' }}</span>
                        {{ isLoading ? 'Refreshing...' : 'Refresh Data' }}
                    </button>
                    <button @click="generateAllPayslips"
                        class="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading || isGeneratingAll">
                        <span class="material-icons text-sm">{{ isGeneratingAll ? 'sync' : 'description' }}</span>
                        {{ isGeneratingAll ? 'Generating...' : 'Generate All' }}
                    </button>
                    <button @click="showPrintModal"
                        class="flex items-center justify-center gap-1 bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded-md"
                        :disabled="isLoading">
                        <span class="material-icons text-sm">print</span>
                        Print All
                    </button>
                </div>
            </div>

            <!-- Employee List (Unchanged) -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 mb-4">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                    <div class="flex items-center gap-1">
                                        <span class="material-icons text-gray-400 text-sm">person</span>
                                        Name
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                    <div class="flex items-center gap-1">
                                        <span class="material-icons text-gray-400 text-sm">badge</span>
                                        Employee ID
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                    <div class="flex items-center gap-1">
                                        <span class="material-icons text-gray-400 text-sm">work</span>
                                        Position
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                    <div class="flex items-center gap-1">
                                        <span class="material-icons text-gray-400 text-sm">payments</span>
                                        Hourly Rate
                                    </div>
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                    <div class="flex items-center gap-1">
                                        <span class="material-icons text-gray-400 text-sm">account_balance_wallet</span>
                                        Basic Salary
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="employee in paginatedEmployees" :key="employee.id"
                                class="hover:bg-blue-50 transition-colors cursor-pointer"
                                @click="showPayslipHistory(employee)">
                                <td class="px-4 py-3 text-sm text-gray-900">{{ employee.name }}</td>
                                <td class="px-4 py-3 text-sm text-gray-500">{{ employee.empNo }}</td>
                                <td class="px-4 py-3 text-sm text-gray-500">
                                    {{ getPositionName(employee.position) }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900">
                                    ₱{{ getHourlyRate(employee.position).toLocaleString() }}
                                </td>
                                <td class="px-4 py-3 text-sm text-blue-600">
                                    ₱{{ getPositionSalary(employee.position).toLocaleString() }}
                                </td>
                            </tr>
                            <tr v-if="paginatedEmployees.length === 0 && !isLoading">
                                <td colspan="5" class="px-4 py-8 text-center">
                                    <div class="flex flex-col items-center gap-2">
                                        <span class="material-icons text-gray-400 text-3xl">search_off</span>
                                        <p class="text-sm text-gray-500">No employees found.</p>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="isLoading">
                                <td colspan="5" class="px-4 py-8 text-center">
                                    <div class="flex flex-col items-center gap-2">
                                        <span class="material-icons text-blue-500 animate-spin text-3xl">sync</span>
                                        <p class="text-sm text-gray-500">Loading employees...</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex items-center justify-between px-4 py-3 bg-gray-50">
                    <div class="text-xs text-gray-700">
                        Showing page {{ currentPage }} of {{ totalPages }}
                    </div>
                    <div class="flex gap-2">
                        <button @click="prevPage" :disabled="currentPage === 1 || isLoading"
                            class="inline-flex items-center px-3 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                            <span class="material-icons text-sm mr-1">chevron_left</span>
                            Previous
                        </button>
                        <button @click="nextPage" :disabled="currentPage === totalPages || isLoading"
                            class="inline-flex items-center px-3 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                            Next
                            <span class="material-icons text-sm ml-1">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Updated Payslip History Modal -->
            <div v-if="showHistoryModal"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
                            <span class="material-icons text-sm">history</span>
                            Payslip History - {{ selectedEmployee?.name }}
                        </h2>
                        <div class="flex items-center gap-2">
                            <button @click.stop="generatePayslipNow(selectedEmployee)"
                                class="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-4 rounded-md"
                                :disabled="isLoading || payslipGenerationStatus.generating">
                                <span class="material-icons text-sm">play_arrow</span>
                                {{ payslipGenerationStatus.generating ? 'Generating...' : 'Generate Now' }}
                            </button>
                            <button @click="showHistoryModal = false" class="p-1 hover:bg-gray-100 rounded-full">
                                <span class="material-icons text-sm">close</span>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-1 overflow-hidden">
                        <div class="w-1/2 p-4 overflow-y-auto border-r">
                            <!-- Payslip List by Position History -->
                            <div v-for="(history, index) in sortedPositionHistory" :key="`history-${index}`"
                                class="mb-6">
                                <h3 class="text-sm font-medium text-gray-700 mb-2">
                                    Payslips for {{ getPositionName(history.position) }}
                                    (Salary: ₱{{ history.salary.toLocaleString() }},
                                    {{ formatDate(history.startDate) }} -
                                    {{ history.endDate ? formatDate(history.endDate) : 'Present' }})
                                </h3>
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Pay Date
                                            </th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr v-for="payslip in getPayslipsForPosition(history.position, history.startDate, history.endDate)"
                                            :key="`${payslip.salaryMonth}-${payslip.paydayType}`"
                                            class="hover:bg-blue-50 cursor-pointer"
                                            :class="{ 'bg-blue-100': selectedPayslip?.salaryMonth === payslip.salaryMonth && selectedPayslip?.paydayType === payslip.paydayType }"
                                            @click="selectPayslip(payslip)">
                                            <td class="px-4 py-2 text-sm text-gray-900">
                                                {{ payslip.paydayType === 'mid-month' ?
                                                    payslip.expectedPaydays.midMonthPayday :
                                                payslip.expectedPaydays.endMonthPayday }}
                                            </td>
                                            <td class="px-4 py-2">
                                                <button @click.stop="generatePayslip(payslip)"
                                                    class="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                                    :disabled="!canGeneratePayslip(payslip) || payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating">
                                                    <span class="material-icons text-sm">description</span>
                                                    {{
                                                        payslipGenerationStatus[`${payslip.salaryMonth}-${payslip.paydayType}`]?.generating
                                                    ? 'Generating...' : 'Generate' }}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr
                                            v-if="getPayslipsForPosition(history.position, history.startDate, history.endDate).length === 0">
                                            <td colspan="2" class="px-4 py-4 text-center text-sm text-gray-500">No
                                                payslips available for this position.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="w-1/2 p-4 overflow-y-auto">
                            <h3 class="text-sm font-medium text-gray-700 mb-2">Payslip Preview</h3>
                            <div v-if="selectedPayslip && selectedPayslip.payslipDataUrl" class="flex flex-col h-full">
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600">
                                        Position: {{ getPositionName(selectedPayslip.position) }} |
                                        Salary: ₱{{ selectedPayslip.salary.toLocaleString() }}
                                    </p>
                                </div>
                                <iframe :src="selectedPayslip.payslipDataUrl"
                                    class="w-full h-[50vh] rounded border mb-4" @load="onIframeLoad"
                                    @error="onIframeError"></iframe>
                                <button @click="downloadPayslip"
                                    class="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md">
                                    <span class="material-icons text-sm">download</span>
                                    Download PDF
                                </button>
                                <div v-if="iframeError"
                                    class="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm flex items-center gap-1">
                                    <span class="material-icons text-sm">error</span>
                                    Error loading payslip. Please try again.
                                </div>
                            </div>
                            <div v-else class="text-sm text-gray-500 text-center mt-4">
                                Select a payslip from the list to preview.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Print All Modal (Unchanged) -->
            <div v-if="showPrintAllModal"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h2 class="text-base font-medium text-gray-800 flex items-center gap-1">
                            <span class="material-icons text-sm">print</span>
                            Print Payslips
                        </h2>
                        <button @click="showPrintAllModal = false" class="p-1 hover:bg-gray-100 rounded-full">
                            <span class="material-icons text-sm">close</span>
                        </button>
                    </div>
                    <div class="p-4 overflow-y-auto">
                        <h3 class="text-sm font-medium text-gray-700 mb-2">Select Employees to Print</h3>
                        <div v-if="employeesWithPayslips.length > 0" class="mb-4">
                            <label class="flex items-center">
                                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                                    class="large-checkbox mr-2" />
                                <span class="text-sm text-gray-900 font-medium">Select All</span>
                            </label>
                        </div>
                        <div v-if="employeesWithPayslips.length > 0">
                            <div v-for="emp in employeesWithPayslips" :key="emp.id"
                                class="flex items-center py-2 border-b">
                                <input type="checkbox" v-model="selectedEmployeesForPrint" :value="emp.id"
                                    class="large-checkbox mr-2" />
                                <span class="text-sm text-gray-900">{{ emp.name }} - Most Recent: {{
                                    emp.latestPayslipDate }}</span>
                            </div>
                        </div>
                        <div v-else class="text-sm text-gray-500 text-center py-4">
                            No employees with generated payslips found in history.
                        </div>
                    </div>
                    <div class="p-4 border-t flex justify-end gap-2">
                        <button @click="showPrintAllModal = false"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                            Cancel
                        </button>
                        <button @click="printSelectedPayslips"
                            class="flex items-center gap-1 px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
                            :disabled="selectedEmployeesForPrint.length === 0 || isPrinting">
                            <span class="material-icons text-sm">print</span>
                            {{ isPrinting ? 'Printing...' : 'Print Selected' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Toast Messages (Unchanged) -->
            <div v-if="statusMessage" :class="[
                statusMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
                'fixed bottom-4 right-4 p-3 rounded shadow-lg z-50 flex items-center gap-1 animate-fade-in text-sm'
            ]">
                <span class="material-icons text-sm">
                    {{ statusMessage.includes('successfully') ? 'check_circle' : 'error' }}
                </span>
                {{ statusMessage }}
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined');

button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.transition-colors {
    transition: background-color 0.2s ease-in-out;
}

.hover\:bg-blue-50:hover {
    background-color: #eff6ff;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(1rem);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.large-checkbox {
    width: 1.25rem;
    height: 1.25rem;
}
</style>