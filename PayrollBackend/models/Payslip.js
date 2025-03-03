const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employeeId: { type: Number, ref: 'Employee', required: true },
  empNo: { type: String, required: true },
  payslipData: { type: String, required: true }, // Base64 encoded PDF
  salaryMonth: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payslip', payslipSchema);