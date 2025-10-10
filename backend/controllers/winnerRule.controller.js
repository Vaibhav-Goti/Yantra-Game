import winnerRuleModal from "../modals/winnerRule.modal.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Machine from "../modals/machine.modal.js";
import { formatTimeToHHMM, isValidateTimeFormat } from "../utils/timeUtils.js";

export const createWinnerRule = catchAsyncError(async (req, res, next) => {
    const { machineId, startTime, endTime, allowedButtons } = req.body;

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

    const winnerRule = new winnerRuleModal({ machineId, startTime: formattedStartTime, endTime: formattedEndTime, allowedButtons });
    await winnerRule.save();

    res.status(201).json({
        success: true,
        message: 'Winner rule created successfully',
        data: winnerRule
    });
});

export const getWinnerRule = catchAsyncError(async (req, res, next) => {
    const { status, machineId, page, limit } = req.query;
    const filter = {};
    if (machineId) {
        filter.machineId = machineId;
    }
    if (status) {
        filter.status = status;
    }
    const winnerRule = await winnerRuleModal.find(filter)
    .populate('appliedInSessions').lean()
    .skip((page - 1) * limit).limit(limit);
    const totalWinnerRule = await winnerRuleModal.countDocuments(filter);
    const totalPages = Math.ceil(totalWinnerRule / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const currentPage = parseInt(page);
    
    res.status(200).json({
        success: true,
        message: 'Winner rule fetched successfully',
        count: winnerRule.length,
        totalWinnerRule,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalWinnerRule / limit),
        data: winnerRule
    });
});

export const updateWinnerRule = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const { machineId, startTime, endTime, allowedButtons } = req.body;
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
    const winnerRule = await winnerRuleModal.findByIdAndUpdate(id, { machineId, startTime: formattedStartTime, endTime: formattedEndTime, allowedButtons }, { new: true });
    res.status(200).json({
        success: true,
        message: 'Winner rule updated successfully',
        data: winnerRule
    });
});

export const deleteWinnerRule = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const winnerRule = await winnerRuleModal.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: 'Winner rule deleted successfully',
        data: winnerRule
    });
});
