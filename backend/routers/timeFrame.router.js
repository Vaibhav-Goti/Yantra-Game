import express from 'express';
import { reqBodyValidator } from '../middlewares/validator.js';
import { 
    timeFrameValidation, 
    timeFrameUpdateValidation, 
    timeFrameDeleteValidation,
    timeFrameByMachineValidation 
} from '../validations/timeFrame.validation.js';
import { 
    createTimeFrame,
    getAllTimeFrames,
    getTimeFrameById,
    updateTimeFrame,
    deleteTimeFrame,
    getTimeFramesByMachine,
    getCurrentTimeFrameForMachine,
    getTimeFramesByPercentageRange,
    getTimeFramesWithAnalysis
} from '../controllers/timeFrame.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.route('/create').post(authMiddleware, reqBodyValidator(timeFrameValidation), createTimeFrame);
router.route('/all').get(authMiddleware, getAllTimeFrames);
router.route('/percentage-range').get(authMiddleware, getTimeFramesByPercentageRange);
router.route('/get/:id').get(authMiddleware, getTimeFrameById);
router.route('/update').post(authMiddleware, reqBodyValidator(timeFrameUpdateValidation), updateTimeFrame);
router.route('/delete').post(authMiddleware, reqBodyValidator(timeFrameDeleteValidation), deleteTimeFrame);

// Machine-specific routes
router.route('/by-machine').post(authMiddleware, reqBodyValidator(timeFrameByMachineValidation), getTimeFramesByMachine);
router.route('/current-by-machine').post(authMiddleware, reqBodyValidator(timeFrameByMachineValidation), getCurrentTimeFrameForMachine);
router.route('/analysis-by-machine').post(authMiddleware, reqBodyValidator(timeFrameByMachineValidation), getTimeFramesWithAnalysis);

export default router;
