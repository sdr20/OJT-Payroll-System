const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  employeeId: { type: Number, ref: 'Employee', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timeIn: { type: String }, // Format: HH:MM:SS (renamed from signInTime)
  timeOut: { type: String }, // Format: HH:MM:SS (renamed from signOutTime)
  status: { type: String, enum: ['On Time', 'Late', 'Absent'], default: 'Absent' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);