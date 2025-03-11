// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\models\Payslip.js
const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employeeId: { type: Number, ref: 'Employee', required: true },
  empNo: { type: String, required: true },
  payslipData: { type: String, required: true }, // Base64 encoded PDF
  salaryMonth: { type: String, required: true }, // e.g., "2025-03"
  paydayType: { type: String, enum: ['mid-month', 'end-of-month'], required: true }, // New field
  generatedAt: { type: Date, default: Date.now }
}, {
  // Ensure uniqueness for employeeId, salaryMonth, and paydayType combination
  indexes: [{ key: { employeeId: 1, salaryMonth: 1, paydayType: 1 }, unique: true }]
});

module.exports = mongoose.model('Payslip', payslipSchema);