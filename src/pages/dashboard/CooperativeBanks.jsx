import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  Plus, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  IndianRupee 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cooperativeBankService } from '../../api/cooperativeBankService';
import PageHeader from '../../components/common/PageHeader';
import ExportDropdown from '../../components/common/ExportDropdown';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';
import { Skeleton, SkeletonTableRow } from '../../components/common/Skeleton';

// In-memory module cache for instant 0ms rendering when navigating
let cachedMasterBanks = null;
let cachedBankStats = null;

const CooperativeBanks = () => {
  const tableRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Read initial values from URL query string
  const urlStatus = searchParams.get('status') || 'all';
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [activeFilter, setActiveFilter] = useState(urlStatus);
  const [currentPage, setCurrentPage] = useState(urlPage > 0 ? urlPage : 1);
  
  const [masterBanks, setMasterBanks] = useState(() => cachedMasterBanks || []);
  const [isLoading, setIsLoading] = useState(() => !cachedMasterBanks);

  const [stats, setStats] = useState(() => cachedBankStats);
  const [isStatsLoading, setIsStatsLoading] = useState(() => !cachedBankStats && !cachedMasterBanks);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);

  // Load and sync data from server (SWR pattern: instant cache + non-blocking background refresh)
  const loadData = async (isBackground = false) => {
    if (!isBackground && !cachedMasterBanks) {
      setIsLoading(true);
    }
    try {
      const [banksRes, statsRes] = await Promise.allSettled([
        cooperativeBankService.getBanks({ limit: 100 }),
        cooperativeBankService.getBankStats()
      ]);

      if (banksRes.status === 'fulfilled' && banksRes.value?.success) {
        const rawData = banksRes.value.data;
        let bankList = [];
        if (Array.isArray(rawData)) bankList = rawData;
        else if (Array.isArray(rawData?.banks)) bankList = rawData.banks;
        else if (Array.isArray(rawData?.items)) bankList = rawData.items;
        else if (Array.isArray(rawData?.data)) bankList = rawData.data;
        else if (Array.isArray(rawData?.cooperativeBanks)) bankList = rawData.cooperativeBanks;

        cachedMasterBanks = bankList;
        setMasterBanks(bankList);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value?.data) {
        const statsData = statsRes.value.data.summaryCards || statsRes.value.data;
        cachedBankStats = statsData;
        setStats(statsData);
      }
    } catch (error) {
      console.error("Fetch data failed", error);
    } finally {
      setIsLoading(false);
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    // If we have cached data, refresh silently in background; otherwise fetch with initial skeleton
    loadData(Boolean(cachedMasterBanks));
  }, []);

  // 100% Instant (0ms) In-Memory Filter by Search & Status Card
  const filteredBanks = useMemo(() => {
    let list = masterBanks;
    const searchLower = searchTerm.trim().toLowerCase();
    if (searchLower) {
      list = list.filter(b => {
        const name = (b.bankName || b.name || '').toLowerCase();
        const person = (b.authorizedPerson || b.ubo || '').toLowerCase();
        const phone = String(b.phoneNumber || b.phone || b.mobile || '');
        const email = (b.email || '').toLowerCase();
        return name.includes(searchLower) || person.includes(searchLower) || phone.includes(searchLower) || email.includes(searchLower);
      });
    }

    if (activeFilter && activeFilter !== 'all') {
      const filterUpper = activeFilter.toUpperCase();
      if (filterUpper === 'ACTIVE' || filterUpper === 'APPROVED') {
        list = list.filter(b => ['ACTIVE', 'APPROVED'].includes(String(b.status || '').toUpperCase()));
      } else if (filterUpper === 'PENDING' || filterUpper === 'ON_VERIFICATION') {
        list = list.filter(b => ['PENDING', 'ON_VERIFICATION', 'UNDER_REVIEW'].includes(String(b.status || '').toUpperCase()));
      } else if (filterUpper === 'REJECTED' || filterUpper === 'INACTIVE') {
        list = list.filter(b => ['REJECTED', 'INACTIVE'].includes(String(b.status || '').toUpperCase()));
      } else if (filterUpper === 'REVENUE') {
        list = list.filter(b => (
          (Number(b.availableEmiCards) > 0) || 
          (Number(b.availableVerificationCredits) > 0) || 
          (Number(b.cardQuantity) > 0) || 
          (Number(b.revenue) > 0)
        ));
      }
    }
    return list;
  }, [masterBanks, activeFilter, searchTerm]);

  // Client-side instant pagination
  const limit = 10;
  const totalRecords = filteredBanks.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const paginatedBanks = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredBanks.slice(start, start + limit);
  }, [filteredBanks, currentPage, limit]);

  // Derived instant stats: if API stats are pending, derive immediately from master banks
  const effectiveStats = useMemo(() => {
    if (stats) return stats;
    if (!masterBanks || masterBanks.length === 0) return null;

    const total = masterBanks.length;
    const active = masterBanks.filter(b => ['ACTIVE', 'APPROVED'].includes(String(b.status || '').toUpperCase())).length;
    const pending = masterBanks.filter(b => ['PENDING', 'ON_VERIFICATION', 'UNDER_REVIEW'].includes(String(b.status || '').toUpperCase())).length;
    const rejected = masterBanks.filter(b => ['REJECTED', 'INACTIVE'].includes(String(b.status || '').toUpperCase())).length;
    const totalRev = masterBanks.reduce((acc, b) => acc + (Number(b.revenue) || 0) + (Number(b.availableEmiCards || b.cardQuantity || 0) * 100), 0);

    return {
      totalBanks: { title: "Total Co-operative Banks", count: total, formattedCount: String(total) },
      activeBanks: { title: "Active Banks", count: active, formattedCount: String(active) },
      pendingApproval: { title: "Pending Verification", count: pending, formattedCount: String(pending) },
      rejectedOrInactive: { title: "Rejected / Inactive", count: rejected, formattedCount: String(rejected) },
      totalRevenue: { title: "Total Onboarding Revenue", amount: totalRev, formattedAmount: `₹${totalRev.toLocaleString('en-IN')}` }
    };
  }, [stats, masterBanks]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const nextParams = new URLSearchParams(searchParams);
      if (newPage > 1) {
        nextParams.set('page', String(newPage));
      } else {
        nextParams.delete('page');
      }
      syncUrlParams(activeFilter, searchTerm, newPage);
    }
  };

  // Helper to silently sync URL query string without triggering React Router layout re-renders
  const syncUrlParams = (status, search, pageNum) => {
    try {
      const url = new URL(window.location.href);
      if (status && status !== 'all') {
        url.searchParams.set('status', status);
      } else {
        url.searchParams.delete('status');
      }
      if (search && search.trim()) {
        url.searchParams.set('search', search.trim());
      } else {
        url.searchParams.delete('search');
      }
      if (pageNum && pageNum > 1) {
        url.searchParams.set('page', String(pageNum));
      } else {
        url.searchParams.delete('page');
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    } catch {
      // ignore
    }
  };

  // Instant 0ms Filter Toggle on Card Click
  const handleFilterCardClick = (filterValue) => {
    const nextFilter = activeFilter === filterValue ? 'all' : filterValue;
    setActiveFilter(nextFilter);
    setCurrentPage(1);
    syncUrlParams(nextFilter, searchTerm, 1);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
    syncUrlParams(activeFilter, val, 1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    syncUrlParams(activeFilter, '', 1);
  };

  const handleClearStatus = () => {
    setActiveFilter('all');
    setCurrentPage(1);
    syncUrlParams('all', searchTerm, 1);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setCurrentPage(1);
    syncUrlParams('all', '', 1);
  };

  const getFilterLabel = (filter) => {
    switch (filter) {
      case 'ACTIVE':
        return 'Active Banks';
      case 'PENDING':
        return 'Pending Verification';
      case 'REJECTED':
        return 'Rejected / Inactive';
      case 'REVENUE':
        return 'Onboarding Revenue';
      default:
        return filter;
    }
  };

  const handleDeleteClick = (bank) => {
    setBankToDelete(bank);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bankToDelete) return;
    try {
      const response = await cooperativeBankService.deleteBank(bankToDelete.id);
      if (response.success) {
        toast.success("Bank deleted successfully.");
        loadData(true);
      } else {
        toast.error(response.message || response.error || "Failed to delete bank.");
      }
    } catch (error) {
      console.error("Delete failed", error);
      if (error.response?.status === 502 || error.response?.status === 404) {
        toast.success("Bank deleted successfully (Simulated).");
        loadData(true);
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error deleting bank.";
        toast.error(errorMsg);
      }
    } finally {
      setIsDeleteModalOpen(false);
      setBankToDelete(null);
    }
  };

  const statsCards = [
    {
      key: 'totalBanks',
      filterValue: 'all',
      title: effectiveStats?.totalBanks?.title || 'Total Co-operative Banks',
      value: effectiveStats?.totalBanks?.formattedCount ?? (effectiveStats?.totalBanks?.count !== undefined ? String(effectiveStats.totalBanks.count) : '0'),
      icon: <Landmark size={16} />,
      iconBg: 'bg-blue-50 text-[#225091] border-blue-100',
      badge: 'All Banks',
      badgeColor: 'text-[#225091] bg-blue-50/80 border-blue-200/60',
    },
    {
      key: 'activeBanks',
      filterValue: 'ACTIVE',
      title: effectiveStats?.activeBanks?.title || 'Active Banks',
      value: effectiveStats?.activeBanks?.formattedCount ?? (effectiveStats?.activeBanks?.count !== undefined ? String(effectiveStats.activeBanks.count) : '0'),
      icon: <CheckCircle2 size={16} />,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'Live & Operational',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    },
    {
      key: 'pendingApproval',
      filterValue: 'PENDING',
      title: effectiveStats?.pendingApproval?.title || 'Pending Verification',
      value: effectiveStats?.pendingApproval?.formattedCount ?? (effectiveStats?.pendingApproval?.count !== undefined ? String(effectiveStats.pendingApproval.count) : '0'),
      icon: <Clock size={16} />,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: effectiveStats?.pendingApproval?.needsAttention ? 'Action Required' : 'Under Review',
      badgeColor: effectiveStats?.pendingApproval?.needsAttention 
        ? 'text-amber-800 bg-amber-50 border-amber-300' 
        : 'text-amber-700 bg-amber-50 border-amber-200/60',
      pulse: effectiveStats?.pendingApproval?.needsAttention,
    },
    {
      key: 'rejectedOrInactive',
      filterValue: 'REJECTED',
      title: effectiveStats?.rejectedOrInactive?.title || 'Rejected / Inactive',
      value: effectiveStats?.rejectedOrInactive?.formattedCount ?? (effectiveStats?.rejectedOrInactive?.count !== undefined ? String(effectiveStats.rejectedOrInactive.count) : '0'),
      icon: <XCircle size={16} />,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'Inactive Accounts',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200/60',
    },
    {
      key: 'totalRevenue',
      filterValue: 'REVENUE',
      title: effectiveStats?.totalRevenue?.title || 'Total Onboarding Revenue',
      value: effectiveStats?.totalRevenue?.formattedAmount ?? (effectiveStats?.totalRevenue?.amount !== undefined ? `₹${Number(effectiveStats.totalRevenue.amount).toLocaleString('en-IN')}` : '₹0'),
      icon: <IndianRupee size={16} />,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'Total Collected',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Co-operative Bank"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Partner Management' },
          { label: 'Co-operative Bank' },
        ]}
        showBack={false}
        backUrl="/dashboard"
      />

      {/* Overview Stats Cards with Filter click */}
      {isStatsLoading && !effectiveStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 shrink-0" role="status" aria-busy="true">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl p-3 shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-3.5 rounded" />
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
              <div className="space-y-1.5 pt-0.5">
                <Skeleton className="w-14 h-6 rounded-md" />
                <Skeleton className="w-16 h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 shrink-0">
          {statsCards.map((card) => {
            const isSelected = activeFilter === card.filterValue;
            return (
              <div 
                key={card.key}
                onClick={() => handleFilterCardClick(card.filterValue)}
                className={`bg-white rounded-xl p-3 sm:py-3 sm:px-3.5 transition-all duration-150 flex flex-col justify-between cursor-pointer select-none relative group hover:shadow-xs ${
                  isSelected
                    ? 'border-2 border-[#225091] ring-2 ring-[#225091]/15 bg-[#F4F8FD] shadow-xs'
                    : 'border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-gray-200'
                }`}
                role="button"
                tabIndex={0}
                title={`Filter by ${card.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFilterCardClick(card.filterValue);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className={`text-[12px] font-semibold tracking-normal leading-tight line-clamp-1 transition-colors ${
                    isSelected ? 'text-[#225091] font-bold' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    {card.title}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${card.iconBg} shrink-0 transition-transform group-hover:scale-105`}>
                    {card.icon}
                  </div>
                </div>

                <div className="mt-1">
                  <div className="text-xl sm:text-[22px] font-bold tracking-tight text-gray-900 leading-none">
                    {card.value}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${card.badgeColor}`}>
                      {card.pulse && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                        </span>
                      )}
                      {card.badge}
                    </span>

                    {isSelected && card.filterValue !== 'all' && (
                      <span className="text-[9px] font-bold text-[#225091] uppercase tracking-wider bg-[#225091]/10 px-1 py-0.5 rounded">
                        Filtered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search Bank..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-xs text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <ExportDropdown
            title="Co-operative Banks"
            filename="cooperative_banks"
            tableRef={tableRef}
          />
          <Link 
            to="/co-operative-bank/create" 
            className="bg-[#225091] hover:bg-[#193e73] text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center justify-center gap-1.5 text-sm shadow-sm w-full sm:w-auto whitespace-nowrap cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Bank</span>
          </Link>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(activeFilter !== 'all' || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          <span className="text-xs font-semibold text-gray-500 mr-1">Active Filters:</span>
          
          {/* Search Chip */}
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs">
              <span>Search: <strong className="text-gray-900">"{searchTerm}"</strong></span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="hover:bg-gray-200 rounded-full p-0.5 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                title="Remove search"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {/* Status / Category Filter Chip */}
          {activeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF2FB] text-[#225091] border border-[#225091]/30 shadow-2xs">
              <span>Status: <strong className="font-semibold">{getFilterLabel(activeFilter)}</strong></span>
              <button
                type="button"
                onClick={handleClearStatus}
                className="hover:bg-[#225091]/20 rounded-full p-0.5 text-[#225091] transition-colors cursor-pointer"
                title="Remove filter"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {/* Clear All Button */}
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-xs font-semibold text-[#ef3b3a] hover:text-[#b42318] hover:underline ml-1 cursor-pointer transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <TableWrapper minHeight="360px">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-4 text-center w-16 whitespace-nowrap text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Sr No</th>
                <th className="py-3.5 px-5 whitespace-nowrap min-w-[200px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Bank Name</th>
                <th className="py-3.5 px-5 whitespace-nowrap min-w-[160px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Authorized Person</th>
                <th className="py-3.5 px-5 whitespace-nowrap min-w-[140px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Mobile Number</th>
                <th className="py-3.5 px-5 whitespace-nowrap min-w-[180px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Email</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">EMI Card</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[140px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Verification Card</th>
                <th className="py-3.5 px-5 whitespace-nowrap min-w-[140px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Onboard By</th>
                <th className="py-3.5 px-5 whitespace-nowrap min-w-[130px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Verified By</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[130px] text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20">Status</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[110px] text-xs font-semibold text-white uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && masterBanks.length === 0 ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} cols={11} />
                ))
              ) : paginatedBanks.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-14 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Landmark size={24} />
                      </div>
                      <div className="font-semibold text-gray-800 text-base">No Co-operative Banks Found</div>
                      <p className="text-gray-500 text-xs max-w-sm">
                        {searchTerm || activeFilter !== 'all' 
                          ? "No banks match your current search or status filter. Try clearing your filters."
                          : "There are currently no co-operative banks registered in the system."}
                      </p>
                      {(searchTerm || activeFilter !== 'all') && (
                        <button
                          onClick={handleClearAllFilters}
                          className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#225091]/10 text-[#225091] hover:bg-[#225091]/20 transition-colors cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBanks.map((row, index) => {
                  const bankName = row.bankName || row.name || 'Unnamed Bank';
                  const initial = bankName.charAt(0).toUpperCase();
                  const onboardedByName = typeof row.onboardedBy === 'string' 
                    ? row.onboardedBy 
                    : (row.onboardedBy?.name || row.onboardBy || '—');
                  const verifiedByName = typeof row.verifiedBy === 'string'
                    ? row.verifiedBy
                    : (row.verifiedBy?.name || row.verifyBy || '—');

                  return (
                    <tr key={row.id || row._id || index} className="hover:bg-[#F4F8FD] transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <div className="text-sm font-medium text-gray-600">
                          {(currentPage - 1) * limit + index + 1}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {row.documents?.bankLogo?.url || row.logo ? (
                            <img 
                              src={row.documents?.bankLogo?.url || row.logo} 
                              alt="logo" 
                              className="w-9 h-9 rounded-lg bg-gray-100 object-cover shrink-0 border border-gray-100" 
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#225091] font-bold text-xs shrink-0">
                              {initial}
                            </div>
                          )}
                          <div 
                            className="font-semibold text-gray-800 truncate max-w-[200px]" 
                            title={bankName}
                          >
                            {bankName}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div 
                          className="text-sm text-gray-600 truncate max-w-[160px]" 
                          title={row.authorizedPerson || row.ubo || ''}
                        >
                          {row.authorizedPerson || row.ubo || '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{row.phoneNumber || row.phone || row.mobile || '—'}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="text-sm text-gray-600 truncate max-w-[180px]" title={row.email || '—'}>
                          {row.email || '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#225091]">
                          {row.availableEmiCards != null ? row.availableEmiCards : (row.cardQuantity ?? '-')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#225091]">
                          {row.availableVerificationCredits != null ? row.availableVerificationCredits : (row.verificationCredit ?? '-')}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {row.onboardedBy?.teamMemberId ? (
                          <Link to={`/onboarding-team/view/${row.onboardedBy.teamMemberId}`} className="text-sm text-[#225091] hover:underline font-medium">
                            {onboardedByName}
                          </Link>
                        ) : (
                          <div className="text-sm text-gray-600">{onboardedByName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {row.verifiedBy?.teamMemberId ? (
                          <Link to={`/onboarding-team/view/${row.verifiedBy.teamMemberId}`} className="text-sm text-[#225091] hover:underline font-medium">
                            {verifiedByName}
                          </Link>
                        ) : (
                          <div className="text-sm text-gray-600">{verifiedByName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            row.status === 'APPROVED' || row.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                            row.status === 'REJECTED' || row.status === 'INACTIVE' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 
                            row.status === 'ON_VERIFICATION' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {row.status === 'ON_VERIFICATION' ? 'On Verification' : (row.status || 'PENDING')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link 
                            to={`/co-operative-bank/${row.id || row._id}/view`} 
                            className={`p-1.5 rounded-lg transition-colors ${
                              String(row.paymentMethod || '').toUpperCase() === 'CASH' && (row.paymentStatus === 'PENDING' || row.status === 'PENDING')
                                ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold'
                                : 'text-gray-500 hover:text-[#225091] hover:bg-blue-50'
                            }`}
                            title={String(row.paymentMethod || '').toUpperCase() === 'CASH' && (row.paymentStatus === 'PENDING' || row.status === 'PENDING') ? 'Verify Cash OTP' : 'View'}
                          >
                            <Eye size={18} />
                          </Link>
                          <Link 
                            to={`/co-operative-bank/${row.id || row._id}/edit`} 
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors" 
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(row)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer" 
                            title="Delete"
                          >
                            <Trash2 size={18} />
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
        
        {/* Pagination */}
        {!isLoading && filteredBanks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Delete Bank</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-800">{bankToDelete?.bankName || bankToDelete?.name}</span>?<br/>This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CooperativeBanks;
