import axiosInstance from './axiosConfig';

export const settingsService = {
  // Price Settings
  getPriceSettings: async () => {
    const response = await axiosInstance.get('/v1/super-admin/settings/price');
    return response.data;
  },

  updatePriceSettings: async (data) => {
    const response = await axiosInstance.put('/v1/super-admin/settings/price', data);
    return response.data;
  },

  // Support Settings
  getSupportSettings: async () => {
    const response = await axiosInstance.get('/v1/super-admin/settings/support');
    return response.data;
  },

  updateSupportSettings: async (data) => {
    const response = await axiosInstance.put('/v1/super-admin/settings/support', data);
    return response.data;
  }
};
