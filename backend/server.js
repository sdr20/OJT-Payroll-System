import cors from 'cors';
import path from 'path';
import express from 'express';
import connectDB from './config/database.js';
import { corsOptions } from './config/cors.js';
import adminRoutes from './routes/admin.routes.js';
import paySlipRoutes from './routes/paySlip.routes.js';
import payHeadRoutes from './routes/payHead.routes.js';
import positionRoutes from './routes/position.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRequestRoutes from './routes/leaveRequest.routes.js';
import positionHistoryRoutes from './routes/positionHistory.routes.js';

const PORT = process.env.PORT || 7777;
const app = express();

connectDB();

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);
app.use('/api/payslips', paySlipRoutes);
app.use('/api/payheads', payHeadRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/leaves', leaveRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/position-history', positionHistoryRoutes);
app.use('/uploads', express.static('public/uploads'));

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});