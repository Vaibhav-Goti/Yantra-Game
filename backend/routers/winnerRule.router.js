import express from "express";
import { createWinnerRule, getWinnerRule, updateWinnerRule, deleteWinnerRule } from "../controllers/winnerRule.controller.js";
import { reqBodyValidator } from "../middlewares/validator.js";
import { winnerRuleUpdateValidation, winnerRuleValidation } from "../validations/winnerRule.validation.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/create').post(authMiddleware, reqBodyValidator(winnerRuleValidation), createWinnerRule);
router.route('/get').get(authMiddleware, getWinnerRule);
router.route('/update').post(authMiddleware, reqBodyValidator(winnerRuleUpdateValidation), updateWinnerRule);
router.route('/delete').post(authMiddleware, deleteWinnerRule);

export default router;