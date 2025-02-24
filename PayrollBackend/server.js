const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const employeeRoutes = require('./routes/employees');
const pendingRequestRoutes = require('./routes/pendingRequests');
const leaveRequestRoutes = require('./routes/leaveRequests');
const payslipRoutes = require('./routes/payslips');
const attendanceRoutes = require('./routes/attendance');
const payheadRoutes = require('./routes/payheads');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/pending-requests', pendingRequestRoutes);
app.use('/api/leaves', leaveRequestRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payheads', payheadRoutes);
app.use('/api/auth', authRoutes);

// Start Server
const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});