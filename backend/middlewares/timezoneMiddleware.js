import moment from 'moment-timezone';

/**
 * Mongoose middleware to automatically set createdAt and updatedAt fields
 * to Asia/Kolkata timezone before saving or updating documents
 * @param {mongoose.Schema} schema - Mongoose schema to apply middleware to
 */
export const kolkataTimezoneMiddleware = (schema) => {
    // Pre-save middleware to set timestamps in Kolkata timezone
    schema.pre('save', function(next) {
        const now = moment().tz('Asia/Kolkata').toDate();
        
        if (this.isNew) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        
        next();
    });

    // Pre-update middleware for findOneAndUpdate, updateOne, updateMany
    schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
        const now = moment().tz('Asia/Kolkata').toDate();
        this.set({ updatedAt: now });
        next();
    });
};
