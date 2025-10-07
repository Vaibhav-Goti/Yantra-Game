import express from 'express';
import { reqBodyValidator } from '../middlewares/validator.js';
import { machineValidation, machineUpdateValidation, machineDeleteValidation, addDepositValidation, addAmountValidation, withdrawAmountValidation } from '../validations/machine.validation.js';
import { 
    createMachine, 
    getAllMachines, 
    getMachineById, 
    updateMachine, 
    deleteMachine, 
    getMachinesByStatus, 
    searchMachines,
    addDeposit,
    getDepositStatus,
    getMachineTransactionHistory,
    addAmountToMachine,
    withdrawAmountFromMachine,
    getMachineBalanceSummary,
    getAllMachineTransactions,
    getMachineTransactionHistoryPaginated,
    getMachineBalanceSummaryEndpoint,
    validateMachineTransactionIntegrity,
    reconcileMachineBalanceEndpoint,
    getMachineTransactionAnalyticsEndpoint
} from '../controllers/machine.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (if needed)
// router.route('/').get(getAllMachines);

// Protected routes (require authentication)
router.route('/create').post(authMiddleware, reqBodyValidator(machineValidation), createMachine);
router.route('/all').get(authMiddleware, getAllMachines);
router.route('/search').get(authMiddleware, searchMachines);
router.route('/status/:status').get(authMiddleware, getMachinesByStatus);
router.route('/get/:id').get(authMiddleware, getMachineById);
router.route('/update').post(authMiddleware, reqBodyValidator(machineUpdateValidation), updateMachine);
router.route('/delete').post(authMiddleware, reqBodyValidator(machineDeleteValidation), deleteMachine);
router.route('/add-deposit').post(authMiddleware, reqBodyValidator(addDepositValidation), addDeposit);
router.route('/deposit-status/:id').get(getDepositStatus);

// Transaction Management Routes
router.route('/transactions').get(authMiddleware, getMachineTransactionHistory);
router.route('/add-amount').post(authMiddleware, reqBodyValidator(addAmountValidation), addAmountToMachine);
router.route('/withdraw-amount').post(authMiddleware, reqBodyValidator(withdrawAmountValidation), withdrawAmountFromMachine);
router.route('/balance-summary/:machineId').get(authMiddleware, getMachineBalanceSummary);
router.route('/all-transactions').get(authMiddleware, getAllMachineTransactions);

// Enhanced Transaction Management Routes
router.route('/transactions-paginated/:machineId').get(authMiddleware, getMachineTransactionHistoryPaginated);
router.route('/balance-summary-enhanced/:machineId').get(authMiddleware, getMachineBalanceSummaryEndpoint);
router.route('/validate-integrity/:machineId').get(authMiddleware, validateMachineTransactionIntegrity);
router.route('/reconcile-balance/:machineId').post(authMiddleware, reconcileMachineBalanceEndpoint);
router.route('/analytics/:machineId').get(authMiddleware, getMachineTransactionAnalyticsEndpoint);

export default router;
