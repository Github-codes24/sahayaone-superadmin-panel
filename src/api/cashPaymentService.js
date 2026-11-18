import axiosInstance from './axiosConfig';

export const cashPaymentService = {
  getCashPayments: async (params) => {
    // params: { page, limit, search }
    const response = await axiosInstance.get('/v1/super-admin/cash-payment', { params });
    return response.data;
  },

  getCashPaymentDetails: async (id, params) => {
    // params: { page, limit, fromDate, toDate }
    const response = await axiosInstance.get(`/v1/super-admin/cash-payment/${id}`, { params });
    return response.data;
  },

  submitCash: async (id, data) => {
    // data: { date, amount, remarks }
    const response = await axiosInstance.post(`/v1/super-admin/cash-payment/${id}/submit-cash`, data);
    return response.data;
  }
};
