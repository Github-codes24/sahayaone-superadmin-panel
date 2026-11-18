import axiosInstance from './axiosConfig';

export const bannerService = {
  getBanners: async (params) => {
    // params: { page, limit, search, portalType, bannerType, status }
    const response = await axiosInstance.get('/v1/super-admin/banners', { params });
    return response.data;
  },

  getBannerDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/banners/${id}`);
    return response.data;
  },

  createBanner: async (formData) => {
    const response = await axiosInstance.post('/v1/super-admin/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateBanner: async (id, formData) => {
    const response = await axiosInstance.put(`/v1/super-admin/banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/banners/${id}`);
    return response.data;
  }
};
