import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; // Import mongoose for isValidObjectId
import { Attendance } from '../../models/attendance.model.js';
import { Employee } from '../../models/employee.model.js';

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc Get total late employees for a specific date
 * @route GET /api/attendance/late
 */
export const getLateEmployeesCount = asyncHandler(async (req, res) => {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'Invalid or missing date parameter (YYYY-MM-DD required)' });
    }

    const OFFICE_START = "08:00:00";
    const lateRecords = await Attendance.find({
        date,
        morningTimeIn: { $gt: OFFICE_START } // Employees who signed in after 8:00 AM
    }).countDocuments();

    res.status(200).json({ total: lateRecords });
});

/**
 * @desc Update attendance record
 * @route PUT /api/attendance/:id
 */
export const updateAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { morningTimeIn, morningTimeOut, afternoonTimeIn, afternoonTimeOut, status } = req.body;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid attendance ID' });
    }

    console.log('Received payload:', req.body);

    const attendance = await Attendance.findById(id);
    if (!attendanceच्च

) {
        return res.status(404).json({ message: 'Attendance record not found' });
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

    if (morningTimeIn !== undefined) {
        if (morningTimeIn !== null && !timeRegex.test(morningTimeIn)) {
            console.log('Validation failed for morningTimeIn:', morningTimeIn);
            return res.status(400).json({ message: 'Invalid morningTimeIn format (HH:mm:ss)' });
        }
        attendance.morningTimeIn = morningTimeIn;
        if (morningTimeIn) {
            const OFFICE_START = "08:00:00";
            attendance.status = morningTimeIn <= OFFICE_START ? 'Present' : 'Late';
        }
    }

    if (morningTimeOut !== undefined) {
        if (morningTimeOut !== null && !timeRegex.test(morningTimeOut)) {
            console.log('Validation failed for morningTimeOut:', morningTimeOut);
            return res.status(400).json({ message: 'Invalid morningTimeOut format (HH:mm:ss)' });
        }
        attendance.morningTimeOut = morningTimeOut;
    }

    if (afternoonTimeIn !== undefined) {
        if (afternoonTimeIn !== null && !timeRegex.test(afternoonTimeIn)) {
            console.log('Validation failed for afternoonTimeIn:', afternoonTimeIn);
            return res.status(400).json({ message: 'Invalid afternoonTimeIn format (HH:mm:ss)' });
        }
        attendance.afternoonTimeIn = afternoonTimeIn;
    }

    if (afternoonTimeOut !== undefined) {
        if (afternoonTimeOut !== null && !timeRegex.test(afternoonTimeOut)) {
            console.log('Validation failed for afternoonTimeOut:', afternoonTimeOut);
            return res.status(400).json({ message: 'Invalid afternoonTimeOut format (HH:mm:ss)' });
        }
        attendance.afternoonTimeOut = afternoonTimeOut;
    }

    if (status) {
        attendance.status = status;
    }

    await attendance.save();
    const updatedAttendance = await Attendance.findById(id).populate(
        'employeeId',
        'firstName lastName empNo position'
    );
    res.status(200).json(updatedAttendance);
});

/**
 * @desc time in
 * @route POST /api/attendance/time-in
 */
export const timeIn = asyncHandler(async (req, res) => {
    const { employeeId } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (!isValidObjectId(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const EARLY_THRESHOLD = "06:00:00";
    const OFFICE_START = "08:00:00";
    const CUTOFF_TIME = "13:00:00";

    if (currentTime < EARLY_THRESHOLD) {
        return res.status(400).json({ message: 'Time In is not allowed before 6:00 AM' });
    }

    const existingRecord = await Attendance.findOne({ employeeId, date: currentDate });
    if (existingRecord && existingRecord.morningTimeIn) {
        return res.status(400).json({ message: 'You are already Timed In for today.' });
    }

    let status = currentTime <= OFFICE_START ? 'Present' : 'Late';
    if (currentTime > CUTOFF_TIME && existingRecord && existingRecord.status === 'Absent') {
        existingRecord.morningTimeIn = currentTime;
        existingRecord.status = 'Late';
        await existingRecord.save();
        return res.status(200).json(existingRecord);
    }

    const attendance = new Attendance({
        employeeId,
        date: currentDate,
        morningTimeIn: currentTime,
        status,
    });

    await attendance.save();
    res.status(200).json(attendance);
});

/**
 * @desc time out
 * @route POST /api/attendance/time-out
 */
export const timeOut = asyncHandler(async (req, res) => {
    const { employeeId } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (!isValidObjectId(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const EARLY_THRESHOLD = "11:30:00";

    const attendance = await Attendance.findOne({ employeeId, date: currentDate });
    if (!attendance || !attendance.morningTimeIn) {
        return res.status(400).json({ message: 'No Time In record found for today. Please Time In first.' });
    }
    if (attendance.afternoonTimeOut) {
        return res.status(400).json({ message: 'You have already Timed Out for today.' });
    }
    if (currentTime < EARLY_THRESHOLD) {
        return res.status(400).json({ message: 'Time Out is not allowed before 11:30 AM' });
    }

    attendance.afternoonTimeOut = currentTime;
    await attendance.save();
    res.status(200).json(attendance);
});

/**
 * @desc check employee's absent
 * @route GET /api/attendance/check-absent
 */
export const checkAbsent = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const CUTOFF_TIME = "13:00:00";

    const attendanceRecords = await Attendance.find({ date: today });
    const presentEmployeeIds = attendanceRecords
        .filter(record => record.morningTimeIn)
        .map(record => record.employeeId.toString());

    const employees = await Employee.find();
    const absentEmployeeIds = employees
        .filter(emp => !presentEmployeeIds.includes(emp._id.toString()))
        .map(emp => emp._id);

    if (currentTime > CUTOFF_TIME) {
        const existingRecords = await Attendance.find({ date: today });
        const employeesToMarkAbsent = absentEmployeeIds.filter(id =>
            !existingRecords.some(record => record.employeeId.toString() === id.toString())
        );

        if (employeesToMarkAbsent.length > 0) {
            await Attendance.insertMany(
                employeesToMarkAbsent.map(employeeId => ({
                    employeeId,
                    date: today,
                    status: 'Absent',
                }))
            );
        }
    }

    res.status(200).json({
        message: 'Absent employees checked',
        absentCount: absentEmployeeIds.length,
        absentEmployeeIds,
    });
});

/**
 * @desc create
 * @route POST /api/attendance/
 */
export const createAttendance = asyncHandler(async (req, res) => {
    const { employeeId, date, status } = req.body;

    if (!isValidObjectId(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }

    const newAttendance = new Attendance({ employeeId, date, status });
    await newAttendance.save();

    const populatedAttendance = await Attendance.findById(newAttendance._id)
        .populate('employeeId', 'firstName lastName position email empNo');
    res.status(201).json(populatedAttendance);
});

/**
 * @desc get all employee attendance
 * @route GET /api/attendance
 */
export const getAllAttendance = asyncHandler(async (req, res) => {
    const attendance = await Attendance.find().populate('employeeId', 'firstName lastName empNo position');
    res.status(200).json(attendance);
});

/**
 * @desc get all employee attendance
 * @route GET /api/attendance/:employeeId
 */
export const getAttendanceByEmployeeId = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!isValidObjectId(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const totalRecords = await Attendance.countDocuments({ employeeId });
    const attendanceRecords = await Attendance.find({ employeeId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

    if (!attendanceRecords || attendanceRecords.length === 0) {
        return res.status(404).json({ message: 'No attendance records found' });
    }

    res.status(200).json({
        records: attendanceRecords,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        limit,
    });
});

/**
 * @desc delete employee attendance
 * @route DELETE /api/attendance/:id
 */
export const deleteAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid attendance ID' });
    }

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({ message: 'Attendance record deleted successfully' });
});