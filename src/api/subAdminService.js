import axiosInstance from './axiosConfig';

export const subAdminService = {
  getSubAdmins: async (params) => {
    // params: { page, limit, search }
    const response = await axiosInstance.get('/v1/super-admin/roles-permissions', { params });
    return response.data;
  },

  getPermissions: async () => {
    const response = await axiosInstance.get('/v1/super-admin/roles-permissions/permissions');
    return response.data;
  },

  getSubAdminDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/roles-permissions/${id}`);
    return response.data;
  },

  createSubAdmin: async (data) => {
    const response = await axiosInstance.post('/v1/super-admin/roles-permissions', data);
    return response.data;
  },

  updateSubAdmin: async (id, data) => {
    const response = await axiosInstance.put(`/v1/super-admin/roles-permissions/${id}`, data);
    return response.data;
  },

  deleteSubAdmin: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/roles-permissions/${id}`);
    return response.data;
  }
};
