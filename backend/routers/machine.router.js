import express from 'express';
import { reqBodyValidator } from '../middlewares/validator.js';
import { machineValidation, machineUpdateValidation, machineDeleteValidation, addDepositValidation } from '../validations/machine.validation.js';
import { 
    createMachine, 
    getAllMachines, 
    getMachineById, 
    updateMachine, 
    deleteMachine, 
    getMachinesByStatus, 
    searchMachines,
    addDeposit,
    getDepositStatus
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

export default router;
