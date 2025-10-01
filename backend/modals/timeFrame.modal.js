import mongoose from 'mongoose';

const timeFrameSchema = new mongoose.Schema({
    time: {
        type: String,
        required: [true, 'Time is required'],
        trim: true,
    },
    percentage: {
        type: Number,
        required: [true, 'Percentage is required'],
        min: [0, 'Percentage cannot be less than 0'],
        // max: [100, 'Percentage cannot be greater than 100']
    },
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: [true, 'Machine reference is required']
    },
}, {
    timestamps: true
});

// Index for better query performance
timeFrameSchema.index({ machineId: 1, date: 1 });
timeFrameSchema.index({ time: 1 });
timeFrameSchema.index({ percentage: 1 });

// Virtual to populate machine details
timeFrameSchema.virtual('machine', {
    ref: 'Machine',
    localField: 'machineId',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
timeFrameSchema.set('toJSON', { virtuals: true });
timeFrameSchema.set('toObject', { virtuals: true });

const TimeFrame = mongoose.model('TimeFrame', timeFrameSchema);

export default TimeFrame;
