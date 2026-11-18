import axiosInstance from './axiosConfig';
import { onboardingTeamService } from './onboardingTeamService';
import { subAdminService } from './subAdminService';

/**
 * Super Admin Employee Letters & Payroll Service
 * Implements full enterprise specs from Super Admin Employee Letters API:
 * Primary Route: /api/v1/super-admin/employees/letters
 * Parity Aliases: /api/v1/super-admin/employees/hr/letters, /api/v1/super-admin/employee-letters
 */

/**
 * Helper to perform letter generation requests.
 * Supports both JSON response (document metadata + S3 fileUrl) and direct binary PDF stream.
 */
const postLetterRequest = async (subPath, data, options = {}) => {
  const { format = 'json' } = options;
  const isJson = format === 'json';

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Accept: isJson ? 'application/json' : 'application/pdf',
    },
    params: isJson ? { format: 'json' } : {},
    responseType: isJson ? 'json' : 'blob',
  };

  const candidateUrls = [
    `/v1/super-admin/employee-letters${subPath}`,
    `/v1/super-admin/employees/letters${subPath}`,
    `/v1/super-admin/employees/hr/letters${subPath}`,
  ];

  let lastError = null;
  for (const url of candidateUrls) {
    try {
      const response = await axiosInstance.post(url, data, config);
      if (response.data instanceof Blob) {
        if (response.headers?.['x-file-url']) {
          response.data.fileUrl = response.headers['x-file-url'];
        }
        if (response.headers?.['x-reference-number']) {
          response.data.referenceNumber = response.headers['x-reference-number'];
        }
        const disposition = response.headers?.['content-disposition'];
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
          if (match && match[1]) {
            response.data.filename = match[1];
          }
        }
      }
      return response.data;
    } catch (err) {
      lastError = err;
      // If error payload is a Blob (from responseType: 'blob'), extract JSON message
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          err.response.data = JSON.parse(text);
        } catch {
          // ignore parsing error
        }
      }
      // If 404, attempt next alias
      if (err.response?.status === 404) continue;
      throw err;
    }
  }

  throw lastError;
};

export const DOCUMENT_TYPE_CODES = {
  'Offer Letter': 'OFFER_LETTER',
  'Confirmation Letter': 'CONFIRMATION_LETTER',
  'Performance Letter': 'PERFORMANCE_LETTER',
  'Performance Appraisal': 'PERFORMANCE_LETTER',
  'Promotion Letter': 'PROMOTION_LETTER',
  'Transfer Letter': 'TRANSFER_LETTER',
  'Salary Slip': 'SALARY_SLIP',
  'Salary Increment': 'SALARY_INCREMENT',
  'Termination Letter': 'TERMINATION_LETTER',
};

export const letterService = {
  // 1. Offer Letter Generation
  // POST /api/v1/super-admin/employees/letters/offer
  generateOfferLetter: async (data, options = {}) => {
    return await postLetterRequest('/offer', data, options);
  },

  // 2. Confirmation Letter Generation
  // POST /api/v1/super-admin/employees/letters/confirmation
  generateConfirmationLetter: async (data, options = {}) => {
    return await postLetterRequest('/confirmation', data, options);
  },

  // 3. Performance Letter / Appraisal Review
  // POST /api/v1/super-admin/employees/letters/performance
  generatePerformanceLetter: async (data, options = {}) => {
    return await postLetterRequest('/performance', data, options);
  },

  // 4. Promotion Letter Generation
  // POST /api/v1/super-admin/employees/letters/promotion
  generatePromotionLetter: async (data, options = {}) => {
    return await postLetterRequest('/promotion', data, options);
  },

  // 5. Transfer Letter Generation
  // POST /api/v1/super-admin/employees/letters/transfer
  generateTransferLetter: async (data, options = {}) => {
    return await postLetterRequest('/transfer', data, options);
  },

  // 6. Salary Slip Generation
  // POST /api/v1/super-admin/employees/letters/salary-slip
  generateSalarySlip: async (data, options = {}) => {
    return await postLetterRequest('/salary-slip', data, options);
  },

  // 7. Salary Increment Letter Generation
  // POST /api/v1/super-admin/employees/letters/salary-increment
  generateSalaryIncrement: async (data, options = {}) => {
    return await postLetterRequest('/salary-increment', data, options);
  },

  // 8. Termination Letter Generation
  // POST /api/v1/super-admin/employees/letters/termination
  generateTerminationLetter: async (data, options = {}) => {
    return await postLetterRequest('/termination', data, options);
  },

  // 9. Letter History & Audit Logs
  // GET /api/v1/super-admin/employees/letters/history
  // Supports { page, limit, bankId, employeeId, branchId, documentTypeCode, search, startDate, endDate, sortBy, sortOrder }
  getHistory: async (params = {}) => {
    const candidateUrls = [
      '/v1/super-admin/employees/letters/history',
      '/v1/super-admin/employees/letters/letter-history',
      '/v1/super-admin/employees/hr/letters/history',
      '/v1/super-admin/employee-letters/history',
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.get(url, { params });
        return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    throw lastError;
  },

  // 10. Send Email Notification with PDF Attachment
  // POST /api/v1/super-admin/employees/letters/send-email
  // Body: { logId, employeeId, bankId, documentTypeCode, customEmail, variables }
  sendLetterEmail: async (payload = {}, logId = null) => {
    const targetLogId = logId || payload.logId;
    const candidateUrls = [
      targetLogId && String(targetLogId).length === 24
        ? `/v1/super-admin/employees/letters/${targetLogId}/send-email`
        : '/v1/super-admin/employees/letters/send-email',
      '/v1/super-admin/employee-letters/send-email',
      '/v1/super-admin/employees/hr/letters/send-email',
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.post(url, payload);
        return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    throw lastError;
  },

  // 11. Bank Authorized Signatory & Signature Settings
  // 11.1 Retrieve Bank Signature Profile
  // GET /api/v1/super-admin/employees/letters/bank/signature (with ?bankId=... or without for all banks overview)
  getBankSignatureSettings: async (bankId = null) => {
    const params = bankId ? { bankId } : {};
    const candidateUrls = [
      bankId
        ? `/v1/super-admin/employees/letters/bank/${bankId}/signature`
        : '/v1/super-admin/employees/letters/bank/signature',
      '/v1/super-admin/employees/letters/bank/signature',
      '/v1/super-admin/employee-letters/bank/signature',
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.get(url, { params });
        return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404) continue;
        throw err;
      }
    }
    throw lastError;
  },

  // 11.2 Update Bank Signature Profile & Upload Image
  // POST or PATCH /api/v1/super-admin/employees/letters/bank/signature
  // Supports multipart/form-data (FormData) or application/json
  updateBankSignatureSettings: async (payload, bankId = null) => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : { headers: { 'Content-Type': 'application/json' } };

    const targetBankId = bankId || (isFormData ? payload.get('bankId') : payload.bankId);
    const candidateUrls = [
      targetBankId
        ? `/v1/super-admin/employees/letters/bank/${targetBankId}/signature`
        : '/v1/super-admin/employees/letters/bank/signature',
      '/v1/super-admin/employees/letters/bank/signature',
      '/v1/super-admin/employee-letters/bank/signature',
    ];

    let lastError = null;
    for (const url of candidateUrls) {
      try {
        const response = await axiosInstance.post(url, payload, config);
        return response.data;
      } catch (err) {
        lastError = err;
        if (err.response?.status === 404 || err.response?.status === 405) {
          try {
            const fallbackPatch = await axiosInstance.patch(url, payload, config);
            return fallbackPatch.data;
          } catch (patchErr) {
            if (patchErr.response?.status === 404 || patchErr.response?.status === 405) {
              continue;
            }
            throw patchErr;
          }
        }
        throw err;
      }
    }
    throw lastError;
  },

  // Unified Dispatcher Method
  generate: async (payload, options = {}) => {
    const { letterType, ...data } = payload;
    const normType = (letterType || '').toLowerCase().trim();

    if (normType.includes('offer')) {
      return await letterService.generateOfferLetter(data, options);
    } else if (normType.includes('confirmation')) {
      return await letterService.generateConfirmationLetter(data, options);
    } else if (normType.includes('performance') || normType.includes('appraisal')) {
      return await letterService.generatePerformanceLetter(data, options);
    } else if (normType.includes('promotion')) {
      return await letterService.generatePromotionLetter(data, options);
    } else if (normType.includes('transfer')) {
      return await letterService.generateTransferLetter(data, options);
    } else if (normType.includes('increment')) {
      return await letterService.generateSalaryIncrement(data, options);
    } else if (normType.includes('slip') || normType.includes('salary slip')) {
      return await letterService.generateSalarySlip(data, options);
    } else if (normType.includes('termination')) {
      return await letterService.generateTerminationLetter(data, options);
    } else {
      throw new Error(`Unsupported document type: ${letterType}`);
    }
  },

  // 12. Corporate Sahayaone Staff Loader
  // Scoped strictly to Sahayaone Internal Corporate Staff: OnboardingTeam & Admin/SubAdmin
  fetchAdvitaCorporateStaff: async () => {
    const staffList = [];

    // 1. Fetch Onboarding Team Staff
    try {
      const obRes = await onboardingTeamService.getOnboardingTeams({ limit: 150 });
      let obList = [];
      if (obRes && obRes.success) {
        obList = Array.isArray(obRes.data) ? obRes.data : (obRes.data?.items || []);
      }
      obList.forEach((m) => {
        staffList.push({
          id: m._id || m.id,
          _id: m._id || m.id,
          name: m.fullName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Onboarding Associate',
          fullName: m.fullName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Onboarding Associate',
          email: m.email || '',
          phone: m.phone || m.mobile || '',
          employeeCode: m.employeeCode || m.empCode || m.code || `ADV-OB-${String(m._id || m.id).slice(-4).toUpperCase()}`,
          model: 'OnboardingTeam',
          modelLabel: 'Onboarding Team',
          designation: m.designation || m.role?.name || m.role || 'Senior Onboarding Specialist',
          department: m.department || 'Client Operations & Onboarding',
          salary: Number(m.salary) || Number(m.ctc) || 650000,
          joiningDate: m.joiningDate || m.createdAt,
          placeOfPosting: m.branch?.name || m.branchName || 'Sahayaone Corporate Head Office, Pune',
          branchName: m.branch?.name || m.branchName || 'Sahayaone Corporate Head Office, Pune',
          branchCity: m.branch?.city || m.branchCity || 'Pune',
          branchState: m.branch?.state || m.branchState || 'Maharashtra'
        });
      });
    } catch (err) {
      console.warn('Could not load Onboarding Team staff:', err);
    }

    // 2. Fetch Admin & Sub-Admin Corporate Staff
    try {
      const adminRes = await subAdminService.getSubAdmins({ limit: 150 });
      let adminList = [];
      if (adminRes && adminRes.success) {
        adminList = Array.isArray(adminRes.data) ? adminRes.data : (adminRes.data?.items || []);
      }
      adminList.forEach((a) => {
        // Avoid duplicate IDs if already present
        const staffId = a._id || a.id;
        if (!staffList.some((s) => s.id === staffId)) {
          staffList.push({
            id: staffId,
            _id: staffId,
            name: a.name || a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Executive Administrator',
            fullName: a.name || a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Executive Administrator',
            email: a.email || '',
            phone: a.phone || a.mobile || '',
            employeeCode: a.employeeCode || a.empCode || `ADV-ADM-${String(staffId).slice(-4).toUpperCase()}`,
            model: 'Admin',
            modelLabel: 'Admin / Management',
            designation: a.designation || a.role?.name || a.role || 'Executive Administrator',
            department: a.department || 'Corporate Management & Operations',
            salary: Number(a.salary) || Number(a.ctc) || 850000,
            joiningDate: a.joiningDate || a.createdAt,
            placeOfPosting: 'Sahayaone Corporate Head Office, Pune',
            branchName: 'Sahayaone Corporate Head Office, Pune',
            branchCity: 'Pune',
            branchState: 'Maharashtra'
          });
        }
      });
    } catch (err) {
      console.warn('Could not load Admin staff:', err);
    }

    return staffList;
  },
};

export default letterService;
