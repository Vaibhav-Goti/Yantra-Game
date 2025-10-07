import moment from 'moment';

// Time utility functions for timeframe management using Moment.js

/**
 * Validate time format using Moment.js
 * @param {string} timeString - Time string to validate
 * @param {string} format - Expected format (default: 'HH:mm')
 * @returns {boolean} True if valid
 */
export const isValidTimeFormat = (timeString, format = 'HH:mm') => {
    if (typeof timeString !== 'string') return false;
    
    const supportedFormats = ['HH:mm', 'H:mm', 'HH:mm:ss', 'H:mm:ss'];
    return moment(timeString, supportedFormats, true).isValid();
};

/**
 * Get current time in specified format
 * @param {string} format - Time format (default: 'HH:mm')
 * @returns {string} Current time
 */
export const getCurrentTime = (format = 'HH:mm') => {
    return moment().format(format);
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time
 */
export const getCurrentTimeHHMM = () => {
    return moment().format('HH:mm');
};

/**
 * Get current time in HH:MM:SS format
 * @returns {string} Current time
 */
export const getCurrentTimeHHMMSS = () => {
    return moment().format('HH:mm:ss');
};

/**
 * Format time using Moment.js
 * @param {string} timeString - Input time string
 * @param {string} inputFormat - Input format (default: 'HH:mm')
 * @param {string} outputFormat - Output format (default: 'HH:mm')
 * @returns {string} Formatted time
 */
export const formatTime = (timeString, inputFormat = 'HH:mm', outputFormat = 'HH:mm') => {
    const momentTime = moment(timeString, inputFormat, true);
    if (!momentTime.isValid()) {
        throw new Error(`Invalid time format: ${timeString}`);
    }
    return momentTime.format(outputFormat);
};

/**
 * Convert seconds to HH:MM:SS format using Moment.js
 * @param {number} seconds - Number of seconds
 * @returns {string} Time in HH:MM:SS format
 */
export const secondsToHHMMSS = (seconds) => {
    if (typeof seconds !== 'number' || seconds < 0) {
        throw new Error('Seconds must be a positive number');
    }
    
    const duration = moment.duration(seconds, 'seconds');
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const remainingSeconds = duration.seconds();
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Convert seconds to HH:MM format using Moment.js
 * @param {number} seconds - Number of seconds
 * @returns {string} Time in HH:MM format
 */
export const secondsToHHMM = (seconds) => {
    if (typeof seconds !== 'number' || seconds < 0) {
        throw new Error('Seconds must be a positive number');
    }
    
    const duration = moment.duration(seconds, 'seconds');
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Convert HH:MM to seconds using Moment.js
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Total seconds
 */
export const HHMMToSeconds = (timeString) => {
    const momentTime = moment(timeString, 'HH:mm', true);
    if (!momentTime.isValid()) {
        throw new Error(`Invalid time format: ${timeString}. Expected HH:MM`);
    }
    
    const duration = moment.duration({
        hours: momentTime.hours(),
        minutes: momentTime.minutes()
    });
    
    return duration.asSeconds();
};

/**
 * Convert HH:MM:SS to seconds using Moment.js
 * @param {string} timeString - Time in HH:MM:SS format
 * @returns {number} Total seconds
 */
export const HHMMSSToSeconds = (timeString) => {
    const momentTime = moment(timeString, 'HH:mm:ss', true);
    if (!momentTime.isValid()) {
        throw new Error(`Invalid time format: ${timeString}. Expected HH:MM:SS`);
    }
    
    const duration = moment.duration({
        hours: momentTime.hours(),
        minutes: momentTime.minutes(),
        seconds: momentTime.seconds()
    });
    
    return duration.asSeconds();
};

/**
 * Calculate time difference between two times using Moment.js
 * @param {string} startTime - Start time in HH:MM or HH:MM:SS format
 * @param {string} endTime - End time in HH:MM or HH:MM:SS format
 * @returns {object} Difference object with seconds, minutes, hours
 */
export const calculateTimeDifference = (startTime, endTime) => {
    let startMoment, endMoment;
    
    // Determine format and parse times
    if (startTime.includes(':') && startTime.split(':').length === 2) {
        startMoment = moment(startTime, 'HH:mm', true);
    } else {
        startMoment = moment(startTime, 'HH:mm:ss', true);
    }
    
    if (endTime.includes(':') && endTime.split(':').length === 2) {
        endMoment = moment(endTime, 'HH:mm', true);
    } else {
        endMoment = moment(endTime, 'HH:mm:ss', true);
    }
    
    if (!startMoment.isValid()) {
        throw new Error(`Invalid start time format: ${startTime}`);
    }
    if (!endMoment.isValid()) {
        throw new Error(`Invalid end time format: ${endTime}`);
    }
    
    const duration = moment.duration(endMoment.diff(startMoment));
    
    return {
        seconds: duration.asSeconds(),
        minutes: duration.asMinutes(),
        hours: duration.asHours(),
        formatted: secondsToHHMMSS(Math.abs(duration.asSeconds()))
    };
};

/**
 * Check if a time is between two other times using Moment.js
 * @param {string} timeToCheck - Time to check in HH:MM format
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {boolean} True if time is between start and end
 */
export const isTimeBetween = (timeToCheck, startTime, endTime) => {
    const checkTime = moment(timeToCheck, 'HH:mm', true);
    const start = moment(startTime, 'HH:mm', true);
    const end = moment(endTime, 'HH:mm', true);
    
    if (!checkTime.isValid() || !start.isValid() || !end.isValid()) {
        throw new Error('Invalid time format. Expected HH:MM');
    }
    
    return checkTime.isBetween(start, end, null, '[]'); // inclusive
};

/**
 * Add minutes to a time using Moment.js
 * @param {string} timeString - Base time in HH:MM format
 * @param {number} minutes - Minutes to add
 * @returns {string} New time in HH:MM format
 */
export const addMinutesToTime = (timeString, minutes) => {
    const momentTime = moment(timeString, 'HH:mm', true);
    if (!momentTime.isValid()) {
        throw new Error(`Invalid time format: ${timeString}. Expected HH:MM`);
    }
    
    return momentTime.add(minutes, 'minutes').format('HH:mm');
};

/**
 * Subtract minutes from a time using Moment.js
 * @param {string} timeString - Base time in HH:MM format
 * @param {number} minutes - Minutes to subtract
 * @returns {string} New time in HH:MM format
 */
export const subtractMinutesFromTime = (timeString, minutes) => {
    const momentTime = moment(timeString, 'HH:mm', true);
    if (!momentTime.isValid()) {
        throw new Error(`Invalid time format: ${timeString}. Expected HH:MM`);
    }
    
    return momentTime.subtract(minutes, 'minutes').format('HH:mm');
};

/**
 * Get time ranges for a machine based on existing timeframes
 * @param {Array} timeFrames - Array of timeframe objects
 * @returns {Array} Array of time ranges
 */
export const getTimeRanges = (timeFrames) => {
    if (!Array.isArray(timeFrames)) {
        throw new Error('TimeFrames must be an array');
    }
    
    return timeFrames.map(timeframe => {
        const startTime = moment(timeframe.time, 'HH:mm', true);
        if (!startTime.isValid()) {
            throw new Error(`Invalid time format in timeframe: ${timeframe.time}`);
        }
        
        return {
            ...timeframe,
            timeMoment: startTime,
            timeFormatted: startTime.format('HH:mm'),
            time12Hour: startTime.format('h:mm A')
        };
    }).sort((a, b) => a.timeMoment.diff(b.timeMoment));
};

export const isValidateTimeFormat = (time) => {
    return moment(time, 'HH:mm', true).isValid();
};

export const formatTimeToHHMM = (time) => {
    return moment(time, 'HH:mm', true).format('HH:mm');
};

export const validateDateFormat = (time) => {
    if (!time) return false;
    return moment(time, 'DD/MM/YYYY', true).isValid();
};

export const formatDate = (date) => {
    return moment(date, 'DD/MM/YYYY', true).format('DD/MM/YYYY');
};

export const formatDate12Hour = (date) => {
    return moment(date, 'DD/MM/YYYY', true).format('DD/MM/YYYY h:mm A');
};
