const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employeeId: { type: Number, ref: 'Employee', required: true },
  empNo: { type: String, required: true },
  payslipData: { type: String, required: true },
  salaryMonth: { type: String, required: true },
  paydayType: { type: String, enum: ['mid-month', 'end-of-month'], required: true },
  position: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
}, {
  indexes: [{ key: { employeeId: 1, salaryMonth: 1, paydayType: 1 }, unique: true }]
});

module.exports = mongoose.model('Payslip', payslipSchema);