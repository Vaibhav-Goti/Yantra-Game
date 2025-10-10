import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
    machineName: {
        type: String,
        required: [true, 'Machine name is required'],
        trim: true,
        maxlength: [100, 'Machine name cannot exceed 100 characters']
    },
    machineNumber: {
        type: String,
        required: [true, 'Machine number is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Machine number cannot exceed 50 characters']
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Maintenance'],
        default: 'Active'
    },
    location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    depositAmount: {
        type: Number,
        required: [true, 'Deposit amount is required'],
        min: [0, 'Deposit amount cannot be negative'],
        default: 0,
        validate: {
            validator: function(value) {
                return value >= 0;
            },
            message: 'Deposit amount must be 0 or greater'
        }
    },
    lastActive: {
        type: Date,
        default: null
    },
    isMachineOffline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
// machineSchema.index({ machineNumber: 1 });
machineSchema.index({ machineName: 1 });

const Machine = mongoose.model('Machine', machineSchema);

export default Machine;
