import axiosInstance from './axiosConfig';

export const authService = {
  getRoles: async () => {
    const response = await axiosInstance.get('/v1/super-admin/auth/roles');
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/v1/super-admin/auth/login', credentials);
    return response.data;
  },

  requestOtp: async (email) => {
    const response = await axiosInstance.post('/v1/super-admin/auth/forgot-password', { email });
    return response.data;
  },

  resendOtp: async (email) => {
    const response = await axiosInstance.post('/v1/super-admin/auth/resend-otp', { email });
    return response.data;
  },

  verifyOtp: async (data) => {
    // data: { email, otp }
    const response = await axiosInstance.post('/v1/super-admin/auth/verify-otp', data);
    return response.data;
  },

  resetPassword: async (data) => {
    // data: { email, password, confirmPassword }
    const response = await axiosInstance.post('/v1/super-admin/auth/reset-password', data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/v1/super-admin/auth/logout');
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await axiosInstance.post('/v1/super-admin/auth/refresh', { refreshToken });
    return response.data;
  }
};
