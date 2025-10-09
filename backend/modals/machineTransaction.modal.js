import mongoose from 'mongoose';

const machineTransactionSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    sessionId: {
        type: String, // optional, link to game session
        default: null
    },
    addedAmountToMachine: {
        type: Number,
        default: 0,
        min: 0
    },
    withdrawnAmountFromMachine: {
        type: Number,
        default: 0,
        min: 0
    },
    totalBetAmount: {
        type: Number,
        // required: true,
        min: 0
    },
    finalAmount: {
        type: Number,
        // required: true,
    },
    applyPercentageDeducted: {
        type: Number,
        default: 0
    },
    applyPercentageValue: {
        type: Number,
        default: 0
    },
    deductedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    unusedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAdded: {
        type: Number,
        default: 0,
        min: 0
    },
    payoutAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    percentageDeducted: {
        type: Number,
        default: 0
    },
    remainingBalance: {
        type: Number,
        required: true, // mandatory to track balance after operation
        min: 0
    },
    note: {
        type: String,
        trim: true
    },
    winnerTypes: [{
        type: String,
        enum: ['regular', 'jackpot', 'manual']
    }],
}, {
    timestamps: true
});

// Index for fast lookup
machineTransactionSchema.index({ machineId: 1, createdAt: -1 });

const MachineTransaction = mongoose.model('MachineTransaction', machineTransactionSchema);
export default MachineTransaction;
