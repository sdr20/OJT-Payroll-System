import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { Employee } from '../../models/employee.model.js';
import { Position } from '../../models/position.model.js';
import {
    calculateSSSContribution,
    calculatePhilHealthContribution,
    calculateWithholdingTax,
    calculatePagIBIGContribution
} from '../../utils/payrollCalculations.js';

const normalizeDate = (date) => new Date(date).toISOString().split('T')[0];

export const getEmployeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id)
        .select('-password')
        .populate('position', 'name');
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
});

export const getAllEmployees = asyncHandler(async (req, res) => {
    try {
        const { month } = req.query;
        let query = { status: { $ne: 'trashed' } };

        if (month) {
            if (!/^\d{4}-\d{2}$/.test(month)) {
                return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
            }
            const [year, monthNum] = month.split('-');
            const parsedYear = parseInt(year, 10);
            const parsedMonth = parseInt(monthNum, 10);
            if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
                return res.status(400).json({ error: 'Invalid year or month value' });
            }
            query.hireDate = {
                $gte: new Date(parsedYear, parsedMonth - 1, 1),
                $lt: new Date(parsedYear, parsedMonth, 1),
            };
        }

        const employees = await Employee.find(query)
            .select('-password')
            .populate('position', 'name')
            .sort({ empNo: 1 });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
});

export const createEmployee = asyncHandler(async (req, res) => {
    try {
        const employeeData = { ...req.body };
        const { position, salary, hireDate } = employeeData;

        const existingEmployee = await Employee.findOne({
            $or: [
                { empNo: employeeData.empNo },
                { username: employeeData.username },
                { email: employeeData.email }
            ]
        });
        if (existingEmployee) {
            const field = existingEmployee.empNo === employeeData.empNo ? 'empNo' :
                         existingEmployee.username === employeeData.username ? 'username' : 'email';
            return res.status(400).json({ error: 'Duplicate key error', message: `${field} already exists` });
        }

        // Handle initial position and position history
        const startDate = hireDate ? new Date(hireDate) : new Date();
        let positionDoc = await Position.findOne({ name: position });
        if (!positionDoc && position && salary !== undefined) {
            positionDoc = new Position({ name: position, salary });
            await positionDoc.save();
        }

        const employee = new Employee({
            ...employeeData,
            hireDate: startDate,
            positionHistory: position && salary !== undefined ? [{
                position,
                salary,
                startDate,
                endDate: null
            }] : []
        });

        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        handleError(res, error, 'Failed to add employee');
    }
});

export const updateEmployee = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { position, salary, password, hireDate, ...otherDetails } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Handle position and salary changes with position history
        if ((position && position !== employee.position) || (salary !== undefined && salary !== employee.salary)) {
            const currentHistory = employee.positionHistory.find(h => !h.endDate);
            if (currentHistory) {
                currentHistory.endDate = new Date(); // End current position
            }
            if (position && salary !== undefined) {
                let positionDoc = await Position.findOne({ name: position });
                if (!positionDoc) {
                    positionDoc = new Position({ name: position, salary });
                    await positionDoc.save();
                } else if (positionDoc.salary !== salary) {
                    positionDoc.salary = salary;
                    await positionDoc.save();
                }
                employee.positionHistory.push({
                    position,
                    salary,
                    startDate: new Date(),
                    endDate: null
                });
            }
        }

        const updateData = {
            ...otherDetails,
            position,
            ...(req.body.deductions && { deductions: req.body.deductions }),
            ...(req.body.earnings && { earnings: req.body.earnings }),
            ...(req.body.payheads && { payheads: req.body.payheads }),
            ...(hireDate && { hireDate: new Date(hireDate) }),
            positionHistory: employee.positionHistory // Include updated history
        };

        if (req.file) {
            updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
        }

        if (salary !== undefined) {
            updateData.salary = Number(salary);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ 
            message: 'Employee details updated successfully', 
            updatedEmployee
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ 
            message: 'Failed to update employee', 
            error: error.message 
        });
    }
});

export const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }
    
    if (employee.status !== 'trashed') {
        return res.status(400).json({ message: 'Employee must be in trash before permanent deletion' });
    }

    const session = await Employee.startSession();
    session.startTransaction();

    try {
        await Employee.findByIdAndDelete(id).session(session);
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Employee permanently deleted from trash' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Error permanently deleting employee', error: error.message });
    }
});

export const trashEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log(`Trashing employee: ${id}`);
        
        const employee = await Employee.findById(id);
        if (!employee) {
            console.log(`Employee not found: ${id}`);
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (employee.status === 'trashed') {
            return res.status(400).json({ message: 'Employee is already in trash' });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { 
                status: 'trashed',
                trashedAt: new Date()
            },
            { new: true }
        );

        console.log('Employee trashed successfully:', updatedEmployee._id);
        res.status(200).json({ 
            message: 'Employee moved to trash successfully',
            employee: updatedEmployee 
        });
    } catch (error) {
        console.error('Trash employee error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Failed to move employee to trash',
            error: error.message 
        });
    }
});

export const restoreEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        const employee = await Employee.findByIdAndUpdate(
            id,
            { 
                status: 'approved',
                trashedAt: null
            },
            { new: true }
        );
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.status(200).json({ 
            message: 'Employee restored successfully',
            employee 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error restoring employee', 
            error: error.message 
        });
    }
});

export const getTrashedEmployees = asyncHandler(async (req, res) => {
    try {
        const trashedEmployees = await Employee.find({ status: 'trashed' }).select('-password');
        res.status(200).json(trashedEmployees);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching trashed employees', 
            error: error.message 
        });
    }
});

export const getPendingEmployees = asyncHandler(async (req, res) => {
    try {
        const pending = await Employee.find({ status: 'pending' })
            .select('-password')
            .populate('position', 'name');
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending employees', error: error.message });
    }
});

export const getEmployeeSalarySlip = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { month } = req.query;

    console.log('Fetching salary slip for empNo:', id, 'month:', month);

    try {
        const employee = await Employee.findOne({ empNo: id }).populate('payHead'); // Changed from payheads to payHead
        if (!employee) {
            console.log('Employee not found for empNo:', id);
            return res.status(404).json({ message: 'Employee not found' });
        }

        console.log('Found employee:', employee);

        const baseSalary = employee.salary || 0;
        const sssContribution = calculateSSSContribution(baseSalary);
        const philHealthContribution = calculatePhilHealthContribution(baseSalary);
        const pagIbigContribution = calculatePagIBIGContribution(baseSalary);
        
        const earnings = employee.payHead.filter(p => p.type === 'Earnings'); // Changed from payheads to payHead
        const totalEarningsFromPayHeads = earnings.reduce((sum, p) => sum + p.amount, 0);
        const totalEarnings = baseSalary + totalEarningsFromPayHeads;

        const deductions = employee.payHead.filter(p => p.type === 'Deductions'); // Changed from payheads to payHead
        const totalCustomDeductions = deductions.reduce((sum, p) => sum + p.amount, 0);
        const withholdingTax = calculateWithholdingTax(totalEarnings);
        const totalDeductions = totalCustomDeductions + sssContribution + philHealthContribution + pagIbigContribution + withholdingTax;

        const netSalary = totalEarnings - totalDeductions;
        const hourlyRate = baseSalary / (8 * 22);

        const salarySlip = {
            id: employee._id,
            empNo: employee.empNo,
            name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`.trim(),
            hourlyRate,
            baseSalary,
            birthDate: employee.birthday ? employee.birthday.toISOString().split('T')[0] : 'N/A',
            hireDate: employee.hireDate ? employee.hireDate.toISOString().split('T')[0] : 'N/A',
            civilStatus: employee.civilStatus || 'SINGLE',
            dependents: employee.dependents || 0,
            sss: employee.sss || 'N/A',
            tin: employee.tin || 'N/A',
            philHeath: employee.philHealth || 'N/A',
            pagIbig: employee.pagibig || 'N/A',
            position: employee.position || 'N/A',
            earnings: earnings.map(p => ({ name: p.name, amount: p.amount })),
            deductions: {
                customDeductions: deductions.map(p => ({ name: p.name, amount: p.amount })),
                sss: sssContribution,
                philHealth: philHealthContribution,
                pagIbig: pagIbigContribution,
                tax: withholdingTax
            },
            totalEarnings,
            totalDeductions,
            totalSalary: netSalary,
            salaryMonth: month
        };

        console.log('Generated salary slip:', salarySlip);
        res.status(200).json(salarySlip);
    } catch (error) {
        console.error('Error fetching salary slip:', error);
        res.status(500).json({ message: 'Failed to fetch salary slip', error: error.message });
    }
});

export const getProfile = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.employeeId)
        .select('-password')
        .populate('position', 'name');
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    const employeeObj = employee.toObject();
    res.status(200).json({
        id: employeeObj._id,
        firstName: employeeObj.firstName,
        lastName: employeeObj.lastName,
        username: employeeObj.username,
        email: employeeObj.email,
        empNo: employeeObj.empNo,
        birthday: employeeObj.birthday,
        profilePicture: employeeObj.profilePicture,
        hireDate: employeeObj.hireDate,
        contactInfo: employeeObj.contactInfo,
        civilStatus: employeeObj.civilStatus,
        salary: employeeObj.salary,
        sss: employeeObj.sss,
        philHealth: employeeObj.philHealth,
        pagIbig: employeeObj.pagIbig,
        position: employeeObj.position,
        role: employeeObj.role,
        positionHistory: employeeObj.positionHistory.map(h => ({
            position: h.position,
            salary: h.salary,
            startDate: normalizeDate(h.startDate),
            endDate: h.endDate ? normalizeDate(h.endDate) : null
        }))
    });
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
    console.log('Request employeeId:', req.employeeId);
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const employee = await Employee.findById(req.employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
        
        employee.profilePicture = profilePicturePath;
        await employee.save();

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: profilePicturePath
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error uploading profile picture', 
            error: error.message 
        });
    }
});

export const getTotalEmployees = asyncHandler(async (req, res) => {
    try {
        const total = await Employee.countDocuments();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total employees', error: error.message });
    }
});

export const approveEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.status !== 'pending') {
        return res.status(400).json({ message: 'Employee is not in pending status' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
        id,
        { status: 'approved' },
        { new: true }
    ).select('-password');

    res.status(200).json({
        message: 'Employee approved successfully',
        employee: updatedEmployee,
    });
});

export const handleError = asyncHandler(async (res, error) => {
    if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({ error: 'Validation failed', message: 'Invalid employee data', details: validationErrors });
    } else if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        res.status(400).json({ error: 'Duplicate key error', message: `${field} already exists` });
    } else {
        res.status(500).json({ error: 'Failed to process request', message: error.message });
    }
});