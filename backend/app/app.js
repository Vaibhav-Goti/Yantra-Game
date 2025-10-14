import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import winston from "winston";
import moment from 'moment-timezone';
import fs from 'fs';
import chalk from 'chalk';
dotenv.config();

import '../config/dbConnect.js';
import { responseFormatter } from '../middlewares/responseFormatter.js';

// machine status job
import machineStatusJobs from '../jobs/machineStatusJobs.js';
machineStatusJobs();

if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}
const app = express()

// Logger
export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
        })
    ),
    transports: [
        // File transport (full JSON)
        new winston.transports.File({
            filename: "logs/combined.log",
            format: winston.format.combine(
                winston.format.json()
            )
        }),
        // Console transport (pretty print)
        new winston.transports.Console({
            format: winston.format.printf(info => {
                let logData = info.message;
                if (typeof logData !== 'object') logData = {};

                const { timestamp, method, url, status, responseTime, requestBody, response, error } = logData;

                // Color status code
                let statusColor = chalk.white;
                if (status >= 500) statusColor = chalk.red;
                else if (status >= 400) statusColor = chalk.yellow;
                else if (status >= 200) statusColor = chalk.green;

                // Color method
                let methodColor = chalk.green;
                if (method === 'POST') methodColor = chalk.yellowBright;
                if (method === 'DELETE') methodColor = chalk.redBright;

                return `${chalk.gray(timestamp)} | ${methodColor(method)} ${url} | Status: ${statusColor(status)} | Time: ${chalk.magenta(responseTime)} | Error: ${chalk.red(error)}`;
            })
        })
    ]
});


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(responseFormatter) // Apply timezone formatting to all responses

// Logger middleware
app.use((req, res, next) => {
    const start = Date.now();
    const oldSend = res.send;

    res.send = function (data) {
        const responseTime = Date.now() - start;
        const isResponseError = res.statusCode >= 400;

        if (!isResponseError) {
            let responseData;
            try {
                responseData = JSON.parse(data);
            } catch (err) {
                responseData = data;
            }

            // Full log object
            const logInfo = {
                timestamp: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                responseTime: `${responseTime}ms`,
                requestBody: req.body,
                response: responseData
            };

            logger.info(logInfo); // logs to both file and console
        }
        // Restore original send
        res.send = oldSend;
        return res.send(data);
    };

    next();
});

// routes
import indexRouter from '../routers/index.js'
app.use('/', indexRouter)

import errorMiddleware from '../middlewares/error.js'
app.use(errorMiddleware)

export default app