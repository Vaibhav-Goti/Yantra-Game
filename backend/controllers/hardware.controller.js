import catchAsyncError from "../middlewares/catchAsyncError.js";
import GameSession from "../modals/gameSession.modal.js";
import Machine from "../modals/machine.modal.js";
import TimeFrame from "../modals/timeFrame.modal.js";
import MachineTransaction from "../modals/machineTransaction.modal.js";
import WinnerRule from "../modals/winnerRule.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import moment from 'moment';
import {
    calculateGameDuration,
    findRelevantTimeFrames,
    calculateDeduction,
    calculateFinalAmounts,
    determineWinners,
    validateGameSession,
    generateSessionId
} from "../utils/gameUtils.js";
import jackpotWinnerModal from "../modals/jackpotWinner.modal.js";
import { io } from '../server.js';

// store button presses
export const startGameSession = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.body;

    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    // Update machine active status based on timestamp
    const now = moment().tz('Asia/Kolkata').toDate();
    machine.lastActive = now;
    machine.isMachineOffline = false;
    await machine.save();

    const sessionId = generateSessionId();
    const gameSession = new GameSession({ machineId, sessionId, status: 'Active' });

    // Initialize button presses for all 12 buttons with zero counts
    gameSession.buttonPresses = Array.from({ length: 12 }, (_, i) => ({
        buttonNumber: i + 1,
        pressCount: 0,
        totalAmount: 0
    }));
    gameSession.status = 'Active';
    gameSession.startTime = moment().tz("Asia/Kolkata").format("HH:mm");
    gameSession.endTime = moment().tz("Asia/Kolkata").format("HH:mm");
    gameSession.totalDuration = 0;
    gameSession.gameTimeFrames = [];
    gameSession.totalBetAmount = 0;
    gameSession.totalDeductedAmount = 0;
    gameSession.finalAmount = 0;
    gameSession.winners = [];
    gameSession.unusedAmount = 0;
    gameSession.totalAdded = 0;
    gameSession.adjustedDeductedAmount = 0;
    await gameSession.save();

    // Populate machine details for Socket.io event
    await gameSession.populate('machineId', 'machineName machineNumber status location');

    // Emit full session data to all clients
    io.emit('gameSessionStarted', {
        sessionId: gameSession.sessionId,
        machineId: gameSession.machineId._id.toString(),
        isLive: true,
        session: gameSession.toObject()
    });

    res.status(200).json({
        success: true,
        message: 'Game session started successfully',
        data: gameSession.sessionId
    });
});

export const storeButtonPresses = catchAsyncError(async (req, res, next) => {
    // const { sessionId, buttonPresses } = req.body;
    const { sessionId, buttonNumber, pressCount } = req.body;
    const gameSession = await GameSession.findOne({ sessionId });
    if (!gameSession) {
        return next(new ErrorHandler('Game session not found', 404));
    }

    await GameSession.findOneAndUpdate(
        { sessionId, "buttonPresses.buttonNumber": buttonNumber },
        {
            $set: {
                "buttonPresses.$.pressCount": pressCount,
            }
        },
        { new: true }
    )

    // Update machine active status based on timestamp
    const machineId = gameSession.machineId;
    const machine = await Machine.findById(machineId);
    if (machine) {
        const now = moment().tz('Asia/Kolkata').toDate();
        machine.lastActive = now;
        machine.isMachineOffline = false;
        await machine.save();
    }

    // gameSession.buttonPresses = buttonPresses;
    await gameSession.save();

    // Populate machine details for Socket.io event
    await gameSession.populate('machineId', 'machineName machineNumber status location');

    // Emit updated button presses to all clients
    io.emit('buttonPressesUpdated', {
        sessionId: gameSession.sessionId,
        machineId: gameSession.machineId._id.toString(),
        isLive: true,
        buttonPresses: gameSession.buttonPresses,
        session: gameSession.toObject()
    });

    res.status(200).json({
        success: true,
        message: 'Button presses stored successfully',
        data: gameSession.sessionId
    });
});

// Process button presses from hardware (WITH STORAGE - process and store results)
// export const processButtonPresses = catchAsyncError(async (req, res, next) => {
//     // const startTime = Date.now();
//     // const minimumTime = 10000; // 10 seconds
//     const { machineId, buttonPresses } = req.body;

//     // Generate current time in IST (Indian Standard Time), 24-hour HH:mm
//     const stopTime = moment().tz("Asia/Kolkata").format("HH:mm");
//     const now = moment().tz('Asia/Kolkata').toDate();
//     // console.log('stopTime', stopTime);
//     // console.log('stopTime', stopTime);

//     // Start database transaction for atomic operations
//     const session = await mongoose.startSession();
//     try {
//         session.startTransaction();

//         const machine = await Machine.findById(machineId).session(session);
//         if (!machine) {
//             throw new ErrorHandler('Machine not found', 404);
//         }
//         const balanceBeforeGame = machine.depositAmount;
//         console.log('machine', machine.depositAmount)

//         // Check if machine is active
//         if (machine.status !== 'Active') {
//             throw new ErrorHandler('Machine is not active', 400);
//         }

//         machine.lastActive = now;
//         machine.isMachineOffline = false;

//         // Find the relevant timeframe for this stop time
//         const stopMoment = moment(stopTime, 'HH:mm', true);
//         if (!stopMoment.isValid()) {
//             throw new ErrorHandler('Invalid stop time format', 400);
//         }

//         // // Validate game session data
//         // const validation = validateGameSession(req.body);
//         // if (!validation.isValid) {
//         //     return next(new ErrorHandler(validation.errors.join(', '), 400));
//         // }

//         // Calculate total bet amount
//         const totalBetAmount = buttonPresses.reduce((total, button) => {
//             return total + (button.pressCount * 10); // 10 rupees per press
//         }, 0);

//         // Calculate deduction amount first to check if machine has enough for the deduction
//         const timeFrames = await TimeFrame.find({ machineId }).sort({ time: 1 }).session(session);
//         // console.log('timeFrames', timeFrames);
//         if (timeFrames.length === 0) {
//             throw new ErrorHandler('No timeframes configured for this machine', 400);
//         }

//         const relevantTimeFrame = timeFrames.reduce((latest, tf) => {
//             const tfMoment = moment(tf.time, 'HH:mm');
//             return tfMoment.isSameOrBefore(stopMoment) ? tf : latest;
//         }, null) || timeFrames[timeFrames.length - 1];

//         // console.log('relevantTimeFrame', relevantTimeFrame);

//         // console.log('all time frame', timeFrames);
//         // console.log('relevent time', relevantTimeFrame);


//         // Calculate deduction amount
//         const deductionPercentage = relevantTimeFrame ? relevantTimeFrame.percentage : 0;
//         // const deductionAmount = (totalBetAmount * deductionPercentage) / 100;

//         // Calculate deduction
//         let deductionAmount = 0;
//         let deductionFromPlayers = true;

//         if (deductionPercentage <= 100) {
//             deductionAmount = (totalBetAmount * deductionPercentage) / 100;
//         } else {
//             deductionAmount = 0; // no deduction from players
//             deductionFromPlayers = false;
//         }

//         // Check if machine has enough for deduction/payout
//         if (machine.depositAmount < totalBetAmount && deductionFromPlayers) {
//             throw new ErrorHandler(
//                 `Insufficient deposit. Machine has ${machine.depositAmount} but needs ${totalBetAmount} for deduction`,
//                 400
//             );
//         }

//         // --- Amount calculation ---
//         const amountCalculation = calculateFinalAmounts(
//             buttonPresses,
//             deductionPercentage,
//             10 // per press
//         );

//         let isJackpotWinner = false;
//         let maxWinners = 1;
//         let appliedRule = null;

//         // Check if jackpot winner is active
//         const jackpotWinner = await jackpotWinnerModal.findOne({ machineId, active: true, startTime: { $lte: stopTime }, endTime: { $gte: stopTime } }).session(session);
//         // console.log('jackpotWinner', jackpotWinner)
//         if (jackpotWinner) {
//             const currentTime = moment(stopTime, "HH:mm");
//             const jackpotWinnerStartTime = moment(jackpotWinner.startTime, "HH:mm");
//             const jackpotWinnerEndTime = moment(jackpotWinner.endTime, "HH:mm");
//             if (currentTime.isSameOrAfter(jackpotWinnerStartTime) && currentTime.isSameOrBefore(jackpotWinnerEndTime)) {
//                 isJackpotWinner = true;
//                 maxWinners = jackpotWinner.maxWinners;
//             }
//             jackpotWinner.active = false;
//             await jackpotWinner.save({ session });
//             appliedRule = {
//                 ruleType: 'JackpotWinner',
//                 ruleId: jackpotWinner._id
//             };
//         }

//         // Check if winner rule is active
//         const winnerRule = await WinnerRule.findOne({ machineId, active: true,startTime: { $lte: stopTime }, endTime: { $gte: stopTime } }).session(session);
//         // console.log('winnerRule', winnerRule)
//         if (winnerRule) {
//             const currentTime = moment(stopTime, "HH:mm");
//             const winnerRuleStartTime = moment(winnerRule.startTime, "HH:mm");
//             const winnerRuleEndTime = moment(winnerRule.endTime, "HH:mm");
//             if (currentTime.isSameOrAfter(winnerRuleStartTime) && currentTime.isSameOrBefore(winnerRuleEndTime)) {
//                 amountCalculation.buttonResults = amountCalculation.buttonResults.map(button => {
//                     const isAllowed = winnerRule.allowedButtons.includes(button.buttonNumber);

//                     return {
//                         ...button,
//                         eligibleForWin: isAllowed,          // normal eligible button
//                         manualWin: isAllowed // flag for manual winner if manual:true
//                     };
//                 });
//                 winnerRule.active = false;
//                 await winnerRule.save({ session });
//                 appliedRule = {
//                     ruleType: 'WinnerRule',
//                     ruleId: winnerRule._id
//                 };
//             }
//         }

//         // Decide final pool to use for winners
//         // console.log('amountCalculation', amountCalculation)
//         const finalPool = deductionFromPlayers
//             ? amountCalculation.finalAmount   // when ≤100%
//             : amountCalculation.totalDeductedAmount;                 // when >100%

//         let finalAmount = finalPool;
//         let totatDeductedAmount = deductionFromPlayers ? amountCalculation.totalDeductedAmount : 0;
//         // Winners calculation
//         const winners = determineWinners(amountCalculation.buttonResults, finalPool, totalBetAmount, maxWinners, isJackpotWinner);

//         // Adjust deposit
//         let adjustedDeductedAmount = deductionAmount;
//         let totalAdded = 0;
//         let isManualWin = winners?.isManualWin || false;
//         const payoutAmount = winners?.winners.reduce((sum, winner) => sum + winner.payOutAmount, 0) || 0;

//         // if (isManualWin) {
//         //     console.log('isManualWin', isManualWin)
//         //     console.log('winners?.totalAdded', winners?.totalAdded)
//         //     totalAdded = winners?.totalAdded;
//         //     adjustedDeductedAmount = 0;
//         //     machine.depositAmount = Math.max(0, machine.depositAmount - totalAdded);
//         //     console.log('totalAdded', totalAdded)
//         //     console.log('adjustedDeductedAmount', adjustedDeductedAmount)
//         //     console.log('machine.depositAmount', machine.depositAmount)
//         // } else {
//         if (!deductionFromPlayers) {
//             // Payout above 100% must come from machine deposit
//             // console.log('finalPool', finalPool)
//             // console.log('winners?.unusedAmount', winners?.unusedAmount)
//             // console.log('winners?.totalAdded', winners?.totalAdded)
//             const extraPayout = finalPool - amountCalculation.totalBetAmount + winners?.totalAdded;
//             const unusedFinalAmount = winners?.unusedAmount || 0;
//             // console.log('extraPayout', extraPayout)
//             if (machine.depositAmount < extraPayout) {
//                 throw new ErrorHandler(
//                     `Insufficient machine deposit to cover extra payout. Needed ${extraPayout}, available ${machine.depositAmount}`,
//                     400
//                 );
//             }
//             const totalDeductedAmount = extraPayout - unusedFinalAmount;
//             // console.log('totalDeductedAmount', totalDeductedAmount)
//             machine.depositAmount = Math.max(0, machine.depositAmount - totalBetAmount + payoutAmount);
//             totalAdded = Math.max(0, finalPool - totalBetAmount - unusedFinalAmount);
//         } else {
//             // Track profits/losses
//             totalAdded = Math.max(0, winners?.totalAdded);
//             // adjustedDeductedAmount -= winners?.totalAdded;
//             adjustedDeductedAmount += winners?.unusedAmount;
//             // console.log('winners?.totalAdded', winners?.totalAdded)
//             // console.log('winners?.unusedAmount', winners?.unusedAmount)
//             // console.log('adjustedDeductedAmount', adjustedDeductedAmount)
//             // console.log('winners?.totalAdded', winners?.totalAdded)

//             // console.log('winners?.totalAddToWinnerToPressCount', winners?.totalAddToWinnerToPressCount)
//             if (winners?.totalAddToWinnerToPressCount > 0) {
//                 adjustedDeductedAmount = winners?.totalAdded - deductionAmount;
//                 machine.depositAmount = Math.max(0, machine.depositAmount - totalBetAmount + payoutAmount);
//                 console.log('winners?.totalAdded', machine.depositAmount, winners?.totalAdded)
//                 totalAdded = winners?.totalAdded;
//             } else {
//                 console.log('adjutedDeductedAmount', adjustedDeductedAmount)
//                 // Prevent negative deduction
//                 adjustedDeductedAmount = Math.abs(adjustedDeductedAmount);
//                 // console.log('adjustedDeductedAmount', adjustedDeductedAmount)
//                 machine.depositAmount = Math.max(0, machine.depositAmount - totalBetAmount + payoutAmount);
//                 totalAdded = Math.max(0, winners?.totalAdded);
//                 console.log('totalAdded', totalAdded)
//                 // console.log('machine.depositAmount', machine.depositAmount)
//             }
//         }
//         // }

//         // console.log('winners', winners)


//         // Generate session ID
//         const sessionId = generateSessionId();

//         // Create game session and store in database
//         const gameSession = new GameSession({
//             sessionId,
//             machineId,
//             startTime: stopTime, // Using stop time as the reference
//             endTime: stopTime,
//             totalDuration: 0, // Not applicable for this use case
//             balanceBeforeGame: balanceBeforeGame,
//             balanceAfterGame: machine.depositAmount,
//             buttonPresses: amountCalculation.buttonResults.map(button => ({
//                 buttonNumber: button.buttonNumber,
//                 pressCount: button.pressCount,
//                 totalAmount: button.finalAmount // Individual button amount (no deduction)
//             })),
//             gameTimeFrames: [{
//                 time: relevantTimeFrame.time,
//                 percentage: relevantTimeFrame.percentage,
//                 deductedPercentage: deductionPercentage,
//                 remainingPercentage: relevantTimeFrame.percentage - deductionPercentage
//             }],
//             totalBetAmount: amountCalculation.totalBetAmount,
//             totalDeductedAmount: Math.abs(totatDeductedAmount),
//             finalAmount: Math.abs(finalAmount),
//             winners: winners?.winners.filter(w => w.isWinner).map(winner => ({
//                 buttonNumber: winner.buttonNumber,
//                 amount: winner.amount,
//                 payOutAmount: winner.payOutAmount,
//                 isWinner: winner.isWinner,
//                 winnerType: winner.winnerType || 'regular'
//             })),
//             appliedRule: appliedRule,
//             // 👇 new tracking fields
//             unusedAmount: winners?.unusedAmount,
//             totalAdded: totalAdded,
//             adjustedDeductedAmount: adjustedDeductedAmount,
//             status: "Completed"
//         });

//         // Save machine with updated balance
//         await machine.save({ session });

//         // Create machine transaction record
//         const machineTransaction = new MachineTransaction({
//             machineId: machine._id,
//             sessionId: sessionId,
//             totalBetAmount: amountCalculation.totalBetAmount,
//             finalAmount: Math.abs(finalAmount),
//             deductedAmount: Math.abs(totatDeductedAmount),
//             unusedAmount: winners?.unusedAmount || 0,
//             totalAdded: totalAdded || 0,
//             payoutAmount: winners?.winners.reduce((sum, winner) => sum + winner.payOutAmount, 0) || 0,
//             percentageDeducted: adjustedDeductedAmount,
//             applyPercentageDeducted: deductionPercentage,
//             applyPercentageValue: amountCalculation.totalDeductedAmount,
//             remainingBalance: machine.depositAmount,
//             winnerTypes: winners?.winners.filter(w => w.isWinner).map(w => w.winnerType || 'regular') || [],
//             note: `Game session ${sessionId} - ${deductionFromPlayers ? 'Deduction from players' : 'Payout from machine deposit'}`
//         });

//         await machineTransaction.save({ session });

//         // Save game session
//         await gameSession.save({ session });

//         // Populate machine details
//         await gameSession.populate('machineId', 'machineName machineNumber status location');

//         // Commit transaction
//         await session.commitTransaction();

//         // const endTime = Date.now();
//         // const duration = endTime - startTime;
//         // console.log('startTime', startTime)
//         // console.log('endTime', endTime)
//         // console.log('duration', duration)
//         // if (duration < minimumTime) {
//         //     await new Promise(resolve => setTimeout(resolve, minimumTime - duration));
//         // }

//         // Return processed results WITH storage confirmation
//         res.status(201).json({
//             // success: true,
//             // message: 'Game processed and stored successfully',
//             data: {
//                 // sessionId: gameSession.sessionId,
//                 // machine: {
//                 //     _id: machine._id,
//                 //     machineName: machine.machineName,
//                 //     machineNumber: machine.machineNumber,
//                 //     status: machine.status,
//                 //     remainingDeposit: machine.depositAmount
//                 // },
//                 // stopTime: stopTime,
//                 // relevantTimeFrame: {
//                 //     time: relevantTimeFrame.time,
//                 //     percentage: relevantTimeFrame.percentage
//                 // },
//                 // balanceBeforeGame: balanceBeforeGame,
//                 // balanceAfterGame: machine.depositAmount,
//                 // totalBetAmount: amountCalculation.totalBetAmount,
//                 // totalDeductedAmount: Math.abs(totatDeductedAmount),
//                 // finalAmount: Math.abs(finalAmount),
//                 // deductionPercentage: deductionPercentage,
//                 // buttonResults: amountCalculation.buttonResults.map(button => ({
//                 //     buttonNumber: button.buttonNumber,
//                 //     pressCount: button.pressCount,
//                 //     buttonAmount: button.finalAmount // Individual button amount (no deduction)
//                 // })),
//                 winners: winners?.winners.filter(w => w.isWinner).map(winner => ({
//                     buttonNumber: winner.buttonNumber,
//                     amount: winner.amount,
//                     payOutAmount: winner.payOutAmount,
//                     isWinner: winner.isWinner,
//                     // winnerType: winner.winnerType || 'regular'
//                 })),
//                 // unusedAmount: winners?.unusedAmount,
//                 // totalAdded: totalAdded,
//                 // adjustedDeductedAmount,
//                 // processingTime: new Date().toISOString(),
//                 // storedAt: gameSession.createdAt
//             }
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         return next(error);
//     } finally {
//         await session.endSession();
//     }
// });

export const processButtonPresses = catchAsyncError(async (req, res, next) => {
    // const startTime = Date.now();
    // const minimumTime = 10000; // 10 seconds
    const { sessionId } = req.body;

    const gameSession = await GameSession.findOne({ sessionId });
    if (!gameSession) {
        return next(new ErrorHandler('Game session not found', 404));
    }
    const machineId = gameSession.machineId;
    const buttonPresses = gameSession.buttonPresses;

    // Generate current time in IST (Indian Standard Time), 24-hour HH:mm
    const stopTime = moment().tz("Asia/Kolkata").format("HH:mm");
    const now = moment().tz('Asia/Kolkata').toDate();
    // console.log('stopTime', stopTime);
    // console.log('stopTime', stopTime);

    // Start database transaction for atomic operations
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const machine = await Machine.findById(machineId).session(session);
        if (!machine) {
            throw new ErrorHandler('Machine not found', 404);
        }
        const balanceBeforeGame = machine.depositAmount;
        console.log('machine', machine.depositAmount)

        // Check if machine is active
        if (machine.status !== 'Active') {
            throw new ErrorHandler('Machine is not active', 400);
        }

        machine.lastActive = now;
        machine.isMachineOffline = false;

        // Find the relevant timeframe for this stop time
        const stopMoment = moment(stopTime, 'HH:mm', true);
        if (!stopMoment.isValid()) {
            throw new ErrorHandler('Invalid stop time format', 400);
        }

        // // Validate game session data
        // const validation = validateGameSession(req.body);
        // if (!validation.isValid) {
        //     return next(new ErrorHandler(validation.errors.join(', '), 400));
        // }

        // Calculate total bet amount
        const totalBetAmount = buttonPresses.reduce((total, button) => {
            return total + (button.pressCount * 10); // 10 rupees per press
        }, 0);

        // Calculate deduction amount first to check if machine has enough for the deduction
        const timeFrames = await TimeFrame.find({ machineId }).sort({ time: 1 }).session(session);
        // console.log('timeFrames', timeFrames);
        if (timeFrames.length === 0) {
            throw new ErrorHandler('No timeframes configured for this machine', 400);
        }

        const relevantTimeFrame = timeFrames.reduce((latest, tf) => {
            const tfMoment = moment(tf.time, 'HH:mm');
            return tfMoment.isSameOrBefore(stopMoment) ? tf : latest;
        }, null) || timeFrames[timeFrames.length - 1];

        // console.log('relevantTimeFrame', relevantTimeFrame);

        // console.log('all time frame', timeFrames);
        // console.log('relevent time', relevantTimeFrame);


        // Calculate deduction amount
        const deductionPercentage = relevantTimeFrame ? relevantTimeFrame.percentage : 0;
        // const deductionAmount = (totalBetAmount * deductionPercentage) / 100;

        // Calculate deduction
        let deductionAmount = 0;
        let deductionFromPlayers = true;

        if (deductionPercentage <= 100) {
            deductionAmount = (totalBetAmount * deductionPercentage) / 100;
        } else {
            deductionAmount = 0; // no deduction from players
            deductionFromPlayers = false;
        }

        // Check if machine has enough for deduction/payout
        if (machine.depositAmount < totalBetAmount && deductionFromPlayers) {
            throw new ErrorHandler(
                `Insufficient deposit. Machine has ${machine.depositAmount} but needs ${totalBetAmount} for deduction`,
                400
            );
        }

        // --- Amount calculation ---
        const amountCalculation = calculateFinalAmounts(
            buttonPresses,
            deductionPercentage,
            10 // per press
        );

        let isJackpotWinner = false;
        let maxWinners = 1;
        let appliedRule = null;

        // Check if jackpot winner is active
        const jackpotWinner = await jackpotWinnerModal.findOne({ machineId, active: true, startTime: { $lte: stopTime }, endTime: { $gte: stopTime } }).session(session);
        // console.log('jackpotWinner', jackpotWinner)
        if (jackpotWinner) {
            const currentTime = moment(stopTime, "HH:mm");
            const jackpotWinnerStartTime = moment(jackpotWinner.startTime, "HH:mm");
            const jackpotWinnerEndTime = moment(jackpotWinner.endTime, "HH:mm");
            if (currentTime.isSameOrAfter(jackpotWinnerStartTime) && currentTime.isSameOrBefore(jackpotWinnerEndTime)) {
                isJackpotWinner = true;
                maxWinners = jackpotWinner.maxWinners;
            }
            jackpotWinner.active = false;
            await jackpotWinner.save({ session });
            appliedRule = {
                ruleType: 'JackpotWinner',
                ruleId: jackpotWinner._id
            };
        }

        // Check if winner rule is active
        const winnerRule = await WinnerRule.findOne({ machineId, active: true, startTime: { $lte: stopTime }, endTime: { $gte: stopTime } }).session(session);
        // console.log('winnerRule', winnerRule)
        if (winnerRule) {
            const currentTime = moment(stopTime, "HH:mm");
            const winnerRuleStartTime = moment(winnerRule.startTime, "HH:mm");
            const winnerRuleEndTime = moment(winnerRule.endTime, "HH:mm");
            if (currentTime.isSameOrAfter(winnerRuleStartTime) && currentTime.isSameOrBefore(winnerRuleEndTime)) {
                amountCalculation.buttonResults = amountCalculation.buttonResults.map(button => {
                    const isAllowed = winnerRule.allowedButtons.includes(button.buttonNumber);

                    return {
                        ...button,
                        eligibleForWin: isAllowed,          // normal eligible button
                        manualWin: isAllowed // flag for manual winner if manual:true
                    };
                });
                winnerRule.active = false;
                await winnerRule.save({ session });
                appliedRule = {
                    ruleType: 'WinnerRule',
                    ruleId: winnerRule._id
                };
            }
        }

        // Decide final pool to use for winners
        // console.log('amountCalculation', amountCalculation)
        const finalPool = deductionFromPlayers
            ? amountCalculation.finalAmount   // when ≤100%
            : amountCalculation.totalDeductedAmount;                 // when >100%

        let finalAmount = finalPool;
        let totatDeductedAmount = deductionFromPlayers ? amountCalculation.totalDeductedAmount : 0;
        // Winners calculation
        const winners = determineWinners(amountCalculation.buttonResults, finalPool, totalBetAmount, maxWinners, isJackpotWinner);

        // Adjust deposit
        let adjustedDeductedAmount = deductionAmount;
        let totalAdded = 0;
        let isManualWin = winners?.isManualWin || false;
        const payoutAmount = winners?.winners.reduce((sum, winner) => sum + winner.payOutAmount, 0) || 0;

        // if (isManualWin) {
        //     console.log('isManualWin', isManualWin)
        //     console.log('winners?.totalAdded', winners?.totalAdded)
        //     totalAdded = winners?.totalAdded;
        //     adjustedDeductedAmount = 0;
        //     machine.depositAmount = Math.max(0, machine.depositAmount - totalAdded);
        //     console.log('totalAdded', totalAdded)
        //     console.log('adjustedDeductedAmount', adjustedDeductedAmount)
        //     console.log('machine.depositAmount', machine.depositAmount)
        // } else {
        if (!deductionFromPlayers) {
            // Payout above 100% must come from machine deposit
            // console.log('finalPool', finalPool)
            // console.log('winners?.unusedAmount', winners?.unusedAmount)
            // console.log('winners?.totalAdded', winners?.totalAdded)
            const extraPayout = finalPool - amountCalculation.totalBetAmount + winners?.totalAdded;
            const unusedFinalAmount = winners?.unusedAmount || 0;
            // console.log('extraPayout', extraPayout)
            if (machine.depositAmount < extraPayout) {
                throw new ErrorHandler(
                    `Insufficient machine deposit to cover extra payout. Needed ${extraPayout}, available ${machine.depositAmount}`,
                    400
                );
            }
            const totalDeductedAmount = extraPayout - unusedFinalAmount;
            // console.log('totalDeductedAmount', totalDeductedAmount)
            machine.depositAmount = Math.max(0, machine.depositAmount - totalBetAmount + payoutAmount);
            totalAdded = Math.max(0, finalPool - totalBetAmount - unusedFinalAmount);
        } else {
            // Track profits/losses
            totalAdded = Math.max(0, winners?.totalAdded);
            // adjustedDeductedAmount -= winners?.totalAdded;
            adjustedDeductedAmount += winners?.unusedAmount;
            // console.log('winners?.totalAdded', winners?.totalAdded)
            // console.log('winners?.unusedAmount', winners?.unusedAmount)
            // console.log('adjustedDeductedAmount', adjustedDeductedAmount)
            // console.log('winners?.totalAdded', winners?.totalAdded)

            // console.log('winners?.totalAddToWinnerToPressCount', winners?.totalAddToWinnerToPressCount)
            if (winners?.totalAddToWinnerToPressCount > 0) {
                adjustedDeductedAmount = winners?.totalAdded - deductionAmount;
                machine.depositAmount = Math.max(0, machine.depositAmount - totalBetAmount + payoutAmount);
                console.log('winners?.totalAdded', machine.depositAmount, winners?.totalAdded)
                totalAdded = winners?.totalAdded;
            } else {
                console.log('adjutedDeductedAmount', adjustedDeductedAmount)
                // Prevent negative deduction
                adjustedDeductedAmount = Math.abs(adjustedDeductedAmount);
                // console.log('adjustedDeductedAmount', adjustedDeductedAmount)
                machine.depositAmount = Math.max(0, machine.depositAmount - totalBetAmount + payoutAmount);
                totalAdded = Math.max(0, winners?.totalAdded);
                console.log('totalAdded', totalAdded)
                // console.log('machine.depositAmount', machine.depositAmount)
            }
        }
        // }

        // console.log('winners', winners)


        // Generate session ID
        // const sessionId = generateSessionId();

        // Create game session and store in database
        // const gameSession = new GameSession({
        //     sessionId,
        //     machineId,
        //     startTime: stopTime, // Using stop time as the reference
        //     endTime: stopTime,
        //     totalDuration: 0, // Not applicable for this use case
        //     balanceBeforeGame: balanceBeforeGame,
        //     balanceAfterGame: machine.depositAmount,
        //     buttonPresses: amountCalculation.buttonResults.map(button => ({
        //         buttonNumber: button.buttonNumber,
        //         pressCount: button.pressCount,
        //         totalAmount: button.finalAmount // Individual button amount (no deduction)
        //     })),
        //     gameTimeFrames: [{
        //         time: relevantTimeFrame.time,
        //         percentage: relevantTimeFrame.percentage,
        //         deductedPercentage: deductionPercentage,
        //         remainingPercentage: relevantTimeFrame.percentage - deductionPercentage
        //     }],
        //     totalBetAmount: amountCalculation.totalBetAmount,
        //     totalDeductedAmount: Math.abs(totatDeductedAmount),
        //     finalAmount: Math.abs(finalAmount),
        //     winners: winners?.winners.filter(w => w.isWinner).map(winner => ({
        //         buttonNumber: winner.buttonNumber,
        //         amount: winner.amount,
        //         payOutAmount: winner.payOutAmount,
        //         isWinner: winner.isWinner,
        //         winnerType: winner.winnerType || 'regular'
        //     })),
        //     appliedRule: appliedRule,
        //     // 👇 new tracking fields
        //     unusedAmount: winners?.unusedAmount,
        //     totalAdded: totalAdded,
        //     adjustedDeductedAmount: adjustedDeductedAmount,
        //     status: "Completed"
        // });

        gameSession.startTime = stopTime;
        gameSession.endTime = stopTime;
        gameSession.totalDuration = 0;
        gameSession.machineId = gameSession.machineId;
        gameSession.balanceAfterGame = machine.depositAmount;
        gameSession.balanceBeforeGame = balanceBeforeGame;
        gameSession.buttonPresses = amountCalculation.buttonResults.map(button => ({
            buttonNumber: button.buttonNumber,
            pressCount: button.pressCount,
            totalAmount: button.finalAmount // Individual button amount (no deduction)
        }));
        gameSession.gameTimeFrames = [{
            time: relevantTimeFrame.time,
            percentage: relevantTimeFrame.percentage,
            deductedPercentage: deductionPercentage,
            remainingPercentage: relevantTimeFrame.percentage - deductionPercentage
        }],
        gameSession.totalBetAmount = amountCalculation.totalBetAmount;
        gameSession.totalDeductedAmount = Math.abs(totatDeductedAmount);
        gameSession.finalAmount = Math.abs(finalAmount);
        gameSession.winners = winners?.winners.filter(w => w.isWinner).map(winner => ({
            buttonNumber: winner.buttonNumber,
            amount: winner.amount,
            payOutAmount: winner.payOutAmount,
            isWinner: winner.isWinner,
            winnerType: winner.winnerType || 'regular'
        }));
        gameSession.appliedRule = appliedRule;
        gameSession.unusedAmount = winners?.unusedAmount;
        gameSession.totalAdded = totalAdded;
        gameSession.adjustedDeductedAmount = adjustedDeductedAmount;
        gameSession.status = 'Completed';


        // Save machine with updated balance
        await machine.save({ session });

        // Create machine transaction record
        const machineTransaction = new MachineTransaction({
            machineId: machine._id,
            sessionId: gameSession.sessionId,
            totalBetAmount: amountCalculation.totalBetAmount,
            finalAmount: Math.abs(finalAmount),
            deductedAmount: Math.abs(totatDeductedAmount),
            unusedAmount: winners?.unusedAmount || 0,
            totalAdded: totalAdded || 0,
            payoutAmount: winners?.winners.reduce((sum, winner) => sum + winner.payOutAmount, 0) || 0,
            percentageDeducted: adjustedDeductedAmount,
            applyPercentageDeducted: deductionPercentage,
            applyPercentageValue: amountCalculation.totalDeductedAmount,
            remainingBalance: machine.depositAmount,
            winnerTypes: winners?.winners.filter(w => w.isWinner).map(w => w.winnerType || 'regular') || [],
            note: `Game session ${gameSession.sessionId} - ${deductionFromPlayers ? 'Deduction from players' : 'Payout from machine deposit'}`
        });

        await machineTransaction.save({ session });

        // Save game session
        await gameSession.save({ session });

        // Populate machine details
        await gameSession.populate('machineId', 'machineName machineNumber status location');

        // Commit transaction
        await session.commitTransaction();

        // Check if there are any other active sessions for this machine
        const activeSessionsCount = await GameSession.countDocuments({ 
            machineId: machineId, 
            status: 'Active' 
        });
        const isLive = activeSessionsCount > 0;

        // const endTime = Date.now();
        // const duration = endTime - startTime;
        // console.log('startTime', startTime)
        // console.log('endTime', endTime)
        // console.log('duration', duration)
        // if (duration < minimumTime) {
        //     await new Promise(resolve => setTimeout(resolve, minimumTime - duration));
        // }

        // Emit game session completed event to all clients
        io.emit('gameSessionCompleted', {
            sessionId: gameSession.sessionId,
            machineId: gameSession.machineId._id.toString(),
            isLive: isLive,
            session: gameSession.toObject()
        });

        // Return processed results WITH storage confirmation
        res.status(201).json({
            // success: true,
            // message: 'Game processed and stored successfully',
            data: {
                // sessionId: gameSession.sessionId,
                // machine: {
                //     _id: machine._id,
                //     machineName: machine.machineName,
                //     machineNumber: machine.machineNumber,
                //     status: machine.status,
                //     remainingDeposit: machine.depositAmount
                // },
                // stopTime: stopTime,
                // relevantTimeFrame: {
                //     time: relevantTimeFrame.time,
                //     percentage: relevantTimeFrame.percentage
                // },
                // balanceBeforeGame: balanceBeforeGame,
                // balanceAfterGame: machine.depositAmount,
                // totalBetAmount: amountCalculation.totalBetAmount,
                // totalDeductedAmount: Math.abs(totatDeductedAmount),
                // finalAmount: Math.abs(finalAmount),
                // deductionPercentage: deductionPercentage,
                // buttonResults: amountCalculation.buttonResults.map(button => ({
                //     buttonNumber: button.buttonNumber,
                //     pressCount: button.pressCount,
                //     buttonAmount: button.finalAmount // Individual button amount (no deduction)
                // })),
                winners: winners?.winners.filter(w => w.isWinner).map(winner => ({
                    buttonNumber: winner.buttonNumber,
                    amount: winner.amount,
                    payOutAmount: winner.payOutAmount,
                    isWinner: winner.isWinner,
                    // winnerType: winner.winnerType || 'regular'
                })),
                // unusedAmount: winners?.unusedAmount,
                // totalAdded: totalAdded,
                // adjustedDeductedAmount,
                // processingTime: new Date().toISOString(),
                // storedAt: gameSession.createdAt
            }
        });

    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        await session.endSession();
    }
});

// Get game session by ID
export const getGameSession = catchAsyncError(async (req, res, next) => {
    const { sessionId } = req.params;

    const gameSession = await GameSession.findOne({ sessionId })
        .populate('machineId', 'machineName depositAmount machineNumber status location')
        .populate('appliedRule.ruleId').lean();

    if (!gameSession) {
        return next(new ErrorHandler('Game session not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Game session fetched successfully',
        data: gameSession
    });
});

// Get all game sessions
export const getAllGameSessions = catchAsyncError(async (req, res, next) => {
    const { machineId, status, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (machineId) filter.machineId = machineId;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const gameSessions = await GameSession.find(filter)
        .populate('machineId', 'machineName machineNumber status location')
        .populate('appliedRule.ruleId').lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalSessions = await GameSession.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: 'Game sessions fetched successfully',
        count: gameSessions.length,
        totalSessions,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSessions / limit),
        data: gameSessions
    });
});

// Get game sessions by machine
export const getGameSessionsByMachine = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.body;

    // Validate machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    const gameSessions = await GameSession.find({ machineId })
        .populate('machineId', 'machineName machineNumber depositAmount status location')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: `Game sessions for machine fetched successfully`,
        count: gameSessions.length,
        machine: machine,
        data: gameSessions
    });
});

// Get game statistics
export const getGameStatistics = catchAsyncError(async (req, res, next) => {
    const { machineId, days = 7 } = req.query;

    // Build filter object
    const filter = { status: 'Completed' };
    if (machineId) filter.machineId = machineId;

    // Date range filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    filter.createdAt = { $gte: startDate };

    const gameSessions = await GameSession.find(filter)
        .populate('machineId', 'machineName machineNumber status location');

    // Calculate statistics
    const totalSessions = gameSessions.length;
    const totalBetAmount = gameSessions.reduce((sum, session) => sum + session.totalBetAmount, 0);
    const totalDeductedAmount = gameSessions.reduce((sum, session) => sum + session.totalDeductedAmount, 0);
    const totalFinalAmount = gameSessions.reduce((sum, session) => sum + session.finalAmount, 0);

    // Button statistics
    const buttonStats = {};
    gameSessions.forEach(session => {
        session.buttonPresses.forEach(press => {
            if (!buttonStats[press.buttonNumber]) {
                buttonStats[press.buttonNumber] = {
                    totalPresses: 0,
                    totalAmount: 0,
                    winCount: 0
                };
            }
            buttonStats[press.buttonNumber].totalPresses += press.pressCount;
            buttonStats[press.buttonNumber].totalAmount += press.totalAmount;
        });

        session.winners.forEach(winner => {
            if (winner.isWinner && buttonStats[winner.buttonNumber]) {
                buttonStats[winner.buttonNumber].winCount += 1;
            }
        });
    });

    res.status(200).json({
        success: true,
        message: 'Game statistics fetched successfully',
        period: `${days} days`,
        statistics: {
            totalSessions,
            totalBetAmount,
            totalDeductedAmount,
            totalFinalAmount,
            averageBetPerSession: totalSessions > 0 ? Math.round(totalBetAmount / totalSessions) : 0,
            averageDeductionPercentage: totalSessions > 0 ? Math.round((totalDeductedAmount / totalBetAmount) * 100) : 0
        },
        buttonStatistics: buttonStats
    });
});

// Get machine status
export const getMachineStatus = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.params;

    const machine = await Machine.findById(machineId);

    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Machine status fetched successfully',
        data: {
            _id: machine._id,
            machineName: machine.machineName,
            machineNumber: machine.machineNumber,
            status: machine.status,
            location: machine.location,
            isActive: machine.status === 'Active'
        }
    });
});

// Update machine status (for hardware integration)
export const updateMachineStatus = catchAsyncError(async (req, res, next) => {
    const { machineId, status } = req.body;

    const machine = await Machine.findByIdAndUpdate(
        machineId,
        { status },
        { new: true, runValidators: true }
    );

    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Machine status updated successfully',
        data: machine
    });
});
