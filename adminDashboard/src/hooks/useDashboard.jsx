import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsApi, getRevenueAnalyticsApi, getUserGrowthAnalyticsApi, getRealTimeDashboardApi } from "../apis/dashboardApis";

// Hook for dashboard statistics - returns data in format expected by your UI
export const useDashboardStats = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStatsApi,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        },
    });

    return { 
        data, 
        isLoading, 
        isError, 
        error,
        // Return data in the exact format your UI expects
        stats: data?.data?.stats || [
            { title: 'Users', value: '1,245', change: '+12%', color: 'text-blue-600' },
            { title: 'Machines', value: '58', change: '+4%', color: 'text-green-600' },
            { title: 'Game Sessions', value: '3,421', change: '+8%', color: 'text-purple-600' },
            { title: 'Revenue', value: '₹12,340', change: '+15%', color: 'text-yellow-600' },
        ],
        sessionsData: data?.data?.sessionsData || [
            { day: 'Mon', sessions: 120 },
            { day: 'Tue', sessions: 200 },
            { day: 'Wed', sessions: 150 },
            { day: 'Thu', sessions: 300 },
            { day: 'Fri', sessions: 250 },
            { day: 'Sat', sessions: 400 },
            { day: 'Sun', sessions: 350 },
        ],
        machineStatus: data?.data?.machineStatus || [
            { name: 'Active', value: 45 },
            { name: 'Inactive', value: 13 },
        ],
        activities: data?.data?.activities || [
            'User123 started a session on Machine #5',
            'Machine #12 went offline',
            'Revenue report generated',
            'New user registered',
            'Game Session #3412 ended',
        ],
        users: data?.data?.users || [
            { id: 1, name: 'Alice', email: 'alice@example.com', status: 'Active' },
            { id: 2, name: 'Bob', email: 'bob@example.com', status: 'Inactive' },
            { id: 3, name: 'Charlie', email: 'charlie@example.com', status: 'Active' },
        ]
    };
};

// Hook for real-time dashboard data
export const useRealTimeDashboard = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['realTimeDashboard'],
        queryFn: getRealTimeDashboardApi,
        staleTime: 1000 * 30, // 30 seconds - more frequent updates
        refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        },
    });

    return { 
        data, 
        isLoading, 
        isError, 
        error,
        realTime: data?.data?.realTime || null,
        activeSessions: data?.data?.activeSessions || [],
        todayStats: data?.data?.todayStats || null,
        lastUpdated: data?.data?.lastUpdated || null
    };
};

// Hook for revenue analytics
export const useRevenueAnalytics = (params = {}) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['revenueAnalytics', params],
        queryFn: () => getRevenueAnalyticsApi(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        },
    });

    return { 
        data, 
        isLoading, 
        isError, 
        error,
        analytics: data?.data || []
    };
};

// Hook for user growth analytics
export const useUserGrowthAnalytics = (params = {}) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['userGrowthAnalytics', params],
        queryFn: () => getUserGrowthAnalyticsApi(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        },
    });

    return { 
        data, 
        isLoading, 
        isError, 
        error,
        analytics: data?.data || []
    };
};
