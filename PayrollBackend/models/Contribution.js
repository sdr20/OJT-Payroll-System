const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  employeeId: {
    type: Number, // Changed to Number to match Employee.js 'id' field
    required: true,
    ref: 'Employee', // Reference the Employee model
  },
  salaryMonth: {
    type: String, // Format: YYYY-MM (e.g., "2025-03")
    required: true,
  },
  taxes: [
    {
      name: {
        type: String, // e.g., "Pag-IBIG", "SSS", "PhilHealth"
        required: true,
        enum: ['Pag-IBIG', 'SSS', 'PhilHealth'], // Restrict to allowed contribution types
      },
      amount: {
        type: Number,
        required: true,
        min: 0, // Ensure amounts are non-negative
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries on employeeId and salaryMonth
contributionSchema.index({ employeeId: 1, salaryMonth: 1 }, { unique: true }); // Prevent duplicate contributions for the same employee and period

module.exports = mongoose.model('Contribution', contributionSchema);