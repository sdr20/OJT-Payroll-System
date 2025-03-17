import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
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
        morningTimeIn: { $gt: OFFICE_START }
    }).countDocuments();

    res.status(200).json({ total: lateRecords });
});

/**
 * @desc Update attendance record
 * @route PUT /api/attendance/:id
 */
export const updateAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { morningTimeIn, morningTimeOut, afternoonTimeIn, afternoonTimeOut, status } = req.body; // Updated fields

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid attendance ID' });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (morningTimeIn !== undefined) {
        if (morningTimeIn !== null && !timeRegex.test(morningTimeIn)) {
            return res.status(400).json({ message: 'Invalid morningTimeIn format (HH:mm)' });
        }
        attendance.morningTimeIn = morningTimeIn;
        if (morningTimeIn) {
            const OFFICE_START = "08:00:00";
            attendance.status = morningTimeIn > OFFICE_START ? 'Late' : 'Present';
        }
    }

    if (morningTimeOut !== undefined) {
        if (morningTimeOut !== null && !timeRegex.test(morningTimeOut)) {
            return res.status(400).json({ message: 'Invalid morningTimeOut format (HH:mm)' });
        }
        attendance.morningTimeOut = morningTimeOut;
    }

    if (afternoonTimeIn !== undefined) {
        if (afternoonTimeIn !== null && !timeRegex.test(afternoonTimeIn)) {
            return res.status(400).json({ message: 'Invalid afternoonTimeIn format (HH:mm)' });
        }
        attendance.afternoonTimeIn = afternoonTimeIn;
    }

    if (afternoonTimeOut !== undefined) {
        if (afternoonTimeOut !== null && !timeRegex.test(afternoonTimeOut)) {
            return res.status(400).json({ message: 'Invalid afternoonTimeOut format (HH:mm)' });
        }
        attendance.afternoonTimeOut = afternoonTimeOut;
    }

    if (status) {
        attendance.status = status;
    }

    await attendance.save();
    const updatedAttendance = await Attendance.findById(id).populate({
        path: 'employeeId',
        select: 'firstName lastName empNo position email',
        populate: { path: 'position', select: 'name' }
    });
    res.status(200).json(updatedAttendance);
});

/**
 * @desc Time in
 * @route POST /api/attendance/time-in
 */
export const timeIn = asyncHandler(async (req, res) => {
    const { employeeId, timeType } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5); // HH:mm format

    if (!isValidObjectId(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const EARLY_THRESHOLD = "06:00";
    const OFFICE_START = "08:00";

    if (currentTime < EARLY_THRESHOLD) {
        return res.status(400).json({ message: 'Time In is not allowed before 6:00 AM' });
    }

    const existingRecord = await Attendance.findOne({ employeeId, date: currentDate });
    if (existingRecord && (existingRecord.morningTimeIn || existingRecord.afternoonTimeIn)) {
        return res.status(400).json({ message: 'You are already Timed In for today.' });
    }

    let status = currentTime > OFFICE_START ? 'Late' : 'Present';
    let updatedRecord;

    if (existingRecord) {
        if (timeType === 'afternoon' && !existingRecord.afternoonTimeIn) {
            existingRecord.afternoonTimeIn = currentTime;
        } else if (!existingRecord.morningTimeIn) {
            existingRecord.morningTimeIn = currentTime;
        }
        existingRecord.status = status;
        await existingRecord.save();
        updatedRecord = await Attendance.findById(existingRecord._id).populate({
            path: 'employeeId',
            select: 'firstName lastName empNo position email',
            populate: { path: 'position', select: 'name' }
        });
    } else {
        const attendance = new Attendance({
            employeeId,
            date: currentDate,
            [timeType === 'afternoon' ? 'afternoonTimeIn' : 'morningTimeIn']: currentTime,
            status,
        });
        await attendance.save();
        updatedRecord = await Attendance.findById(attendance._id).populate({
            path: 'employeeId',
            select: 'firstName lastName empNo position',
            populate: { path: 'position', select: 'name' }
        });
    }
    res.status(200).json(updatedRecord);
});

/**
 * @desc Time out
 * @route POST /api/attendance/time-out
 */
export const timeOut = asyncHandler(async (req, res) => {
    const { employeeId } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5); // HH:mm format

    if (!isValidObjectId(employeeId)) {
        return res.status(400).json({ message: 'Invalid employeeId' });
    }

    const EARLY_THRESHOLD = "11:30";

    const attendance = await Attendance.findOne({ employeeId, date: currentDate });
    if (!attendance || !attendance.morningTimeIn) {
        return res.status(400).json({ message: 'No Time In record found for today. Please Time In first.' });
    }
    if (attendance.morningTimeOut || attendance.afternoonTimeOut) {
        return res.status(400).json({ message: 'You have already Timed Out for today.' });
    }
    if (currentTime < EARLY_THRESHOLD) {
        return res.status(400).json({ message: 'Time Out is not allowed before 11:30 AM' });
    }

    // Determine if this is morning or afternoon timeout based on time
    if (currentTime <= "12:00") {
        attendance.morningTimeOut = currentTime;
    } else {
        attendance.afternoonTimeOut = currentTime; 
    }

    await attendance.save();
    const populatedAttendance = await Attendance.findById(attendance._id).populate({
        path: 'employeeId',
        select: 'firstName lastName empNo position email',
        populate: { path: 'position', select: 'name' }
    });
    res.status(200).json(populatedAttendance);
});

/**
 * @desc Check employee's absent
 * @route GET /api/attendance/check-absent
 */
export const checkAbsent = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5); // HH:mm format
    const CUTOFF_TIME = "13:00";

    const attendanceRecords = await Attendance.find({ date: today })
        .populate('employeeId', 'firstName lastName position')
        .populate('position', 'name');
    
    const presentEmployeeIds = attendanceRecords
        .filter(record => record.morningTimeIn)
        .map(record => record.employeeId.toString());

    const employees = await Employee.find();
    const absentEmployeeIds = employees
        .filter(emp => !presentEmployeeIds.includes(emp._id.toString()))
        .map(emp => emp._id);

    if (currentTime > CUTOFF_TIME && absentEmployeeIds.length > 0) {
        const recordsToInsert = absentEmployeeIds
            .filter(empId => !attendanceRecords.some(r => r.employeeId.toString() === empId.toString()))
            .map(employeeId => ({
                employeeId,
                date: today,
                status: 'Absent',
            }));
        if (recordsToInsert.length > 0) {
            await Attendance.insertMany(recordsToInsert);
        }
    }

    res.status(200).json({
        message: 'Absent employees checked',
        absentCount: absentEmployeeIds.length,
        absentEmployeeIds,
    });
});

/**
 * @desc Create attendance record
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

    const newAttendance = new Attendance({ employeeId, date, status: status || 'Present' });
    await newAttendance.save();

    const populatedAttendance = await Attendance.findById(newAttendance._id)
        .populate('employeeId', 'firstName lastName position email empNo');
    res.status(201).json(populatedAttendance);
});

/**
 * @desc Get all employee attendance for today
 * @route GET /api/attendance
 */
export const getAllAttendance = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.find({ date: today }).populate({
        path: 'employeeId',
        select: 'firstName lastName empNo position email empNo',
        populate: { path: 'position', select: 'name' }
    });
    res.status(200).json(attendance);
});

/**
 * @desc Get all employee attendance by employee ID
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
        .populate({
            path: 'employeeId',
            select: 'firstName lastName empNo position email',
            populate: { path: 'position', select: 'name' }
        })
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
 * @desc Delete employee attendance
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