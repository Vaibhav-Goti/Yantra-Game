import jackpotWinnerModal from "../modals/jackpotWinner.modal.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import { formatTimeToHHMM, isValidateTimeFormat } from "../utils/timeUtils.js";
import Machine from "../modals/machine.modal.js";

export const createJackpotWinner = catchAsyncError(async (req, res, next) => {
    const { machineId, startTime, endTime, maxWinners } = req.body;
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }
    const validateStartTime = isValidateTimeFormat(startTime);
    let formattedStartTime = startTime;
    const validateEndTime = isValidateTimeFormat(endTime);
    let formattedEndTime = endTime;
    if (!validateStartTime) {
        formattedStartTime = formatTimeToHHMM(startTime);
    }
    if (!validateEndTime) {
        formattedEndTime = formatTimeToHHMM(endTime);
    }

    const jackpotWinner = new jackpotWinnerModal({ machineId, startTime: formattedStartTime, endTime: formattedEndTime, maxWinners });
    await jackpotWinner.save();
    res.status(201).json({
        success: true,
        message: 'Jackpot winner created successfully',
        data: jackpotWinner
    });
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
