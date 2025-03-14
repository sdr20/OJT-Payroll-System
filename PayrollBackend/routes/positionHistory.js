const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Position = require('../models/Position');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Utility function to normalize dates to YYYY-MM-DD
const normalizeDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// POST: Record or update an employee's position and salary history
router.post('/record', isAdmin, async (req, res) => {
  try {
    const { employeeId, position, salary, startDate } = req.body;

    // Input validation
    if (!employeeId || !position || salary === undefined || !startDate) {
      return res.status(400).json({ error: 'Missing required fields: employeeId, position, salary, and startDate are required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-01)' });
    }

    const employee = await Employee.findOne({ id: parseInt(employeeId) });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const newStartDate = new Date(startDate);
    const newStartDateStr = normalizeDate(newStartDate);

    // Validate that the new startDate is after the latest position's startDate
    const sortedHistory = employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const currentPosition = sortedHistory.find(p => !p.endDate);
    if (currentPosition) {
      const currentStartDate = new Date(currentPosition.startDate);
      if (newStartDate <= currentStartDate) {
        return res.status(400).json({ error: `New startDate (${newStartDateStr}) must be after the current position's startDate (${normalizeDate(currentStartDate)})` });
      }
      // Set the endDate of the current position to the day before the new startDate
      const endDate = new Date(newStartDate);
      endDate.setDate(endDate.getDate() - 1);
      currentPosition.endDate = endDate;
    }

    // Manage position in the Position collection
    let positionDoc = await Position.findOne({ name: position });
    if (!positionDoc) {
      positionDoc = new Position({ name: position, salary });
      await positionDoc.save();
      console.log(`New position '${position}' created with salary ${salary}`);
    } else if (positionDoc.salary !== salary) {
      // Note: Only update the Position salary if this is intentional
      positionDoc.salary = salary;
      await positionDoc.save();
      console.log(`Updated salary for position '${position}' to ${salary}`);
    }

    // Add new position history entry
    employee.positionHistory.push({
      position: position,
      salary: salary,
      startDate: newStartDate,
      endDate: null
    });

    // Sort positionHistory by startDate
    employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Update employee's current position and salary
    employee.position = position;
    employee.salary = salary;
    employee.hourlyRate = salary / (8 * 22);

    await employee.save();
    console.log(`Position history updated for employee ID ${employeeId}: ${position} at ${salary} from ${newStartDateStr}`);

    res.status(200).json({
      success: true,
      message: `Position history updated successfully for employee ID ${employeeId}`,
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        salary: employee.salary,
        positionHistory: employee.positionHistory.map(history => ({
          position: history.position,
          salary: history.salary,
          startDate: normalizeDate(history.startDate),
          endDate: history.endDate ? normalizeDate(history.endDate) : null
        }))
      }
    });
  } catch (error) {
    console.error('Error recording position history:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ error: 'Validation failed', message: 'Invalid data', details: validationErrors });
    } else {
      res.status(500).json({ error: 'Failed to record position history', message: error.message });
    }
  }
});

// GET: Retrieve an employee's position history
router.get('/:employeeId', isAdmin, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const employee = await Employee.findOne({ id: employeeId }).select('firstName lastName positionHistory position salary');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Sort positionHistory by startDate
    employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    res.status(200).json({
      success: true,
      employee: {
        id: employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        salary: employee.salary,
        positionHistory: employee.positionHistory.map(history => ({
          position: history.position,
          salary: history.salary,
          startDate: normalizeDate(history.startDate),
          endDate: history.endDate ? normalizeDate(history.endDate) : null
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching position history:', error);
    res.status(500).json({ error: 'Failed to fetch position history', message: error.message });
  }
});

// PUT: Update an existing position history entry
router.put('/update/:employeeId', isAdmin, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const { position, startDate, endDate, newSalary } = req.body;

    // Input validation
    if (!employeeId || !position || !startDate) {
      return res.status(400).json({ error: 'Missing required fields: employeeId, position, and startDate are required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate))) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-01)' });
    }

    const employee = await Employee.findOne({ id: employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Normalize dates for comparison
    const targetStartDate = normalizeDate(new Date(startDate));
    const historyEntry = employee.positionHistory.find(h => 
      h.position === position && normalizeDate(h.startDate) === targetStartDate
    );

    if (!historyEntry) {
      return res.status(404).json({ error: 'Position history entry not found' });
    }

    // Prevent modifying past entries that might affect generated payslips
    const today = new Date();
    if (new Date(historyEntry.startDate) < today && historyEntry.endDate && new Date(historyEntry.endDate) < today) {
      return res.status(400).json({ error: 'Cannot modify past position history entries that may have associated payslips' });
    }

    // Validate new endDate if provided
    if (endDate) {
      const newEndDate = new Date(endDate);
      if (newEndDate <= new Date(historyEntry.startDate)) {
        return res.status(400).json({ error: 'endDate must be after startDate' });
      }
      // Check for overlap with the next position
      const sortedHistory = employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      const entryIndex = sortedHistory.findIndex(h => 
        h.position === position && normalizeDate(h.startDate) === targetStartDate
      );
      if (entryIndex < sortedHistory.length - 1) {
        const nextEntry = sortedHistory[entryIndex + 1];
        if (newEndDate >= new Date(nextEntry.startDate)) {
          return res.status(400).json({ error: 'New endDate overlaps with the next position’s startDate' });
        }
      }
      historyEntry.endDate = newEndDate;
    }

    // Update salary if provided
    if (newSalary !== undefined) {
      historyEntry.salary = newSalary;
      if (!historyEntry.endDate) { // Update current position
        employee.salary = newSalary;
        employee.hourlyRate = newSalary / (8 * 22);
      }
      const positionDoc = await Position.findOneAndUpdate(
        { name: position },
        { salary: newSalary },
        { new: true, upsert: true }
      );
      console.log(`Updated salary for position '${position}' to ${newSalary} in Position model`);
    }

    // Sort positionHistory by startDate
    employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    await employee.save();
    console.log(`Position history updated for employee ID ${employeeId}: ${position} at ${startDate}`);

    res.status(200).json({
      success: true,
      message: `Position history updated successfully for employee ID ${employeeId}`,
      employee: {
        id: employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        salary: employee.salary,
        positionHistory: employee.positionHistory.map(history => ({
          position: history.position,
          salary: history.salary,
          startDate: normalizeDate(history.startDate),
          endDate: history.endDate ? normalizeDate(history.endDate) : null
        }))
      }
    });
  } catch (error) {
    console.error('Error updating position history:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ error: 'Validation failed', message: 'Invalid data', details: validationErrors });
    } else {
      res.status(500).json({ error: 'Failed to update position history', message: error.message });
    }
  }
});

module.exports = router;