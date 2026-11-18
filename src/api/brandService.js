import axiosInstance from './axiosConfig';

export const brandService = {
  getBrands: async (params) => {
    // params: { page, limit, search, category }
    const response = await axiosInstance.get('/v1/super-admin/brands', { params });
    return response.data;
  },

  getBrandsDropdown: async (params) => {
    // params: { category }
    const response = await axiosInstance.get('/v1/super-admin/brands/dropdown', { params });
    return response.data;
  },

  getBrandDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/brands/${id}`);
    return response.data;
  },

  createBrand: async (formData) => {
    const response = await axiosInstance.post('/v1/super-admin/brands', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateBrand: async (id, formData) => {
    const response = await axiosInstance.put(`/v1/super-admin/brands/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBrand: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/brands/${id}`);
    return response.data;
  }
};
