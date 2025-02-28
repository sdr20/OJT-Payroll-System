// C:\Users\ASUS\Desktop\Payroll_system\PayrollBackend\models\PendingRequest.js
const mongoose = require('mongoose');

const pendingRequestSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Unique request ID
  name: { type: String, required: true }, // Full name of the employee
  positionApplied: { type: String, required: true }, // Position applying for
  email: { type: String, required: true }, // Employee email
  contactNumber: { type: String, required: true }, // Contact number (e.g., 11-digit phone)
  salary: { type: Number, required: true, min: 0 }, // Proposed monthly salary
  hourlyRate: { type: Number, default: 0 }, // Calculated hourly rate (salary / (8 * 22))
  sss: { type: String, default: '' }, // SSS ID
  philhealth: { type: String, default: '' }, // PhilHealth ID
  pagibig: { type: String, default: '' }, // Pag-IBIG ID
  tin: { type: String, default: '' }, // Tax Identification Number (TIN)
  earnings: {
    travelExpenses: { type: Number, default: 0 }, // Additional earnings (DOLE-compliant)
    otherEarnings: { type: Number, default: 0 }   // Additional earnings (DOLE-compliant)
  },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] }, // Request status
  username: { type: String, required: true, unique: true }, // Requested username
  password: { type: String, required: true } // Requested password
}, { timestamps: true });

// Index for efficient querying
pendingRequestSchema.index({ id: 1 });
pendingRequestSchema.index({ username: 1 });

// Pre-save hook to calculate hourlyRate if not provided
pendingRequestSchema.pre('save', function(next) {
  if (this.salary && !this.hourlyRate) {
    this.hourlyRate = this.salary / (8 * 22); // DOLE: 8-hour workday, 22 days/month
  }
  next();
});

module.exports = mongoose.model('PendingRequest', pendingRequestSchema);