import catchAsyncError from "../middlewares/catchAsyncError.js";
import TimeFrame from "../modals/timeFrame.modal.js";
import Machine from "../modals/machine.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
import { 
    isValidTimeFormat, 
    getCurrentTimeHHMM, 
    formatTime, 
    isTimeBetween,
    calculateTimeDifference,
    getTimeRanges 
} from "../utils/timeUtils.js";
import moment from "moment";

// Create new timeframe
export const createTimeFrame = catchAsyncError(async (req, res, next) => {
    const { time, percentage, machineId } = req.body;

    // Find the relevant timeframe for this stop time
    const stopMoment = moment(time, 'HH:mm', true);
    if (!stopMoment.isValid()) {
        return next(new ErrorHandler('Invalid time format, provide in HH:MM format', 400));
    }

    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    // Check if timeframe already exists for the same machine and time
    const existingTimeFrame = await TimeFrame.findOne({ 
        machineId, 
        time 
    });
    
    if (existingTimeFrame) {
        return next(new ErrorHandler('TimeFrame already exists for this machine at this time', 400));
    }

    const timeFrame = new TimeFrame({
        time,
        percentage,
        machineId
    });

    await timeFrame.save();

    // Populate machine details
    await timeFrame.populate('machineId', 'machineName machineNumber status location');

    res.status(201).json({
        success: true,
        message: 'TimeFrame created successfully',
        data: timeFrame
    });
});

// Get all timeframes
export const getAllTimeFrames = catchAsyncError(async (req, res, next) => {
    const { machineId, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (machineId) {
        filter.machineId = machineId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const timeFrames = await TimeFrame.find(filter)
        .populate('machineId', 'machineName machineNumber status location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalTimeFrames = await TimeFrame.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: 'TimeFrames fetched successfully',
        count: timeFrames.length,
        totalTimeFrames,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTimeFrames / limit),
        data: timeFrames
    });
});

// Get timeframe by ID
export const getTimeFrameById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const timeFrame = await TimeFrame.findById(id)
        .populate('machineId', 'machineName machineNumber status location');

    if (!timeFrame) {
        return next(new ErrorHandler('TimeFrame not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'TimeFrame fetched successfully',
        data: timeFrame
    });
});

// Update timeframe
export const updateTimeFrame = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const { time, percentage, machineId } = req.body;

    // Validate time format if provided
    if (time && !isValidTimeFormat(time)) {
        return next(new ErrorHandler('Invalid time format. Expected HH:MM format', 400));
    }

    // Check if machine exists if machineId is provided
    if (machineId) {
        const machine = await Machine.findById(machineId);
        if (!machine) {
            return next(new ErrorHandler('Machine not found', 404));
        }
    }

    // Check for duplicate timeframe if time or machineId is being updated
    if (time || machineId) {
        const currentTimeFrame = await TimeFrame.findById(id);
        if (!currentTimeFrame) {
            return next(new ErrorHandler('TimeFrame not found', 404));
        }

        const checkTime = time || currentTimeFrame.time;
        const checkMachineId = machineId || currentTimeFrame.machineId;

        const existingTimeFrame = await TimeFrame.findOne({
            time: checkTime,
            machineId: checkMachineId,
            _id: { $ne: id }
        });

        if (existingTimeFrame) {
            return next(new ErrorHandler('TimeFrame already exists for this machine at this time', 400));
        }
    }

    // Create update object with only provided fields
    const updateData = {};
    if (time !== undefined) updateData.time = time;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (machineId !== undefined) updateData.machineId = machineId;

    const timeFrame = await TimeFrame.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate('machineId', 'machineName machineNumber status location');

    if (!timeFrame) {
        return next(new ErrorHandler('TimeFrame not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'TimeFrame updated successfully',
        data: timeFrame
    });
});

// Delete timeframe
export const deleteTimeFrame = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;

    const timeFrame = await TimeFrame.findByIdAndDelete(id);

    if (!timeFrame) {
        return next(new ErrorHandler('TimeFrame not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'TimeFrame deleted successfully'
    });
});

// Get timeframes by machine ID
export const getTimeFramesByMachine = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.body;

    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    const timeFrames = await TimeFrame.find({ machineId })
        .populate('machineId', 'machineName machineNumber status location')
        .sort({ time: 1 }); // Sort by time ascending

    res.status(200).json({
        success: true,
        message: `TimeFrames for machine fetched successfully`,
        count: timeFrames.length,
        machine: machine,
        data: timeFrames
    });
});

// Get current timeframe for a machine
export const getCurrentTimeFrameForMachine = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.body;

    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    const currentTime = getCurrentTimeHHMM();
    
    // Find timeframe that matches current time or closest previous time
    const timeFrame = await TimeFrame.findOne({ 
        machineId,
        time: { $lte: currentTime }
    })
    .populate('machineId', 'machineName machineNumber status location')
    .sort({ time: -1 });

    if (!timeFrame) {
        return res.status(200).json({
            success: true,
            message: 'No timeframe found for current time',
            currentTime,
            data: null
        });
    }

    res.status(200).json({
        success: true,
        message: 'Current timeframe fetched successfully',
        currentTime,
        data: timeFrame
    });
});

// Get timeframes with percentage range
export const getTimeFramesByPercentageRange = catchAsyncError(async (req, res, next) => {
    const { minPercentage = 0, maxPercentage = 100, machineId } = req.query;

    // Build filter object
    const filter = {
        percentage: { $gte: parseInt(minPercentage), $lte: parseInt(maxPercentage) }
    };
    
    if (machineId) {
        filter.machineId = machineId;
    }

    const timeFrames = await TimeFrame.find(filter)
        .populate('machineId', 'machineName machineNumber status location')
        .sort({ percentage: -1 });

    res.status(200).json({
        success: true,
        message: `TimeFrames with percentage between ${minPercentage}% and ${maxPercentage}% fetched successfully`,
        count: timeFrames.length,
        filter: { minPercentage, maxPercentage, machineId },
        data: timeFrames
    });
});

// Get timeframes with advanced time analysis
export const getTimeFramesWithAnalysis = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.body;

    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    const timeFrames = await TimeFrame.find({ machineId })
        .populate('machineId', 'machineName machineNumber status location')
        .sort({ time: 1 });

    if (timeFrames.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No timeframes found for this machine',
            data: []
        });
    }

    // Analyze timeframes using Moment.js
    const timeRanges = getTimeRanges(timeFrames);
    const currentTime = getCurrentTimeHHMM();
    
    // Find current active timeframe
    const currentTimeFrame = timeRanges.find(timeframe => {
        const nextIndex = timeRanges.indexOf(timeframe) + 1;
        const nextTimeFrame = timeRanges[nextIndex];
        
        if (nextTimeFrame) {
            return isTimeBetween(currentTime, timeframe.time, nextTimeFrame.time);
        } else {
            // If it's the last timeframe, check if current time is after it
            return currentTime >= timeframe.time;
        }
    });

    // Calculate time gaps between timeframes
    const timeGaps = [];
    for (let i = 0; i < timeRanges.length - 1; i++) {
        const current = timeRanges[i];
        const next = timeRanges[i + 1];
        const gap = calculateTimeDifference(current.time, next.time);
        timeGaps.push({
            from: current.time,
            to: next.time,
            gap: gap.formatted,
            gapMinutes: gap.minutes
        });
    }

    // Calculate average percentage
    const totalPercentage = timeRanges.reduce((sum, tf) => sum + tf.percentage, 0);
    const averagePercentage = totalPercentage / timeRanges.length;

    res.status(200).json({
        success: true,
        message: 'TimeFrames with analysis fetched successfully',
        count: timeFrames.length,
        machine: machine,
        currentTime,
        currentTimeFrame: currentTimeFrame || null,
        analysis: {
            totalTimeFrames: timeRanges.length,
            averagePercentage: Math.round(averagePercentage * 100) / 100,
            highestPercentage: Math.max(...timeRanges.map(tf => tf.percentage)),
            lowestPercentage: Math.min(...timeRanges.map(tf => tf.percentage)),
            timeGaps,
            timeRanges: timeRanges.map(tf => ({
                ...tf,
                time12Hour: tf.time12Hour,
                timeFormatted: tf.timeFormatted
            }))
        }
    });
});
