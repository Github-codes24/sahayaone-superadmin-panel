import axios from 'axios';
import useAuthStore from '../store/authStore';
import useLoadingStore from '../store/loadingStore';

// Always prefer the relative '/api' proxy for both local Vite dev and Netlify production.
// This routes all requests through Netlify / Vite proxy and completely eliminates CORS issues.
let apiBaseUrl = '/api';
const envUrl = import.meta.env.VITE_API_URL;

if (envUrl && !envUrl.includes('onrender.com') && envUrl !== '/api') {
  const trimmed = envUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    apiBaseUrl = trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/+$/, '')}/api`;
  }
}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mutex & Queue for token refresh to avoid race conditions with multiple concurrent requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// In-memory API Response Cache for instant page transitions across the application
const apiCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export const clearApiCache = () => {
  apiCache.clear();
};

// Helper to determine if global loader overlay should be displayed
const shouldTriggerGlobalLoader = (config) => {
  if (config.skipLoader) return false;
  if (config.showLoader === true) return true;
  const method = (config.method || 'get').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isAuthRefresh = config.url?.includes('/auth/refresh');
  return isMutation && !isAuthRefresh;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // In-memory Cache Check for GET requests
    const method = (config.method || 'get').toUpperCase();
    if (method === 'GET' && !config.skipCache && !config.headers?.['x-skip-cache']) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      const cached = apiCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        config.adapter = () => {
          return Promise.resolve({
            data: JSON.parse(JSON.stringify(cached.data)),
            status: cached.status || 200,
            statusText: 'OK (Cached)',
            headers: cached.headers || {},
            config,
            request: {}
          });
        };
      }
    }

    if (shouldTriggerGlobalLoader(config)) {
      config._hasTriggeredLoader = true;
      useLoadingStore.getState().showLoader();
    }

    const token = useAuthStore.getState().accessToken || useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (error.config?._hasTriggeredLoader) {
      useLoadingStore.getState().hideLoader();
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const config = response.config;
    const method = (config?.method || 'get').toUpperCase();

    // Invalidate cache on mutations so subsequent GETs get fresh data
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      apiCache.clear();
    } else if (method === 'GET' && !config?.skipCache && response.status === 200) {
      // Save successful GET response in cache
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      apiCache.set(cacheKey, {
        data: response.data,
        status: response.status,
        headers: response.headers,
        timestamp: Date.now()
      });
    }

    if (response.config?._hasTriggeredLoader) {
      useLoadingStore.getState().hideLoader();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?._hasTriggeredLoader) {
      useLoadingStore.getState().hideLoader();
      originalRequest._hasTriggeredLoader = false;
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check for 401 Unauthorized (exclude login and refresh endpoints)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        useLoadingStore.getState().hideLoader();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const baseURL = axiosInstance.defaults.baseURL || '/api';
        const response = await axios.post(`${baseURL}/v1/super-admin/auth/refresh`, {
          refreshToken,
        });

        const resData = response.data?.data || response.data || {};
        const newAccessToken = resData.accessToken || resData.tokens?.accessToken || resData.token;
        const newRefreshToken = resData.refreshToken || resData.tokens?.refreshToken || refreshToken;

        if (newAccessToken) {
          useAuthStore.getState().setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh response payload');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useLoadingStore.getState().hideLoader();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
