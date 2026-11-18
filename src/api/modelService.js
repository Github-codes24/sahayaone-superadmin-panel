import axiosInstance from './axiosConfig';

export const modelService = {
  getModels: async (params) => {
    // params: { page, limit, search, productId, brandId, category }
    const response = await axiosInstance.get('/v1/super-admin/models', { params });
    return response.data;
  },

  getModelDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/models/${id}`);
    return response.data;
  },

  createModel: async (formData) => {
    const response = await axiosInstance.post('/v1/super-admin/models', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateModel: async (id, formData) => {
    const response = await axiosInstance.put(`/v1/super-admin/models/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteModel: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/models/${id}`);
    return response.data;
  }
};
