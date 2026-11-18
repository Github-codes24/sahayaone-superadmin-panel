import axiosInstance from './axiosConfig';

export const leadService = {
  getLeads: async (params) => {
    // params: { page, limit, search, status, fromDate, toDate, state, branch, sortBy, sortOrder }
    const response = await axiosInstance.get('/v1/super-admin/leads', { params });
    return response.data;
  },

  getFilters: async () => {
    const response = await axiosInstance.get('/v1/super-admin/leads/filters');
    return response.data;
  },

  getLeadDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/leads/${id}`);
    return response.data;
  },

  getLeadById: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/leads/${id}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/leads/${id}`);
    return response.data;
  },

  assignToEmployee: async (id, employeeId) => {
    const response = await axiosInstance.put(`/v1/super-admin/leads/${id}/assign`, { employeeId });
    return response.data;
  },

  assignToBank: async (id, bankId) => {
    const response = await axiosInstance.put(`/v1/super-admin/leads/${id}/assign-bank`, { bankId });
    return response.data;
  }
};

export default leadService;
