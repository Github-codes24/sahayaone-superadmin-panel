import axiosInstance from './axiosConfig';

export const onboardingTeamService = {
  getFilterOptions: async () => {
    const response = await axiosInstance.get('/v1/super-admin/onboarding-team/filters');
    return response.data;
  },

  getOnboardingTeams: async (params) => {
    // params: { page, limit, search, onboardingTeamType, region, branch, status }
    const response = await axiosInstance.get('/v1/super-admin/onboarding-team', { params });
    return response.data;
  },

  getOnboardingTeamDetails: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/onboarding-team/${id}`);
    return response.data;
  },

  getMemberById: async (id) => {
    const response = await axiosInstance.get(`/v1/super-admin/onboarding-team/${id}`);
    return response.data;
  },

  createOnboardingTeam: async (formData) => {
    // multipart/form-data
    const response = await axiosInstance.post('/v1/super-admin/onboarding-team', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateOnboardingTeam: async (id, data) => {
    const response = await axiosInstance.put(`/v1/super-admin/onboarding-team/${id}`, data);
    return response.data;
  },

  deleteOnboardingTeam: async (id) => {
    const response = await axiosInstance.delete(`/v1/super-admin/onboarding-team/${id}`);
    return response.data;
  },

  export: async (params) => {
    const response = await axiosInstance.get('/v1/super-admin/onboarding-team/export', { params, responseType: 'blob' });
    return response.data;
  }
};
