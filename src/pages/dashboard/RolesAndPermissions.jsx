import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, X, ChevronDown, Plus, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import ExportDropdown from '../../components/common/ExportDropdown';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';
import { subAdminService } from '../../api/subAdminService';


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
        <div className="absolute z-50 top-full left-0 mt-1.5 min-w-[190px] max-w-[260px] bg-white border border-gray-200 rounded-xl shadow-xl p-2 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
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
              const val = typeof option === 'object' ? option.value : option;
              const text = typeof option === 'object' ? option.label : option;
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

const RolesAndPermissions = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [deleteRoleData, setDeleteRoleData] = useState(null);

  const [rolesData, setRolesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await subAdminService.getSubAdmins({
        page,
        limit,
        search: searchTerm.trim() || undefined
      });
      if (response.success && Array.isArray(response.data)) {
        setRolesData(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalRecords(response.meta?.totalRecords || response.data.length);
      } else {
        setRolesData([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRolesData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async () => {
    if (!deleteRoleData) return;
    try {
      await subAdminService.deleteSubAdmin((deleteRoleData._id || deleteRoleData.id));
      setDeleteRoleData(null);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Dynamic role category options from actual data
  const categoryOptions = useMemo(() => {
    const rolesFromData = rolesData.map((r) => r.role).filter(Boolean);
    const unique = Array.from(new Set(rolesFromData));
    return unique.map((cat) => ({ value: cat, label: cat }));
  }, [rolesData]);

  // Real-time filtering by search and selected categories
  const filteredData = useMemo(() => {
    return rolesData.filter((item) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          (item.name || '').toLowerCase().includes(term) ||
          (item.email || '').toLowerCase().includes(term) ||
          (item.phoneNumber || '').toLowerCase().includes(term) ||
          (item.role || '').toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      if (selectedCategories.length > 0) {
        const matchesCategory = selectedCategories.some(
          (cat) => (item.role || '').toLowerCase() === cat.toLowerCase()
        );
        if (!matchesCategory) return false;
      }
      return true;
    });
  }, [rolesData, searchTerm, selectedCategories]);

  const hasActiveFilters = Boolean(searchTerm.trim() || selectedCategories.length > 0);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPage(1);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title="Roles & Permissions"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Roles & Permissions' },
        ]}
      />

      {/* Controls Container */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search & Role Filter */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone, role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
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

            {/* Role Filter */}
            <InlineMultiSelect
              label="Role"
              options={categoryOptions}
              selectedValues={selectedCategories}
              onChange={(cats) => {
                setSelectedCategories(cats);
                setPage(1);
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

          {/* Right Side: Export & Add New Role */}
          <div className="flex items-center gap-2.5 shrink-0 justify-end">
            <ExportDropdown
              title="Roles & Permissions"
              filename="roles_and_permissions"
              tableRef={tableRef}
            />
            <Link 
              to="/roles-permissions/create"
              className="bg-[#225091] hover:bg-[#193e73] text-white px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-1.5 text-xs shadow-xs shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Role</span>
            </Link>
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
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#225091] font-semibold border border-blue-200 text-xs shadow-2xs"
              >
                Role: {cat}
                <button
                  type="button"
                  onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
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

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
        <TableWrapper minHeight="360px">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-6 text-center w-20 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Sr.No.</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Name</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Email</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Phone Number</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Role</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Permissions</th>
                <th className="py-3.5 px-6 text-center w-32 font-semibold text-white text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No roles found</td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={(row._id || row.id)} className="hover:bg-[#F4F8FD] transition-colors text-sm text-gray-600">
                    <td className="py-4 px-6 text-center font-medium text-gray-500">{(page - 1) * limit + index + 1}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{row.name}</td>
                    <td className="py-4 px-6 text-gray-600">{row.email || '—'}</td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{row.phoneNumber || '—'}</td>
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#225091] border border-blue-100">
                        {row.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{row.permissions?.length || 0}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link 
                          to={`/roles-permissions/view/${(row._id || row.id)}`} 
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/roles-permissions/edit/${(row._id || row.id)}`} 
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => setDeleteRoleData(row)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>

        {filteredData.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={limit}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteRoleData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
                <Trash2 size={30} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Role</h3>
              <p className="text-gray-500 text-[15px] mb-8 px-2">
                Are you sure you want to delete the role <strong className="text-gray-700">{deleteRoleData.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteRoleData(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-[15px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm text-[15px]"
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

export default RolesAndPermissions;
