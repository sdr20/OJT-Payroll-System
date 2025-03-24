const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    employeeId: { type: Number, ref: 'Employee', required: true },
    employeeName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Disapproved'], default: 'Pending' }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);