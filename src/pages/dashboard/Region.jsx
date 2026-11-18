import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegionModal from '../../components/modals/RegionModal';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';

const mockRegions = [];

const Region = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedRegion(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (region) => {
    setModalMode('edit');
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Region"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Branch Management' },
          { label: 'Region' },
        ]}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleCreateClick}
          className="bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-sm flex-shrink-0"
        >
          + Create Region
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <TableWrapper>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white font-semibold text-xs tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4 text-center border-r border-white/20 w-20">Sr.No.</th>
                <th className="px-6 py-4 border-r border-white/20">Region Name</th>
                <th className="px-6 py-4 border-r border-white/20">Region Manager</th>
                <th className="px-6 py-4 border-r border-white/20 text-center">Total Branch</th>
                <th className="px-6 py-4 border-r border-white/20 text-center">Total Employee</th>
                <th className="px-6 py-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockRegions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 text-sm font-medium">
                    No regions found. Click "+ Create Region" to add one.
                  </td>
                </tr>
              ) : (
                mockRegions.map((region) => (
                  <tr key={region.id} className="hover:bg-[#F4F8FD] transition-colors">
                    <td className="px-6 py-4 text-gray-700 text-center">{region.srNo}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{region.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {region.srNo === 1 ? (
                           <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                             <img src={region.avatar} alt={region.manager} className="w-full h-full object-cover" />
                           </div>
                        ) : (
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium shrink-0 ${region.managerBg}`}>
                              {region.managerInitials}
                           </div>
                        )}
                        <span className="text-gray-700 font-medium">{region.manager}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">{region.totalBranch}</td>
                    <td className="px-6 py-4 text-gray-700 text-center">{region.totalEmployee}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(region)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-[#225091] hover:bg-blue-50 transition-colors" 
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={16} />
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
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 font-medium">
            Showing 1 to {mockRegions.length || 0} of {mockRegions.length || 0} Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#225091] text-white font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <RegionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedRegion}
      />
    </div>
  );
};

export default Region;
