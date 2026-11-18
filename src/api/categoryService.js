import axiosInstance from './axiosConfig';

export const categoryService = {
  getCategories: async (params) => {
    // params: { page, limit, search }
    const response = await axiosInstance.get('/v1/super-admin/categories', { params });
    return response.data;
  },

  getCategoriesDropdown: async () => {
    const response = await axiosInstance.get('/v1/super-admin/categories/dropdown');
    return response.data;
  },

  getCategoryDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (formData) => {
    const response = await axiosInstance.post('/v1/super-admin/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCategory: async (id, formData) => {
    const response = await axiosInstance.put(`/v1/super-admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/categories/${id}`);
    return response.data;
  }
};
