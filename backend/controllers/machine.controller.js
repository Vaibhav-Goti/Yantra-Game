import mongoose from "mongoose";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Machine from "../modals/machine.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
import TimeFrame from "../modals/timeFrame.modal.js";
import MachineTransaction from "../modals/machineTransaction.modal.js";
import {
    getMachineTransactionHistory as getMachineTransactionHistoryUtil,
    getMachineBalanceSummary as getMachineBalanceSummaryUtil,
    validateTransactionIntegrity,
    reconcileMachineBalance,
    getMachineTransactionAnalytics
} from "../utils/machineTransactionUtils.js";

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

        // Create initial deposit transaction if depositAmount > 0
        if (depositAmount && depositAmount > 0) {
            const initialTransaction = new MachineTransaction({
                machineId: machine._id,
                addedAmountToMachine: depositAmount,
                remainingBalance: machine.depositAmount,
                note: `Initial deposit for new machine`
            });

            await initialTransaction.save({ session: transaction });
        }

        await transaction.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'Machine created successfully',
            data: {
                machine,
                initialDeposit: depositAmount > 0 ? {
                    amount: depositAmount,
                    transactionRecorded: true
                } : null
            }
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
    const { id, amount, note } = req.body;

    if (!amount || amount <= 0) {
        return next(new ErrorHandler('Amount must be greater than 0', 400));
    }

    // Start transaction
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const machine = await Machine.findById(id).session(session);
        if (!machine) {
            throw new ErrorHandler('Machine not found', 404);
        }

        const previousBalance = machine.depositAmount;
        machine.depositAmount += amount;
        await machine.save({ session });

        // Create transaction record
        const transaction = new MachineTransaction({
            machineId: machine._id,
            addedAmountToMachine: amount,
            remainingBalance: machine.depositAmount,
            note: note || `Deposit added to machine`
        });

        await transaction.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `Successfully added ₹${amount} to machine deposit`,
            data: {
                transactionId: transaction._id,
                machineId: machine._id,
                machineName: machine.machineName,
                previousDeposit: previousBalance,
                addedAmount: amount,
                newDeposit: machine.depositAmount,
                transactionTime: transaction.createdAt
            }
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        await session.endSession();
    }
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

// Get machine transaction history
export const getMachineTransactionHistory = catchAsyncError(async (req, res, next) => {
    const { page = 1, limit = 10, startDate, endDate, transactionType, machineId } = req.query;

    const query = {};
    if (machineId) {
        query.machineId = machineId;
    }

    // Build filter object
    const filter = query;
    
    // Date range filter
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.$lte = new Date(endDate);
        }
    }

    // Transaction type filter
    if (transactionType) {
        if (transactionType === 'deposit') {
            filter.addedAmountToMachine = { $gt: 0 };
        } else if (transactionType === 'withdrawal') {
            filter.withdrawnAmountFromMachine = { $gt: 0 };
        } else if (transactionType === 'game') {
            filter.totalBetAmount = { $gt: 0 };
        }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const transactions = await MachineTransaction.find(filter)
        .populate('machineId', 'machineName machineNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalTransactions = await MachineTransaction.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: 'Machine transaction history fetched successfully',
        count: transactions.length,
        totalTransactions,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransactions / limit),
        data: transactions
    });
});

// Add amount to machine with transaction history
export const addAmountToMachine = catchAsyncError(async (req, res, next) => {
    const { machineId, amount, note } = req.body;

    if (!amount || amount <= 0) {
        return next(new ErrorHandler('Amount must be greater than 0', 400));
    }

    // Start transaction
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const machine = await Machine.findById(machineId).session(session);
        if (!machine) {
            throw new ErrorHandler('Machine not found', 404);
        }

        const previousBalance = machine.depositAmount;
        machine.depositAmount += amount;
        await machine.save({ session });

        // Create transaction record
        const transaction = new MachineTransaction({
            machineId,
            addedAmountToMachine: amount,
            remainingBalance: machine.depositAmount,
            note: note || `Added ${amount} to machine deposit`
        });

        await transaction.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `Successfully added ₹${amount} to machine`,
            data: {
                transactionId: transaction._id,
                machineId: machine._id,
                machineName: machine.machineName,
                previousBalance,
                addedAmount: amount,
                newBalance: machine.depositAmount,
                transactionTime: transaction.createdAt
            }
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        await session.endSession();
    }
});

// Withdraw amount from machine with transaction history
export const withdrawAmountFromMachine = catchAsyncError(async (req, res, next) => {
    const { machineId, amount, note } = req.body;

    if (!amount || amount <= 0) {
        return next(new ErrorHandler('Amount must be greater than 0', 400));
    }

    // Start transaction
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const machine = await Machine.findById(machineId).session(session);
        if (!machine) {
            throw new ErrorHandler('Machine not found', 404);
        }

        if (machine.depositAmount < amount) {
            throw new ErrorHandler('Insufficient balance in machine', 400);
        }

        const previousBalance = machine.depositAmount;
        machine.depositAmount -= amount;
        await machine.save({ session });

        // Create transaction record
        const transaction = new MachineTransaction({
            machineId,
            withdrawnAmountFromMachine: amount,
            remainingBalance: machine.depositAmount,
            note: note || `Withdrew ${amount} from machine deposit`
        });

        await transaction.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `Successfully withdrew ₹${amount} from machine`,
            data: {
                transactionId: transaction._id,
                machineId: machine._id,
                machineName: machine.machineName,
                previousBalance,
                withdrawnAmount: amount,
                newBalance: machine.depositAmount,
                transactionTime: transaction.createdAt
            }
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        await session.endSession();
    }
});

// Get machine balance and transaction summary
export const getMachineBalanceSummary = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.params;
    const { days = 30 } = req.query;

    const machine = await Machine.findById(machineId);
    if (!machine) {
        return next(new ErrorHandler('Machine not found', 404));
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get transaction summary
    const transactions = await MachineTransaction.find({
        machineId,
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const summary = {
        currentBalance: machine.depositAmount,
        totalDeposits: transactions.reduce((sum, t) => sum + (t.addedAmountToMachine || 0), 0),
        totalWithdrawals: transactions.reduce((sum, t) => sum + (t.withdrawnAmountFromMachine || 0), 0),
        totalGameBets: transactions.reduce((sum, t) => sum + (t.totalBetAmount || 0), 0),
        totalPayouts: transactions.reduce((sum, t) => sum + (t.payoutAmount || 0), 0),
        transactionCount: transactions.length,
        period: `${days} days`
    };

    res.status(200).json({
        success: true,
        message: 'Machine balance summary fetched successfully',
        data: {
            machineId: machine._id,
            machineName: machine.machineName,
            summary,
            lastUpdated: new Date()
        }
    });
});

// Get all machine transactions (admin view)
export const getAllMachineTransactions = catchAsyncError(async (req, res, next) => {
    const { page = 1, limit = 10, machineId, startDate, endDate, transactionType } = req.query;

    // Build filter object
    const filter = {};
    
    if (machineId) {
        filter.machineId = machineId;
    }

    // Date range filter
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.$lte = new Date(endDate);
        }
    }

    // Transaction type filter
    if (transactionType) {
        if (transactionType === 'deposit') {
            filter.addedAmountToMachine = { $gt: 0 };
        } else if (transactionType === 'withdrawal') {
            filter.withdrawnAmountFromMachine = { $gt: 0 };
        } else if (transactionType === 'game') {
            filter.totalBetAmount = { $gt: 0 };
        }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const transactions = await MachineTransaction.find(filter)
        .populate('machineId', 'machineName machineNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalTransactions = await MachineTransaction.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: 'All machine transactions fetched successfully',
        count: transactions.length,
        totalTransactions,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransactions / limit),
        data: transactions
    });
});

// Get machine transaction history with pagination
export const getMachineTransactionHistoryPaginated = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getMachineTransactionHistoryUtil(machineId, parseInt(page), parseInt(limit));

    res.status(200).json({
        success: true,
        message: 'Machine transaction history fetched successfully',
        data: result.transactions,
        pagination: result.pagination
    });
});

// Get machine balance summary
export const getMachineBalanceSummaryEndpoint = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.params;

    const summary = await getMachineBalanceSummaryUtil(machineId);

    res.status(200).json({
        success: true,
        message: 'Machine balance summary fetched successfully',
        data: summary
    });
});

// Validate transaction integrity
export const validateMachineTransactionIntegrity = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.params;

    const validation = await validateTransactionIntegrity(machineId);

    res.status(200).json({
        success: true,
        message: validation.message,
        data: validation
    });
});

// Reconcile machine balance
export const reconcileMachineBalanceEndpoint = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.params;

    const result = await reconcileMachineBalance(machineId);

    res.status(200).json({
        success: true,
        message: result.message,
        data: result
    });
});

// Get machine transaction analytics
export const getMachineTransactionAnalyticsEndpoint = catchAsyncError(async (req, res, next) => {
    const { machineId } = req.params;
    const { startDate, endDate } = req.query;

    let start, end;
    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
    }

    const analytics = await getMachineTransactionAnalytics(machineId, start, end);

    res.status(200).json({
        success: true,
        message: 'Machine transaction analytics fetched successfully',
        data: analytics
    });
});
