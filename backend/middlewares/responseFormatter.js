import { formatResponseWithKolkataTime } from '../utils/responseUtils.js';

/**
 * Middleware to automatically format all API responses with Kolkata timezone
 * This ensures all date fields in responses are converted to Asia/Kolkata timezone
 */
export const responseFormatter = (req, res, next) => {
    // Store the original json method
    const originalJson = res.json;

    // Override the json method to format responses
    res.json = function(data) {
        try {
            // Only format if it's a successful response with data
            if (data && typeof data === 'object' && data.success !== false) {
                // Format the main data if it exists
                if (data.data) {
                    data.data = formatResponseWithKolkataTime(data.data);
                }
                
                // Format pagination data if it exists
                if (data.pagination) {
                    data.pagination = formatResponseWithKolkataTime(data.pagination);
                }

                // Format any other nested objects that might contain dates
                if (data.stats) {
                    data.stats = formatResponseWithKolkataTime(data.stats);
                }

                // Format the entire response if it contains date fields
                if (data.createdAt || data.updatedAt) {
                    data = formatResponseWithKolkataTime(data);
                }
            }
        } catch (error) {
            // If formatting fails, log the error but don't break the response
            console.error('Error formatting response with Kolkata timezone:', error);
        }
        
        // Call the original json method
        return originalJson.call(this, data);
    };

    next();
};
