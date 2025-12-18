import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
import crypto from 'crypto';

/**
 * Middleware to authenticate requests from Telegram bot
 * Supports two authentication methods:
 * 1. X-API-Key header: X-API-Key: <your-api-key>
 * 2. Authorization header: Authorization: Bearer <your-api-key>
 */
export const telegramAuthMiddleware = catchAsyncError(async (req, res, next) => {
    // Get API key from environment variable
    const expectedApiKey = process.env.TELEGRAM_API_KEY;
    
    if (!expectedApiKey) {
        console.error('TELEGRAM_API_KEY is not set in environment variables');
        return next(new ErrorHandler('Server configuration error: API key not configured', 500));
    }

    // Try to get API key from X-API-Key header first
    let providedApiKey = req.header('X-API-Key');
    
    // If not found, try Authorization header with Bearer token
    if (!providedApiKey) {
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            providedApiKey = authHeader.replace('Bearer ', '');
        }
    }

    // Check if API key is provided
    if (!providedApiKey) {
        return next(new ErrorHandler('API key is required. Provide it via X-API-Key header or Authorization: Bearer <key>', 401));
    }

    // Securely compare API keys to prevent timing attacks
    // Both buffers must be the same length for timingSafeEqual
    const providedKeyBuffer = Buffer.from(providedApiKey);
    const expectedKeyBuffer = Buffer.from(expectedApiKey);
    
    // If lengths differ, keys are definitely not equal
    if (providedKeyBuffer.length !== expectedKeyBuffer.length) {
        return next(new ErrorHandler('Invalid API key. Access denied.', 401));
    }

    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(providedKeyBuffer, expectedKeyBuffer);

    if (!isValid) {
        return next(new ErrorHandler('Invalid API key. Access denied.', 401));
    }

    // Authentication successful, proceed to next middleware
    next();
});

export default telegramAuthMiddleware;

