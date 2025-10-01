import moment from 'moment-timezone';
import mongoose from 'mongoose';

/**
 * Recursively format all date fields in a response to Asia/Kolkata timezone
 * @param {any} data - Data to format
 * @returns {any} Formatted data with Kolkata timezone dates
 */

export const formatResponseWithKolkataTime = (data) => {
    if (!data) return data;

    // If data is a Date object
    if (data instanceof Date) {
        return moment(data).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    }

    // If data is a string that looks like ISO date
    if (typeof data === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z/.test(data)) {
        return moment(data).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    }

    // If data is an array, recursively process each item
    if (Array.isArray(data)) {
        return data.map(item => formatResponseWithKolkataTime(item));
    }

    // If data is an object (plain object or Mongoose doc)
    if (typeof data === 'object') {

        if (data instanceof mongoose.Types.ObjectId || Buffer.isBuffer(data)) {
            return data;
        }
        // Convert Mongoose doc to plain object if needed
        if (data._doc || data.toObject) {
            data = data.toObject ? data.toObject() : data._doc;
        }

        const formatted = {};
        for (const key in data) {
            if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

            const value = data[key];

            // Recursively process every value
            formatted[key] = formatResponseWithKolkataTime(value);
        }
        return formatted;
    }

    // For primitives, return as-is
    return data;
};


/**
 * Get current time in Asia/Kolkata timezone as string
 * @returns {string} Current time in Kolkata timezone
 */
export const getCurrentKolkataTimeString = () => {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Convert UTC date to Asia/Kolkata timezone string
 * @param {Date|string} date - UTC date to convert
 * @returns {string} Kolkata timezone formatted string
 */
export const convertUTCToKolkataString = (date) => {
    if (!date) return date;
    return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
};
