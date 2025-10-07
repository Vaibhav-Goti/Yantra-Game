import mongoose from 'mongoose';

const winnerRuleSchema = new mongoose.Schema({
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
    allowedButtons: {
        type: [Number], // e.g., [5, 6, 9]
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.model('WinnerRule', winnerRuleSchema);
