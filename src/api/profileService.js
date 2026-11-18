import axiosInstance from './axiosConfig';

export const profileService = {
  // Get super admin profile
  getProfile: async () => {
    const response = await axiosInstance.get('/v1/super-admin/profile');
    return response.data;
  },

  // Update profile details (Name, Email, Phone, Avatar)
  // Supports multipart/form-data for avatar upload
  updateProfile: async (formData) => {
    const response = await axiosInstance.put('/v1/super-admin/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password for logged-in super admin
  changePassword: async (data) => {
    const response = await axiosInstance.post('/v1/super-admin/profile/change-password', data);
    return response.data;
  },

  // Reset user/sub-admin password by ID
  resetUserPassword: async (id, data) => {
    const response = await axiosInstance.post(`/v1/super-admin/profile/reset-user-password/${id}`, data);
    return response.data;
  }
};
