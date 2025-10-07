import mongoose from 'mongoose';

const masterWinnerTimeFameSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    }
});

masterWinnerTimeFameSchema.index({ machineId: 1, date: 1 });
masterWinnerTimeFameSchema.virtual('machine', {
    ref: 'Machine',
    localField: 'machineId',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
masterWinnerTimeFameSchema.set('toJSON', { virtuals: true });
masterWinnerTimeFameSchema.set('toObject', { virtuals: true });

const MasterWinnerTimeFrame = mongoose.model('MasterWinnerTimeFrame', masterWinnerTimeFameSchema);

export default MasterWinnerTimeFrame;