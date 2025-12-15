import express from 'express';
import { 
    getDailyBalanceReport
} from '../controllers/machine.controller.js';

const router = express.Router();

router.route('/deposit-status/:id').get(getDailyBalanceReport);

export default router;
