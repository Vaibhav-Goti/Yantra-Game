import express from 'express';
import { reqBodyValidator } from '../middlewares/validator.js';
import { userRegistrationValidation, userUpdateValidation } from '../validations/user.validation.js';
import { 
    createUser, 
    getProfile, 
    updateProfile, 
    deleteAccount, 
    getAllUsers,
    updateUser,
    deleteUser
} from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/create/user').post(reqBodyValidator(userRegistrationValidation), createUser)

// Protected routes (require authentication)
router.route('/get/profile').get(authMiddleware, getProfile)
router.route('/update/profile').post(authMiddleware,reqBodyValidator(userUpdateValidation), updateProfile)
router.route('/delete/account').post(authMiddleware, deleteAccount)

// Admin routes
router.route('/all').get(authMiddleware, getAllUsers)
router.route('/update').post(authMiddleware, updateUser)
router.route('/delete').post(authMiddleware, deleteUser)

export default router