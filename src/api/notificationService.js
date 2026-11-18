import axiosInstance from './axiosConfig';

export const notificationService = {
  getNotifications: async (params) => {
    // params: { page, limit, type, isRead }
    const response = await axiosInstance.get('/v1/super-admin/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/v1/super-admin/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.put('/v1/super-admin/notifications/read-all');
    return response.data;
  },

  createNotification: async (data) => {
    // data: { title, description, type, targetRole, actionText, actionUrl, icon, iconColor }
    const response = await axiosInstance.post('/v1/super-admin/notifications', data);
    return response.data;
  }
};
