import express from 'express';
import { 
    getDailyBalanceReport
} from '../controllers/machine.controller.js';
import telegramAuthMiddleware from '../middlewares/telegramAuthMiddleware.js';

const router = express.Router();

// Protected route - requires Telegram API key authentication
router.route('/deposit-status/:id').get(telegramAuthMiddleware, getDailyBalanceReport);

export default router;
