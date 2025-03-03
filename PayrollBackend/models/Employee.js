// C:\Users\ASUS\Desktop\Payroll_system\PayrollBackend\models\Employee.js
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
  email: { type: String, required: true, unique: true },
  contactInfo: { type: String, required: true },
  hireDate: { type: Date, default: Date.now },
  sss: { type: String, default: '' },
  philhealth: { type: String, default: '' },
  pagibig: { type: String, default: '' },
  tin: { type: String, default: '' },
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
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' } // Added role field
}, { timestamps: true });

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.salary && !this.hourlyRate) {
    this.hourlyRate = this.salary / (8 * 22);
  }
  next();
});

// Method to compare passwords
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

employeeSchema.index({ email: 1 });
employeeSchema.index({ id: 1 });
employeeSchema.index({ empNo: 1 });
employeeSchema.index({ username: 1 });

module.exports = mongoose.model('Employee', employeeSchema);