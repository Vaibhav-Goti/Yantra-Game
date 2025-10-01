import moment from 'moment-timezone';

/**
 * Get current time in Asia/Kolkata timezone
 * @returns {moment.Moment} Current time in Kolkata timezone
 */
export const getCurrentTime = () => {
    return moment().tz('Asia/Kolkata');
};

/**
 * Format a date to Asia/Kolkata timezone
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
export const formatKolkataTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    return moment(date).tz('Asia/Kolkata').format(format);
};

/**
 * Convert UTC date to Asia/Kolkata timezone string
 * @param {Date|string} date - UTC date to convert
 * @returns {string} Kolkata timezone formatted string
 */
export const convertUTCToKolkata = (date) => {
    if (!date) return date;
    return moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
};
