import mongoose from "mongoose";
const { Schema, model } = mongoose;

const positionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Position = model('Position', positionSchema);