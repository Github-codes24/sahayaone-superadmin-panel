import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Camera, Calendar, ChevronDown, Clock, Eye, EyeOff } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [employeeType, setEmployeeType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <PageHeader
        title="Create Employee"
        showBack={true}
        backUrl="/employees"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Employees', to: '/employees' },
          { label: 'Create Employee' },
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* General Info */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6">General Info</h2>
          
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden flex items-center justify-center p-1">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button className="absolute bottom-0 right-1 bg-[#225091] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                <Camera size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
              <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                  <option value="" disabled selected>Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Date Of Birth</label>
              <div className="relative">
                <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
              <input 
                type="tel" 
                maxLength={10}
                pattern="\d{10}"
                onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
                placeholder="Enter phone Number" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <input type="email" placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create Password" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Info */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Employment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Employee Type</label>
              <div className="relative">
                <select 
                  value={employeeType}
                  onChange={(e) => setEmployeeType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm"
                >
                  <option value="" disabled selected>Select</option>
                  <option value="Loan Executive">Loan Executive</option>
                  <option value="Tele-caller">Tele-caller</option>
                  <option value="Credit Analyst">Credit Analyst</option>
                  <option value="Field Verification Officer">Field Verification Officer</option>
                  <option value="Operations Executive">Operations Executive</option>
                  <option value="Disbursal Officer">Disbursal Officer</option>
                  <option value="Collection Agent">Collection Agent</option>
                  <option value="Customer Support Executive">Customer Support Executive</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Region</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                  <option value="" disabled selected>Select</option>
                  <option value="Eastern Region">Eastern Region</option>
                  <option value="Western Region">Western Region</option>
                  <option value="Northern Region">Northern Region</option>
                  <option value="Southern Region">Southern Region</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Branch</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                  <option value="" disabled selected>Select</option>
                  <option value="Mumbai Branch">Mumbai Branch</option>
                  <option value="Nagpur Branch">Nagpur Branch</option>
                  <option value="Kolkata Branch">Kolkata Branch</option>
                  <option value="Delhi Branch">Delhi Branch</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Salary</label>
              <input type="number" placeholder="Rs." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Check In Time</label>
              <div className="relative">
                <input type="text" placeholder="HH:MM" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
                <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Check Out Time</label>
              <div className="relative">
                <input type="text" placeholder="HH:MM" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
                <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Bank Name</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                  <option value="" disabled selected>Select</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Account Number</label>
              <input type="text" placeholder="Enter account number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">IFSC</label>
              <input type="text" placeholder="Enter IFSC" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Branch</label>
              <input type="text" placeholder="Enter Branch" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center gap-4 pt-6 mt-4">
          <Link
            to="/employees"
            className="px-8 py-2.5 rounded-full border-2 border-[#225091] text-[#225091] bg-white hover:bg-blue-50/50 font-semibold transition-colors"
          >
            Cancel
          </Link>
          <Link
            to="/employees"
            className="px-8 py-2.5 rounded-full bg-[#225091] hover:bg-[#193e73] text-white font-semibold transition-colors shadow-sm"
          >
            Create
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployee;
