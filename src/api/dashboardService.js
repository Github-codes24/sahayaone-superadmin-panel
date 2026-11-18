import axiosInstance from './axiosConfig';

export const dashboardService = {
  getDashboardOverview: async (timeFilter = 'Today') => {
    try {
      const response = await axiosInstance.get('/v1/super-admin/dashboard', {
        params: { timeFilter }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }
};
