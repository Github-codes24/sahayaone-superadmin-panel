import axiosInstance from './axiosConfig';

/**
 * Super Admin Important Dates Service
 * Implements full enterprise specs from Super Admin Important Dates Module:
 * Primary Route: /api/v1/super-admin/important-dates
 * Society HR Parity Alias: /api/v1/super-admin/employees/hr/important-dates
 * Employee Sub-Module Alias: /api/v1/super-admin/employees/important-dates
 */

const CANDIDATE_URLS = [
  '/v1/super-admin/important-dates',
  '/v1/super-admin/employees/hr/important-dates',
  '/v1/super-admin/employees/important-dates',
];

/**
 * Sanitizes query parameters by stripping null, undefined, and empty string values.
 * When bankId is omitted/empty, the backend performs a global multi-tenant query across all active banks.
 */
const sanitizeParams = (params = {}) => {
  const clean = {};
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val)) {
        if (val.length > 0) clean[key] = val.join(',');
      } else {
        clean[key] = val;
      }
    }
  });
  return clean;
};

export const importantDatesService = {
  /**
   * List Important Dates Feed
   * GET /api/v1/super-admin/important-dates
   * 
   * @param {Object} params
   * @param {string} [params.bankId] - Optional institution/partner bank filter (24-char hex). If omitted, automatically defaults to Sahayaone Corporate.
   * @param {string} [params.branchId] - Filter events to a specific branch office.
   * @param {string|string[]} [params.branchIds] - Multiple branch IDs.
   * @param {string|string[]} [params.celebrationTypes] - Birthday, Work Anniversary, Marriage Anniversary.
   * @param {number} [params.month] - Calendar month number (1-12).
   * @param {string} [params.date] - Reference date in ISO (YYYY-MM-DD) or Indian (DD/MM/YYYY) format.
   * @param {string} [params.state] - State name filter.
   * @param {string} [params.designation] - Designation filter.
   * @param {string} [params.search] - Full-text search across employee name, email, phone, code.
   * @param {boolean} [params.paginate] - When true, returns paginated data structure with meta.
   * @param {number} [params.page] - Page number (>= 1).
   * @param {number} [params.limit] - Page size limit (1-100).
   * @returns {Promise<{ success: boolean, items: Array, data: Array, meta: Object, message?: string }>}
   */
  getImportantDates: async (params = {}) => {
    const cleanParams = sanitizeParams(params);

    let lastError = null;
    for (const url of CANDIDATE_URLS) {
      try {
        const response = await axiosInstance.get(url, { params: cleanParams });
        const resData = response.data;

        // Normalization layer to support both Standard Array & Paginated formats
        if (resData) {
          let items = [];
          let meta = {
            totalRecords: 0,
            page: Number(cleanParams.page) || 1,
            limit: Number(cleanParams.limit) || 50,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          };

          if (Array.isArray(resData.data)) {
            items = resData.data;
            if (resData.meta) {
              meta = { ...meta, ...resData.meta };
            } else {
              meta.totalRecords = items.length;
              meta.totalPages = Math.ceil(items.length / meta.limit) || 1;
            }
          } else if (Array.isArray(resData.items)) {
            items = resData.items;
            if (resData.meta) meta = { ...meta, ...resData.meta };
            else meta.totalRecords = items.length;
          } else if (Array.isArray(resData.dates)) {
            items = resData.dates;
            meta.totalRecords = items.length;
          } else if (Array.isArray(resData)) {
            items = resData;
            meta.totalRecords = items.length;
          } else if (resData.data && Array.isArray(resData.data.items)) {
            items = resData.data.items;
            meta = { ...meta, ...(resData.data.meta || resData.meta || {}) };
          }

          return {
            success: resData.success !== false,
            statusCode: resData.statusCode || 200,
            message: resData.message || 'Important dates retrieved successfully.',
            items,
            data: items, // Direct array parity for components expecting response.data
            meta,
            raw: resData,
          };
        }

        return {
          success: true,
          statusCode: 200,
          items: [],
          data: [],
          meta: { totalRecords: 0, page: 1, limit: 50, totalPages: 1 },
        };
      } catch (err) {
        lastError = err;
        // If 404, fallback to next alias candidate
        if (err.response?.status === 404) {
          continue;
        }
        // If error response exists with JSON, throw immediately
        throw err;
      }
    }

    throw lastError || new Error('Failed to retrieve important dates feed from all candidate endpoints.');
  },
};

export default importantDatesService;
