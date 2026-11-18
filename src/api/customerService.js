import axiosInstance from './axiosConfig';

export const customerService = {
  getCustomers: async (params) => {
    const response = await axiosInstance.get('/v1/super-admin/customers', { params });
    return response.data;
  },

  getCustomerDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/customers/${id}`);
    return response.data;
  },

  createCustomer: async (formData) => {
    const response = await axiosInstance.post('/v1/super-admin/customers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCustomer: async (id, formData) => {
    const response = await axiosInstance.put(`/v1/super-admin/customers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/customers/${id}`);
    return response.data;
  },

  getCustomerLoans: async (id, params) => {
    const response = await axiosInstance.get(`/v1/super-admin/customers/${id}/loans`, { params });
    return response.data;
  },

  getSingleLoanDetails: async (id, loanId) => {
    const response = await axiosInstance.get(`/v1/super-admin/customers/${id}/loans/${loanId}`);
    return response.data;
  }
};
