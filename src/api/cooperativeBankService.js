import axiosInstance from './axiosConfig';

export const cooperativeBankService = {
  getBanks: async (params) => {
    // params: { page, limit, search, sortBy, sortOrder }
    const response = await axiosInstance.get('/v1/super-admin/co-operative-bank', { params });
    return response.data;
  },

  createBank: async (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const response = await axiosInstance.post('/v1/super-admin/co-operative-bank', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  getBankDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/co-operative-bank/${id}`);
    return response.data;
  },

  getBankDropdown: async () => {
    const response = await axiosInstance.get('/v1/super-admin/co-operative-bank/dropdown');
    return response.data;
  },

  updateBank: async (id, data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const response = await axiosInstance.put(`/v1/super-admin/co-operative-bank/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  deleteBank: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/co-operative-bank/${id}`);
    return response.data;
  },

  addCredit: async (id, data) => {
    const response = await axiosInstance.post(`/v1/super-admin/co-operative-bank/${id}/add-credit`, data);
    return response.data;
  },

  calculatePrice: async (type, data) => {
    const endpoint = type === 'EMI' 
      ? '/v1/super-admin/co-operative-bank/calculate-emi-card-price' 
      : '/v1/super-admin/co-operative-bank/calculate-verification-credit-price';
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
  },

  updateBankStatus: async (id, status, remark) => {
    const response = await axiosInstance.patch(`/v1/super-admin/co-operative-bank/${id}/status`, { status, remarks: remark });
    return response.data;
  },

  verifyCashOtp: async (data, id) => {
    const bankId = data?.bankId || id;
    console.log('[cooperativeBankService] verifyCashOtp called with:', { bankId, otp: data?.otp });
    try {
      const response = await axiosInstance.post('/v1/super-admin/co-operative-bank/verify-cash-otp', {
        bankId,
        otp: data?.otp
      });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 && bankId) {
        console.warn('[cooperativeBankService] Falling back to parameterized verify-cash-otp endpoint');
        const fallbackRes = await axiosInstance.post(`/v1/super-admin/co-operative-bank/${bankId}/verify-cash-otp`, {
          bankId,
          otp: data?.otp
        });
        return fallbackRes.data;
      }
      throw err;
    }
  },

  resendCashOtp: async (data, id) => {
    const bankId = data?.bankId || id;
    console.log('[cooperativeBankService] resendCashOtp called with:', { bankId });
    try {
      const response = await axiosInstance.post('/v1/super-admin/co-operative-bank/resend-cash-otp', {
        bankId
      });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 && bankId) {
        console.warn('[cooperativeBankService] Falling back to parameterized resend-cash-otp endpoint');
        const fallbackRes = await axiosInstance.post(`/v1/super-admin/co-operative-bank/${bankId}/resend-cash-otp`, {
          bankId
        });
        return fallbackRes.data;
      }
      throw err;
    }
  },

  getBankStats: async () => {
    const response = await axiosInstance.get('/v1/super-admin/co-operative-bank/stats');
    return response.data;
  }
};
