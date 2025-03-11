const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: Number, ref: 'Employee', required: true }, // References Employee.id
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  morningTimeIn: { type: String }, // Format: HH:mm (e.g., "08:00")
  morningTimeOut: { type: String }, // Format: HH:mm (e.g., "12:00")
  afternoonTimeIn: { type: String }, // Format: HH:mm (e.g., "13:00")
  afternoonTimeOut: { type: String }, // Format: HH:mm (e.g., "17:00")
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Absent' } // Updated to match frontend
}, {
  indexes: [{ key: { employeeId: 1, date: 1 }, unique: true }] // Ensure one record per employee per date
});

module.exports = mongoose.model('Attendance', attendanceSchema);