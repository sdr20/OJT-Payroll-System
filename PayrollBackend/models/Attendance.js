const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: Number, required: true },
  date: { type: String, required: true },
  morningTimeIn: { type: String, default: null },
  morningTimeOut: { type: String, default: null },
  afternoonTimeIn: { type: String, default: null },
  afternoonTimeOut: { type: String, default: null },
  status: { type: String, enum: ['Present', 'Half Day', 'Absent', 'Late'], default: 'Absent' }
}, {
  indexes: [{ key: { employeeId: 1, date: 1 }, unique: true }]
});

attendanceSchema.post('index', function() {
  console.log('Indexes defined after model load:', this.indexes());
});

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);