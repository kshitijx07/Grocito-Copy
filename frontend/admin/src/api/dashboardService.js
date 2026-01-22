import api from './config';

export const dashboardService = {
  // Get dashboard stats based on admin role and pincode
  getDashboardStats: async (adminId) => {
    try {
      console.log('DashboardService: Fetching dashboard stats for admin ID:', adminId);
      const response = await api.get(`/admin/dashboard/stats?adminId=${adminId}`);
      console.log('DashboardService: Dashboard stats received:', response.data);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching dashboard stats:', error);
      
      // Return fallback data if API fails
      return {
        totalUsers: 0,
        activeOrders: 0,
        totalProducts: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        recentOrdersCount: 0,
        error: 'Failed to fetch real-time data'
      };
    }
  },

  // Get recent activity based on admin role and pincode
  getRecentActivity: async (adminId, limit = 10) => {
    try {
      console.log('DashboardService: Fetching recent activity for admin ID:', adminId, 'with limit:', limit);
      const response = await api.get(`/admin/dashboard/recent-activity?adminId=${adminId}&limit=${limit}`);
      console.log('DashboardService: Recent activity received:', response.data);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching recent activity:', error);
      
      // Return fallback data if API fails
      return {
        recentOrders: [],
        totalCount: 0,
        error: 'Failed to fetch recent activity'
      };
    }
  },

  // Get comprehensive dashboard overview
  getDashboardOverview: async (adminId) => {
    try {
      console.log('DashboardService: Fetching dashboard overview for admin ID:', adminId);
      const response = await api.get(`/admin/dashboard/overview?adminId=${adminId}`);
      console.log('DashboardService: Dashboard overview received:', response.data);
      return response.data;
    } catch (error) {
      console.error('DashboardService: Error fetching dashboard overview:', error);
      
      // Return fallback data if API fails
      return {
        stats: {
          totalUsers: 0,
          activeOrders: 0,
          totalProducts: 0,
          todayRevenue: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          recentOrdersCount: 0
        },
        recentActivity: {
          recentOrders: [],
          totalCount: 0
        },
        adminInfo: null,
        error: 'Failed to fetch dashboard data'
      };
    }
  }
};