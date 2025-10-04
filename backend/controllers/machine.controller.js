import mongoose from "mongoose";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Machine from "../modals/machine.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
import TimeFrame from "../modals/timeFrame.modal.js";

// Create new machine
export const createMachine = catchAsyncError(async (req, res, next) => {
    const { machineName, machineNumber, status, location, description, depositAmount } = req.body;

    // start transaction
    const transaction = await mongoose.startSession();
    try {
        transaction.startTransaction();
        // Check if machine number already exists
        const existingMachine = await Machine.findOne({ machineNumber }).session(transaction);
        if (existingMachine) {
            throw new ErrorHandler('Machine number already exists', 400);
        }

        const machine = new Machine({
            machineName,
            machineNumber,
            status: status || 'Active',
            location: location ? location : "",
            description: description ? description : "",
            depositAmount: depositAmount || 0
        });

        const timeFrames = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                timeFrames.push({
                    time,
                    percentage: 10, // default percentage
                    machineId: machine._id
                });
            }
        }

        await TimeFrame.insertMany(timeFrames, { session: transaction });

        await machine.save({ session: transaction });
        await transaction.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'Machine created successfully',
            data: machine
        });
    } catch (error) {
        await transaction.abortTransaction();
        return next(error);
    }finally{
        await transaction.endSession();
    }
});

// Get all machines
export const getAllMachines = catchAsyncError(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (status) {
        filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const machines = await Machine.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalMachines = await Machine.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: 'Machines fetched successfully',
        count: machines.length,
        totalMachines,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMachines / limit),
        data: machines
    });
});

// Get machine by ID
export const getMachineById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const machine = await Machine.findById(id);

    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Machine fetched successfully',
        data: machine
    });
});

// Update machine
export const updateMachine = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const { machineName, machineNumber, status, location, description, depositAmount } = req.body;

    // If machine number is being updated, check for duplicates
    if (machineNumber) {
        const existingMachine = await Machine.findOne({
            machineNumber: machineNumber,
            _id: { $ne: id }
        });
        if (existingMachine) {
            return next(new ErrorHandler('Machine number already exists', 400));
        }
    }

    // Create update object with only provided fields
    const updateData = {};
    if (machineName !== undefined) updateData.machineName = machineName;
    if (machineNumber !== undefined) updateData.machineNumber = machineNumber;
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (depositAmount !== undefined) updateData.depositAmount = depositAmount;

    const machine = await Machine.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Machine updated successfully',
        data: machine
    });
});

// Delete machine
export const deleteMachine = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;

    const machine = await Machine.findByIdAndDelete(id);

    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Machine deleted successfully'
    });
});

// Get machines by status
export const getMachinesByStatus = catchAsyncError(async (req, res, next) => {
    const { status } = req.params;

    if (!['Active', 'Inactive', 'Maintenance'].includes(status)) {
        return next(new ErrorHandler('Invalid status. Must be Active, Inactive, or Maintenance', 400));
    }

    const machines = await Machine.find({ status }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: `Machines with status ${status} fetched successfully`,
        count: machines.length,
        data: machines
    });
});

// Search machines
export const searchMachines = catchAsyncError(async (req, res, next) => {
    const { query } = req.query;

    if (!query) {
        return next(new ErrorHandler('Search query is required', 400));
    }

    const machines = await Machine.find({
        $or: [
            { machineName: { $regex: query, $options: 'i' } },
            { machineNumber: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
        ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        count: machines.length,
        data: machines
    });
});

// Add money to machine deposit
export const addDeposit = catchAsyncError(async (req, res, next) => {
    const { id, amount } = req.body;

    if (!amount || amount <= 0) {
        return next(new ErrorHandler('Amount must be greater than 0', 400));
    }

    const machine = await Machine.findById(id);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    machine.depositAmount += amount;
    await machine.save();

    res.status(200).json({
        success: true,
        message: `Successfully added ${amount} to machine deposit`,
        data: {
            machineId: machine._id,
            machineName: machine.machineName,
            previousDeposit: machine.depositAmount - amount,
            addedAmount: amount,
            newDeposit: machine.depositAmount
        }
    });
});

// Get machine deposit status
export const getDepositStatus = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const machine = await Machine.findById(id);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    if (machine.status !== 'Active') {
        return next(new ErrorHandler('Machine is not active', 400));
    }

    // Boolean check: true if deposit > 5000, else false
    const isDepositAboveThreshold = machine.depositAmount > 5000;


    res.status(200).json({
        success: true,
        message: 'Machine deposit status fetched successfully',
        data: {
            machineId: machine._id,
            isDepositAboveThreshold
        }
    });
});
