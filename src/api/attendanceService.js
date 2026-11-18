import axiosInstance from './axiosConfig';

/**
 * Super Admin Attendance & Attendance Report Service
 * Implements the Super Admin Panel Attendance API Specification
 * Base URLs:
 *   /api/v1/super-admin/attendance
 *   /api/v1/super-admin/attendance-report
 */
export const attendanceService = {
  /**
   * 1. Today's Attendance Snapshot
   * GET /api/v1/super-admin/attendance/today
   */
  getTodayStatus: async () => {
    const candidateUrls = [
      '/v1/super-admin/attendance/today',
      '/v1/attendance/today'
    ];
    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.get(url);
        if (response.data) return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    if (lastError) throw lastError;
    return { success: false, data: { todayAttendance: null } };
  },

  /**
   * 2. Punch-In (Check-In) with Geolocation
   * POST /api/v1/super-admin/attendance/punch-in
   * @param {Object} data { latitude, longitude, address }
   */
  punchIn: async (data) => {
    const latitude = data?.latitude ?? data?.lat ?? data?.latitute ?? data?.location?.latitude;
    const longitude = data?.longitude ?? data?.lng ?? data?.langitute ?? data?.location?.longitude;
    const address = data?.address ?? data?.location?.address ?? '';

    const payload = {
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : undefined,
      address: address ? String(address).slice(0, 500) : ''
    };

    const candidateUrls = [
      '/v1/super-admin/attendance/punch-in',
      '/v1/attendance/punch-in'
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.post(url, payload);
        if (response.data) return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    if (lastError) throw lastError;
  },

  /**
   * 3. Punch-Out (Check-Out)
   * POST /api/v1/super-admin/attendance/punch-out
   * @param {Object} data { latitude, longitude, address }
   */
  punchOut: async (data) => {
    const latitude = data?.latitude ?? data?.lat ?? data?.latitute ?? data?.location?.latitude;
    const longitude = data?.longitude ?? data?.lng ?? data?.langitute ?? data?.location?.longitude;
    const address = data?.address ?? data?.location?.address ?? '';

    const payload = {
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : undefined,
      address: address ? String(address).slice(0, 500) : ''
    };

    const candidateUrls = [
      '/v1/super-admin/attendance/punch-out',
      '/v1/attendance/punch-out'
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.post(url, payload);
        if (response.data) return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    if (lastError) throw lastError;
  },

  /**
   * 4. Monthly Attendance Summary Cards
   * GET /api/v1/super-admin/attendance/report?month=&year=
   * @param {Object} params { month, year }
   */
  getMonthlySummaryCards: async (params = {}) => {
    const query = {
      ...(params.month ? { month: Number(params.month) } : {}),
      ...(params.year ? { year: Number(params.year) } : {})
    };

    const candidateUrls = [
      '/v1/super-admin/attendance/report',
      '/v1/attendance/report'
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.get(url, { params: query });
        if (response.data) return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    if (lastError) throw lastError;
    return { success: false, data: null };
  },

  /**
   * 5. Monthly Attendance Sheet (Admin Personnel Only)
   * GET /api/v1/super-admin/attendance/sheet
   * @param {Object} params { month, year, search, page, limit }
   */
  getMonthlySheet: async (params = {}) => {
    const candidateEndpoints = [
      '/v1/super-admin/attendance/sheet',
      '/v1/super-admin/attendance/monthly-sheet',
      '/v1/super-admin/attendance/monthly-data',
      '/v1/attendance/sheet'
    ];

    let lastError = null;
    for (const url of candidateEndpoints) {
      try {
        const response = await axiosInstance.get(url, { params });
        if (response.status === 200 && response.data) {
          return response.data;
        }
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    if (lastError) throw lastError;
    return { success: true, data: { items: [], daysInMonth: 31 } };
  },

  /**
   * 6. Yearly Attendance Matrix (12-Month Summary)
   * GET /api/v1/super-admin/attendance/yearly-matrix
   * @param {Object} params { year, search, page, limit }
   */
  getYearlyMatrix: async (params = {}) => {
    const candidateEndpoints = [
      '/v1/super-admin/attendance/yearly-matrix',
      '/v1/super-admin/attendance/matrix',
      '/v1/super-admin/attendance/yearly-data',
      '/v1/attendance/yearly-matrix'
    ];

    let lastError = null;
    for (const url of candidateEndpoints) {
      try {
        const response = await axiosInstance.get(url, { params });
        if (response.status === 200 && response.data) {
          return response.data;
        }
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    if (lastError) throw lastError;
    return { success: true, data: { items: [] } };
  },

  /**
   * 7. Single Person Attendance Report
   * GET /api/v1/super-admin/attendance/single-report?userId=&month=&year=
   * Or GET /api/v1/super-admin/attendance/user/:id/report
   * @param {Object} params { userId, employeeId, id, month, year }
   */
  getSinglePersonReport: async (params = {}) => {
    const targetId = params.userId || params.employeeId || params.id;
    const query = {
      ...(targetId ? { userId: targetId, employeeId: targetId } : {}),
      ...(params.month ? { month: Number(params.month) } : {}),
      ...(params.year ? { year: Number(params.year) } : {})
    };

    const candidateUrls = [
      '/v1/super-admin/attendance/single-report',
      ...(targetId ? [`/v1/super-admin/attendance/user/${targetId}/report`] : []),
      '/v1/super-admin/attendance-report/single-person',
      ...(targetId ? [`/v1/super-admin/attendance-report/user/${targetId}`] : [])
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.get(url, { params: query });
        if (response.status === 200 && response.data) {
          return response.data;
        }
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    if (lastError) throw lastError;
    return { success: true, data: {} };
  },

  /**
   * 8. Attendance Report List (Daily/Monthly/Yearly)
   * GET /api/v1/super-admin/attendance-report?period=DAILY&date=YYYY-MM-DD
   * @param {Object} params { period, date, search, page, limit }
   */
  getAttendanceReport: async (params = {}) => {
    const response = await axiosInstance.get('/v1/super-admin/attendance-report', { params });
    return response.data;
  },

  /**
   * 9. Apply Leave
   * POST /api/v1/super-admin/attendance/leave
   * @param {Object} data { leaveType, startDate, endDate, reason }
   */
  applyLeave: async (data) => {
    const payload = {
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason ? String(data.reason).slice(0, 500) : ''
    };
    const response = await axiosInstance.post('/v1/super-admin/attendance/leave', payload);
    return response.data;
  },

  /**
   * 10. Date-wise Attendance History Logs
   * GET /api/v1/super-admin/attendance/history?startDate=&endDate=&page=&limit=
   * @param {Object} params { startDate, endDate, page, limit }
   */
  getAttendanceHistory: async (params = {}) => {
    const response = await axiosInstance.get('/v1/super-admin/attendance/history', { params });
    return response.data;
  },

  /**
   * 11. Attendance Filter Options (e.g., user roles, designations)
   * GET /api/v1/super-admin/attendance-report/filters
   */
  getReportFilters: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/v1/super-admin/attendance-report/filters', { params });
      return response.data;
    } catch {
      return { success: true, data: { userRoles: [], designations: [] } };
    }
  }
};

export default attendanceService;
