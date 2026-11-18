import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Calendar, Phone, Mail, Lock, Map, MapPin, Clock, Building2, CreditCard, Globe, Users, Banknote, ShieldAlert, Eye, EyeOff, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-start gap-4">
    <div className="text-[#225091] mt-1">
      <Icon size={20} strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-[#1b2559] font-bold text-[15px]">{value}</p>
    </div>
  </div>
);

const ViewEmployee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const employeeData = location.state || {
    name: 'Clark Kent',
    type: 'Loan Executive',
    initials: 'CK',
    hasImage: true,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    phone: '9876543210',
    email: 'example@mail.com',
    password: 'Pass@12345',
    region: 'Eastern Region',
    branch: 'Mumbai Branch',
    salary: 'Rs. 1,00,000/-',
    dutyHours: '10:00 to 19:00',
    bankName: 'State Bank Of India',
    accountNumber: '53697842882',
    ifsc: 'SBIN0001234',
    registeredOn: 'January 1, 2026',
    gender: 'Female',
    dob: '28/07/1996'
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <PageHeader
        title="Employee Details"
        showBack={true}
        backUrl="/employees"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Employees', to: '/employees' },
          { label: 'Employee Details' },
        ]}
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Banner */}
        <div className="p-6 flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
            {employeeData.hasImage ? (
              <img src={employeeData.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#f4f2ff] text-[#225091] flex items-center justify-center text-2xl font-bold">
                {employeeData.initials || 'EM'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-1.5">{employeeData.name}</h2>
            <span className="inline-block px-3 py-1 bg-[#225091] text-white text-[11px] font-medium rounded-full">
              {employeeData.type}
            </span>
          </div>

          <Link
            to="/letters-payroll"
            state={{
              employeeId: employeeData._id || employeeData.id,
              employeeModel: 'Admin',
              letterType: 'Offer Letter'
            }}
            className="ml-auto bg-[#225091] hover:bg-[#193e73] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FileText size={15} />
            <span>Generate Official Letter</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">General Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Users} label="Gender" value={employeeData.gender || 'Female'} />
            <DetailCard icon={Calendar} label="Date Of Birth" value={employeeData.dob || '28/07/1996'} />
            <DetailCard icon={Phone} label="Phone" value={employeeData.phone || '9876543210'} />
            <DetailCard icon={Mail} label="Email" value={employeeData.email || 'example@mail.com'} />
            <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="text-[#225091] mt-1 shrink-0">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 font-medium mb-1">Password</p>
                  <p className="text-[#1b2559] font-bold text-[15px] truncate font-mono">
                    {showPassword ? (employeeData.password || 'Pass@12345') : '••••••••'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-[#225091] p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors focus:outline-none cursor-pointer shrink-0"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>
        
        <hr className="border-gray-100 my-8" />

        {/* Employment Info */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Employment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Map} label="Region" value={employeeData.region || 'Eastern Region'} />
            <DetailCard icon={MapPin} label="Branch" value={employeeData.branch || 'Mumbai Branch'} />
            <DetailCard icon={Banknote} label="Salary" value={employeeData.salary || 'Rs. 1,00,000/-'} />
            <DetailCard icon={Clock} label="Duty Hours" value={employeeData.dutyHours || '10:00 to 19:00'} />
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Bank Details */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Building2} label="Bank Name" value={employeeData.bankName || 'State Bank Of India'} />
            <DetailCard icon={CreditCard} label="Account Number" value={employeeData.accountNumber || '53697842882'} />
            <DetailCard icon={Globe} label="IFSC" value={employeeData.ifsc || 'SBIN0001234'} />
            <DetailCard icon={MapPin} label="Branch" value={employeeData.branch || 'Mumbai Branch'} />
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Registration Info */}
        <div className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Calendar} label="Registered On" value={employeeData.registeredOn || 'January 1, 2026'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
