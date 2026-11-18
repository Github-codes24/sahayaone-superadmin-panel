import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X, ChevronDown, Camera, Calendar, Phone, Mail, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';

const mockEmployees = [];

const MultiSelectDropdown = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOption = (option) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="relative mb-4">
      <div 
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white flex justify-between items-center cursor-pointer shadow-sm text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedValues.length ? "text-gray-800 font-medium" : "text-gray-500"}>
          {selectedValues.length ? `${label} (${selectedValues.length})` : label}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091]"
                checked={selectedValues.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  


  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const filteredData = mockEmployees.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(row.type);
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(row.region);
    const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(row.branch);
    
    return matchesSearch && matchesType && matchesRegion && matchesBranch;
  });

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Perform delete action here
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };





  return (
    <div className="h-full flex flex-col gap-6 w-full">
      {/* Page Header */}
      <PageHeader
        title="Employees"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'HR Management' },
          { label: 'Employees' },
        ]}
      />

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-xs text-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm relative"
            >
              <SlidersHorizontal size={18} />
              {(selectedTypes.length > 0 || selectedRegions.length > 0 || selectedBranches.length > 0 || selectedDate !== '') && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#225091] rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white">
                  {selectedTypes.length + selectedRegions.length + selectedBranches.length + (selectedDate ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-[320px] bg-[#f4f3fb] rounded-2xl shadow-2xl flex flex-col border border-gray-200">
                <div className="flex justify-between items-center p-5 pb-3">
                  <h2 className="text-xl font-bold text-[#1b2559]">Filter</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-5 pt-2 space-y-2">
                  <MultiSelectDropdown 
                    label="Employee Type" 
                    options={['Loan Executive', 'Tele-caller', 'Credit Analyst', 'Field Verification Officer', 'Operations Executive', 'Disbursal Officer', 'Collection Agent', 'Customer Support Executive']} 
                    selectedValues={selectedTypes} 
                    onChange={setSelectedTypes} 
                  />
                  <MultiSelectDropdown 
                    label="Region" 
                    options={['Eastern Region', 'Western Region', 'Northern Region', 'Southern Region']} 
                    selectedValues={selectedRegions} 
                    onChange={setSelectedRegions} 
                  />
                  <MultiSelectDropdown 
                    label="Branch" 
                    options={['Mumbai Branch', 'Nagpur Branch', 'Kolkata Branch', 'Delhi Branch']} 
                    selectedValues={selectedBranches} 
                    onChange={setSelectedBranches} 
                  />
                  <div className="relative mb-4">
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-sm text-gray-500"
                    />
                  </div>
                </div>
                
                <div className="p-5 pt-2 flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedTypes([]);
                      setSelectedRegions([]);
                      setSelectedBranches([]);
                      setSelectedDate('');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full border-2 border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors bg-white text-sm"
                  >
                    Reset Filter
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#193e73] transition-colors shadow-sm text-sm"
                  >
                    Set Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link 
          to="/employees/create"
          className="bg-[#225091] hover:bg-[#193e73] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm shadow-sm"
        >
          + Create Employee
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs flex-1 overflow-hidden flex flex-col min-h-0">
        <TableWrapper>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 text-center w-20 border-r border-white/20">Sr.No.</th>
                <th className="py-4 px-6 border-r border-white/20">Employee Name</th>
                <th className="py-4 px-6 border-r border-white/20">Employee Type</th>
                <th className="py-4 px-6 border-r border-white/20">Region</th>
                <th className="py-4 px-6 border-r border-white/20">Branch</th>
                <th className="py-4 px-6 border-r border-white/20">Email</th>
                <th className="py-4 px-6 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 text-sm font-medium">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredData.map((employee, idx) => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-[#F4F8FD] transition-colors text-sm text-gray-600">
                    <td className="py-4 px-6 text-center">{idx + 1}</td>
                    <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${employee.hasImage ? '' : 'bg-[#f4f2ff] text-gray-800 font-bold text-[13px]'}`}>
                        {employee.hasImage ? (
                          <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                        ) : (
                          employee.initials
                        )}
                      </div>
                      <span className="font-semibold text-gray-800">{employee.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-[150px] leading-tight truncate">
                        {employee.type}
                      </div>
                    </td>
                    <td className="py-4 px-6">{employee.region}</td>
                    <td className="py-4 px-6">{employee.branch}</td>
                    <td className="py-4 px-6">{employee.email}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to="/employees/view"
                          state={employee}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-[#225091] hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to="/employees/edit"
                          state={employee}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-[#225091] hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link 
                          to="/letters-payroll"
                          state={{
                            employeeId: employee.id || employee._id,
                            employeeModel: 'Admin',
                            letterType: 'Offer Letter'
                          }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-[#225091] hover:bg-blue-50 transition-colors"
                          title="Generate Letter"
                        >
                          <FileText size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(employee)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 shrink-0">
        <div>Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of 30 Entries</div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#225091] text-white border border-[#225091] shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm">
            <ChevronRight size={16} />
          </button>
        </div>
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
              Are you sure you want to delete?<br />
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





    </div>
  );
};

export default Employees;
