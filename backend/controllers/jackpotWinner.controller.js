import jackpotWinnerModal from "../modals/jackpotWinner.modal.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import { formatTimeToHHMM, isValidateTimeFormat } from "../utils/timeUtils.js";
import Machine from "../modals/machine.modal.js";
import mongoose from "mongoose";
import GameSession from "../modals/gameSession.modal.js";

export const createJackpotWinner = catchAsyncError(async (req, res, next) => {
    const { machineId, sessionId, startTime, endTime, maxWinners } = req.body;

    const transaction = await mongoose.startSession();
    try {
        transaction.startTransaction();

        const machine = await Machine.findById(machineId).session(transaction);
        if (!machine) {
            throw new ErrorHandler('Machine not found', 404);
        }

        let formattedStartTime
        let formattedEndTime

        if (startTime) {
            const validateStartTime = isValidateTimeFormat(startTime);
            formattedStartTime = startTime;
            if (!validateStartTime) {
                formattedStartTime = formatTimeToHHMM(startTime);
            }
        }
        if (endTime) {
            const validateEndTime = isValidateTimeFormat(endTime);
            formattedEndTime = endTime;
            if (!validateEndTime) {
                formattedEndTime = formatTimeToHHMM(endTime);
            }
        }
        const jackpotWinner = new jackpotWinnerModal({
            machineId,
            startTime: formattedStartTime || null,
            endTime: formattedEndTime || null,
            maxWinners
        })
        await jackpotWinner.save({ session: transaction });
        if (sessionId) {
            const gameSession = await GameSession.findOne({ sessionId }).session(transaction);
            if (!gameSession) {
                throw new ErrorHandler('Game session not found', 404);
            }
            gameSession.appliedRule = {
                ruleType: 'JackpotWinner',
                ruleId: jackpotWinner._id
            };
            await gameSession.save({ session: transaction });
        }
        await transaction.commitTransaction();
        res.status(201).json({
            success: true,
            message: 'Jackpot winner created successfully',
            data: jackpotWinner
        });
    } catch (error) {
        await transaction.abortTransaction();
        return next(error);
    } finally {
        await transaction.endSession();
    }
});

export const getJackpotWinner = catchAsyncError(async (req, res, next) => {
    const { machineId, page, limit } = req.query;
    const filter = {};
    if (machineId) {
        filter.machineId = machineId;
    }
    const jackpotWinner = await jackpotWinnerModal.find(filter)
        .populate('appliedInSessions').lean()
        .skip((page - 1) * limit).limit(limit);
    const totalJackpotWinner = await jackpotWinnerModal.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: 'Jackpot winner fetched successfully',
        count: jackpotWinner.length,
        totalJackpotWinner,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJackpotWinner / limit),
        data: jackpotWinner
    });
});

export const updateJackpotWinner = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const { machineId, startTime, endTime, maxWinners } = req.body;
    const jackpotWinner = await jackpotWinnerModal.findByIdAndUpdate(id, { machineId, startTime, endTime, maxWinners }, { new: true });
    res.status(200).json({
        success: true,
        message: 'Jackpot winner updated successfully',
        data: jackpotWinner
    });
});

export const deleteJackpotWinner = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const jackpotWinner = await jackpotWinnerModal.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: 'Jackpot winner deleted successfully',
        data: jackpotWinner
    });
});

// get jackpot winner by jackpot winner id
export const getJackpotWinnerById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const jackpotWinner = await jackpotWinnerModal.findById(id).populate('appliedInSessions');
    if (!jackpotWinner) {
        throw new ErrorHandler('Jackpot winner not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Jackpot winner fetched successfully',
        data: jackpotWinner
    });
});