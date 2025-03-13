const Attendance = require('../models/Attendance');

const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    const attendanceRecords = await Attendance.find({ date }).sort({ employeeId: 1 });
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance', message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { date, employeeId, morningTimeIn, morningTimeOut, afternoonTimeIn, afternoonTimeOut, status } = req.body;
    const employeeIdParam = parseInt(req.params.id);

    if (!date || !employeeId) {
      return res.status(400).json({ error: 'Date and Employee ID are required' });
    }

    const parsedEmployeeId = parseInt(employeeId);
    if (isNaN(parsedEmployeeId) || employeeIdParam !== parsedEmployeeId) {
      return res.status(400).json({ 
        error: 'Employee ID in URL must match body', 
        paramId: employeeIdParam, 
        bodyId: employeeId 
      });
    }

    const updateData = {
      employeeId: parsedEmployeeId,
      date,
      morningTimeIn: morningTimeIn !== undefined ? morningTimeIn : null,
      morningTimeOut: morningTimeOut !== undefined ? morningTimeOut : null,
      afternoonTimeIn: afternoonTimeIn !== undefined ? afternoonTimeIn : null,
      afternoonTimeOut: afternoonTimeOut !== undefined ? afternoonTimeOut : null,
      status: status || 'Absent',
    };

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId: parsedEmployeeId, date },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(attendance);
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      const { date, employeeId, morningTimeIn, morningTimeOut, afternoonTimeIn, afternoonTimeOut, status } = req.body;
      const updateData = {
        morningTimeIn: morningTimeIn !== undefined ? morningTimeIn : null,
        morningTimeOut: morningTimeOut !== undefined ? morningTimeOut : null,
        afternoonTimeIn: afternoonTimeIn !== undefined ? afternoonTimeIn : null,
        afternoonTimeOut: afternoonTimeOut !== undefined ? afternoonTimeOut : null,
        status: status || 'Absent',
      };

      const attendance = await Attendance.findOneAndUpdate(
        { employeeId: parseInt(employeeId), date },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      res.status(200).json(attendance);
    } else {
      res.status(500).json({ error: 'Failed to update attendance', message: error.message });
    }
  }
};

module.exports = { getAttendance, updateAttendance };