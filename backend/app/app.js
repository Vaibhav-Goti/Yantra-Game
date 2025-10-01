import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();

import '../config/dbConnect.js';
import { responseFormatter } from '../middlewares/responseFormatter.js';


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(responseFormatter) // Apply timezone formatting to all responses

// routes
import indexRouter from '../routers/index.js'
app.use('/', indexRouter)

import errorMiddleware from '../middlewares/error.js'
app.use(errorMiddleware)

export default app