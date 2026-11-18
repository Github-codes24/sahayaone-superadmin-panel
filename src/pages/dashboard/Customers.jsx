import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Eye, Edit, Trash2, X, Calendar, Mail, Phone, MapPin, User, Camera, Plus, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { customerService } from '../../api/customerService';
import { cooperativeBankService } from '../../api/cooperativeBankService';
import PageHeader from '../../components/common/PageHeader';
import ExportDropdown from '../../components/common/ExportDropdown';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';

const mockCustomers = [];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'PENDING_KYC', label: 'Pending KYC' },
];

const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const SingleSelectDropdown = ({ label, value, options, onChange }) => {
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

  const selectedOption = options.find((o) => o.value === value);
  const isSelected = Boolean(value);

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
        <span>{selectedOption ? selectedOption.label : label}</span>
        {isSelected ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="w-4 h-4 rounded-full bg-[#225091]/20 hover:bg-[#225091] hover:text-white text-[#225091] text-[10px] flex items-center justify-center transition-colors"
            title="Clear"
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
        <div className="absolute z-50 top-full left-0 mt-1.5 min-w-[170px] max-w-[240px] bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            {isSelected && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[11px] text-[#225091] hover:underline font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {options.map((option, idx) => {
            const checked = value === option.value;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs text-left ${
                  checked ? 'bg-blue-50/70 text-[#225091] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {checked && <span className="w-1.5 h-1.5 rounded-full bg-[#225091]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BankSelectDropdown = ({ value, onChange, bankOptions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filteredOptions = bankOptions.filter((b) =>
    (b.label || '').toLowerCase().includes(search.toLowerCase())
  );
  const isSelected = Boolean(value);

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
        <span className="max-w-[140px] truncate">{value || 'Bank'}</span>
        {isSelected ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="w-4 h-4 rounded-full bg-[#225091]/20 hover:bg-[#225091] hover:text-white text-[#225091] text-[10px] flex items-center justify-center transition-colors"
            title="Clear"
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
        <div className="absolute z-50 top-full left-0 mt-1.5 min-w-[220px] max-w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filter by Bank</span>
            {isSelected && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[11px] text-[#225091] hover:underline font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="p-1">
            <input
              type="text"
              placeholder="Search bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] mb-1"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="text-xs text-gray-400 p-2 text-center">No banks found</div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const checked = value === opt.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs text-left ${
                      checked ? 'bg-blue-50/70 text-[#225091] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {checked && <span className="w-1.5 h-1.5 rounded-full bg-[#225091]" />}
                  </button>
                );
              })
            )}
          </div>
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

const Customers = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [debouncedBankFilter, setDebouncedBankFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [bankOptions, setBankOptions] = useState([]);

  // Fetch cooperative bank dropdown options
  useEffect(() => {
    let isMounted = true;
    const loadBanks = async () => {
      try {
        const res = await cooperativeBankService.getBankDropdown();
        if (isMounted && res.success && Array.isArray(res.data)) {
          const list = res.data.map((b) => ({
            value: b.bankName || b.name || b.label || String(b.id),
            label: b.bankName || b.name || b.label || 'Bank'
          }));
          setBankOptions(list);
        }
      } catch (err) {
        console.warn('Failed to load bank dropdown', err);
      }
    };
    loadBanks();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    statusFilter ||
    genderFilter ||
    bankFilter ||
    fromDate ||
    toDate
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setGenderFilter('');
    setBankFilter('');
    setFromDate('');
    setToDate('');
  };
  
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedBankFilter(bankFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, bankFilter]);

  const fetchCustomers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (genderFilter) params.gender = genderFilter.toUpperCase();
      if (statusFilter) params.status = statusFilter.toUpperCase();
      if (debouncedBankFilter) params.bank = debouncedBankFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await customerService.getCustomers(params);
      if (response.success) {
        setCustomers(response.data);
        setMeta(response.meta);
      } else {
        // Fallback for when backend endpoint is not yet deployed (returns 404 or success: false)
        console.warn("API returned error, falling back to mock data");
        setCustomers(mockCustomers);
        setMeta({ page: 1, limit: 10, totalRecords: 4, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      }
    } catch (error) {
      console.error("Failed to fetch customers, backend route likely not deployed. Using mock data.", error);
      // Fallback for when backend endpoint returns 404 (Not Found)
      setCustomers(mockCustomers);
      setMeta({ page: 1, limit: 10, totalRecords: 4, totalPages: 1, hasNextPage: false, hasPrevPage: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [debouncedSearch, genderFilter, statusFilter, debouncedBankFilter, fromDate, toDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchCustomers(newPage);
    }
  };

  const handleEditClick = (customer) => {
    setCustomerToEdit(customer);
    setIsEditModalOpen(true);
  };

  const handleViewClick = async (customer) => {
    try {
      const response = await customerService.getCustomerDetails(customer.id);
      if (response.success) {
        setCustomerToView(response.data);
      } else {
        setCustomerToView(customer);
      }
    } catch (error) {
      console.error("Failed to fetch customer details, using local data", error);
      setCustomerToView(customer);
    } finally {
      setIsViewModalOpen(true);
    }
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      const response = await customerService.deleteCustomer(customerToDelete.id);
      if (response.success) {
        toast.success("Customer deleted successfully.");
        fetchCustomers(meta.page);
      } else {
        toast.error("Failed to delete customer.");
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Error deleting customer (Backend might not be deployed yet).");
    } finally {
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Clean up empty file inputs which might cause 422 errors
    const profileImage = formData.get('profileImage');
    if (profileImage && profileImage.size === 0) {
      formData.delete('profileImage');
    }
    
    // Clean up empty optional fields
    if (!formData.get('email')) formData.delete('email');
    if (!formData.get('address')) formData.delete('address');

    try {
      const response = await customerService.createCustomer(formData);
      if (response.success) {
        toast.success("Customer created successfully.");
        setIsAddModalOpen(false);
        fetchCustomers(1);
      } else {
        const errorMsg = response.message || response.error || "Failed to create customer.";
        toast.error(errorMsg);
        console.error("Backend validation error:", response);
      }
    } catch (error) {
      console.error("Create failed", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error creating customer. Please check your data.";
      toast.error(errorMsg);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!customerToEdit) return;
    const formData = new FormData(e.target);
    
    const profileImage = formData.get('profileImage');
    if (profileImage && profileImage.size === 0) {
      formData.delete('profileImage');
    }
    if (!formData.get('email')) formData.delete('email');
    if (!formData.get('address')) formData.delete('address');

    try {
      const response = await customerService.updateCustomer(customerToEdit.id, formData);
      if (response.success) {
        toast.success("Customer updated successfully.");
        setIsEditModalOpen(false);
        fetchCustomers(meta.page);
      } else {
        toast.error(response.message || response.error || "Failed to update customer.");
      }
    } catch (error) {
      console.error("Update failed", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error updating customer.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title="Customer Loans"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Lead Management' },
          { label: 'Customer Loans' },
        ]}
        showBack={false}
        backUrl="/dashboard"
      >
        <ExportDropdown
          title="Customer Loans"
          filename="customer_loans"
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
                placeholder="Search customer name, phone, email..."
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
            <SingleSelectDropdown
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />

            {/* Gender Filter */}
            <SingleSelectDropdown
              label="Gender"
              value={genderFilter}
              options={genderOptions}
              onChange={setGenderFilter}
            />

            {/* Bank Filter */}
            <BankSelectDropdown
              value={bankFilter}
              onChange={setBankFilter}
              bankOptions={bankOptions}
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
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-xs"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right Side: Add Customer */}
          <div className="flex items-center gap-2.5 shrink-0 justify-end">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#225091] hover:bg-[#193e73] text-white px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-1.5 text-xs shadow-xs shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              + Add Customer
            </button>
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
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#225091] font-semibold border border-blue-200 text-xs shadow-2xs">
                Status: {statusOptions.find((o) => o.value === statusFilter)?.label || statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {genderFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-xs shadow-2xs">
                Gender: {genderOptions.find((o) => o.value === genderFilter)?.label || genderFilter}
                <button
                  type="button"
                  onClick={() => setGenderFilter('')}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {bankFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 font-semibold border border-purple-200 text-xs shadow-2xs">
                Bank: {bankFilter}
                <button
                  type="button"
                  onClick={() => setBankFilter('')}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
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
              onClick={handleResetFilters}
              className="text-gray-500 hover:text-rose-600 underline text-xs font-semibold ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <TableWrapper minHeight="360px">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Sr.No.</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Customer Name</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Gender</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Date Of Birth</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Phone Number</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Email</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider text-center min-w-[210px] whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer, idx) => (
                  <tr key={customer.id} className="hover:bg-[#F4F8FD] transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">{(meta.page - 1) * meta.limit + idx + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {customer.profileImage ? (
                          <img src={customer.profileImage} alt={customer.fullName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100/60 text-[#225091] flex items-center justify-center text-xs font-bold uppercase">
                            {customer.fullName ? customer.fullName.substring(0, 2) : 'NA'}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-900">{customer.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 capitalize">{customer.displayGender || customer.gender?.toLowerCase() || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{customer.formattedDob || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">{customer.phoneNumber || customer.phone || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{customer.email || '-'}</td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-1.5">
                        <button 
                          onClick={() => handleViewClick(customer)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 hover:border-[#225091]/30 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                          title="View"
                        >
                          <Eye size={13} className="text-[#225091]" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleEditClick(customer)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 hover:border-amber-300 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={13} className="text-amber-600" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(customer)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 hover:border-rose-300 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} className="text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>

        {/* Pagination */}
        {!isLoading && customers.length > 0 && (
          <Pagination
            currentPage={meta.page || 1}
            totalPages={meta.totalPages || 1}
            totalRecords={meta.totalRecords || customers.length}
            limit={meta.limit || 10}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 transition-transform">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-[#ff3d67]">
              <Trash2 size={24} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-3">Delete</h2>
            
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to delete {customerToDelete?.fullName}?<br />
              This action is permanent and cannot be undone.
            </p>

            <div className="flex w-full gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-[#ff3d67] hover:bg-[#e02e55] text-white font-semibold rounded-full shadow-md transition-colors focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {isViewModalOpen && customerToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Customer Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-8 pb-8 overflow-y-auto flex-1 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              
              {/* Profile Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-5">
                  {customerToView.profileImage ? (
                    <img src={customerToView.profileImage} alt={customerToView.fullName} className="w-20 h-20 rounded-full border-[3px] border-[#225091] object-cover shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-[3px] border-[#225091] bg-white text-[#225091] flex items-center justify-center text-2xl font-bold shadow-sm uppercase">
                      {customerToView.fullName ? customerToView.fullName.substring(0, 2) : 'NA'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-[22px] font-bold text-gray-800 mb-2">{customerToView.fullName}</h3>
                    <div className="inline-block px-4 py-1.5 bg-[#225091] text-white text-xs font-semibold rounded-full shadow-sm">
                      {customerToView.roleTag || 'Customer'}
                    </div>
                  </div>
                </div>
                
                <Link to={`/customers/${customerToView.id}/loans`} className="py-2.5 px-6 rounded-full border-2 border-[#225091] text-[#225091] font-semibold bg-white hover:bg-blue-50/50 transition-colors focus:outline-none text-[15px] shadow-sm block text-center">
                  See Loans
                </Link>
              </div>

              <div className="h-px bg-gray-200 w-full mb-6"></div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Gender */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <User size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Gender</div>
                    <div className="text-[15px] font-semibold text-gray-800 capitalize">{customerToView.displayGender || customerToView.gender?.toLowerCase()}</div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Calendar size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Date Of Birth</div>
                    <div className="text-[15px] font-semibold text-gray-800">{customerToView.formattedDob}</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Phone size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Phone</div>
                    <div className="text-[15px] font-semibold text-gray-800">{customerToView.phoneNumber || customerToView.phone}</div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                  <div className="mt-0.5">
                    <Mail size={22} className="text-[#225091]" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 font-medium mb-1">Email</div>
                    <div className="text-[15px] font-semibold text-gray-800">{customerToView.email || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50 mb-6">
                <div className="mt-0.5">
                  <MapPin size={22} className="text-[#225091]" />
                </div>
                <div>
                  <div className="text-[13px] text-gray-500 font-medium mb-1">Address</div>
                  <div className="text-[15px] font-semibold text-gray-800">{customerToView.address || '-'}</div>
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full my-6"></div>

              {/* Registered On */}
              <div className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50 w-full md:w-[calc(50%-8px)]">
                <div className="mt-0.5">
                  <Calendar size={22} className="text-[#225091]" />
                </div>
                <div>
                  <div className="text-[13px] text-gray-500 font-medium mb-1">Registered On</div>
                  <div className="text-[15px] font-semibold text-gray-800">{customerToView.registeredOnFormatted || '-'}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Add Customer</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <form onSubmit={handleAddSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-8 pb-4 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-4 relative">
                {/* Avatar Upload */}
                <div className="flex justify-center mb-4 mt-2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                      <User size={40} className="text-gray-400" />
                    </div>
                    <label className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/3 bg-[#225091] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm cursor-pointer">
                      <Camera size={14} />
                      <input type="file" name="profileImage" className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Full Name *</label>
                  <input type="text" name="fullName" required placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Gender *</label>
                  <div className="relative">
                    <select name="gender" required defaultValue="" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] appearance-none text-gray-700 shadow-sm">
                      <option value="" disabled>Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Date Of Birth *</label>
                  <div className="relative">
                    <input type="date" name="dob" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Phone *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    maxLength={10}
                    pattern="\d{10}"
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
                    required 
                    placeholder="Enter phone Number" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    placeholder="Enter email" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Address</label>
                  <input type="text" name="address" placeholder="Enter address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 pt-4 bg-[#f4f3fb] flex justify-end gap-4 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-8 rounded-full border-2 border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors focus:outline-none text-[15px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="py-2.5 px-8 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && customerToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Edit Customer</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-8 pb-4 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-4 relative">
                {/* Avatar Upload */}
                <div className="flex justify-center mb-4 mt-2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm text-[#225091] text-2xl font-bold uppercase">
                      {customerToEdit.profileImage ? (
                        <img src={customerToEdit.profileImage} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        customerToEdit.fullName ? customerToEdit.fullName.substring(0, 2) : 'NA'
                      )}
                    </div>
                    <label className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/3 bg-[#225091] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm cursor-pointer">
                      <Camera size={14} />
                      <input type="file" name="profileImage" className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Full Name</label>
                  <input type="text" name="fullName" defaultValue={customerToEdit.fullName} placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Gender</label>
                  <div className="relative">
                    <select name="gender" defaultValue={customerToEdit.gender} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] appearance-none text-gray-700 shadow-sm">
                      <option value="" disabled>Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Date Of Birth</label>
                  <div className="relative">
                    {/* The API returns ISO string for dob, which might need formatting for input type="date" */}
                    <input type="date" name="dob" defaultValue={customerToEdit.dob ? new Date(customerToEdit.dob).toISOString().split('T')[0] : ''} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    maxLength={10}
                    pattern="\d{10}"
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
                    defaultValue={customerToEdit.phoneNumber || customerToEdit.phone} 
                    placeholder="Enter phone Number" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    defaultValue={customerToEdit.email} 
                    placeholder="Enter email" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Address</label>
                  <input type="text" name="address" defaultValue={customerToEdit.address} placeholder="Enter address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-[15px] text-gray-700 shadow-sm" />
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 pt-4 bg-[#f4f3fb] flex justify-end gap-4 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2.5 px-8 rounded-full border-2 border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors focus:outline-none text-[15px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="py-2.5 px-8 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
