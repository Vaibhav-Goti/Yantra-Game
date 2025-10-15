import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../modals/user.modal.js";
import Machine from "../modals/machine.modal.js";
import GameSession from "../modals/gameSession.modal.js";

// Get dashboard statistics
export const getDashboardStats = catchAsyncError(async (req, res, next) => {
    // Get total users
    const totalUsers = await User.countDocuments({role: 'Admin'});
    
    // Get total machines
    const totalMachines = await Machine.countDocuments();
    
    // Get active machines
    const activeMachines = await Machine.countDocuments({ status: 'Active' });
    
    // Get game sessions statistics
    const gameStats = await GameSession.aggregate([
        { $match: { status: 'Completed' } },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalFinalAmount: { $sum: '$finalAmount' },
                totalBetAmount: { $sum: '$totalBetAmount' },
                totalDeductedAmount: { $sum: '$totalDeductedAmount' },
                totalUnusedAmount: { $sum: '$unusedAmount' },
                totalAddedAmount: { $sum: '$totalAdded' },
                totalAdjustedDeductedAmount: { $sum: '$adjustedDeductedAmount' }
            }
        }
    ]);

    // Get daily sessions for last 7 days
    const dailySessions = await getDailySessions();
    
    // Get machine status breakdown
    const machineStatus = await Machine.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get recent activities (last 5 game sessions)
    const recentActivities = await GameSession.find({ status: 'Completed' })
        .populate('machineId', 'machineName machineNumber')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('sessionId machineId createdAt');

    // Get latest users
    const latestUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name email createdAt');

    // Get real-time analytics
    const realTimeAnalytics = await getRealTimeAnalytics();

    // Calculate real growth percentages by comparing with previous period
    const userGrowth = await calculateRealGrowth(User, 'createdAt', 30); // 30 days comparison
    const machineGrowth = await calculateRealGrowth(Machine, 'createdAt', 30);
    const sessionGrowth = await calculateRealGrowth(GameSession, 'createdAt', 30, { status: 'Completed' });
    const revenueGrowth = await calculateRevenueGrowth(gameStats[0]?.totalAdjustedDeductedAmount || 0, 7);

    res.status(200).json({
        success: true,
        message: 'Dashboard statistics fetched successfully',
        data: {
            // Stats for the cards
            stats: [
                { 
                    title: 'Users', 
                    value: totalUsers.toLocaleString(), 
                    change: `${userGrowth >= 0 ? '+' : ''}${userGrowth.toFixed(2)}%`, 
                    color: 'text-blue-600' 
                },
                { 
                    title: 'Machines', 
                    value: totalMachines.toString(), 
                    change: `${machineGrowth >= 0 ? '+' : ''}${machineGrowth.toFixed(2)}%`, 
                    color: 'text-green-600' 
                },
                { 
                    title: 'Game Sessions', 
                    value: (gameStats[0]?.totalSessions || 0).toLocaleString(), 
                    change: `${sessionGrowth >= 0 ? '+' : ''}${sessionGrowth.toFixed(2)}%`, 
                    color: 'text-purple-600' 
                },
                { 
                    title: 'Revenue', 
                    value: `₹${(gameStats[0]?.totalAdjustedDeductedAmount || 0).toLocaleString()}`, 
                    change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(2)}%`, 
                    color: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }
            ],
            // Chart data
            sessionsData: dailySessions,
            machineStatus: machineStatus.map(item => ({
                name: item._id,
                value: item.count
            })),
            // Recent activities
            activities: recentActivities.map(activity => 
                `Session ${activity.sessionId} completed on ${activity.machineId?.machineName || 'Unknown Machine'}`
            ),
            // Latest users
            users: latestUsers.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                status: 'Active' // You can add status field to user model if needed
            })),
            // Real-time analytics
            realTime: realTimeAnalytics
        }
    });
});

// Get daily sessions for chart
const getDailySessions = async () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyData = [];
    
    // Get sessions for last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const sessionCount = await GameSession.countDocuments({
            status: 'Completed',
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
        
        const dayName = days[date.getDay()];
        dailyData.push({
            day: dayName,
            sessions: sessionCount
        });
    }
    
    return dailyData;
};

// Get revenue analytics
export const getRevenueAnalytics = catchAsyncError(async (req, res, next) => {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const revenueData = await GameSession.aggregate([
        {
            $match: {
                status: 'Completed',
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                dailyRevenue: { $sum: '$finalAmount' },
                dailySessions: { $sum: 1 },
                dailyBetAmount: { $sum: '$totalBetAmount' }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);
    
    res.status(200).json({
        success: true,
        message: 'Revenue analytics fetched successfully',
        data: revenueData
    });
});

// Get user growth analytics
export const getUserGrowthAnalytics = catchAsyncError(async (req, res, next) => {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const userGrowth = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                dailyRegistrations: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);
    
    res.status(200).json({
        success: true,
        message: 'User growth analytics fetched successfully',
        data: userGrowth
    });
});

// Get real-time dashboard data
export const getRealTimeDashboard = catchAsyncError(async (req, res, next) => {
    const realTimeAnalytics = await getRealTimeAnalytics();
    
    // Get current active sessions
    const activeSessions = await GameSession.find({ status: 'In Progress' })
        .populate('machineId', 'machineName machineNumber status')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('sessionId machineId status createdAt startTime');
    
    // Get today's performance metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await GameSession.aggregate([
        {
            $match: {
                status: 'Completed',
                createdAt: { $gte: today }
            }
        },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalRevenue: { $sum: '$adjustedDeductedAmount' },
                totalBetAmount: { $sum: '$totalBetAmount' },
                averageSessionDuration: { $avg: '$sessionDuration' }
            }
        }
    ]);
    
    res.status(200).json({
        success: true,
        message: 'Real-time dashboard data fetched successfully',
        data: {
            realTime: realTimeAnalytics,
            activeSessions: activeSessions.map(session => ({
                sessionId: session.sessionId,
                machineName: session.machineId?.machineName || 'Unknown',
                machineNumber: session.machineId?.machineNumber || 'N/A',
                startTime: session.startTime,
                status: session.status,
                createdAt: session.createdAt
            })),
            todayStats: todayStats[0] || {
                totalSessions: 0,
                totalRevenue: 0,
                totalBetAmount: 0,
                averageSessionDuration: 0
            },
            lastUpdated: new Date().toISOString()
        }
    });
});

// Helper function to calculate real growth percentage
const calculateRealGrowth = async (Model, dateField, days, additionalFilter = {}) => {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    // Current period count
    const currentCount = await Model.countDocuments({
        [dateField]: { $gte: currentPeriodStart },
        ...additionalFilter
    });
    
    // Previous period count
    const previousCount = await Model.countDocuments({
        [dateField]: { 
            $gte: previousPeriodStart, 
            $lt: currentPeriodStart 
        },
        ...additionalFilter
    });
    
    if (previousCount === 0) {
        return currentCount > 0 ? 100 : 0;
    }
    
    const growth = ((currentCount - previousCount) / previousCount) * 100;
    return Math.round(growth);
};

// Helper function to calculate revenue growth
const calculateRevenueGrowth = async (currentRevenue, days) => {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    // Get current period revenue
    const currentPeriodRevenue = await GameSession.aggregate([
        {
            $match: {
                status: 'Completed',
                createdAt: { $gte: currentPeriodStart }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$adjustedDeductedAmount' }
            }
        }
    ]);
    
    // Get previous period revenue
    const previousPeriodRevenue = await GameSession.aggregate([
        {
            $match: {
                status: 'Completed',
                createdAt: { 
                    $gte: previousPeriodStart, 
                    $lt: currentPeriodStart 
                }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$adjustedDeductedAmount' }
            }
        }
    ]);
    
    const currentAmount = currentPeriodRevenue[0]?.totalRevenue || 0;
    const previousAmount = previousPeriodRevenue[0]?.totalRevenue || 0;
    
    if (previousAmount === 0) {
        return currentAmount > 0 ? 100 : 0;
    }
    
    const growth = ((currentAmount - previousAmount) / previousAmount) * 100;
    return Math.round(growth);
};

// Get real-time analytics
const getRealTimeAnalytics = async () => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisHour = new Date(now);
    thisHour.setMinutes(0, 0, 0);
    
    // Today's sessions
    const todaySessions = await GameSession.countDocuments({
        status: 'Completed',
        createdAt: { $gte: today }
    });
    
    // Yesterday's sessions
    const yesterdaySessions = await GameSession.countDocuments({
        status: 'Completed',
        createdAt: { 
            $gte: yesterday, 
            $lt: today 
        }
    });
    
    // This hour's sessions
    const thisHourSessions = await GameSession.countDocuments({
        status: 'Completed',
        createdAt: { $gte: thisHour }
    });
    
    // Today's revenue
    const todayRevenue = await GameSession.aggregate([
        {
            $match: {
                status: 'Completed',
                createdAt: { $gte: today }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$adjustedDeductedAmount' }
            }
        }
    ]);
    
    // Active machines right now
    const activeMachinesNow = await Machine.countDocuments({ status: 'Active' });
    
    // Sessions in progress
    const sessionsInProgress = await GameSession.countDocuments({ status: 'In Progress' });
    
    // Recent activity (last 10 minutes)
    const tenMinutesAgo = new Date(now);
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
    
    const recentActivity = await GameSession.find({
        createdAt: { $gte: tenMinutesAgo }
    })
    .populate('machineId', 'machineName machineNumber')
    .sort({ createdAt: -1 })
    .limit(3)
    .select('sessionId machineId status createdAt');
    
    return {
        todaySessions,
        yesterdaySessions,
        thisHourSessions,
        todayRevenue: todayRevenue[0]?.totalRevenue || 0,
        activeMachinesNow,
        sessionsInProgress,
        recentActivity: recentActivity.map(activity => ({
            sessionId: activity.sessionId,
            machineName: activity.machineId?.machineName || 'Unknown',
            status: activity.status,
            time: activity.createdAt
        })),
        lastUpdated: now.toISOString()
    };
};
