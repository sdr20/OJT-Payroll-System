const mongoose = require('mongoose');

const pendingRequestSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  positionApplied: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 },
  sss: { type: String, default: '' },
  philhealth: { type: String, default: '' },
  pagibig: { type: String, default: '' },
  earnings: {
    travelExpenses: { type: Number, default: 0 },
    otherEarnings: { type: Number, default: 0 }
  },
  status: { type: String, default: 'pending' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

pendingRequestSchema.index({ email: 1 });
pendingRequestSchema.index({ id: 1 });
pendingRequestSchema.index({ username: 1 });

module.exports = mongoose.model('PendingRequest', pendingRequestSchema);