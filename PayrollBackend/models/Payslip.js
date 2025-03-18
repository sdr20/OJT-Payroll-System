const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employeeId: { type: Number, required: true },
  empNo: { type: String, required: true },
  payslipData: { type: String, required: true }, // Base64 encoded PDF
  salaryMonth: { type: String, required: true }, // Format: YYYY-MM
  paydayType: { type: String, enum: ['mid-month', 'end-of-month'], required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true }
}, { timestamps: true });

payslipSchema.index({ employeeId: 1, salaryMonth: 1, paydayType: 1 });

module.exports = mongoose.model('Payslip', payslipSchema);