import { jsPDF } from 'jspdf';
import nodemailer from 'nodemailer';
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
export const getPaySlips = async (req, res) => {
    try {
        const { month } = req.query;
        const query = month ? { salaryMonth: month } : {};
        const payslips = await Payslip.find(query);
        res.status(200).json(payslips);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payslips', message: error.message });
    }
};

export const generatePayslip = async (req, res) => {
    console.log('Received request to generate payslip:', req.body);
    const { 
        employeeId, 
        empNo, 
        payslipData, 
        salaryMonth, 
        paydayType 
    } = req.body;

    try {
        const employee = await Employee.findById(employeeId).populate('payHead'); // Changed from payHeads to payHead
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const baseSalary = employee.salary || 0;
        const payHead = Array.isArray(employee.payHead) ? employee.payHead : []; // Changed from payHeads to payHead

        const totalEarnings = calculateTotalEarnings(baseSalary, payHead);
        const totalDeductions = calculateTotalDeductions(baseSalary, payHead, totalEarnings);
        const netSalary = calculateNetSalary(totalEarnings, totalDeductions);

        const sssContribution = calculateSSSContribution(baseSalary);
        const philHealthContribution = calculatePhilHealthContribution(baseSalary);
        const pagIbigContribution = calculatePagIBIGContribution(baseSalary);
        const withholdingTax = calculateWithholdingTax(totalEarnings);
        const deductions = payHead.filter(p => p.type === 'Deductions'); // Changed from payHeads to payHead
        const totalCustomDeductions = deductions.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const earnings = payHead.filter(p => p.type === 'Earnings'); // Changed from payHeads to payHead
        const travelExpenses = earnings.find(p => p.name.toLowerCase().includes('travel'))?.amount || 0;
        const otherEarnings = earnings
            .filter(p => !p.name.toLowerCase().includes('travel'))
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const payslipData = {
            empNo: employee.empNo || 'N/A',
            firstName: employee.firstName || 'N/A',
            lastName: employee.lastName || 'N/A',
            middleName: employee.middleName || '',
            birthDate: employee.birthDate || 'N/A',
            hireDate: employee.hireDate || 'N/A',
            civilStatus: employee.civilStatus || 'SINGLE',
            dependents: employee.dependents || 0,
            sss: employee.sssNumber || 'N/A',
            tin: employee.tin || 'N/A',
            philHeath: employee.philHealthNumber || 'N/A',
            pagIbig: employee.pagIbigNumber || 'N/A',
            position: employee.position || 'N/A',
            salary: baseSalary,
            salaryMonth,
            totalSalary: netSalary,
            payHead,
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
            empNo: empNo,
            payslipData: payslipData,
            salaryMonth,
            paydayType,
        });
        await payslip.save();

        res.status(200).json({
            message: 'Payslip generated successfully',
            payslip: {
                id: payslip._id,
                employeeId,
                empNo: empNo,
                payslipData: payslip.payslipData,
                salaryMonth,
                paydayType,
            },
        });
    } catch (error) {
        console.error('Error generating payslip:', error);
        res.status(500).json({ message: 'Failed to generate payslip', error: error.message });
    }
};

export const sendPayslipEmail = async (req, res) => {
    const { employeeId, employeeEmail, payslipData, salaryMonth } = req.body;

    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

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
                content: payslipData.split(',')[1],
                encoding: 'base64'
            }]
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Payslip email sent successfully' });
    } catch (error) {
        console.error('Error sending payslip email:', error);
        res.status(500).json({ message: 'Failed to send payslip email', error: error.message });
    }
};

export const getEmployeePayslips = async (req, res) => {
    const { id } = req.params;
    const { month } = req.query;

    console.log('Fetching salary slip for empNo:', id, 'month:', month);

    try {
        const employee = await Employee.findOne({ empNo: id }).populate('payHead'); // Changed from payHeads to payHead
        if (!employee) {
            console.log('Employee not found for empNo:', id);
            return res.status(404).json({ message: 'Employee not found' });
        }

        console.log('Found employee:', employee);

        const baseSalary = employee.salary || 0;
        const sssContribution = calculateSSSContribution(baseSalary);
        const philHealthContribution = calculatePhilHealthContribution(baseSalary);
        const pagIbigContribution = calculatePagIBIGContribution(baseSalary);
        
        const earnings = employee.payHead.filter(p => p.type === 'Earnings'); // Changed from payHeads to payHead
        const totalEarningsFromPayHeads = earnings.reduce((sum, p) => sum + p.amount, 0);
        const totalEarnings = baseSalary + totalEarningsFromPayHeads;

        const deductions = employee.payHead.filter(p => p.type === 'Deductions'); // Changed from payHeads to payHead
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
};