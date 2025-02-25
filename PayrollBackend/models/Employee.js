// C:\Users\ASUS\Desktop\Payroll_system\PayrollBackend\models\Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Unique employee ID
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 }, // Base salary
  email: { type: String, required: true, unique: true },
  contactInfo: { type: String, required: true },
  // Identification numbers (not financial amounts)
  sss: { type: String, default: '' }, // SSS ID (e.g., "123-45-6789")
  philhealth: { type: String, default: '' }, // PhilHealth ID (e.g., "123456789012")
  pagibig: { type: String, default: '' }, // Pag-IBIG ID (e.g., "123456789012")
  earnings: {
    travelExpenses: { type: Number, default: 0 }, // Additional earnings
    otherEarnings: { type: Number, default: 0 }   // Additional earnings
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

// Indexes for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ id: 1 });
employeeSchema.index({ username: 1 });

module.exports = mongoose.model('Employee', employeeSchema);