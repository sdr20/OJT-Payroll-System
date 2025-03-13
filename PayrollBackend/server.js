// C:\Users\Administrator\Desktop\OJT-Payroll-System\PayrollBackend\server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const Employee = require('./models/Employee');

// Import routes
const employeeRoutes = require('./routes/employees');
const pendingRequestRoutes = require('./routes/pendingRequests');
const leaveRequestRoutes = require('./routes/leaveRequests');
const payslipRoutes = require('./routes/payslips');
const attendanceRoutes = require('./routes/attendance');
const payheadRoutes = require('./routes/payheads');
const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions'); // Added position routes

const app = express();

// Middleware
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'user-role', 'authorization'],
  credentials: true
};
app.use(cors(corsOptions));
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

// Connect to MongoDB and seed admin
async function seedAdminIfNeeded() {
  try {
    const existingAdmin = await Employee.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const admin = new Employee({
        id: 1,
        empNo: "ADMIN001",
        firstName: "Admin",
        lastName: "User",
        position: "Manager",
        salary: 50000,
        hourlyRate: 284.0909090909091,
        email: "admin@example.com",
        contactInfo: "09123456789",
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

connectDB().then(() => {
  seedAdminIfNeeded();
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/pending-requests', pendingRequestRoutes);
app.use('/api/leaves', leaveRequestRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payheads', payheadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes); // Added position routes

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