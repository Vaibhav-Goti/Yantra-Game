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

winnerRuleSchema.virtual('appliedInSessions', {
    ref: 'GameSession',           // The model to populate
    localField: '_id',            // _id of WinnerRule
    foreignField: 'appliedRule.ruleId', // field in GameSession
    justOne: true                // many sessions can use this rule
});

winnerRuleSchema.set('toJSON', { virtuals: true });
winnerRuleSchema.set('toObject', { virtuals: true });

export default mongoose.model('WinnerRule', winnerRuleSchema);
