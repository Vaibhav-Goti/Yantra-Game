import  ErrorHandler from '../utils/errorHandler.js'
import moment from 'moment-timezone';
import {logger} from '../app/app.js';

export default (err, req, res, next) => {
    // console.log(err);
    
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    err.data = err.data || null;

    // Wrong Mongodb Id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again `;
        err = new ErrorHandler(message, 400);
    }

    // JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, Try again `;
        err = new ErrorHandler(message, 400);
    }

    if (err.code === 413) {
        err = new ErrorHandler('File size limit has been reached', 413); // 413 Payload Too Large
    }

    // 🔥 Log the error
    const logInfo = {
        timestamp: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
        method: req.method,
        url: req.originalUrl,
        status: err.statusCode,
        error: err.message,
        responseTime: "-", // optional
        requestBody: req.body,
        response: { error: err.message }
    };

    logger.error({ message: logInfo }); // logs to console + file

    res.status(err.statusCode).json({
        success: false,
        statusCode: err.statusCode,
        message: err.message,
        data: err.data,
    });
};