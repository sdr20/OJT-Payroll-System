// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\models\Employee.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  empNo: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 },
  hourlyRate: { type: Number, default: 0 },
  email: { type: String, required: true },
  contactInfo: { type: String, required: true },
  sss: { type: String, default: '' },
  philhealth: { type: String, default: '' },
  pagibig: { type: String, default: '' },
  tin: { type: String, default: '' },
  civilStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  earnings: {
    travelExpenses: { type: Number, default: 0 },
    otherEarnings: { type: Number, default: 0 }
  },
  payheads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payhead' }]
}, { timestamps: true });

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.salary && !this.hourlyRate) {
    this.hourlyRate = this.salary / (8 * 22); // DOLE: 8-hour workday, 22 days/month
  }
  next();
});

employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

employeeSchema.index({ id: 1 });
employeeSchema.index({ empNo: 1 });
employeeSchema.index({ username: 1 });

module.exports = mongoose.model('Employee', employeeSchema);