import express from 'express';
import { reqBodyValidator } from '../middlewares/validator.js';
import { 
    buttonPressValidation, 
    gameResultValidation, 
    machineStatusValidation 
} from '../validations/hardware.validation.js';
import { 
    processButtonPresses,
    getGameSession,
    getAllGameSessions,
    getGameSessionsByMachine,
    getGameStatistics,
    getMachineStatus,
    updateMachineStatus,
    startGameSession,
    storeButtonPresses
} from '../controllers/hardware.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Hardware integration routes (no authentication needed - called directly from hardware)
router.route('/process-game').post(reqBodyValidator(buttonPressValidation), processButtonPresses); // Main endpoint
router.route('/machine-status').post(updateMachineStatus); // Hardware status update
router.route('/start-game').post(startGameSession);
router.route('/store-button-presses').post(storeButtonPresses);

// Admin routes (require authentication for accessing stored data)
router.route('/session/:sessionId').get(authMiddleware, getGameSession);
router.route('/sessions').get(authMiddleware, getAllGameSessions);
router.route('/sessions/by-machine').post(authMiddleware, getGameSessionsByMachine);
router.route('/statistics').get(authMiddleware, getGameStatistics);
router.route('/machine/:machineId/status').get(authMiddleware, getMachineStatus); 

export default router;
