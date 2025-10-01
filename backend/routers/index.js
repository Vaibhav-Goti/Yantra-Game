import { Router } from "express";
const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World!')
})

import userRouter from '../routers/user.router.js'
router.use('/api/v1', userRouter)

import authRouter from '../routers/auth.router.js'
router.use('/api/v1', authRouter)

import machineRouter from '../routers/machine.router.js'
router.use('/api/v1/machine', machineRouter)

import timeFrameRouter from '../routers/timeFrame.router.js'
router.use('/api/v1/timeframe', timeFrameRouter)

import hardwareRouter from '../routers/hardware.router.js'
router.use('/api/v1/hardware', hardwareRouter)

import dashboardRouter from '../routers/dashboard.router.js'
router.use('/api/v1/dashboard', dashboardRouter)

export default router;