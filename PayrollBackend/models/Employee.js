const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 },
  email: { type: String, required: true, unique: true },
  contactInfo: { type: String, required: true },
  sss: { type: String, default: '' },
  philhealth: { type: String, default: '' },
  pagibig: { type: String, default: '' },
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

employeeSchema.index({ email: 1 });
employeeSchema.index({ id: 1 });
employeeSchema.index({ username: 1 });

module.exports = mongoose.model('Employee', employeeSchema);