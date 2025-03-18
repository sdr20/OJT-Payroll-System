import { Employee } from '../../models/employee.model.js';
import { Position } from '../../models/position.model.js';

// Helper function to normalize date to YYYY-MM-DD
const normalizeDate = (date) => new Date(date).toISOString().split('T')[0];

// Record a new position history entry
export const recordPositionHistory = async (req, res) => {
  try {
    const { employeeId, position, salary, startDate } = req.body;

    if (!employeeId || !position || salary === undefined || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }

    const newStartDate = new Date(startDate);
    if (newStartDate < new Date(employee.hireDate)) {
        return res.status(400).json({ error: `startDate (${newStartDate.toISOString()}) cannot be before hireDate (${employee.hireDate.toISOString()})` });
    }

    const sortedHistory = employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const currentPosition = sortedHistory.find(p => !p.endDate);
    if (currentPosition) {
        const currentStartDate = new Date(currentPosition.startDate);
        if (newStartDate <= currentStartDate) {
            return res.status(400).json({ error: `New startDate (${normalizeDate(newStartDate)}) must be after current position's startDate (${normalizeDate(currentStartDate)})` });
        }
        currentPosition.endDate = new Date(newStartDate - 1);
    }

    let positionDoc = await Position.findOne({ name: position });
    if (!positionDoc) {
        positionDoc = new Position({ name: position, salary });
        await positionDoc.save();
    } else if (positionDoc.salary !== salary) {
        positionDoc.salary = salary;
        await positionDoc.save();
    }

    employee.positionHistory.push({ position, salary, startDate: newStartDate, endDate: null });
    employee.position = position;
    employee.salary = salary;
    employee.hourlyRate = salary / (8 * 22);

    await employee.save();

    res.status(200).json({
        success: true,
        message: `Position history updated for employee ID ${employeeId}`,
        employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            position: employee.position,
            salary: employee.salary,
            hireDate: normalizeDate(employee.hireDate),
            positionHistory: employee.positionHistory.map(h => ({
            position: h.position,
            salary: h.salary,
            startDate: normalizeDate(h.startDate),
            endDate: h.endDate ? normalizeDate(h.endDate) : null
            }))
        }
    });
    } catch (error) {
        console.error('Error recording position history:', error);
        res.status(500).json({ error: 'Failed to record position history', message: error.message });
    }
};

// Fetch position history for an employee
export const getPositionHistory = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findById(employeeId).select('firstName lastName positionHistory position salary hireDate');

        if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
        }

        employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        res.status(200).json({
        success: true,
        employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            position: employee.position,
            salary: employee.salary,
            hireDate: normalizeDate(employee.hireDate),
            positionHistory: employee.positionHistory.map(h => ({
            position: h.position,
            salary: h.salary,
            startDate: normalizeDate(h.startDate),
            endDate: h.endDate ? normalizeDate(h.endDate) : null
            }))
        }
    });
    } catch (error) {
        console.error('Error fetching position history:', error);
        res.status(500).json({ error: 'Failed to fetch position history', message: error.message });
    }
};

// Update an existing position history entry
export const updatePositionHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { position, startDate, endDate, newSalary } = req.body;

    if (!employeeId || !position || !startDate) {
        return res.status(400).json({ error: 'Missing required fields: employeeId, position, and startDate required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate))) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }

    const targetStartDate = normalizeDate(new Date(startDate));
    const historyEntry = employee.positionHistory.find(h => 
        h.position === position && normalizeDate(h.startDate) === targetStartDate
    );

    if (!historyEntry) {
        return res.status(404).json({ error: 'Position history entry not found' });
    }

    if (new Date(historyEntry.startDate) < new Date(employee.hireDate)) {
        return res.status(400).json({ error: `Position startDate (${historyEntry.startDate.toISOString()}) cannot be before hireDate (${employee.hireDate.toISOString()})` });
    }

    if (new Date(historyEntry.startDate) < new Date() && historyEntry.endDate && new Date(historyEntry.endDate) < new Date()) {
        return res.status(400).json({ error: 'Cannot modify past position history entries' });
    }

    if (endDate) {
        const newEndDate = new Date(endDate);
        if (newEndDate <= new Date(historyEntry.startDate)) {
            return res.status(400).json({ error: 'endDate must be after startDate' });
        }
        const sortedHistory = employee.positionHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const entryIndex = sortedHistory.findIndex(h => 
            h.position === position && normalizeDate(h.startDate) === targetStartDate
        );
        if (entryIndex < sortedHistory.length - 1) {
            const nextEntry = sortedHistory[entryIndex + 1];
            if (newEndDate >= new Date(nextEntry.startDate)) {
                return res.status(400).json({ error: 'New endDate overlaps with next position’s startDate' });
            }
        }
        historyEntry.endDate = newEndDate;
    }

    if (newSalary !== undefined) {
        historyEntry.salary = newSalary;
        if (!historyEntry.endDate) {
            employee.salary = newSalary;
            employee.hourlyRate = newSalary / (8 * 22);
        }
        await Position.findOneAndUpdate(
            { name: position },
            { salary: newSalary },
            { new: true, upsert: true }
        );
    }

    await employee.save();

    res.status(200).json({
        success: true,
        message: `Position history updated for employee ID ${employeeId}`,
        employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            position: employee.position,
            salary: employee.salary,
            hireDate: normalizeDate(employee.hireDate),
            positionHistory: employee.positionHistory.map(h => ({
            position: h.position,
            salary: h.salary,
            startDate: normalizeDate(h.startDate),
            endDate: h.endDate ? normalizeDate(h.endDate) : null
            }))
        }
    });
    } catch (error) {
        console.error('Error updating position history:', error);
        res.status(500).json({ error: 'Failed to update position history', message: error.message });
    }
};