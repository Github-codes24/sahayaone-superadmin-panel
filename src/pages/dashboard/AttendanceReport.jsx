import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  RefreshCw, 
  Eye, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  CalendarDays, 
  RotateCcw,
  AlertTriangle,
  History,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';
import ExportDropdown from '../../components/common/ExportDropdown';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import SinglePersonAttendanceModal from '../../components/modals/SinglePersonAttendanceModal';
import ApplyLeaveModal from '../../components/modals/ApplyLeaveModal';
import TodayPunchBanner from '../../components/attendance/TodayPunchBanner';
import AttendanceHistoryTab from '../../components/attendance/AttendanceHistoryTab';
import { attendanceService } from '../../api/attendanceService';
import { 
  formatDisplayString, 
  formatStatusCode, 
  formatNumeric, 
  formatAddress 
} from '../../utils/attendanceFormatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => 2020 + i);

const MonthlyStatusBadge = ({ status }) => {
  const upper = formatStatusCode(status);
  let styles = 'text-gray-400 border-gray-200 bg-gray-50';
  let isPill = false;

  switch (upper) {
    case 'P':
    case 'PRESENT':
      styles = 'text-[#15803D] border-[#15803D]/40 bg-emerald-50';
      break;
    case 'P*':
    case 'LATE':
    case 'LATE_PRESENT':
      styles = 'text-[#b45309] border-[#b45309]/40 bg-amber-50';
      break;
    case 'HD':
    case 'HALF_DAY':
      styles = 'text-[#7c3aed] border-[#7c3aed]/40 bg-purple-50';
      isPill = true;
      break;
    case 'A':
    case 'ABSENT':
      styles = 'text-[#b91c1c] border-[#b91c1c]/40 bg-rose-50';
      break;
    case 'L':
    case 'LEAVE':
      styles = 'text-[#225091] border-[#225091]/40 bg-blue-50';
      break;
    case 'WO':
    case 'WEEKLY_OFF':
      styles = 'text-[#4b5563] border-[#9ca3af] bg-[#e5e7eb]';
      isPill = true;
      break;
    case 'COFF':
    case 'COMP_OFF':
      styles = 'text-[#6366f1] border-[#818cf8] bg-[#eef2ff]';
      isPill = true;
      break;
    default:
      styles = 'text-gray-400 border-gray-200 bg-gray-50';
  }

  const baseStyles = "inline-flex items-center justify-center border text-[11px] font-bold";
  const shapeStyles = isPill ? "px-1.5 py-0.5 rounded-full min-w-[28px]" : "w-6 h-6 rounded-full";

  return (
    <div className={`${baseStyles} ${shapeStyles} ${styles}`} title={upper || 'Not Recorded'}>
      {upper || '—'}
    </div>
  );
};

const LegendItem = ({ status, label }) => (
  <div className="flex items-center gap-2">
    <MonthlyStatusBadge status={status} />
    <span className="text-xs font-semibold text-gray-600">{label}</span>
  </div>
);

export default function AttendanceReport() {
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse initial state from URL query parameters
  const urlTab = searchParams.get('tab') || 'daily';
  const urlDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const urlMonth = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);
  const urlYear = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlUserId = searchParams.get('userId') || null;

  // Active Tab: 'daily' | 'monthly' | 'yearly' | 'history'
  const [activeTab, setActiveTab] = useState(urlTab);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const [selectedMonth, setSelectedMonth] = useState(urlMonth);
  const [selectedYear, setSelectedYear] = useState(urlYear);

  // Data States
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [summaryCards, setSummaryCards] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({ 
    items: [], 
    daysInMonth: 31, 
    summaryStats: null, 
    monthName: '' 
  });
  const [yearlyData, setYearlyData] = useState({ 
    items: [], 
    summaryStats: null, 
    year: urlYear 
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(urlPage > 0 ? urlPage : 1);
  const [paginationMeta, setPaginationMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    limit: 10
  });

  // Modals State
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(Boolean(urlUserId));
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(
    urlUserId ? { id: urlUserId, userId: urlUserId } : null
  );
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Centralized URL Synchronization Helper
  const updateUrlParams = useCallback((overrides = {}) => {
    const currentParams = new URLSearchParams(searchParams);

    const targetTab = overrides.tab !== undefined ? overrides.tab : activeTab;
    const targetDate = overrides.date !== undefined ? overrides.date : selectedDate;
    const targetMonth = overrides.month !== undefined ? overrides.month : selectedMonth;
    const targetYear = overrides.year !== undefined ? overrides.year : selectedYear;
    const targetSearch = (overrides.search !== undefined ? overrides.search : searchTerm).trim();
    const targetPage = overrides.page !== undefined ? overrides.page : currentPage;
    const targetUserId = overrides.userId !== undefined ? overrides.userId : (currentParams.get('userId') || null);

    const nextParams = new URLSearchParams();

    // Tab parameter (default: daily)
    if (targetTab && targetTab !== 'daily') {
      nextParams.set('tab', targetTab);
    }

    // Tab-specific filters
    if (targetTab === 'daily') {
      if (targetDate) nextParams.set('date', targetDate);
    } else if (targetTab === 'monthly') {
      nextParams.set('month', String(targetMonth));
      nextParams.set('year', String(targetYear));
    } else if (targetTab === 'yearly') {
      nextParams.set('year', String(targetYear));
    } else if (targetTab === 'history') {
      const start = overrides.startDate !== undefined ? overrides.startDate : currentParams.get('startDate');
      const end = overrides.endDate !== undefined ? overrides.endDate : currentParams.get('endDate');
      if (start) nextParams.set('startDate', start);
      if (end) nextParams.set('endDate', end);
    }

    // Search query parameter
    if (targetSearch) {
      nextParams.set('search', targetSearch);
    }

    // Pagination (omit if page 1)
    if (targetPage > 1) {
      nextParams.set('page', String(targetPage));
    }

    // Modal deep-link
    if (targetUserId) {
      nextParams.set('userId', targetUserId);
    }

    setSearchParams(nextParams, { replace: true });
  }, [activeTab, selectedDate, selectedMonth, selectedYear, searchTerm, currentPage, searchParams, setSearchParams]);

  // Sync state when URL searchParams change (handles browser Back / Forward navigation)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'daily';
    const dateFromUrl = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const monthFromUrl = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);
    const yearFromUrl = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
    const searchFromUrl = searchParams.get('search') || '';
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    const userIdFromUrl = searchParams.get('userId') || null;

    if (tabFromUrl !== activeTab) setActiveTab(tabFromUrl);
    if (dateFromUrl !== selectedDate) setSelectedDate(dateFromUrl);
    if (monthFromUrl !== selectedMonth) setSelectedMonth(monthFromUrl);
    if (yearFromUrl !== selectedYear) setSelectedYear(yearFromUrl);
    if (searchFromUrl !== searchTerm) setSearchTerm(searchFromUrl);
    const validPage = pageFromUrl > 0 ? pageFromUrl : 1;
    if (validPage !== currentPage) setCurrentPage(validPage);

    if (userIdFromUrl && !isSingleModalOpen) {
      setSelectedEmployeeForModal({ id: userIdFromUrl, userId: userIdFromUrl });
      setIsSingleModalOpen(true);
    } else if (!userIdFromUrl && isSingleModalOpen) {
      setIsSingleModalOpen(false);
      setSelectedEmployeeForModal(null);
    }
  }, [searchParams]);

  // 1. Fetch Monthly Summary Counters (Executive KPIs)
  const fetchSummaryCards = useCallback(async () => {
    try {
      const res = await attendanceService.getMonthlySummaryCards({
        month: selectedMonth,
        year: selectedYear
      });
      if (res && (res.success || res.statusCode === 200 || res.data)) {
        setSummaryCards(res.data || res);
      }
    } catch (err) {
      console.warn('Failed to load monthly attendance report cards:', err);
    }
  }, [selectedMonth, selectedYear]);

  // 2. Fetch Tab-Specific Data
  const fetchData = useCallback(async (pageToLoad = currentPage) => {
    if (activeTab === 'history') return;

    setLoading(true);
    setApiError(null);
    try {
      if (activeTab === 'daily') {
        const res = await attendanceService.getAttendanceReport({
          period: 'DAILY',
          date: selectedDate,
          search: searchTerm.trim() || undefined,
          page: pageToLoad,
          limit: 10
        });
        if (res) {
          const rawItems = Array.isArray(res.data) 
            ? res.data 
            : (Array.isArray(res.data?.data) ? res.data.data : (res.data?.items || []));
          setDailyData(rawItems);
          const meta = res.meta || res.data?.meta;
          if (meta) {
            setPaginationMeta({
              totalRecords: formatNumeric(meta.totalRecords, rawItems.length),
              totalPages: formatNumeric(meta.totalPages, 1),
              limit: formatNumeric(meta.limit, 10)
            });
          }
        }
      } else if (activeTab === 'monthly') {
        const res = await attendanceService.getMonthlySheet({
          month: selectedMonth,
          year: selectedYear,
          search: searchTerm.trim() || undefined,
          page: pageToLoad,
          limit: 10
        });
        if (res && res.data) {
          const rawItems = Array.isArray(res.data.items) 
            ? res.data.items 
            : (Array.isArray(res.data) ? res.data : (res.data?.data?.items || []));
          setMonthlyData({
            items: rawItems,
            daysInMonth: Number(res.data.daysInMonth) || new Date(selectedYear, selectedMonth, 0).getDate(),
            summaryStats: res.data.summaryStats || null,
            monthName: res.data.monthName || `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
            month: res.data.month || selectedMonth,
            year: res.data.year || selectedYear
          });
          const meta = res.data.meta || res.meta;
          if (meta) {
            setPaginationMeta({
              totalRecords: formatNumeric(meta.totalRecords, rawItems.length),
              totalPages: formatNumeric(meta.totalPages, 1),
              limit: formatNumeric(meta.limit, 10)
            });
          }
        }
      } else if (activeTab === 'yearly') {
        const res = await attendanceService.getYearlyMatrix({
          year: selectedYear,
          search: searchTerm.trim() || undefined,
          page: pageToLoad,
          limit: 10
        });
        if (res && res.data) {
          const rawItems = Array.isArray(res.data.items) 
            ? res.data.items 
            : (Array.isArray(res.data) ? res.data : (res.data?.data?.items || []));
          setYearlyData({ 
            items: rawItems,
            summaryStats: res.data.summaryStats || null,
            year: res.data.year || selectedYear
          });
          const meta = res.data.meta || res.meta;
          if (meta) {
            setPaginationMeta({
              totalRecords: formatNumeric(meta.totalRecords, rawItems.length),
              totalPages: formatNumeric(meta.totalPages, 1),
              limit: formatNumeric(meta.limit, 10)
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch attendance records:', err);
      const msg = formatDisplayString(err.response?.data?.message || err.message, 'Failed to load attendance records');
      setApiError(msg);
      if (activeTab === 'daily') setDailyData([]);
      else if (activeTab === 'monthly') setMonthlyData({ items: [], daysInMonth: 31, summaryStats: null, monthName: '' });
      else if (activeTab === 'yearly') setYearlyData({ items: [], summaryStats: null, year: selectedYear });
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate, selectedMonth, selectedYear, searchTerm, currentPage]);

  useEffect(() => {
    fetchSummaryCards();
  }, [fetchSummaryCards]);

  useEffect(() => {
    fetchData(currentPage);
  }, [activeTab, selectedDate, selectedMonth, selectedYear, currentPage]);

  // Tab change handler (updates URL)
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
    updateUrlParams({ tab: newTab, page: 1 });
  };

  // Filter form submit (updates URL and triggers fetch)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrlParams({
      tab: activeTab,
      date: selectedDate,
      month: selectedMonth,
      year: selectedYear,
      search: searchTerm,
      page: 1
    });
    fetchData(1);
  };

  // Reset filters (cleans URL back to defaults)
  const handleResetFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().getMonth() + 1;
    const thisYear = new Date().getFullYear();

    setSearchTerm('');
    setSelectedDate(today);
    setSelectedMonth(thisMonth);
    setSelectedYear(thisYear);
    setCurrentPage(1);

    updateUrlParams({
      tab: activeTab,
      search: '',
      date: today,
      month: thisMonth,
      year: thisYear,
      page: 1,
      userId: null
    });
  };

  // Modal handlers with deep-link URL sync
  const handleOpenSingleModal = (employee) => {
    const targetId = employee?.id || employee?.userId || employee?._id;
    setSelectedEmployeeForModal(employee);
    setIsSingleModalOpen(true);
    if (targetId) {
      updateUrlParams({ userId: targetId });
    }
  };

  const handleCloseSingleModal = () => {
    setIsSingleModalOpen(false);
    setSelectedEmployeeForModal(null);
    updateUrlParams({ userId: null });
  };

  // Safe KPI values for Daily / Personal History
  const kpiPresent = formatNumeric(summaryCards?.presentDays ?? summaryCards?.cards?.present, 0);
  const kpiAbsent = formatNumeric(summaryCards?.absentDays ?? summaryCards?.cards?.absent, 0);
  const kpiHalfDay = formatNumeric(summaryCards?.halfDays ?? summaryCards?.cards?.halfDay, 0);
  const kpiLeave = formatNumeric(summaryCards?.leaveDays ?? summaryCards?.cards?.leave, 0);
  const kpiLate = formatNumeric(summaryCards?.lateDays ?? summaryCards?.cards?.latePresent, 0);
  const kpiTotalHours = formatDisplayString(
    summaryCards?.formattedTotalWorkingHours || (summaryCards?.totalWorkingMinutes ? `${Math.round(Number(summaryCards.totalWorkingMinutes) / 60)} hrs` : '0 hrs')
  );
  const kpiPercentage = formatNumeric(summaryCards?.attendancePercentage, 0);

  // Safe KPI values for Monthly Sheet (from /v1/super-admin/attendance/sheet summaryStats)
  const monthlyStats = monthlyData?.summaryStats;
  const mTotalEmployees = formatNumeric(monthlyStats?.totalEmployees, monthlyData?.items?.length || 0);
  const mPresentDays = formatNumeric(monthlyStats?.totalPresentDays, 0);
  const mAbsentDays = formatNumeric(monthlyStats?.totalAbsentDays, 0);
  const mHalfDays = formatNumeric(monthlyStats?.totalHalfDays, 0);
  const mLeaveDays = formatNumeric(monthlyStats?.totalLeaveDays, 0);
  const mAvgPercentage = formatNumeric(monthlyStats?.averageAttendancePercentage, 0);

  // Safe KPI values for Yearly Matrix (from /v1/super-admin/attendance/yearly-matrix summaryStats)
  const yearlyStats = yearlyData?.summaryStats;
  const yTotalEmployees = formatNumeric(yearlyStats?.totalEmployees, yearlyData?.items?.length || 0);
  const yPresentDaysYear = formatNumeric(yearlyStats?.totalPresentDaysYear, 0);
  const yPossibleDaysYear = formatNumeric(yearlyStats?.totalPossibleDaysYear, 0);
  const yAvgPercentage = formatNumeric(yearlyStats?.averageAttendancePercentage, 0);

  // Helper to extract day status for monthly grid
  const getDayStatusForEmp = (emp, dayNum) => {
    if (emp?.daysMap && typeof emp.daysMap === 'object' && !Array.isArray(emp.daysMap)) {
      if (emp.daysMap[dayNum] !== undefined) return formatStatusCode(emp.daysMap[dayNum]);
    }
    if (Array.isArray(emp?.days)) {
      const match = emp.days.find(d => Number(d?.day) === dayNum);
      if (match) return formatStatusCode(match.statusCode || match.status);
    }
    if (emp?.days && typeof emp.days === 'object' && !Array.isArray(emp.days)) {
      if (emp.days[dayNum] !== undefined) return formatStatusCode(emp.days[dayNum]);
    }
    return '—';
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-6 w-full pb-10">
        
        {/* 1. Page Header & Actions */}
        <PageHeader
          title="Attendance & Reports"
          breadcrumbs={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'HR Management' },
            { label: 'Attendance' },
          ]}
          showBack={false}
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#225091] hover:bg-[#1a3f73] rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Plus size={15} /> Apply Leave
              </button>

              <ExportDropdown
                title="Attendance Report"
                filename={`attendance_${activeTab}_${selectedDate}`}
                tableRef={tableRef}
              />

              <button
                onClick={() => {
                  fetchSummaryCards();
                  fetchData(currentPage);
                  toast.info('Refreshed attendance data');
                }}
                disabled={loading}
                className="p-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin text-[#225091]' : ''} />
              </button>
            </div>
          }
        />

        {/* 2. Today's Punch-In / Punch-Out Geolocation Banner */}
        <TodayPunchBanner 
          onPunchSuccess={() => {
            fetchSummaryCards();
            fetchData(currentPage);
          }} 
        />

        {/* 3. Executive KPI Summary Cards (Context-Sensitive by Tab) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {activeTab === 'monthly' && (
                <>Monthly Performance Summary • <span className="text-[#225091]">{monthlyData.monthName || `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}</span></>
              )}
              {activeTab === 'yearly' && (
                <>Annual Attendance Summary • <span className="text-[#225091]">Year {yearlyData.year || selectedYear}</span></>
              )}
              {(activeTab === 'daily' || activeTab === 'history') && (
                <>Monthly Shift Overview • <span className="text-[#225091]">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span></>
              )}
            </span>
          </div>

          {/* Tab: Monthly Sheet Cards (6 Aggregate Cards) */}
          {activeTab === 'monthly' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Total Staff */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#225091]">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
                  <span className="p-1.5 rounded-lg bg-blue-50 text-[#225091]">
                    <Users size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#225091]">{mTotalEmployees}</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Staff</span>
                </div>
              </div>

              {/* Present Days */}
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Present Days</span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-700">{mPresentDays}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">P</span>
                </div>
              </div>

              {/* Absent Days */}
              <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Absent Days</span>
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-rose-700">{mAbsentDays}</span>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">A</span>
                </div>
              </div>

              {/* Half Days */}
              <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Half Days</span>
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Clock size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-purple-700">{mHalfDays}</span>
                  <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">HD &lt;4h</span>
                </div>
              </div>

              {/* Leave Days */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Leave Days</span>
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Calendar size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-blue-700">{mLeaveDays}</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">L</span>
                </div>
              </div>

              {/* Average Attendance % */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider">Avg Attendance</span>
                  <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-800">{mAvgPercentage}%</span>
                  <span className="text-[10px] text-gray-400 font-medium">Monthly Avg</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Yearly Matrix Cards (4 High-Impact Cards) */}
          {activeTab === 'yearly' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Total Staff */}
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#225091]">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
                  <span className="p-1.5 rounded-lg bg-blue-50 text-[#225091]">
                    <Users size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-[#225091]">{yTotalEmployees}</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">All Personnel</span>
                </div>
              </div>

              {/* Total Present Days (Year) */}
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Annual Present Days</span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-emerald-700">{yPresentDaysYear}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">12 Months</span>
                </div>
              </div>

              {/* Total Shift Capacity (Year) */}
              <div 
                className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs flex flex-col justify-between"
                title="Total expected person-days across all personnel (All Staff × 365 Days)"
              >
                <div className="flex items-center justify-between text-purple-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Shift Capacity</span>
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <CalendarDays size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-purple-700">{yPossibleDaysYear}</span>
                  <span 
                    className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded" 
                    title="All personnel × 365 calendar days"
                  >
                    Staff × 365 Days
                  </span>
                </div>
              </div>

              {/* Annual Average Attendance % */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider">Annual Attendance</span>
                  <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-800">{yAvgPercentage}%</span>
                  <span className="text-[10px] text-gray-400 font-medium">Yearly Rate</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Daily / History Cards (6 Personal Shift Cards) */}
          {(activeTab === 'daily' || activeTab === 'history') && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Present Days</span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-700">{kpiPresent}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">P</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Absent Days</span>
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-rose-700">{kpiAbsent}</span>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">A</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Half Day</span>
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Clock size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-purple-700">{kpiHalfDay}</span>
                  <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">HD &lt;4h</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-800">
                  <span className="text-xs font-bold uppercase tracking-wider">On Leave</span>
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Calendar size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-blue-700">{kpiLeave}</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">L</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-xs font-bold uppercase tracking-wider">Late Days</span>
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <AlertTriangle size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-amber-700">{kpiLate}</span>
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">P*</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider">Attendance %</span>
                  <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-800">{kpiPercentage}%</span>
                  <span className="text-[10px] text-gray-400 font-medium">{kpiTotalHours}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live API Error Notice */}
        {apiError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>Attendance Status: {formatDisplayString(apiError)}</span>
            </div>
            <button 
              onClick={() => { setApiError(null); fetchData(currentPage); fetchSummaryCards(); }}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline ml-4 shrink-0 cursor-pointer"
            >
              Retry Fetch
            </button>
          </div>
        )}

        {/* 4. Tab Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex bg-slate-200/70 p-1 rounded-xl self-start shadow-inner">
            <button 
              onClick={() => handleTabChange('daily')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'daily' 
                  ? 'bg-white shadow-xs text-[#225091]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={15} /> Daily Attendance
            </button>
            <button 
              onClick={() => handleTabChange('monthly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'monthly' 
                  ? 'bg-white shadow-xs text-[#225091]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarDays size={15} /> Monthly Sheet
            </button>
            <button 
              onClick={() => handleTabChange('yearly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'yearly' 
                  ? 'bg-white shadow-xs text-[#225091]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={15} /> Yearly Matrix
            </button>
            <button 
              onClick={() => handleTabChange('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-white shadow-xs text-[#225091]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History size={15} /> History Logs
            </button>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            {activeTab === 'daily' && `Showing personnel punches for ${selectedDate}`}
            {activeTab === 'monthly' && `Showing grid matrix for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
            {activeTab === 'yearly' && `Showing 12-month summary for Year ${selectedYear}`}
            {activeTab === 'history' && 'Showing date-wise attendance logs'}
          </span>
        </div>

        {/* 5. Filters (for Daily, Monthly, Yearly) */}
        {activeTab !== 'history' && (
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 p-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              
              {activeTab === 'daily' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      updateUrlParams({ date: e.target.value, page: 1 });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#225091] text-xs font-medium bg-white"
                  />
                </div>
              )}

              {activeTab === 'monthly' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        const m = Number(e.target.value);
                        setSelectedMonth(m);
                        updateUrlParams({ month: m, page: 1 });
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#225091] text-xs font-medium bg-white cursor-pointer"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        const y = Number(e.target.value);
                        setSelectedYear(y);
                        updateUrlParams({ year: y, page: 1 });
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#225091] text-xs font-medium bg-white cursor-pointer"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'yearly' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      setSelectedYear(y);
                      updateUrlParams({ year: y, page: 1 });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#225091] text-gray-700 text-xs font-medium bg-white cursor-pointer"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Search Admin Personnel
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, code, designation..." 
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#225091] text-xs text-gray-700 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#225091] hover:bg-[#1a3f73] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Filter
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2.5 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                  title="Reset Filters"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 6. Main Tab Content Displays */}

        {/* TAB 1: DAILY ATTENDANCE */}
        {activeTab === 'daily' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
            <TableWrapper ref={tableRef} minHeight="360px">
              <table className="w-full min-w-[900px] text-left border-collapse text-xs">
                <thead className="bg-[#225091] text-white uppercase tracking-wider font-semibold border-b border-[#225091]">
                  <tr>
                    <th className="py-3.5 px-5 w-16 text-center border-r border-white/20">Sr.No.</th>
                    <th className="py-3.5 px-5 border-r border-white/20">Employee</th>
                    <th className="py-3.5 px-5 border-r border-white/20">Designation</th>
                    <th className="py-3.5 px-5 border-r border-white/20">Punch In</th>
                    <th className="py-3.5 px-5 border-r border-white/20">Punch Out</th>
                    <th className="py-3.5 px-5 border-r border-white/20">Total Hrs</th>
                    <th className="py-3.5 px-4 text-center border-r border-white/20">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        <RefreshCw size={24} className="animate-spin text-[#225091] mx-auto mb-2" />
                        Loading daily attendance records...
                      </td>
                    </tr>
                  ) : dailyData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                        No attendance records found for {selectedDate}.
                      </td>
                    </tr>
                  ) : (
                    dailyData.map((row, index) => {
                      const sr = ((currentPage - 1) * 10) + index + 1;
                      const empName = formatDisplayString(row.name || row.employeeName, 'Employee');
                      const initialLetter = empName.charAt(0).toUpperCase();
                      const inTime = formatDisplayString(row.punchIn, '—');
                      const outTime = formatDisplayString(row.punchOut, '—');
                      const inAddr = formatAddress(row.punchInLocation || row.punchInAddress);
                      const outAddr = formatAddress(row.punchOutLocation || row.punchOutAddress);
                      const duration = formatDisplayString(
                        row.totalHrs || (row.workingMinutes ? `${Math.round(Number(row.workingMinutes) / 60)} hrs` : '—')
                      );

                      return (
                        <tr 
                          key={row.id || row._id || index} 
                          className="hover:bg-[#F4F8FD] transition-colors cursor-pointer"
                          onClick={() => handleOpenSingleModal(row)}
                        >
                          <td className="py-3.5 px-5 text-center font-semibold text-gray-400 border-r border-gray-100">
                            {sr}
                          </td>
                          <td className="py-3.5 px-5 border-r border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {initialLetter}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{empName}</div>
                                {row.employeeCode && (
                                  <span className="text-[10px] text-gray-400 font-mono">{formatDisplayString(row.employeeCode)}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 border-r border-gray-100 text-gray-600 font-medium">
                            {formatDisplayString(row.designation, 'Staff')}
                          </td>
                          <td className="py-3.5 px-5 border-r border-gray-100">
                            <div className="flex flex-col">
                              <span className={inTime !== '—' ? "font-semibold text-gray-900" : "text-gray-400"}>
                                {inTime}
                              </span>
                              {inAddr && (
                                <span className="text-[10px] text-gray-400 truncate max-w-[170px] flex items-center gap-1" title={inAddr}>
                                  <MapPin size={10} className="text-emerald-600 shrink-0" />
                                  {inAddr}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 border-r border-gray-100">
                            <div className="flex flex-col">
                              <span className={outTime !== '—' ? "font-semibold text-gray-900" : "text-gray-400"}>
                                {outTime}
                              </span>
                              {outAddr && (
                                <span className="text-[10px] text-gray-400 truncate max-w-[170px] flex items-center gap-1" title={outAddr}>
                                  <MapPin size={10} className="text-rose-500 shrink-0" />
                                  {outAddr}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 border-r border-gray-100 font-semibold text-gray-800">
                            {duration}
                          </td>
                          <td className="py-3.5 px-4 text-center border-r border-gray-100">
                            <MonthlyStatusBadge status={row.status || row.statusCode} />
                          </td>
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenSingleModal(row)}
                              className="p-1.5 rounded-lg text-[#225091] hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
                              title="View 360° Attendance Report"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </TableWrapper>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={paginationMeta.totalPages}
              totalRecords={paginationMeta.totalRecords}
              onPageChange={(p) => {
                setCurrentPage(p);
                updateUrlParams({ page: p });
                fetchData(p);
              }}
            />
          </div>
        )}

        {/* TAB 2: MONTHLY SHEET */}
        {activeTab === 'monthly' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
              <TableWrapper ref={tableRef} minHeight="360px">
                <table className="w-full text-left border-collapse min-w-[max-content] text-xs">
                  <thead className="bg-[#225091] text-white uppercase tracking-wider font-semibold border-b border-[#225091]">
                    <tr>
                      <th className="py-3 px-4 border-r border-white/20 whitespace-nowrap text-center w-12 sticky left-0 bg-[#225091] z-10">Sr.</th>
                      <th className="py-3 px-4 border-r border-white/20 whitespace-nowrap min-w-[180px] sticky left-12 bg-[#225091] z-10">Personnel</th>
                      <th className="py-3 px-4 border-r border-white/20 whitespace-nowrap min-w-[130px]">Role</th>
                      {Array.from({ length: monthlyData.daysInMonth || 31 }, (_, i) => (
                        <th key={i} className="py-3 px-2 text-center border-r border-white/20 min-w-[38px] font-bold">
                          {i + 1}
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center border-r border-white/20 font-bold bg-emerald-900/40">P</th>
                      <th className="py-3 px-3 text-center border-r border-white/20 font-bold bg-rose-900/40">A</th>
                      <th className="py-3 px-3 text-center border-r border-white/20 font-bold bg-blue-900/40">L</th>
                      <th className="py-3 px-3 text-center font-bold bg-slate-900/50">Pay Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={36} className="py-12 text-center text-gray-400">
                          <RefreshCw size={24} className="animate-spin text-[#225091] mx-auto mb-2" />
                          Loading monthly sheet...
                        </td>
                      </tr>
                    ) : monthlyData.items.length === 0 ? (
                      <tr>
                        <td colSpan={36} className="py-12 text-center text-gray-400 font-medium">
                          No personnel found for this monthly filter.
                        </td>
                      </tr>
                    ) : (
                      monthlyData.items.map((emp, index) => {
                        const sr = ((currentPage - 1) * 10) + index + 1;
                        const summary = emp.summary || {};
                        const pDays = formatNumeric(summary.presentDays, 0);
                        const aDays = formatNumeric(summary.absentDays, 0);
                        const lDays = formatNumeric(summary.leaveDays, 0);
                        const payDays = formatNumeric(summary.payableDays ?? summary.presentDays, pDays);

                        return (
                          <tr 
                            key={emp.id || emp._id || index}
                            onClick={() => handleOpenSingleModal(emp)}
                            className="hover:bg-[#F4F8FD] transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 text-center border-r border-gray-100 font-bold text-gray-400 sticky left-0 bg-white group-hover:bg-[#F4F8FD] z-10">
                              {sr}
                            </td>
                            <td className="py-3 px-4 border-r border-gray-100 sticky left-12 bg-white group-hover:bg-[#F4F8FD] z-10 font-bold text-gray-900">
                              <div>{formatDisplayString(emp.employeeName || emp.name, 'Admin')}</div>
                              {emp.employeeCode && (
                                <span className="text-[10px] text-gray-400 font-mono font-normal">{formatDisplayString(emp.employeeCode)}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 border-r border-gray-100 text-gray-600">
                              {formatDisplayString(emp.designation, 'Super Admin')}
                            </td>
                            {Array.from({ length: monthlyData.daysInMonth || 31 }, (_, i) => {
                              const dayCode = getDayStatusForEmp(emp, i + 1);
                              return (
                                <td key={i} className="py-2 px-1 text-center border-r border-gray-100">
                                  <MonthlyStatusBadge status={dayCode} />
                                </td>
                              );
                            })}
                            <td className="py-3 px-3 text-center border-r border-gray-100 font-bold text-emerald-700 bg-emerald-50/40">
                              {pDays}
                            </td>
                            <td className="py-3 px-3 text-center border-r border-gray-100 font-bold text-rose-700 bg-rose-50/40">
                              {aDays}
                            </td>
                            <td className="py-3 px-3 text-center border-r border-gray-100 font-bold text-blue-700 bg-blue-50/40">
                              {lDays}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-800 bg-slate-50/80">
                              {payDays}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </TableWrapper>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginationMeta.totalPages}
                totalRecords={paginationMeta.totalRecords}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  updateUrlParams({ page: p });
                  fetchData(p);
                }}
              />
            </div>

            {/* Status Code Legend */}
            <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 p-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mr-2">Legend:</span>
              <LegendItem status="P" label="Present (>= 4h)" />
              <LegendItem status="P*" label="Late Present" />
              <LegendItem status="HD" label="Half Day (< 4h)" />
              <LegendItem status="A" label="Absent" />
              <LegendItem status="L" label="Approved Leave" />
              <LegendItem status="WO" label="Weekly Off" />
              <LegendItem status="COFF" label="Compensatory Off" />
            </div>
          </div>
        )}

        {/* TAB 3: YEARLY MATRIX */}
        {activeTab === 'yearly' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
            <TableWrapper ref={tableRef} minHeight="360px">
              <table className="w-full text-left border-collapse min-w-[max-content] text-xs">
                <thead className="bg-[#225091] text-white uppercase tracking-wider font-semibold border-b border-[#225091]">
                  <tr>
                    <th className="py-3 px-4 border-r border-white/20 text-center w-12 sticky left-0 bg-[#225091] z-10">Sr.</th>
                    <th className="py-3 px-4 border-r border-white/20 min-w-[180px] sticky left-12 bg-[#225091] z-10">Personnel</th>
                    <th className="py-3 px-4 border-r border-white/20 min-w-[130px]">Role</th>
                    {MONTH_SHORT.map((m, idx) => (
                      <th key={idx} className="py-3 px-3 text-center border-r border-white/20 font-bold min-w-[55px]">
                        {m}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center border-r border-white/20 font-bold bg-emerald-900/40">Present Days</th>
                    <th className="py-3 px-4 text-center font-bold bg-blue-900/40">Avg Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={17} className="py-12 text-center text-gray-400">
                        <RefreshCw size={24} className="animate-spin text-[#225091] mx-auto mb-2" />
                        Loading yearly attendance matrix...
                      </td>
                    </tr>
                  ) : yearlyData.items.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="py-12 text-center text-gray-400 font-medium">
                        No records found for year {selectedYear}.
                      </td>
                    </tr>
                  ) : (
                    yearlyData.items.map((emp, index) => {
                      const sr = ((currentPage - 1) * 10) + index + 1;
                      const ySummary = emp.yearlySummary || {};
                      const matrixMap = {};
                      (emp.yearlyMatrix || []).forEach(m => {
                        if (m?.month) matrixMap[m.month] = m;
                      });

                      const totalPresent = formatNumeric(ySummary.totalPresentDaysYear, 0);
                      const avgAttendance = formatDisplayString(
                        ySummary.formattedAverageAttendance || `${formatNumeric(ySummary.averageAttendancePercentage, 0)}%`
                      );

                      return (
                        <tr 
                          key={emp.id || emp._id || index}
                          onClick={() => handleOpenSingleModal(emp)}
                          className="hover:bg-[#F4F8FD] transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 text-center border-r border-gray-100 font-bold text-gray-400 sticky left-0 bg-white group-hover:bg-[#F4F8FD] z-10">
                            {sr}
                          </td>
                          <td className="py-3 px-4 border-r border-gray-100 sticky left-12 bg-white group-hover:bg-[#F4F8FD] z-10 font-bold text-gray-900">
                            <div>{formatDisplayString(emp.employeeName || emp.name, 'Admin')}</div>
                            {emp.employeeCode && (
                              <span className="text-[10px] text-gray-400 font-mono font-normal">{formatDisplayString(emp.employeeCode)}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 border-r border-gray-100 text-gray-600">
                            {formatDisplayString(emp.designation, 'Super Admin')}
                          </td>
                          {Array.from({ length: 12 }, (_, i) => {
                            const monthObj = matrixMap[i + 1];
                            const presentDays = formatNumeric(monthObj?.presentDays, 0);
                            return (
                              <td key={i} className="py-3 px-2 text-center border-r border-gray-100">
                                <span className={presentDays > 0 ? "font-bold text-emerald-700" : "text-gray-300"}>
                                  {presentDays}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-center border-r border-gray-100 font-bold text-emerald-700 bg-emerald-50/40">
                            {totalPresent}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#225091] bg-blue-50/40">
                            {avgAttendance}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </TableWrapper>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={paginationMeta.totalPages}
              totalRecords={paginationMeta.totalRecords}
              onPageChange={(p) => {
                setCurrentPage(p);
                updateUrlParams({ page: p });
                fetchData(p);
              }}
            />
          </div>
        )}

        {/* TAB 4: ATTENDANCE HISTORY LOGS */}
        {activeTab === 'history' && (
          <AttendanceHistoryTab onOpenSingleModal={handleOpenSingleModal} />
        )}

        {/* 7. Modals */}
        <SinglePersonAttendanceModal
          isOpen={isSingleModalOpen}
          onClose={handleCloseSingleModal}
          employeeId={selectedEmployeeForModal?.id || selectedEmployeeForModal?.userId || selectedEmployeeForModal?._id}
          initialEmployee={selectedEmployeeForModal}
          initialMonth={selectedMonth}
          initialYear={selectedYear}
        />

        <ApplyLeaveModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          onSuccess={() => {
            fetchSummaryCards();
            fetchData(currentPage);
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
