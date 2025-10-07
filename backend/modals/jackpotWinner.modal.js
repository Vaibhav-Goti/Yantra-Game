import mongoose from 'mongoose';

const jackpotWinnerSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true,
    },
    startTime: {
        type: String, // e.g., "10:00"
        required: true,
    },
    endTime: {
        type: String, // e.g., "10:30"
        required: true,
    },
    maxWinners: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model('JackpotWinner', jackpotWinnerSchema);
