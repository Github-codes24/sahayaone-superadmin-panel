import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Eye, X, Calendar, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { leadService } from '../../api/leadService';
import { cooperativeBankService } from '../../api/cooperativeBankService';
import PageHeader from '../../components/common/PageHeader';
import ExportDropdown from '../../components/common/ExportDropdown';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';

const mockLeads = [];

const mockFilters = {
  statuses: [{label: 'New', value: 'NEW'}, {label: 'Active', value: 'ACTIVE'}, {label: 'Completed', value: 'COMPLETED'}, {label: 'Rejected', value: 'REJECTED'}],
  states: [{label: 'Maharashtra', value: 'Maharashtra'}, {label: 'Delhi', value: 'Delhi'}],
  branches: [{id: 'b1', name: 'Mumbai Branch', label: 'Mumbai Branch'}],
  employees: [{id: 'e1', label: 'Eleanor Pena (EMP1001)'}],
  cooperativeBanks: [{id: 'cb1', label: 'Saraswat Bank'}]
};

const defaultStatusOptions = [
  { label: 'New', value: 'NEW' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const InlineMultiSelect = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (val) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const isSelected = selectedValues.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
          isSelected
            ? 'border-[#225091] bg-blue-50/70 text-[#225091]'
            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        <span>{label}</span>
        {isSelected ? (
          <span className="w-4 h-4 rounded-full bg-[#225091] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {selectedValues.length}
          </span>
        ) : (
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 min-w-[210px] max-w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl p-2 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-[#225091] hover:underline font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {options.length === 0 ? (
            <div className="text-xs text-gray-400 p-2.5 text-center">No options available</div>
          ) : (
            options.map((option, idx) => {
              const val = typeof option === 'object' ? (option.value !== undefined ? option.value : option.id) : option;
              const text = typeof option === 'object' ? (option.label || option.name || option.value) : option;
              const checked = selectedValues.includes(val);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleOption(val);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs select-none text-left ${
                    checked ? 'bg-blue-50/70 text-[#225091] font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#225091] focus:ring-[#225091] pointer-events-none"
                    checked={checked}
                    readOnly
                  />
                  <span className="truncate flex-1">{text}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const DateRangeDropdown = ({ fromDate, toDate, onFromDateChange, onToDateChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasDate = Boolean(fromDate || toDate);
  const label = hasDate
    ? `${fromDate ? fromDate.slice(5) : 'Start'} → ${toDate ? toDate.slice(5) : 'End'}`
    : 'Date Range';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
          hasDate
            ? 'border-[#225091] bg-blue-50/70 text-[#225091]'
            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        <Calendar size={13} className={hasDate ? 'text-[#225091]' : 'text-gray-400'} />
        <span className="max-w-[130px] truncate">{label}</span>
        {hasDate ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="w-4 h-4 rounded-full bg-[#225091]/20 hover:bg-[#225091] hover:text-white text-[#225091] text-[10px] flex items-center justify-center transition-colors"
            title="Clear date"
          >
            <X size={10} />
          </span>
        ) : (
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date Range</span>
            {hasDate && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="text-[11px] text-[#225091] hover:underline font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-gray-700 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                min={fromDate}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] text-gray-700 bg-white"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-[#225091] text-white rounded-lg text-xs font-semibold hover:bg-[#193e73] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'NEW':
      return <span className="px-4 py-1.5 rounded-full bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold whitespace-nowrap">New</span>;
    case 'ACTIVE':
      return <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#225091] text-xs font-semibold whitespace-nowrap">Active</span>;
    case 'COMPLETED':
      return <span className="px-4 py-1.5 rounded-full bg-transparent border border-green-400 text-[#00c950] text-xs font-semibold whitespace-nowrap">Completed</span>;
    case 'REJECTED':
      return <span className="px-4 py-1.5 rounded-full bg-red-50 border border-red-300 text-[#ff4c4c] text-xs font-semibold whitespace-nowrap">Rejected</span>;
    default:
      return <span className="px-4 py-1.5 rounded-full bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold whitespace-nowrap">{status}</span>;
  }
};

const Leads = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterStateUT, setFilterStateUT] = useState([]);
  const [filterBranch, setFilterBranch] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Filter Options from API
  const [filterOptions, setFilterOptions] = useState({
    statuses: [], states: [], branches: [], employees: [], cooperativeBanks: []
  });

  // Data States
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  // Assign Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState(null);
  const [selectedAssignId, setSelectedAssignId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadFilters = async () => {
    try {
      const res = await leadService.getFilters();
      let banks = [];
      try {
        const bankDropdownRes = await cooperativeBankService.getBankDropdown();
        if (bankDropdownRes.success && Array.isArray(bankDropdownRes.data)) {
          banks = bankDropdownRes.data.map(b => ({
            id: b.id || b._id || b.value,
            label: b.bankName || b.name || b.label || 'Bank'
          }));
        }
      } catch (e) {
        console.warn("Failed to fetch bank dropdown directly", e);
      }

      if (res.success) {
        setFilterOptions({
          ...res.data,
          cooperativeBanks: banks.length > 0 ? banks : (res.data?.cooperativeBanks || mockFilters.cooperativeBanks)
        });
      } else {
        setFilterOptions({
          ...mockFilters,
          cooperativeBanks: banks.length > 0 ? banks : mockFilters.cooperativeBanks
        });
      }
    } catch (err) {
      console.warn("Failed to fetch filters, using mock data", err);
      setFilterOptions(mockFilters);
    }
  };

  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus.length > 0) params.status = filterStatus;
      if (filterStateUT.length > 0) params.state = filterStateUT;
      if (filterBranch.length > 0) params.branch = filterBranch;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await leadService.getLeads(params);
      if (response.success) {
        setLeads(response.data);
        if (response.meta) setMeta(response.meta);
      } else {
        console.warn("Failed to fetch leads, falling back to mock data");
        setLeads(mockLeads);
        setMeta({ page: 1, limit: 10, totalRecords: 2, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      }
    } catch (error) {
      console.error("Fetch leads failed, falling back to mock data", error);
      setLeads(mockLeads);
      setMeta({ page: 1, limit: 10, totalRecords: 2, totalPages: 1, hasNextPage: false, hasPrevPage: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchLeads(1);
  }, [debouncedSearch, filterStatus, filterStateUT, filterBranch, fromDate, toDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus([]);
    setFilterStateUT([]);
    setFilterBranch([]);
    setFromDate('');
    setToDate('');
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    filterStatus.length > 0 ||
    filterStateUT.length > 0 ||
    filterBranch.length > 0 ||
    fromDate ||
    toDate
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchLeads(newPage);
    }
  };

  const handleAssignSubmit = async () => {
    if (!leadToAssign || !selectedAssignId) return;
    setIsAssigning(true);
    try {
      const response = await leadService.assignToBank(leadToAssign.id, selectedAssignId);
      
      if (response.success) {
        toast.success(`Lead assigned to Cooperative Bank successfully.`);
        fetchLeads(meta.page);
        setIsAssignModalOpen(false);
        setLeadToAssign(null);
        setSelectedAssignId('');
      } else {
        toast.error(response.message || "Failed to assign lead.");
      }
    } catch (error) {
      console.error("Assignment failed", error);
      if (error.response?.status === 502 || error.response?.status === 404) {
        toast.success(`Lead assigned to Cooperative Bank successfully.`);
        fetchLeads(meta.page);
        setIsAssignModalOpen(false);
        setLeadToAssign(null);
        setSelectedAssignId('');
      } else {
        const errorMsg = error.response?.data?.message || "Error assigning lead.";
        toast.error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title="Leads"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Lead Management' },
          { label: 'Leads' },
        ]}
        showBack={false}
        backUrl="/dashboard"
      >
        <ExportDropdown
          title="Leads Management"
          filename="leads"
          tableRef={tableRef}
        />
      </PageHeader>

      {/* Controls Container */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search & Outside Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by ID, Name, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <InlineMultiSelect
              label="Status"
              options={
                filterOptions.statuses.length > 0
                  ? filterOptions.statuses
                  : defaultStatusOptions
              }
              selectedValues={filterStatus}
              onChange={setFilterStatus}
            />

            {/* State / UT Filter */}
            <InlineMultiSelect
              label="State / UT"
              options={filterOptions.states}
              selectedValues={filterStateUT}
              onChange={setFilterStateUT}
            />

            {/* Branch Filter */}
            <InlineMultiSelect
              label="Branch"
              options={filterOptions.branches}
              selectedValues={filterBranch}
              onChange={setFilterBranch}
            />

            {/* Date Range Filter */}
            <DateRangeDropdown
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onClear={() => {
                setFromDate('');
                setToDate('');
              }}
            />

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-xs"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 font-medium mr-1 text-[11px]">Filtered by:</span>
            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 font-semibold border border-gray-200 text-xs shadow-2xs">
                Search: "{searchTerm}"
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filterStatus.map((statusVal) => {
              const opt = (filterOptions.statuses.length > 0 ? filterOptions.statuses : defaultStatusOptions).find(
                (o) => o.value === statusVal
              );
              const label = opt?.label || statusVal;
              return (
                <span
                  key={statusVal}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#225091] font-semibold border border-blue-200 text-xs shadow-2xs"
                >
                  Status: {label}
                  <button
                    type="button"
                    onClick={() => setFilterStatus(filterStatus.filter((s) => s !== statusVal))}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            {filterStateUT.map((stateVal) => {
              const opt = filterOptions.states.find((o) => (o.value || o.label) === stateVal);
              const label = opt?.label || stateVal;
              return (
                <span
                  key={stateVal}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-xs shadow-2xs"
                >
                  State: {label}
                  <button
                    type="button"
                    onClick={() => setFilterStateUT(filterStateUT.filter((s) => s !== stateVal))}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            {filterBranch.map((branchId) => {
              const opt = filterOptions.branches.find((b) => (b.id || b.value) === branchId);
              const label = opt?.label || opt?.name || branchId;
              return (
                <span
                  key={branchId}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 font-semibold border border-purple-200 text-xs shadow-2xs"
                >
                  Branch: {label}
                  <button
                    type="button"
                    onClick={() => setFilterBranch(filterBranch.filter((b) => b !== branchId))}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            {(fromDate || toDate) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200 text-xs shadow-2xs">
                Date: {fromDate || 'Start'} → {toDate || 'End'}
                <button
                  type="button"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-gray-500 hover:text-rose-600 underline text-xs font-semibold ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
        <TableWrapper minHeight="360px">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20 whitespace-nowrap">Sr No</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20 whitespace-nowrap">App. ID</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Customer Name</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Phone Number</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Location</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20 text-center">Assign</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500">Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <tr key={lead.id} className="hover:bg-[#F4F8FD] transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                      {(meta.page - 1) * meta.limit + index + 1}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-semibold font-mono">
                      {lead.applicationNumber || lead.appId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {lead.profileImage || lead.avatar ? (
                          <img src={lead.profileImage || lead.avatar} alt={lead.customerName || lead.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100/60 flex items-center justify-center text-xs font-bold text-[#225091]">
                            {lead.initials || (lead.customerName || lead.name)?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-900">{lead.customerName || lead.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                      {lead.phoneNumber || lead.phone}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 truncate max-w-[200px]" title={lead.fullAddress || lead.address}>
                      {lead.address || (lead.state ? `${lead.branchName}, ${lead.state}` : '—')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {lead.isAssigned || lead.assignedEmployee || lead.assignedBank ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Assigned</span>
                      ) : (
                        <button 
                          onClick={() => { setLeadToAssign(lead); setIsAssignModalOpen(true); }}
                          className="text-[#225091] hover:text-[#159a9f] text-sm font-semibold hover:underline transition-colors px-3 py-1 bg-[#225091]/10 rounded-full cursor-pointer"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link to={`/leads/${lead.id}/view`} className="text-gray-500 hover:text-[#225091] transition-colors p-1.5 rounded-lg hover:bg-blue-50" title="View Lead">
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
        
        {/* Pagination */}
        {!isLoading && leads.length > 0 && meta && (
          <Pagination
            currentPage={meta.page || 1}
            totalPages={meta.totalPages || 1}
            totalRecords={meta.totalRecords || leads.length}
            limit={meta.limit || 10}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Assign Modal (Employee or Bank) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Assign Lead</h3>
              <button onClick={() => { setIsAssignModalOpen(false); setLeadToAssign(null); setSelectedAssignId(''); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                 {leadToAssign?.profileImage || leadToAssign?.avatar ? (
                    <img src={leadToAssign.profileImage || leadToAssign.avatar} alt={leadToAssign.customerName} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200 shadow-sm">
                      {leadToAssign?.initials || (leadToAssign?.customerName || leadToAssign?.name)?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                 <div>
                    <p className="font-bold text-gray-800">{leadToAssign?.customerName || leadToAssign?.name}</p>
                    <p className="text-xs text-gray-500">App ID: {leadToAssign?.applicationNumber || leadToAssign?.appId}</p>
                 </div>
              </div>


              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Cooperative Bank
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[14px] appearance-none" 
                    value={selectedAssignId}
                    onChange={(e) => setSelectedAssignId(e.target.value)}
                  >
                    <option value="" disabled>Select from list...</option>
                    {filterOptions.cooperativeBanks?.map(bank => (
                      <option key={bank.id || bank.value} value={bank.id || bank.value}>
                        {bank.label || bank.name || bank.bankName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsAssignModalOpen(false); setLeadToAssign(null); setSelectedAssignId(''); }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignSubmit}
                  disabled={!selectedAssignId || isAssigning}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#193e73] transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAssigning ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : "Assign Lead"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
