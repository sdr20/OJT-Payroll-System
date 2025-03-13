const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database');

// Import middleware
const corsMiddleware = require('./middleware/cors');

// Import seeder
const seedAdminIfNeeded = require('./seeders/adminSeeder');
const seedPositions = require('./seeders/positionSeeder');

// Import routes
const employeeRoutes = require('./routes/employees');
const pendingRequestRoutes = require('./routes/pendingRequests');
const leaveRequestRoutes = require('./routes/leaveRequests');
const payslipRoutes = require('./routes/payslips');
const attendanceRoutes = require('./routes/attendance');
const payheadRoutes = require('./routes/payheads');
const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions');

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Log environment variables
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT || 7777);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

// Connect to DB and seed admin
connectDB().then(() => {
  seedAdminIfNeeded();
  seedPositions();
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/pending-requests', pendingRequestRoutes);
app.use('/api/leaves', leaveRequestRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payheads', payheadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', uptime: process.uptime() });
});

// Default Route (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});