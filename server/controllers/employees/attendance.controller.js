import asyncHandler from 'express-async-handler';
import { Attendance } from '../../models/attendance.model.js';
import { Employee } from '../../models/employee.model.js';

/**
 * @desc Create a new attendance record
 * @route POST /api/attendance/time-in
 */
export const timeIn = asyncHandler(async (req, res) => {
    const { employeeId } = req.body;
    // YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Define office hours
    const EARLY_THRESHOLD = "06:00:00"; // Earliest allowed time-in
    const OFFICE_START = "08:00:00";    // Threshold for Present vs Late
    const CUTOFF_TIME = "13:00:00";     // Cutoff to mark as Absent initially

    // Validate minimum time-in
    if (currentTime < EARLY_THRESHOLD) {
        return res.status(400).json({ message: 'Time In is not allowed before 6:00 AM' });
    }

    // Check for existing record today
    const existingRecord = await Attendance.findOne({
        employeeId,
        date: currentDate,
    });

    if (existingRecord) {
        if (existingRecord.morningTimeIn) {
            return res.status(400).json({ message: 'You are already Timed In for today.' });
        }
    }

    // Determine status
    let status = currentTime <= OFFICE_START ? 'Present' : 'Late';

    // If timing in after cutoff and an absent record exists, update it
    if (currentTime > CUTOFF_TIME && existingRecord && existingRecord.status === 'Absent') {
        existingRecord.morningTimeIn = currentTime;
        existingRecord.status = 'Late';
        await existingRecord.save();
        return res.status(200).json(existingRecord);
    }

    // Create new attendance record
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
 * @desc Update attendance record with time out
 * @route POST /api/attendance/time-out
 */
export const timeOut = asyncHandler(async (req, res) => {
    const { employeeId } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Define office end time
    const EARLY_THRESHOLD = "11:30:00"; // Earliest allowed time-out

    // Find today's attendance record
    const attendance = await Attendance.findOne({
        employeeId,
        date: currentDate,
    });

    if (!attendance || !attendance.morningTimeIn) {
        return res.status(400).json({ message: 'No Time In record found for today. Please Time In first.' });
    }

    if (attendance.afternoonTimeOut) {
        return res.status(400).json({ message: 'You have already Timed Out for today.' });
    }

    if (currentTime < EARLY_THRESHOLD) {
        return res.status(400).json({ message: 'Time Out is not allowed before 11:30 AM' });
    }

    // Update with afternoonTimeOut (no status change since Early Departure is removed)
    attendance.afternoonTimeOut = currentTime;
    await attendance.save();
    res.status(200).json(attendance);
});

/**
 * @desc Check and mark absent employees (optional cron job or admin endpoint)
 * @route GET /api/attendance/check-absent (example)
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

export const createAttendance = async (req, res) => {
    try {
        const { employeeId, date, status } = req.body;

        // Check if the employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Create a new attendance record
        const newAttendance = new Attendance({
            employeeId,
            date,
            status
        });

        await newAttendance.save();

        // Populate the employee details
        const populatedAttendance = await Attendance.findById(newAttendance._id)
            .populate('employeeId', 'name position email employeeIdNumber');

        res.status(201).json(populatedAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Get all attendance records
 * @route GET /api/attendance
 */
export const getAllAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find().populate('employeeId', 'firstName lastName position email employeeIdNumber');
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @desc Get attendance by employee ID
 * @route GET /api/attendance/:employeeId
//  */
// export const getAttendanceByEmployee = async (req, res) => {
//     try {
//         const { employeeId } = req.params;

//         // Validate employeeId
//         if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
//             return res.status(400).json({ message: 'Invalid or missing employee ID' });
//         }

//         const attendanceRecords = await Attendance.find({ employeeId })
//             .populate('employeeId', 'name position employeeIdNumber');

//         if (!attendanceRecords.length) {
//             return res.status(404).json({ message: 'No attendance records found for this employee' });
//         }

//         res.status(200).json(attendanceRecords);
//     } catch (error) {
//         console.error('Error in getAttendanceByEmployee:', error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// };

/**
 * @desc Get attendance by employee ID with pagination
 * @route GET /api/attendance/:employeeId?page=<page>&limit=<limit>
 */
export const getAttendanceByEmployeeId = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
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
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

/**
 * @desc Delete an attendance record
 * @route DELETE /api/attendance/:id
 */
export const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance.findByIdAndDelete(id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};