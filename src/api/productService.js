import axiosInstance from './axiosConfig';

export const productService = {
  getProducts: async (params) => {
    // params: { page, limit, search, brandId, category }
    const response = await axiosInstance.get('/v1/super-admin/products', { params });
    return response.data;
  },

  getProductsDropdown: async (params) => {
    // params: { brandId, category }
    const response = await axiosInstance.get('/v1/super-admin/products/dropdown', { params });
    return response.data;
  },

  getProductDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/products/${id}`);
    return response.data;
  },

  createProduct: async (formData) => {
    const response = await axiosInstance.post('/v1/super-admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, formData) => {
    const response = await axiosInstance.put(`/v1/super-admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/products/${id}`);
    return response.data;
  }
};
