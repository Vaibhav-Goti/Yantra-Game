import express from 'express';
import { reqBodyValidator } from '../middlewares/validator.js';
import { 
    startGameSession,
    storeButtonPresses,
    stopGameSession
} from '../controllers/hardware.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { 
    buttonPressValidation,
    gameResultValidation,
    machineStatusValidation
} from '../validations/hardware.validation.js';

const router = express.Router();

// version 2.0 features
router.route('/start-game').post(startGameSession);
router.route('/store-button-presses').post(storeButtonPresses);
router.route('/process-game').post(stopGameSession);

export default router;
