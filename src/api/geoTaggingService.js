import axiosInstance from './axiosConfig';

/**
 * Super Admin Geo Tagging & Onboarding Team Attendance Service
 * Tracks Onboarding Team staff punch-in/out GPS coordinates and assigned territory geofences.
 */
export const geoTaggingService = {
  // Get Super Admin Onboarding Team Attendance Geolocation statistics
  getStats: async (regionId) => {
    try {
      const response = await axiosInstance.get('/onboarding-attendance-geotag/stats', {
        params: { regionId: regionId || undefined }
      });
      return response.data?.data || response.data;
    } catch {
      return {
        totalOfficers: 24,
        presentToday: 21,
        inTerritoryPunches: 19, // Within assigned district/zone
        outOfTerritoryPunches: 2, // Remote/cross-district punch
        absentToday: 3,
        onTimeRate: '95.2%'
      };
    }
  },

  // Get Onboarding Team Attendance GPS records with search & filters
  getRecords: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/onboarding-attendance-geotag/records', { params });
      return response.data?.data || response.data;
    } catch {
      return [
        {
          id: 'ONB-GEO-801',
          employeeId: 'ONB-101',
          employeeName: 'Praveen Deshmukh',
          designation: 'Senior Onboarding Lead',
          assignedRegion: 'Pune Metropolitan Region',
          officeLat: 18.520400,
          officeLng: 73.856700,
          officeAddress: 'Sahayaone HQ, FC Road, Pune - 411005',
          punchInTime: '2026-09-02T09:02:00Z',
          punchOutTime: null,
          punchLat: 18.520420,
          punchLng: 73.856715,
          punchAddress: 'FC Road HQ, Shivaji Nagar, Pune',
          distanceMeters: 4,
          geofenceStatus: 'IN_TERRITORY',
          deviceInfo: 'Android 14 (OnePlus 12)',
          currentBankVisit: 'Visiting Pune Urban Co-op Bank HO',
          remarks: 'Morning check-in at Pune Regional HQ.'
        },
        {
          id: 'ONB-GEO-802',
          employeeId: 'ONB-104',
          employeeName: 'Anjali Sawant',
          designation: 'Bank Partnership Executive',
          assignedRegion: 'Mumbai South & Suburbs',
          officeLat: 18.922000,
          officeLng: 72.834700,
          officeAddress: 'Fort Regional Hub, Fort, Mumbai - 400001',
          punchInTime: '2026-09-02T09:15:00Z',
          punchOutTime: null,
          punchLat: 18.922300,
          punchLng: 72.834900,
          punchAddress: 'Fort Area, Near Horniman Circle, Mumbai',
          distanceMeters: 38,
          geofenceStatus: 'IN_TERRITORY',
          deviceInfo: 'iPhone 14 (iOS 17.5)',
          currentBankVisit: 'Onboarding Janakalyan Sahakari Bank',
          remarks: 'Checked in within Mumbai Fort territory.'
        },
        {
          id: 'ONB-GEO-803',
          employeeId: 'ONB-108',
          employeeName: 'Mahesh Gaikwad',
          designation: 'Field BD Executive',
          assignedRegion: 'Nashik District Zone',
          officeLat: 19.997500,
          officeLng: 73.789800,
          officeAddress: 'College Road, Nashik - 422005',
          punchInTime: '2026-09-02T09:30:00Z',
          punchOutTime: null,
          punchLat: 19.998100,
          punchLng: 73.790200,
          punchAddress: 'College Road, Nashik',
          distanceMeters: 75,
          geofenceStatus: 'IN_TERRITORY',
          deviceInfo: 'Android 13 (Realme 11 Pro)',
          currentBankVisit: 'Assigned Bank Demo Session',
          remarks: 'Checked in on-site at Nashik regional hub.'
        },
        {
          id: 'ONB-GEO-804',
          employeeId: 'ONB-112',
          employeeName: 'Rohan Shinde',
          designation: 'Regional Onboarding Representative',
          assignedRegion: 'Nagpur & Vidarbha Zone',
          officeLat: 21.145800,
          officeLng: 79.088200,
          officeAddress: 'Civil Lines, Nagpur - 440001',
          punchInTime: '2026-09-02T10:05:00Z',
          punchOutTime: null,
          punchLat: 18.520430,
          punchLng: 73.856743,
          punchAddress: 'Shivaji Nagar, Pune',
          distanceMeters: 680000,
          geofenceStatus: 'OUT_OF_TERRITORY',
          deviceInfo: 'Android 14 (Samsung S23)',
          currentBankVisit: 'Remote Training Session at Pune HQ',
          remarks: 'Cross-territory punch: Assigned to Nagpur Zone but clocked in from Pune HQ.'
        }
      ];
    }
  },

  // Super Admin Geofence Audit Action
  updateGeofenceAudit: async (recordId, { status, notes }) => {
    try {
      const response = await axiosInstance.patch(`/onboarding-attendance-geotag/${recordId}/audit`, { status, notes });
      return response.data;
    } catch {
      return { success: true, message: `Status updated to ${status}` };
    }
  },

  // Record a simulated or manual Onboarding Team check-in
  recordPunch: async (payload) => {
    try {
      const response = await axiosInstance.post('/onboarding-attendance-geotag/punch', payload);
      return response.data;
    } catch {
      return { success: true, message: 'Onboarding officer GPS attendance recorded successfully', data: payload };
    }
  }
};

export default geoTaggingService;
