import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const USERNAME_INVALID_CHARACTERS = ' ?;:,.`\'"(){}[]|\\/';

function usernameValidator(value) {
    for (let i = 0; i < USERNAME_INVALID_CHARACTERS.length; i++) {
        if (value.includes(USERNAME_INVALID_CHARACTERS[i])) {
            return false;
        }
    }
    return true;
}

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const employeeSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    empNo: { 
        type: String, 
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true,
    },
    firstName: { type: String, required: true },
    middleName: { type: String, default: '' },
    lastName: { type: String, required: true },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minLength: [4, 'Username must be at least 4 characters long'],
        validate: [usernameValidator, 'Username contains invalid characters'],
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [emailRegex, 'Please enter a valid email address'],
    },
    password: { 
        type: String, 
        required: true,
        minLength: [8, 'Password must be at least 8 characters long'],
    },
    profilePicture: { type: String, default: null },
    birthday: { type: Date, required: false, default: null },
    position: { 
        type: Schema.Types.ObjectId, 
        ref: 'Position', 
        required: false
    },
    salary: { type: Number, required: true, min: 0 },
    hourlyRate: { type: Number, default: 0 },
    contactInfo: { type: String, required: false },
    sss: { type: String, default: '' },
    philhealth: { type: String, default: '' },
    pagibig: { type: String, default: '' },
    tin: { type: String, default: '' },
    civilStatus: { 
        type: String, 
        enum: ['Single', 'Married', 'Separated', 'Widowed'], 
        default: 'Single' 
    },
    role: { 
        type: String, 
        enum: ['admin', 'employee'], 
        default: 'employee' 
    },
    hireDate: { 
        type: Date, 
        default: Date.now, 
        required: true 
    },
    earnings: {
        travelExpenses: { type: Number, default: 0 },
        otherEarnings: { type: Number, default: 0 },
    },
    payheads: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'Payhead' 
        }
    ],
    commission: { type: Number, default: 0 },
    profitSharing: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    thirteenthMonthPay: { type: Number, default: 0 },
    hazardPay: { type: Number, default: 0 },
    overtimeHours: {
        regular: { type: Number, default: 0 },
        holiday: { type: Number, default: 0 },
    },
    nightShiftDiff: { type: Number, default: 0 },
    deMinimis: { type: Number, default: 0 },
    otherTaxable: { type: Number, default: 0 },
    paidLeaves: {
        days: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    absences: {
        days: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
    },  
    trashedAt: {
        type: Date
    }
}, { timestamps: true });

employeeSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const Employee = model('Employee', employeeSchema);