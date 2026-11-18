import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronDown,
  Download,
  Plus,
  RotateCcw,
  FileText,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import TableWrapper from "../../components/common/TableWrapper";
import Pagination from "../../components/common/Pagination";
import { SkeletonTableRow } from "../../components/common/Skeleton";
import { onboardingTeamService } from "../../api/onboardingTeamService";

const InlineMultiSelect = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
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
            ? "border-[#225091] bg-blue-50/70 text-[#225091]"
            : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
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
            className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
              const checked = selectedValues.includes(option);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleOption(option);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs select-none text-left ${
                    checked ? "bg-blue-50/70 text-[#225091] font-medium" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#225091] focus:ring-[#225091] pointer-events-none"
                    checked={checked}
                    readOnly
                  />
                  <span className="truncate flex-1">{option}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const OnboardingTeam = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [onboardingTeamToDelete, setOnboardingTeamToDelete] = useState(null);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setSelectedRegions([]);
    setSelectedBranches([]);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedTypes.length > 0 ||
    selectedRegions.length > 0 ||
    selectedBranches.length > 0;

  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filterOptions, setFilterOptions] = useState({
    onboardingTeamTypes: [],
    regions: [],
    branches: [],
  });

  const fetchFilters = React.useCallback(async () => {
    try {
      const response = await onboardingTeamService.getFilterOptions();
      if (response && response.success && response.data) {
        setFilterOptions({
          onboardingTeamTypes: response.data.onboardingTeamTypes || [],
          regions: response.data.regions || [],
          branches: response.data.branches || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch filters", error);
    }
  }, []);

  const fetchTeams = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
      };
      
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedTypes.length > 0) params.onboardingTeamType = selectedTypes.join(",");
      if (selectedRegions.length > 0) params.region = selectedRegions.join(",");
      if (selectedBranches.length > 0) params.branch = selectedBranches.join(",");

      const response = await onboardingTeamService.getOnboardingTeams(params);
      if (response && response.success && response.data) {
        setTeams(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalRecords(response.meta?.totalRecords || 0);
      }
    } catch (error) {
      console.error("Failed to fetch teams", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    limit,
    searchTerm,
    selectedTypes,
    selectedRegions,
    selectedBranches,
  ]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeams();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchTeams]);

  const filteredData = teams;

  const handleExport = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedTypes.length > 0) params.onboardingTeamType = selectedTypes.join(",");
      if (selectedRegions.length > 0) params.region = selectedRegions.join(",");
      if (selectedBranches.length > 0) params.branch = selectedBranches.join(",");

      const blob = await onboardingTeamService.export(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'onboarding_teams.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export data", error);
    }
  };

  const handleDeleteClick = (onboardingTeam) => {
    setOnboardingTeamToDelete(onboardingTeam);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!onboardingTeamToDelete) return;
    setIsDeleting(true);
    try {
      const response = await onboardingTeamService.deleteOnboardingTeam(
        onboardingTeamToDelete.id,
      );
      if (response.success) {
        setIsDeleteModalOpen(false);
        setOnboardingTeamToDelete(null);
        fetchTeams();
      }
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title="Employee Onboarding"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'User Management' },
          { label: 'Employee Onboarding' },
        ]}
      />

      {/* Filter & Action Toolbar (Filters are OUTSIDE) */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-3 shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Left: Search & Outside Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
              <input
                type="text"
                placeholder="Search staff, email, phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Outside Filter 1: Team Type */}
            <InlineMultiSelect
              label="Team Type"
              options={filterOptions.onboardingTeamTypes.map((o) => o.label || o)}
              selectedValues={selectedTypes}
              onChange={(vals) => {
                setSelectedTypes(vals);
                setPage(1);
              }}
            />

            {/* Outside Filter 2: Region */}
            <InlineMultiSelect
              label="Region"
              options={filterOptions.regions.map((o) => o.label || o)}
              selectedValues={selectedRegions}
              onChange={(vals) => {
                setSelectedRegions(vals);
                setPage(1);
              }}
            />

            {/* Outside Filter 3: Branch */}
            <InlineMultiSelect
              label="Branch"
              options={filterOptions.branches.map((o) => o.label || o)}
              selectedValues={selectedBranches}
              onChange={(vals) => {
                setSelectedBranches(vals);
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

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0 justify-end">
            <button
              onClick={handleExport}
              className="bg-white border border-[#225091] text-[#225091] hover:bg-[#225091]/10 px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 text-xs shadow-xs cursor-pointer"
            >
              <Download size={15} />
              Export
            </button>
            <Link
              to="/onboarding-team/create"
              className="bg-[#225091] hover:bg-[#193e73] text-white px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-1.5 text-xs shadow-xs shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              + Create Employee Onboarding
            </Link>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 font-medium mr-1 text-[11px]">Filtered by:</span>
            {selectedTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#225091] font-semibold border border-blue-200 text-xs shadow-2xs"
              >
                Type: {type}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTypes(selectedTypes.filter((t) => t !== type));
                    setPage(1);
                  }}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {selectedRegions.map((region) => (
              <span
                key={region}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-xs shadow-2xs"
              >
                Region: {region}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegions(selectedRegions.filter((r) => r !== region));
                    setPage(1);
                  }}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {selectedBranches.map((branch) => (
              <span
                key={branch}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 font-semibold border border-purple-200 text-xs shadow-2xs"
              >
                Branch: {branch}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBranches(selectedBranches.filter((b) => b !== branch));
                    setPage(1);
                  }}
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
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col min-h-0">
        <TableWrapper minHeight="360px">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-5 text-center w-16 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">OnboardingTeam Name</th>
                <th className="py-3.5 px-5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">OnboardingTeam Type</th>
                <th className="py-3.5 px-5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Region</th>
                <th className="py-3.5 px-5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Branch</th>
                <th className="py-3.5 px-5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Email</th>
                <th className="py-3.5 px-5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Onboard by</th>
                <th className="py-3.5 px-5 text-center w-36 font-semibold text-white text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} cols={8} />
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredData.map((onboardingTeam, idx) => (
                  <tr
                    key={(onboardingTeam._id || onboardingTeam.id)}
                    className="hover:bg-[#F4F8FD] transition-colors"
                  >
                    <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium text-center">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-xs ${onboardingTeam.profileImage ? "" : "bg-blue-50 border border-blue-100 text-[#225091] font-bold text-xs"}`}
                        >
                          {onboardingTeam.profileImage ? (
                            <img
                              src={onboardingTeam.profileImage}
                              alt={onboardingTeam.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            onboardingTeam.fullName?.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {onboardingTeam.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-700 font-medium">
                      <div className="max-w-[120px] leading-tight">
                        {onboardingTeam.onboardingTeamType}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{onboardingTeam.region}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{onboardingTeam.branch}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-500">{onboardingTeam.email}</td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">{onboardingTeam.onboardedBy?.name || onboardingTeam.onboardBy || '—'}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/onboarding-team/view/${(onboardingTeam._id || onboardingTeam.id)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-xs"
                          title="View"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <Link
                          to={`/onboarding-team/edit/${(onboardingTeam._id || onboardingTeam.id)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs"
                          title="Edit"
                        >
                          <Edit size={13} /> Edit
                        </Link>
                        <Link
                          to="/letters-payroll"
                          state={{
                            employeeId: onboardingTeam._id || onboardingTeam.id,
                            employeeModel: 'OnboardingTeam',
                            letterType: 'Offer Letter'
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all shadow-xs"
                          title="Issue Letter"
                        >
                          <FileText size={13} /> Letter
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(onboardingTeam)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs"
                          title="Delete"
                        >
                          <Trash2 size={13} />
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
            onLimitChange={setLimit}
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
              Are you sure you want to delete?
              <br />
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
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-[#ff3d67] hover:bg-[#e02e55] text-white font-semibold rounded-full shadow-md transition-colors focus:outline-none disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingTeam;
