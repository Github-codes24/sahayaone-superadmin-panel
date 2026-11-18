import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Cake, 
  Heart, 
  Briefcase, 
  Loader2,
  Calendar,
  RefreshCw,
  Gift,
  Building2,
  MapPin,
  Sparkles,
  RotateCcw,
  Landmark,
  FileText,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import TableWrapper from '../../components/common/TableWrapper';
import ExportDropdown from '../../components/common/ExportDropdown';
import { importantDatesService } from '../../api/importantDatesService';
import { cooperativeBankService } from '../../api/cooperativeBankService';

const AVAILABLE_MONTHS = [
  { label: 'All Months', value: '' },
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

const CELEBRATION_TYPES = [
  { label: 'All Celebrations', value: '' },
  { label: 'Birthday', value: 'Birthday' },
  { label: 'Work Anniversary', value: 'Work Anniversary' },
  { label: 'Marriage Anniversary', value: 'Marriage Anniversary' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh'
];

const DEFAULT_ROLES = [
  'Super Administrator',
  'Sub Administrator',
  'Head Office Admin',
  'Regional Onboarding Specialist',
  'Field Onboarding Officer',
  'Operations Lead',
  'Technical Lead',
  'Verification Officer',
  'Area Manager',
  'Administrative Officer'
];

export default function ImportantDates() {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  // Data States
  const [datesList, setDatesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankOptions, setBankOptions] = useState([]);

  // Primary Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBankId, setSelectedBankId] = useState(''); // '' = Sahayaone Corporate (Default)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Debounce search input (350ms) to trigger server query efficiently
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Secondary Filter States
  const [appliedFilters, setAppliedFilters] = useState({
    celebrationTypes: '',
    date: '',
    designation: '',
    state: '',
    city: '',
    branchId: '',
  });

  // Quick Celebration Wish Modal State
  const [activeWishItem, setActiveWishItem] = useState(null);
  const [copiedWish, setCopiedWish] = useState(false);

  // Fetch Co-operative Banks dropdown
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await cooperativeBankService.getBankDropdown();
        if (res && res.success && Array.isArray(res.data)) {
          setBankOptions(res.data);
        }
      } catch (err) {
        console.warn('Failed to load bank dropdown:', err);
      }
    };
    fetchBanks();
  }, []);

  // Fetch Important Dates Feed
  // GET /api/v1/super-admin/important-dates
  const fetchImportantDates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBankId) params.bankId = selectedBankId;
      if (selectedMonth) params.month = Number(selectedMonth);
      if (appliedFilters.celebrationTypes) params.celebrationTypes = appliedFilters.celebrationTypes;
      if (appliedFilters.date) params.date = appliedFilters.date;
      if (appliedFilters.designation) params.designation = appliedFilters.designation;
      if (appliedFilters.state) params.state = appliedFilters.state;
      if (appliedFilters.branchId) params.branchId = appliedFilters.branchId;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await importantDatesService.getImportantDates(params);

      if (response && response.success) {
        const list = response.items || response.data || [];
        setDatesList(Array.isArray(list) ? list : []);
      } else {
        setDatesList([]);
      }
    } catch (err) {
      console.error('Failed to fetch important dates feed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch important dates');
      setDatesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImportantDates();
  }, [selectedBankId, selectedMonth, selectedYear, appliedFilters, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract dynamic dropdown options from current data
  const dynamicBranches = useMemo(() => {
    const set = new Set();
    datesList.forEach((d) => {
      const b = d.branch || d.branchName;
      if (b) set.add(b);
    });
    return Array.from(set).sort();
  }, [datesList]);

  const dynamicDesignations = useMemo(() => {
    const set = new Set(DEFAULT_ROLES);
    datesList.forEach((d) => {
      const role = d.designation || d.role;
      if (role) set.add(role);
    });
    return Array.from(set).sort();
  }, [datesList]);

  const dynamicStates = useMemo(() => {
    const set = new Set(INDIAN_STATES);
    datesList.forEach((d) => {
      if (d.state) set.add(d.state);
    });
    return Array.from(set).sort();
  }, [datesList]);

  // Client-side full-text search filter for instantaneous feedback
  const filteredList = useMemo(() => {
    if (!search.trim()) return datesList;
    const query = search.toLowerCase().trim();

    return datesList.filter((item) => {
      const name = (item.employeeName || item.name || '').toLowerCase();
      const code = (item.employeeCode || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const phone = (item.phone || item.mobileNumber || '').toLowerCase();
      const bank = (item.bankName || item.bankCode || '').toLowerCase();
      const branch = (item.branch || item.branchName || '').toLowerCase();
      const desig = (item.designation || item.type || '').toLowerCase();
      const state = (item.state || '').toLowerCase();
      const celebration = (item.celebration || item.type || '').toLowerCase();

      return (
        name.includes(query) ||
        code.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        bank.includes(query) ||
        branch.includes(query) ||
        desig.includes(query) ||
        state.includes(query) ||
        celebration.includes(query)
      );
    });
  }, [datesList, search]);

  // Summary Metrics Counts
  const stats = useMemo(() => {
    let birthdays = 0;
    let workAnniversaries = 0;
    let marriageAnniversaries = 0;

    filteredList.forEach((item) => {
      const t = String(item.type || item.celebration || '').toLowerCase();
      if (t.includes('birth')) birthdays++;
      else if (t.includes('work') || t.includes('tenure') || t.includes('service')) workAnniversaries++;
      else if (t.includes('marriage') || t.includes('wedding')) marriageAnniversaries++;
    });

    return {
      total: filteredList.length,
      birthdays,
      workAnniversaries,
      marriageAnniversaries
    };
  }, [filteredList]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.ceil(filteredList.length / limit) || 1;
  const paginatedList = useMemo(() => {
    return filteredList.slice((page - 1) * limit, page * limit);
  }, [filteredList, page, limit]);

  // Reset Filters
  const handleResetFilter = () => {
    setAppliedFilters({
      celebrationTypes: '',
      date: '',
      designation: '',
      state: '',
      city: '',
      branchId: '',
    });
    setSearch('');
  };

  const hasActiveFilters = Boolean(
    appliedFilters.celebrationTypes || 
    appliedFilters.date || 
    appliedFilters.designation || 
    appliedFilters.state || 
    appliedFilters.city || 
    appliedFilters.branchId ||
    search
  );

  // Celebration badge styling helper matching the corporate bank panel
  const renderCelebrationBadge = (celebrationText, typeText) => {
    const text = celebrationText || typeText || 'Celebration Event';
    const lower = text.toLowerCase();

    if (lower.includes('birthday') || lower.includes('birth')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-full text-[12px] font-bold shadow-2xs">
          <Cake size={13} className="text-pink-500" />
          {text}
        </span>
      );
    }

    if (lower.includes('marriage') || lower.includes('wedding')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[12px] font-bold shadow-2xs">
          <Heart size={13} className="text-rose-500" />
          {text}
        </span>
      );
    }

    if (lower.includes('work') || lower.includes('service') || lower.includes('tenure') || lower.includes('anniversary')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[12px] font-bold shadow-2xs">
          <Briefcase size={13} className="text-blue-500" />
          {text}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[12px] font-bold shadow-2xs">
        <Sparkles size={13} className="text-purple-500" />
        {text}
      </span>
    );
  };

  // Day & Date formatting helper with ordinal suffixes
  const formatDayDisplay = (row) => {
    if (row.day !== undefined && row.day !== null && row.day !== '') {
      const dayNum = Number(row.day);
      const ordinal = dayNum === 1 || dayNum === 21 || dayNum === 31 ? 'st' :
                      dayNum === 2 || dayNum === 22 ? 'nd' :
                      dayNum === 3 || dayNum === 23 ? 'rd' : 'th';
      const monthName = row.monthName || (selectedMonth ? AVAILABLE_MONTHS.find(m => m.value === selectedMonth)?.label : '');

      return (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
            <Calendar size={13} className="text-[#225091]" />
            <span>{dayNum}{ordinal} {monthName}</span>
          </div>
          {row.formattedDate && (
            <span className="text-[11px] text-gray-400 mt-0.5 font-medium">{row.formattedDate}</span>
          )}
        </div>
      );
    }
    if (row.formattedDate || row.date) {
      return (
        <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-xs">
          <Calendar size={13} className="text-[#225091]" />
          <span>{row.formattedDate || row.date}</span>
        </div>
      );
    }
    return <span className="text-gray-400">—</span>;
  };

  // Quick action: navigate to Letters & Payroll to generate a promotion, appraisal, or confirmation
  const handleIssueLetter = (row) => {
    const isWorkAnniversary = String(row.type || row.celebration || '').toLowerCase().includes('work');
    navigate('/letters-payroll', {
      state: {
        employeeId: row.employeeId || row.id,
        letterType: isWorkAnniversary ? 'Salary Increment' : 'Confirmation Letter'
      }
    });
  };

  // Quick Wish text generator tailored for Sahayaone Corporate
  const generatedWishText = useMemo(() => {
    if (!activeWishItem) return '';
    const name = activeWishItem.employeeName || 'Colleague';
    const celebration = activeWishItem.celebration || activeWishItem.type || 'Special Day';
    const org = activeWishItem.bankName ? ` at ${activeWishItem.bankName}` : ' at Sahayaone';
    
    if (celebration.toLowerCase().includes('birthday')) {
      return `🎉 Wishing you a very Happy ${celebration}, ${name}! May your day be filled with joy, good health, and continued success${org}! ✨`;
    }
    if (celebration.toLowerCase().includes('work')) {
      return `💼 Heartiest Congratulations on your ${celebration}, ${name}! Thank you for your continued dedication, professional excellence, and invaluable contributions${org}! 🏆`;
    }
    if (celebration.toLowerCase().includes('marriage')) {
      return `💐 Warmest Congratulations to you and your spouse on your ${celebration}, ${name}! Wishing you both a lifetime of love, happiness, harmony, and togetherness! 🥂`;
    }
    return `✨ Wishing you a joyful and memorable ${celebration}, ${name}!`;
  }, [activeWishItem]);

  const handleCopyWish = () => {
    navigator.clipboard.writeText(generatedWishText);
    setCopiedWish(true);
    toast.success('Celebration wish copied to clipboard!');
    setTimeout(() => setCopiedWish(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10 relative">
      {/* 1. Page Header with Breadcrumbs, Celebration Count Chip & Export Dropdown */}
      <PageHeader
        title="Important Dates"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR Management" },
          { label: "Important Dates" }
        ]}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Upcoming Celebrations Count Chip (Exact parity with Society HR Panel) */}
          <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-4 py-2 rounded-xl shadow-2xs">
            <Gift className="text-pink-600" size={18} />
            <span className="text-xs font-bold text-pink-800">
              {filteredList.length} Upcoming Celebrations
            </span>
          </div>

          {/* Universal Multi-Format Export Dropdown */}
          <ExportDropdown
            title="Important Dates Report"
            filename={`Important_Dates_${selectedMonth ? `Month_${selectedMonth}` : 'All'}_${selectedYear}`}
            tableRef={tableRef}
          />
        </div>
      </PageHeader>

      {/* 2. Interactive Celebration Stat Cards (Quick KPI Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Celebrations Card */}
        <div 
          onClick={() => setAppliedFilters(prev => ({ ...prev, celebrationTypes: '' }))}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
            appliedFilters.celebrationTypes === '' 
              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/30' 
              : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Total Celebrations</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Gift size={22} />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-purple-600">
            {selectedBankId ? 'Scoped to selected partner institution' : 'All Sahayaone corporate staff milestones'}
          </div>
        </div>

        {/* Birthdays Card */}
        <div 
          onClick={() => setAppliedFilters(prev => ({ ...prev, celebrationTypes: 'Birthday' }))}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
            appliedFilters.celebrationTypes === 'Birthday' 
              ? 'bg-pink-50/80 border-pink-300 ring-2 ring-pink-400/30' 
              : 'bg-white border-gray-100 hover:border-pink-200 hover:bg-pink-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-pink-700">Birthdays</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.birthdays}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
              <Cake size={22} />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-pink-600">
            Employee birth milestones
          </div>
        </div>

        {/* Work Anniversaries Card */}
        <div 
          onClick={() => setAppliedFilters(prev => ({ ...prev, celebrationTypes: 'Work Anniversary' }))}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
            appliedFilters.celebrationTypes === 'Work Anniversary' 
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30' 
              : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Work Anniversaries</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.workAnniversaries}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Briefcase size={22} />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-blue-600">
            Service tenure & loyalty
          </div>
        </div>

        {/* Marriage Anniversaries Card */}
        <div 
          onClick={() => setAppliedFilters(prev => ({ ...prev, celebrationTypes: 'Marriage Anniversary' }))}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
            appliedFilters.celebrationTypes === 'Marriage Anniversary' 
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30' 
              : 'bg-white border-gray-100 hover:border-rose-200 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Marriage Anniversaries</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.marriageAnniversaries}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Heart size={22} />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-rose-600">
            Personal life milestones
          </div>
        </div>
      </div>

      {/* 3. Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Top Toolbar */}
        <div className="p-6 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-gray-100">
          
          {/* Left Actions: Search & Refresh */}
          <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-[320px]">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee, bank, branch, event..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#225091] bg-gray-50/50"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchImportantDates}
              disabled={loading}
              className="w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm shrink-0 bg-white"
              title="Refresh Dates"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-[#225091]' : ''} />
            </button>
          </div>
          
          {/* Right Selectors: Bank, Month & Year */}
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            {/* Institution / Bank Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[13px] text-gray-700 font-semibold focus:outline-none focus:border-[#225091] bg-white shadow-2xs cursor-pointer"
              >
                <option value="">Sahayaone Corporate Staff (Default)</option>
                {bankOptions.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    Partner: {b.bankName || b.name} {b.bankCode ? `(${b.bankCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 font-semibold focus:outline-none focus:border-[#225091] bg-white shadow-2xs cursor-pointer"
            >
              {AVAILABLE_MONTHS.map(m => (
                <option key={m.label} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 font-semibold focus:outline-none focus:border-[#225091] bg-white shadow-2xs cursor-pointer"
            >
              {AVAILABLE_YEARS.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Secondary Inline Filter Controls (Exact 6-column grid from Society Panel) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/30">
          {/* Celebration Type */}
          <div className="relative">
            <select 
              value={appliedFilters.celebrationTypes}
              onChange={(e) => setAppliedFilters(prev => ({ ...prev, celebrationTypes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
            >
              {CELEBRATION_TYPES.map((type) => (
                <option key={type.label} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* State / UT */}
          <div className="relative">
            <select 
              value={appliedFilters.state}
              onChange={(e) => setAppliedFilters(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
            >
              <option value="">All States</option>
              {dynamicStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="relative">
            <select 
              value={appliedFilters.branchId}
              onChange={(e) => setAppliedFilters(prev => ({ ...prev, branchId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
            >
              <option value="">All Branches</option>
              {dynamicBranches.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div className="relative">
            <select 
              value={appliedFilters.designation}
              onChange={(e) => setAppliedFilters(prev => ({ ...prev, designation: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
            >
              <option value="">All Designations</option>
              {dynamicDesignations.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Specific Reference Date */}
          <div className="relative">
            <input 
              type="date"
              value={appliedFilters.date}
              onChange={(e) => setAppliedFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white cursor-pointer"
              title="Specific Date Filter"
            />
          </div>

          {/* Reset Filters Button */}
          <div className="flex items-center justify-end">
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilter}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 text-xs font-semibold bg-white"
                title="Reset all active filters"
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            ) : (
              <div className="w-full text-center text-xs text-gray-400 py-2">
                Filter controls active
              </div>
            )}
          </div>
        </div>

        {/* 4. Table Wrapper with Drag-to-Scroll */}
        <TableWrapper ref={tableRef} minHeight="380px">
          <table className="w-full min-w-[980px] text-center text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-16">Sr.No.</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-left">Staff Member</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-left">Institution / Organization</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-left">Designation</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-left">State / UT</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-left">Branch / Office</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Day / Date</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Milestone</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Loader2 className="animate-spin text-[#225091]" size={28} />
                      <span className="text-sm font-semibold text-gray-700">Loading important dates feed...</span>
                      <span className="text-xs text-gray-400">Querying Sahayaone corporate onboarding & administrative staff milestones</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Gift className="text-gray-300 w-12 h-12 mb-1" />
                      <span className="text-base font-semibold text-gray-800">No Celebrations Found</span>
                      <span className="text-xs text-gray-400">No staff birthdays or anniversaries scheduled for this period</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((row, index) => {
                  const empName = row.employeeName || row.name || row.fullName || '—';
                  const initials = empName !== '—'
                    ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'E';
                  const srNo = (page - 1) * limit + (index + 1);
                  const desig = row.designation || row.type || row.role || '—';
                  const state = row.state || '—';
                  const branch = row.branch || row.branchName || '—';
                  const celebration = row.celebration || row.type || 'Celebration';
                  const bankName = row.bankName || 'Sahayaone Urban Multistate Co-operative Society Ltd';
                  const bankCode = row.bankCode || 'SAHAYAONE';
                  const bankLogo = row.bankLogo || '';

                  return (
                    <tr 
                      key={row.id || `${row.employeeId}_${index}`} 
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Sr. No. */}
                      <td className="py-3.5 px-3 text-[13px] text-gray-500 font-medium text-center">
                        {row.srNo || srNo}
                      </td>

                      {/* Employee Name & Code */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-gray-900 truncate max-w-[170px]" title={empName}>{empName}</span>
                            {row.employeeCode && (
                              <span className="text-[11px] font-medium text-gray-400">{row.employeeCode}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Institution / Organization */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center gap-2">
                          {bankLogo ? (
                            <img 
                              src={bankLogo} 
                              alt={bankName} 
                              className="w-6 h-6 rounded-md object-contain border border-gray-100 shrink-0" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-blue-50 text-[#225091] border border-blue-200/60 flex items-center justify-center text-[10px] font-bold shrink-0">
                              <Landmark size={12} />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-gray-800 truncate max-w-[190px]" title={bankName}>{bankName}</span>
                            {bankCode && (
                              <span className="text-[10px] font-mono text-gray-400 uppercase">{bankCode}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3.5 px-3 text-xs text-gray-600 font-medium text-left">
                        {desig}
                      </td>

                      {/* State / UT */}
                      <td className="py-3.5 px-3 text-xs text-gray-600 text-left">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span>{state}</span>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3.5 px-3 text-xs text-gray-600 font-medium text-left">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-gray-400 shrink-0" />
                          <span>{branch}</span>
                        </div>
                      </td>

                      {/* Day / Date */}
                      <td className="py-3.5 px-3 text-xs text-gray-700 font-medium whitespace-nowrap text-center">
                        {formatDayDisplay(row)}
                      </td>

                      {/* Celebration Badge */}
                      <td className="py-3.5 px-3 text-center">
                        {renderCelebrationBadge(celebration, row.type)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Send Wishes / View Quick Card */}
                          <button
                            type="button"
                            onClick={() => setActiveWishItem(row)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-[#225091] hover:bg-[#225091]/5 text-gray-600 hover:text-[#225091] transition-colors"
                            title="Send wishes / view milestone"
                          >
                            <Send size={14} />
                          </button>

                          {/* Issue Official Letter */}
                          <button
                            type="button"
                            onClick={() => handleIssueLetter(row)}
                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-[#225091] transition-colors"
                            title="Generate Letter in Letters & Payroll"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableWrapper>

        {/* 5. Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalRecords={filteredList.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

      </div>

      {/* 6. Quick Celebration Wish Modal */}
      {activeWishItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 relative">
            <button
              onClick={() => setActiveWishItem(null)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0">
                <Gift size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {activeWishItem.employeeName}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeWishItem.designation} • {activeWishItem.bankName}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Milestone</span>
                {renderCelebrationBadge(activeWishItem.celebration, activeWishItem.type)}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Scheduled on: <span className="text-gray-800 font-bold">{activeWishItem.formattedDate || activeWishItem.date || 'Upcoming'}</span>
              </div>
            </div>

            {/* Generated Greeting */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed font-medium mb-4">
              "{generatedWishText}"
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWish}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedWish ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Wish</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const item = activeWishItem;
                  setActiveWishItem(null);
                  handleIssueLetter(item);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#225091] hover:bg-[#1a3d6e] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <FileText size={14} />
                <span>Issue Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
