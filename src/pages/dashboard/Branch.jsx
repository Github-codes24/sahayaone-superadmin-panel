import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, SlidersHorizontal, ChevronDown, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';

const mockBranches = [];

const Branch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [filterRegion, setFilterRegion] = useState([]);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const toggleFilter = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Branch"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Branch Management' },
          { label: 'Branch' },
        ]}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors relative focus:outline-none"
            >
              <SlidersHorizontal size={18} />
              {filterRegion.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#225091] rounded-full border border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {filterRegion.length}
                </span>
              )}
            </button>
            
            {isFilterOpen && (
              <div className="absolute z-20 top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-[#f8f9fb] border border-gray-100 rounded-2xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-800 text-[16px]">Filter</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={22} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Region Dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setOpenFilterDropdown(openFilterDropdown === 'region' ? null : 'region')}
                    >
                      <span className="text-gray-500 text-[14px] font-medium">Region</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFilterDropdown === 'region' ? 'rotate-180' : ''}`} />
                    </div>
                    {openFilterDropdown === 'region' && (
                      <div className="absolute z-30 top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-3 flex flex-col gap-2">
                        {['Eastern Region', 'Western Region', 'Northern Region'].map(opt => (
                          <label 
                            key={opt} 
                            className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-[4px] border-2 border-gray-400 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer"
                                checked={filterRegion.includes(opt)}
                                onChange={() => toggleFilter(setFilterRegion, opt)}
                              />
                              {filterRegion.includes(opt) && (
                                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            <span className="text-[15px] font-medium text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors focus:outline-none text-sm bg-white"
                    onClick={() => setFilterRegion([])}
                  >
                    Reset Filter
                  </button>
                  <button 
                    className="flex-1 py-2.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#193e73] transition-colors focus:outline-none text-sm shadow-sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-sm flex-shrink-0"
        >
          + Create Branch
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <TableWrapper minHeight="360px">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20 text-center w-20">Sr.No.</th>
                <th className="px-6 py-3.5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Branch Name</th>
                <th className="px-6 py-3.5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Region Name</th>
                <th className="px-6 py-3.5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Branch Manager</th>
                <th className="px-6 py-3.5 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Total Employee</th>
                <th className="px-6 py-3.5 font-semibold text-white text-xs uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-[#F4F8FD] transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-medium text-center">{branch.srNo}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">{branch.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{branch.regionName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {branch.srNo === 1 ? (
                         <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                           <img src={branch.avatar} alt={branch.manager} className="w-full h-full object-cover" />
                         </div>
                      ) : (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium shrink-0 ${branch.managerBg}`}>
                            {branch.managerInitials}
                         </div>
                      )}
                      <span className="text-gray-700 font-medium">{branch.manager}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{branch.totalEmployee}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => { setSelectedBranch(branch); setIsEditModalOpen(true); }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors cursor-pointer" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedBranch(branch); setIsDeleteModalOpen(true); }}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="text-xs text-gray-500 font-medium">
            Showing 1 to 5 of 5 Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#225091] text-white font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Branch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50">
              <h2 className="text-[17px] font-bold text-[#1b2559]">Create Branch</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Branch Name</label>
                <input type="text" placeholder="Enter branch name" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Region</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-sm">
                    <option value="" disabled selected>Select</option>
                    <option value="eastern">Eastern Region</option>
                    <option value="western">Western Region</option>
                    <option value="northern">Northern Region</option>
                    <option value="southern">Southern Region</option>
                    <option value="central">Central Region</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 mt-4 pt-4">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full border border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors text-sm bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#193e73] transition-colors shadow-sm text-sm">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50">
              <h2 className="text-[17px] font-bold text-[#1b2559]">Edit Branch</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Branch Name</label>
                <input type="text" defaultValue={selectedBranch.name} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Region</label>
                <div className="relative">
                  <select defaultValue={selectedBranch.regionName} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-sm">
                    <option value="Eastern Region">Eastern Region</option>
                    <option value="Western Region">Western Region</option>
                    <option value="Northern Region">Northern Region</option>
                    <option value="Southern Region">Southern Region</option>
                    <option value="Central Region">Central Region</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 mt-4 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-full border border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors text-sm bg-white">
                  Cancel
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#193e73] transition-colors shadow-sm text-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Branch</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{selectedBranch.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedBranch(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedBranch(null); }}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branch;
