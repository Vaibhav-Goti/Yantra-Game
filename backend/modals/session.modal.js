import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    refreshTokenHashed: {
        type: String,
        default: null,
        // index: true
    },
    // 🔁 rotation chain (for reuse detection)
    replacedByToken: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    deviceInfo: {
        type: String,
        default: null
    },
    expiresAt: {
        type: Date,
        required: true,
        // index: true,
        expires: 0 // MongoDB TTL index - automatically deletes expired sessions
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for efficient queries
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
