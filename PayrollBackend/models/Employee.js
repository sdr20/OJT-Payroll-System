// C:\Users\ASUS\Desktop\Payroll_system\PayrollBackend\models\Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 },
  hourlyRate: { type: Number, default: 0 }, // Calculated from salary
  email: { type: String, required: true, unique: true },
  contactInfo: { type: String, required: true },
  sss: { type: String, default: '' },
  philhealth: { type: String, default: '' },
  pagibig: { type: String, default: '' },
  tin: { type: String, default: '' }, // Tax Identification Number
  earnings: {
    travelExpenses: { type: Number, default: 0 },
    otherEarnings: { type: Number, default: 0 }
  },
  payheads: [{
    id: { type: Number, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Earnings', 'Deductions'], required: true }
  }],
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Pre-save hook to calculate hourlyRate
employeeSchema.pre('save', function(next) {
  if (this.salary && !this.hourlyRate) {
    this.hourlyRate = this.salary / (8 * 22); // DOLE: 8-hour workday, 22 days/month
  }
  next();
});

employeeSchema.index({ email: 1 });
employeeSchema.index({ id: 1 });
employeeSchema.index({ username: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
