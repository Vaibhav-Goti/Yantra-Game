import apiUtils from "./apiUtils";

// Get dashboard statistics
export const getDashboardStatsApi = async () => {
    return apiUtils('GET', '/dashboard/stats');
};

// Get revenue analytics
export const getRevenueAnalyticsApi = async (params = {}) => {
    let url = '/dashboard/revenue';
    if (params.days) {
        url += `?days=${params.days}`;
    }
    return apiUtils('GET', url);
};

// Get user growth analytics
export const getUserGrowthAnalyticsApi = async (params = {}) => {
    let url = '/dashboard/user-growth';
    if (params.days) {
        url += `?days=${params.days}`;
    }
    return apiUtils('GET', url);
};

// Get real-time dashboard data
export const getRealTimeDashboardApi = async () => {
    return apiUtils('GET', '/dashboard/realtime');
};
