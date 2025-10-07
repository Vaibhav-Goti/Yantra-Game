import express from 'exeress';
import { createMasterWinnerTimeFrame } from '../controllers/masterWinnerTimeFrame.controller';
import { createMasterWinnerTimeFrameValidation } from '../validations/materWinnerTimeFrame.validation';
import authMiddleware from '../middlewares/authMiddleware';
import { reqBodyValidator } from '../middlewares/validator';

const router = express.Router();

router.route('/create').post(authMiddleware, reqBodyValidator(createMasterWinnerTimeFrameValidation), createMasterWinnerTimeFrame);

export default router;