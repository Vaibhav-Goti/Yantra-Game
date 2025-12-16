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

// import masterWinnerTimeframeRouter from './masterWinnerTimeframe.router.js'
// router.use('/api/v1/masterwinner', masterWinnerTimeframeRouter)

import winnerRuleRouter from '../routers/winnerRule.router.js'
router.use('/api/v1/winnerrule', winnerRuleRouter)

import jackpotWinnerRouter from '../routers/jackpotWinner.router.js'
router.use('/api/v1/jackpotwinner', jackpotWinnerRouter)

// version 2.0 features
import hardwareV2Router from '../routers/hardwareV2.router.js'
router.use('/api/v2/hardware', hardwareV2Router)

import machineV2Router from '../routers/machine.router.v2.js'
router.use('/api/v2/machine', machineV2Router)

export default router;