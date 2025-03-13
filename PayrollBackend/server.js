const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database');
const corsMiddleware = require('./middleware/cors');
const seedAdminIfNeeded = require('./seeders/adminSeeder');
const seedPositions = require('./seeders/positionSeeder');
const employeeRoutes = require('./routes/employees');
const pendingRequestRoutes = require('./routes/pendingRequests');
const leaveRequestRoutes = require('./routes/leaveRequests');
const payslipRoutes = require('./routes/payslips');
const attendanceRoutes = require('./routes/attendance');
const payheadRoutes = require('./routes/payheads');
const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Headers:`, req.headers);
  next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/pending-requests', pendingRequestRoutes);
app.use('/api/leaves', leaveRequestRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payheads', payheadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server after DB connection
const PORT = process.env.PORT || 7777;

const startServer = async () => {
  try {
    await connectDB(); // Establish persistent connection
    await seedPositions(); // Seed positions without closing connection
    await seedAdminIfNeeded(); // Seed admin without closing connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();