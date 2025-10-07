import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    startTime: {
        type: String,
        // required: true,
        trim: true
    },
    endTime: {
        type: String,
        // required: true,
        trim: true
    },
    totalDuration: {
        type: Number, // in seconds
        // required: true
    },
    buttonPresses: [{
        buttonNumber: {
            type: Number,
            // required: true,
            min: 1,
            max: 12 // Assuming max 10 buttons per machine
        },
        pressCount: {
            type: Number,
            // required: true,
            min: 0
        },
        totalAmount: {
            type: Number,
            // required: true,
            min: 0
        },
    }],
    gameTimeFrames: [{
        time: {
            type: String,
            // required: true
        },
        percentage: {
            type: Number,
            // required: true,
            min: 0,
            // max: 100
        },
        deductedPercentage: {
            type: Number,
            default: 0
        },
        remainingPercentage: {
            type: Number,
            // required: true
        }
    }],
    totalBetAmount: {
        type: Number,
        // required: true,
        min: 0
    },
    totalDeductedAmount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        // required: true,
    },
    winners: [{
        buttonNumber: {
            type: Number,
            // required: true
        },
        amount: {
            type: Number,
            // required: true
        },
        payOutAmount: {
            type: Number,
            // required: true
        },
        isWinner: {
            type: Boolean,
            default: false
        },
        winnerType: {
            type: String,
            enum: ['regular', 'jackpot', 'manual'],
            default: 'regular'
        }
    }],
    // 👇 new tracking fields
    unusedAmount: {
        type: Number,
        default: 0
    },
    totalAdded: {
        type: Number,
        default: 0
    },
    adjustedDeductedAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
gameSessionSchema.index({ sessionId: 1 });
gameSessionSchema.index({ machineId: 1, createdAt: -1 });
gameSessionSchema.index({ status: 1 });

// Virtual to populate machine details
gameSessionSchema.virtual('machine', {
    ref: 'Machine',
    localField: 'machineId',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
gameSessionSchema.set('toJSON', { virtuals: true });
gameSessionSchema.set('toObject', { virtuals: true });

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
