import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const paySlipSchema = new Schema({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    empNo: {
        type: String, 
        required: true
    },
    payslipData: { 
        type: String, 
        required: true 
    },
    salaryMonth: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}$/ 
    },
    paydayType: { 
        type: String, 
        enum: ['mid-month', 'end-of-month'], 
        required: true 
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid'],
        default: 'pending',
        required: true
    }
},
{ 
    indexes: [
        { key: { employeeId: 1, salaryMonth: 1, paydayType: 1 }, unique: true }
    ] 
});

export const Payslip = model('Payslip', paySlipSchema);