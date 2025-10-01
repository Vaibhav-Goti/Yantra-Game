import express from 'express';
import { getDashboardStats, getRevenueAnalytics, getUserGrowthAnalytics, getRealTimeDashboard } from '../controllers/dashboard.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Dashboard routes (require authentication)
router.route('/stats').get(authMiddleware, getDashboardStats);
router.route('/revenue').get(authMiddleware, getRevenueAnalytics);
router.route('/user-growth').get(authMiddleware, getUserGrowthAnalytics);
router.route('/realtime').get(authMiddleware, getRealTimeDashboard);

export default router;
