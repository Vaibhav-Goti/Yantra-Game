import express from 'express';
import { createJackpotWinner, getJackpotWinner, updateJackpotWinner, deleteJackpotWinner, getJackpotWinnerById } from '../controllers/jackpotWinner.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { reqBodyValidator } from '../middlewares/validator.js';
import { createJackpotWinnerValidation, updateJackpotWinnerValidation } from '../utils/jackpotWinner.validation.js';

const router = express.Router();

router.route('/create').post(authMiddleware, reqBodyValidator(createJackpotWinnerValidation), createJackpotWinner);
router.route('/get').get(authMiddleware, getJackpotWinner);
router.route('/update').post(authMiddleware, reqBodyValidator(updateJackpotWinnerValidation), updateJackpotWinner);
router.route('/delete').post(authMiddleware, deleteJackpotWinner);
router.route('/get/:id').get(authMiddleware, getJackpotWinnerById);

export default router;