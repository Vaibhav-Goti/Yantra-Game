import MachineTransaction from "../modals/machineTransaction.modal.js";
import Machine from "../modals/machine.modal.js";
import mongoose from "mongoose";

/**
 * Create a machine transaction record
 * @param {Object} transactionData - Transaction data
 * @param {Object} session - Database session
 * @returns {Promise<Object>} Created transaction
 */
export const createMachineTransaction = async (transactionData, session = null) => {
    const transaction = new MachineTransaction(transactionData);
    return await transaction.save({ session });
};

/**
 * Get machine transaction history with pagination
 * @param {string} machineId - Machine ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Transaction history
 */
export const getMachineTransactionHistory = async (machineId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const transactions = await MachineTransaction.find({ machineId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('machineId', 'machineName machineNumber');

    const totalTransactions = await MachineTransaction.countDocuments({ machineId });

    return {
        transactions,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalTransactions / limit),
            totalTransactions,
            hasNextPage: page < Math.ceil(totalTransactions / limit),
            hasPrevPage: page > 1
        }
    };
};

/**
 * Get machine balance summary with transaction statistics
 * @param {string} machineId - Machine ID
 * @returns {Promise<Object>} Balance summary
 */
export const getMachineBalanceSummary = async (machineId) => {
    const machine = await Machine.findById(machineId);
    if (!machine) {
        throw new Error('Machine not found');
    }

    // Get transaction statistics
    const stats = await MachineTransaction.aggregate([
        { $match: { machineId: new mongoose.Types.ObjectId(machineId) } },
        {
            $group: {
                _id: null,
                totalAdded: { $sum: '$addedAmountToMachine' },
                totalWithdrawn: { $sum: '$withdrawnAmountFromMachine' },
                totalBetAmount: { $sum: '$totalBetAmount' },
                totalPayoutAmount: { $sum: '$payoutAmount' },
                totalDeductedAmount: { $sum: '$deductedAmount' },
                transactionCount: { $sum: 1 }
            }
        }
    ]);

    const transactionStats = stats[0] || {
        totalAdded: 0,
        totalWithdrawn: 0,
        totalBetAmount: 0,
        totalPayoutAmount: 0,
        totalDeductedAmount: 0,
        transactionCount: 0
    };

    return {
        machine: {
            _id: machine._id,
            machineName: machine.machineName,
            machineNumber: machine.machineNumber,
            currentBalance: machine.depositAmount,
            status: machine.status
        },
        transactionStats,
        netProfit: transactionStats.totalBetAmount - transactionStats.totalPayoutAmount - transactionStats.totalDeductedAmount
    };
};

/**
 * Validate transaction integrity
 * @param {string} machineId - Machine ID
 * @returns {Promise<Object>} Validation result
 */
export const validateTransactionIntegrity = async (machineId) => {
    const machine = await Machine.findById(machineId);
    if (!machine) {
        throw new Error('Machine not found');
    }

    // Get all transactions for this machine
    const transactions = await MachineTransaction.find({ machineId }).sort({ createdAt: 1 });
    
    if (transactions.length === 0) {
        return {
            isValid: true,
            message: 'No transactions found',
            currentBalance: machine.depositAmount
        };
    }

    // Calculate expected balance from transactions
    let calculatedBalance = 0;
    const issues = [];

    for (const transaction of transactions) {
        calculatedBalance += transaction.addedAmountToMachine || 0;
        calculatedBalance -= transaction.withdrawnAmountFromMachine || 0;
        calculatedBalance -= transaction.payoutAmount || 0;
        calculatedBalance -= transaction.deductedAmount || 0;

        // Check if transaction balance matches expected
        if (Math.abs(transaction.remainingBalance - calculatedBalance) > 0.01) {
            issues.push({
                transactionId: transaction._id,
                expectedBalance: calculatedBalance,
                recordedBalance: transaction.remainingBalance,
                difference: transaction.remainingBalance - calculatedBalance
            });
        }
    }

    const isValid = issues.length === 0;
    const currentBalance = machine.depositAmount;
    const expectedBalance = calculatedBalance;

    return {
        isValid,
        currentBalance,
        expectedBalance,
        difference: currentBalance - expectedBalance,
        issues,
        message: isValid ? 'Transaction integrity verified' : 'Transaction integrity issues found'
    };
};

/**
 * Reconcile machine balance with transaction history
 * @param {string} machineId - Machine ID
 * @param {Object} session - Database session
 * @returns {Promise<Object>} Reconciliation result
 */
export const reconcileMachineBalance = async (machineId, session = null) => {
    const dbSession = session || await mongoose.startSession();
    const shouldEndSession = !session;

    try {
        if (!session) {
            dbSession.startTransaction();
        }

        const machine = await Machine.findById(machineId).session(dbSession);
        if (!machine) {
            throw new Error('Machine not found');
        }

        const validation = await validateTransactionIntegrity(machineId);
        
        if (validation.isValid) {
            return {
                success: true,
                message: 'Balance is already correct',
                currentBalance: machine.depositAmount
            };
        }

        // Update machine balance to match calculated balance
        const oldBalance = machine.depositAmount;
        machine.depositAmount = validation.expectedBalance;
        await machine.save({ session: dbSession });

        // Create reconciliation transaction
        const reconciliationTransaction = new MachineTransaction({
            machineId: machine._id,
            note: `Balance reconciliation - Adjusted from ${oldBalance} to ${validation.expectedBalance}`,
            remainingBalance: validation.expectedBalance
        });

        await reconciliationTransaction.save({ session: dbSession });

        if (shouldEndSession) {
            await dbSession.commitTransaction();
        }

        return {
            success: true,
            message: 'Balance reconciled successfully',
            oldBalance,
            newBalance: validation.expectedBalance,
            adjustment: validation.expectedBalance - oldBalance,
            transactionId: reconciliationTransaction._id
        };

    } catch (error) {
        if (shouldEndSession) {
            await dbSession.abortTransaction();
        }
        throw error;
    } finally {
        if (shouldEndSession) {
            await dbSession.endSession();
        }
    }
};

/**
 * Get transaction analytics for a machine
 * @param {string} machineId - Machine ID
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 * @returns {Promise<Object>} Analytics data
 */
export const getMachineTransactionAnalytics = async (machineId, startDate, endDate) => {
    const matchStage = {
        machineId: new mongoose.Types.ObjectId(machineId)
    };

    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }

    const analytics = await MachineTransaction.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalBetAmount: { $sum: '$totalBetAmount' },
                totalPayoutAmount: { $sum: '$payoutAmount' },
                totalDeductedAmount: { $sum: '$deductedAmount' },
                totalAdded: { $sum: '$addedAmountToMachine' },
                totalWithdrawn: { $sum: '$withdrawnAmountFromMachine' },
                averageBetAmount: { $avg: '$totalBetAmount' },
                averagePayoutAmount: { $avg: '$payoutAmount' }
            }
        }
    ]);

    const result = analytics[0] || {
        totalTransactions: 0,
        totalBetAmount: 0,
        totalPayoutAmount: 0,
        totalDeductedAmount: 0,
        totalAdded: 0,
        totalWithdrawn: 0,
        averageBetAmount: 0,
        averagePayoutAmount: 0
    };

    result.netProfit = result.totalBetAmount - result.totalPayoutAmount - result.totalDeductedAmount;
    result.profitMargin = result.totalBetAmount > 0 ? (result.netProfit / result.totalBetAmount) * 100 : 0;

    return result;
};
