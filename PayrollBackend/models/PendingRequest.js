// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\models\PendingRequest.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pendingRequestSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  empNo: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 },
  hourlyRate: { type: Number, default: 0 },
  sss: { type: String, default: '' },
  philhealth: { type: String, default: '' },
  pagibig: { type: String, default: '' },
  tin: { type: String, default: '' },
  civilStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Hash password before saving
pendingRequestSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.salary && !this.hourlyRate) {
    this.hourlyRate = this.salary / (8 * 22);
  }
  next();
});

pendingRequestSchema.index({ id: 1 });
pendingRequestSchema.index({ empNo: 1 });
pendingRequestSchema.index({ username: 1 });

module.exports = mongoose.model('PendingRequest', pendingRequestSchema);