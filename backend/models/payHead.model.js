import mongoose from "mongoose";
const { Schema, model } = mongoose;

const payHeadSchema = new Schema({
    id: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: [
            'Earnings',
            'Deductions'
        ],
        required: true
    }
});

export const PayHead = model('PayHead', payHeadSchema);