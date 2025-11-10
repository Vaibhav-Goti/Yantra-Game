import mongoose from 'mongoose';

const jackpotWinnerSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true,
    },
    startTime: {
        type: String, // e.g., "10:00"
        required: false,
    },
    endTime: {
        type: String, // e.g., "10:30"
        required: false,
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

jackpotWinnerSchema.virtual('appliedInSessions', {
    ref: 'GameSession',
    localField: '_id',
    foreignField: 'appliedRule.ruleId',
    justOne: true
});

jackpotWinnerSchema.set('toJSON', { virtuals: true });
jackpotWinnerSchema.set('toObject', { virtuals: true });

export default mongoose.model('JackpotWinner', jackpotWinnerSchema);
