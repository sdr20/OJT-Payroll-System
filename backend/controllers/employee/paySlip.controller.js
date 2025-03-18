import { jsPDF } from 'jspdf';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { Employee } from '../../models/employee.model.js';
import { Payslip } from '../../models/payslip.model.js';
import {
    calculateSSSContribution,
    calculatePhilHealthContribution,
    calculatePagIBIGContribution,
    calculateWithholdingTax,
    calculateTotalEarnings,
    calculateTotalDeductions,
    calculateNetSalary
} from '../../utils/payrollCalculations.js';

// Fetch all payslips (admin-only)
export const getPaySlips = async (req, res) => {
    try {
        const { month } = req.query;
        const query = month ? { salaryMonth: month } : {};
        const payslips = await Payslip.find(query);
        res.status(200).json(payslips);
    } catch (error) {
        console.error('Error fetching payslips:', error);
        res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
    }
};

// Generate a payslip (admin-only)
export const generatePayslip = async (req, res) => {
    console.log('Received request to generate payslip:', req.body);
    const { employeeId, empNo, payslipData, salaryMonth, paydayType, position, salary } = req.body;

    const requiredFields = { employeeId, empNo, payslipData, salaryMonth, paydayType, position, salary };
    const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === undefined || value === null || value === '')
        .map(([key]) => key);
    if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    try {
        const employee = await Employee.findById(employeeId).populate('payHeads');
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Validate salaryMonth and calculate payslip date
        const [year, month] = salaryMonth.split('-').map(Number);
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const day = paydayType === 'mid-month' ? 15 : lastDayOfMonth;
        const payslipDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

        const hireDate = new Date(employee.hireDate);
        if (payslipDate < hireDate) {
            console.log('Payslip date before hire date:', { payslipDate, hireDate });
            return res.status(400).json({ error: 'Payslip date cannot be before hire date' });
        }

        // Check for existing payslip
        const existingPayslip = await Payslip.findOne({ employeeId, salaryMonth, paydayType });
        if (existingPayslip) {
            console.log('Payslip already exists:', { employeeId, salaryMonth, paydayType });
            return res.status(409).json({ error: 'Payslip already generated for this period' });
        }

        // Find position history entry for payslip date
        let historyEntry = employee.positionHistory.find(h => {
            const startDate = new Date(h.startDate);
            const endDate = h.endDate ? new Date(h.endDate) : new Date('9999-12-31T23:59:59Z');
            return startDate <= payslipDate && payslipDate <= endDate;
        }) || { position: employee.position, salary: employee.salary };

        const receivedPosition = position.trim().toLowerCase();
        const historyPosition = historyEntry.position.trim().toLowerCase();
        const receivedSalary = Number(salary);
        const historySalary = historyEntry.salary;

        if (historyPosition !== receivedPosition || historySalary !== receivedSalary) {
            console.warn('Position/salary mismatch (using received values):', {
                history: { position: historyPosition, salary: historySalary },
                received: { position: receivedPosition, salary: receivedSalary }
            });
        }

        // Calculate payroll details
        const baseSalary = receivedSalary;
        const payHeads = Array.isArray(employee.payHeads) ? employee.payHeads : [];
        const totalEarnings = calculateTotalEarnings(baseSalary, payHeads);
        const totalDeductions = calculateTotalDeductions(baseSalary, payHeads, totalEarnings);
        const netSalary = calculateNetSalary(totalEarnings, totalDeductions);

        const sssContribution = calculateSSSContribution(baseSalary);
        const philHealthContribution = calculatePhilHealthContribution(baseSalary);
        const pagIbigContribution = calculatePagIBIGContribution(baseSalary);
        const withholdingTax = calculateWithholdingTax(totalEarnings);
        const deductions = payHeads.filter(p => p.type === 'Deductions');
        const totalCustomDeductions = deductions.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const earnings = payHeads.filter(p => p.type === 'Earnings');
        const travelExpenses = earnings.find(p => p.name.toLowerCase().includes('travel'))?.amount || 0;
        const otherEarnings = earnings
            .filter(p => !p.name.toLowerCase().includes('travel'))
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        // Prepare payslip data
        const fullPayslipData = {
            empNo: employee.empNo || empNo,
            firstName: employee.firstName || 'N/A',
            lastName: employee.lastName || 'N/A',
            middleName: employee.middleName || '',
            birthDate: employee.birthDate || 'N/A',
            hireDate: employee.hireDate || 'N/A',
            civilStatus: employee.civilStatus || 'SINGLE',
            dependents: employee.dependents || 0,
            sss: employee.sssNumber || 'N/A',
            tin: employee.tin || 'N/A',
            philHealth: employee.philHealthNumber || 'N/A',
            pagIbig: employee.pagIbigNumber || 'N/A',
            position: position.trim(),
            salary: baseSalary,
            salaryMonth,
            totalSalary: netSalary,
            payHeads,
            deductions: {
                sss: sssContribution,
                philHealth: philHealthContribution,
                pagIbig: pagIbigContribution,
                tax: withholdingTax,
                customDeductions: deductions.map(d => ({ name: d.name, amount: d.amount }))
            },
            earnings: {
                travelExpenses,
                otherEarnings
            }
        };

        const payslip = new Payslip({
            employeeId,
            empNo,
            payslipData: { ...payslipData, ...fullPayslipData }, // Merge provided and calculated data
            salaryMonth,
            paydayType,
            position: position.trim(),
            salary: receivedSalary
        });
        await payslip.save();

        console.log('Payslip generated successfully:', { employeeId, salaryMonth, paydayType });
        res.status(201).json({
            message: 'Payslip generated successfully',
            payslip: {
                id: payslip._id,
                employeeId,
                empNo,
                payslipData: payslip.payslipData,
                salaryMonth,
                paydayType,
                position: payslip.position,
                salary: payslip.salary
            }
        });
    } catch (error) {
        console.error('Error generating payslip:', error);
        res.status(500).json({ error: 'Failed to generate payslip', message: error.message });
    }
};

// Send payslip email (admin-only)
export const sendPayslipEmail = async (req, res) => {
    const { employeeId, employeeEmail, payslipData, salaryMonth } = req.body;

    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: employeeEmail,
            subject: `Payslip for ${salaryMonth}`,
            text: `Dear ${employee.firstName},\n\nAttached is your payslip for ${salaryMonth}.\n\nBest regards,\nHR Team`,
            attachments: [{
                filename: `payslip-${employee.firstName}-${salaryMonth}.pdf`,
                content: payslipData.split(',')[1], // Assuming base64 data URI
                encoding: 'base64'
            }]
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Payslip email sent successfully' });
    } catch (error) {
        console.error('Error sending payslip email:', error);
        res.status(500).json({ error: 'Failed to send payslip email', message: error.message });
    }
};

// Fetch payslips for a specific employee
export const getEmployeePayslips = async (req, res) => {
    const { employeeId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ error: 'Invalid employee ID format' });
        }
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const payslips = await Payslip.find({ employeeId: employee._id });
        if (!payslips || payslips.length === 0) {
            return res.status(404).json({ error: 'No payslips found for this employee' });
        }

        const formattedPayslips = payslips.map(payslip => ({
            employeeId: payslip.employeeId,
            empNo: payslip.empNo,
            payslipDataUrl: payslip.payslipData,
            salaryMonth: payslip.salaryMonth,
            paydayType: payslip.paydayType,
            position: payslip.position || null,
            salary: payslip.salary || 0
        }));
        res.status(200).json(formattedPayslips);
    } catch (error) {
        console.error('Error fetching employee payslips:', error);
        res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
    }
};