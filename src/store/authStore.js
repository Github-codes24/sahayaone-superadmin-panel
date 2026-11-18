import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (userData, accessTokenArg, refreshTokenArg) => {
        if (typeof userData === 'object' && userData !== null && !accessTokenArg) {
          const user = userData.user || userData;
          const accessToken = userData.accessToken || userData.tokens?.accessToken || userData.token;
          const refreshToken = userData.refreshToken || userData.tokens?.refreshToken || null;
          set({
            user,
            token: accessToken,
            accessToken,
            refreshToken,
            isAuthenticated: !!accessToken,
          });
        } else {
          const accessToken = accessTokenArg;
          const refreshToken = refreshTokenArg || null;
          set({
            user: userData,
            token: accessToken,
            accessToken,
            refreshToken,
            isAuthenticated: !!accessToken,
          });
        }
      },

      setTokens: (tokens) => {
        const accessToken = typeof tokens === 'string' ? tokens : (tokens?.accessToken || tokens?.token);
        const refreshToken = typeof tokens === 'object' ? (tokens?.refreshToken || null) : null;
        set((state) => ({
          token: accessToken,
          accessToken,
          refreshToken: refreshToken !== null ? refreshToken : state.refreshToken,
        }));
      },

      logout: () => set({ 
        user: null, 
        token: null, 
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'super-admin-auth-storage', // unique name preventing collision with bank portal
    }
  )
);

export default useAuthStore;

