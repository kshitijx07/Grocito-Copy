import api from './config';

export const dashboardService = {
  // Get basic dashboard stats (placeholder for future implementation)
  getDashboardStats: async () => {
    try {
      // For now, return static data
      return {
        totalUsers: 0,
        activeOrders: 0,
        totalProducts: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        recentOrdersCount: 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activity (placeholder for future implementation)
  getRecentActivity: async (limit = 10) => {
    try {
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
};