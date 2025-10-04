import catchAsyncError from "../middlewares/catchAsyncError.js";
import GameSession from "../modals/gameSession.modal.js";
import Machine from "../modals/machine.modal.js";
import TimeFrame from "../modals/timeFrame.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
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

// Process button presses from hardware (WITH STORAGE - process and store results)
export const processButtonPresses = catchAsyncError(async (req, res, next) => {
    const { machineId, buttonPresses } = req.body;

    // Generate current time in IST (Indian Standard Time), 24-hour HH:mm
    const stopTime = moment().tz("Asia/Kolkata").format("HH:mm");
    // console.log('stopTime', stopTime);

    // Validate machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }
    console.log('machine', machine.depositAmount)

    // Check if machine is active
    if (machine.status !== 'Active') {
        return next(new ErrorHandler('Machine is not active', 400));
    }

    // Validate game session data
    const validation = validateGameSession(req.body);
    if (!validation.isValid) {
        return next(new ErrorHandler(validation.errors.join(', '), 400));
    }

    // Calculate total bet amount
    const totalBetAmount = buttonPresses.reduce((total, button) => {
        return total + (button.pressCount * 10); // 10 rupees per press
    }, 0);

    // Calculate deduction amount first to check if machine has enough for the deduction
    const timeFrames = await TimeFrame.find({ machineId }).sort({ time: 1 });
    // console.log('timeFrames', timeFrames);
    if (timeFrames.length === 0) {
        return next(new ErrorHandler('No timeframes configured for this machine', 400));
    }

    // Find the relevant timeframe for this stop time
    const stopMoment = moment(stopTime, 'HH:mm', true);
    if (!stopMoment.isValid()) {
        return next(new ErrorHandler('Invalid stop time format', 400));
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
        return next(
            new ErrorHandler(
                `Insufficient deposit. Machine has ${machine.depositAmount} but needs ${totalBetAmount} for deduction`,
                400
            )
        );
    }

    // --- Amount calculation ---
    const amountCalculation = calculateFinalAmounts(
        buttonPresses,
        deductionPercentage,
        10 // per press
    );

    // Decide final pool to use for winners
    // console.log('amountCalculation', amountCalculation)
    const finalPool = deductionFromPlayers
        ? amountCalculation.finalAmount   // when ≤100%
        : amountCalculation.totalDeductedAmount;                 // when >100%

    // Winners calculation
    const winners = determineWinners(amountCalculation.buttonResults, finalPool);

    // Adjust deposit
    let adjustedDeductedAmount = deductionAmount;
    let totalAdded = 0;

    if (!deductionFromPlayers) {
        // Payout above 100% must come from machine deposit
        // console.log('finalPool', finalPool)
        // console.log('winners?.unusedAmount', winners?.unusedAmount)
        // console.log('winners?.totalAdded', winners?.totalAdded)
        // console.log('machine.depositAmount', machine.depositAmount)
        const extraPayout = finalPool - amountCalculation.totalBetAmount + winners?.totalAdded;
        const unusedFinalAmount = winners?.unusedAmount || 0;
        // console.log('extraPayout', extraPayout)
        if (machine.depositAmount < extraPayout) {
            return next(
                new ErrorHandler(
                    `Insufficient machine deposit to cover extra payout. Needed ${extraPayout}, available ${machine.depositAmount}`,
                    400
                )
            );
        }
        const totalDeductedAmount = extraPayout - unusedFinalAmount;
        machine.depositAmount = Math.max(0, machine.depositAmount - totalDeductedAmount);
        totalAdded = totalDeductedAmount;
    } else {
        // Track profits/losses
        adjustedDeductedAmount -= winners?.totalAdded;
        adjustedDeductedAmount += winners?.unusedAmount;

        console.log('winners?.totalAddToWinnerToPressCount', winners?.totalAddToWinnerToPressCount)
        if (winners?.totalAddToWinnerToPressCount > 0) {
            adjustedDeductedAmount = winners?.totalAdded - deductionAmount;
            machine.depositAmount = Math.max(0, machine.depositAmount - adjustedDeductedAmount);
            console.log('winners?.totalAdded', machine.depositAmount, winners?.totalAdded)
            totalAdded = winners?.totalAdded;
        } else {
            console.log('adjutedDeductedAmount', adjustedDeductedAmount)
            // Prevent negative deduction
            adjustedDeductedAmount = Math.max(0, adjustedDeductedAmount);
            console.log('adjustedDeductedAmount', adjustedDeductedAmount)
            machine.depositAmount = Math.max(0, machine.depositAmount - adjustedDeductedAmount);
            totalAdded = winners?.totalAdded;
            console.log('totalAdded', totalAdded)
        }
    }

    // console.log('winners', winners)


    // Generate session ID
    const sessionId = generateSessionId();

    // Create game session and store in database
    const gameSession = new GameSession({
        sessionId,
        machineId,
        startTime: stopTime, // Using stop time as the reference
        endTime: stopTime,
        totalDuration: 0, // Not applicable for this use case
        buttonPresses: amountCalculation.buttonResults.map(button => ({
            buttonNumber: button.buttonNumber,
            pressCount: button.pressCount,
            totalAmount: button.finalAmount // Individual button amount (no deduction)
        })),
        gameTimeFrames: [{
            time: relevantTimeFrame.time,
            percentage: relevantTimeFrame.percentage,
            deductedPercentage: deductionPercentage,
            remainingPercentage: relevantTimeFrame.percentage - deductionPercentage
        }],
        totalBetAmount: amountCalculation.totalBetAmount,
        totalDeductedAmount: amountCalculation.totalDeductedAmount,
        finalAmount: amountCalculation.finalAmount,
        winners: winners?.winners.filter(w => w.isWinner),
        // 👇 new tracking fields
        unusedAmount: winners?.unusedAmount,
        totalAdded: totalAdded,
        adjustedDeductedAmount: adjustedDeductedAmount,
        status: "Completed"
    });

    await gameSession.save();

    console.log('machine.depositAmount', machine.depositAmount)
    console.log('adjustedDeductedAmount', adjustedDeductedAmount)
    // // Deduct the deduction amount from machine deposit (ensure it never goes below 0)
    // machine.depositAmount = Math.max(0, machine.depositAmount - adjustedDeductedAmount);
    console.log('machine.depositAmount', machine.depositAmount)
    await machine.save();

    // Populate machine details
    await gameSession.populate('machineId', 'machineName machineNumber status location');

    // Return processed results WITH storage confirmation
    res.status(201).json({
        success: true,
        message: 'Game processed and stored successfully',
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
            // totalBetAmount: amountCalculation.totalBetAmount,
            // totalDeductedAmount: amountCalculation.totalDeductedAmount,
            // finalAmount: amountCalculation.finalAmount,
            // deductionPercentage: deductionPercentage,
            // buttonResults: amountCalculation.buttonResults.map(button => ({
            //     buttonNumber: button.buttonNumber,
            //     pressCount: button.pressCount,
            //     buttonAmount: button.finalAmount // Individual button amount (no deduction)
            // })),
            winners: winners?.winners.filter(w => w.isWinner),
            // unusedAmount: winners?.unusedAmount,
            // totalAdded: totalAdded,
            // adjustedDeductedAmount,
            // processingTime: new Date().toISOString(),
            // storedAt: gameSession.createdAt
        }
    });
});

// Get game session by ID
export const getGameSession = catchAsyncError(async (req, res, next) => {
    const { sessionId } = req.params;

    const gameSession = await GameSession.findOne({ sessionId })
        .populate('machineId', 'machineName machineNumber status location');

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
        .populate('machineId', 'machineName machineNumber status location')
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
