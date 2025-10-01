import express from 'express';
import { login, refreshToken, logout, changePassword, forgotPassword, resetPassword } from '../controllers/auth.contoller.js';
import { reqBodyValidator } from '../middlewares/validator.js';
import { userLoginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validations/user.validation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Login endpoint
router.route('/login').post(reqBodyValidator(userLoginValidation), login)

// Refresh token endpoint
router.route('/refresh').post(refreshToken)

// Logout endpoint
router.route('/logout').post(logout)

// Change password endpoint
router.route('/change-password').post(authMiddleware, changePassword)

// Forgot password endpoint
router.route('/forgot-password').post(reqBodyValidator(forgotPasswordValidation), forgotPassword)

// Reset password endpoint
router.route('/reset-password').post(reqBodyValidator(resetPasswordValidation), resetPassword)

export default router;