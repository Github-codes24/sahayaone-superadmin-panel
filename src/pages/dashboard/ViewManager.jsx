import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Calendar, Phone, Mail, Lock, Map, MapPin, Clock, Banknote, Users, Check, ArrowUpToLine, AlertCircle, ArrowLeftRight, Eye, EyeOff } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
    <div className="text-[#225091] flex-shrink-0">
      <Icon size={20} strokeWidth={2} />
    </div>
    <div>
      <p className="text-[13px] text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-[#1b2559] font-bold text-[14px]">{value}</p>
    </div>
  </div>
);

const ViewManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const managerData = location.state || {
    name: 'Clark Kent',
    type: 'Regional Manager',
    initials: 'CK',
    hasImage: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    phone: '9876543210',
    email: 'clarkkent@example.com',
    role: 'Regional Manager',
    status: 'ACTIVE',
    dateOfJoining: '01-01-2023',
    reportingManager: 'Bruce Wayne',
    allowedBranches: ['Branch A', 'Branch B', 'Branch C'],
    region: 'North Region',
    state: 'Maharashtra',
    city: 'Nagpur',
    address: '123, Central Avenue, Nagpur - 440001',
    permissions: [
      { name: 'View Customers', granted: true },
      { name: 'Create Customers', granted: true },
      { name: 'Edit Customers', granted: true },
      { name: 'Delete Customers', granted: false },
      { name: 'View Loans', granted: true },
      { name: 'Approve Loans', granted: true },
      { name: 'Reject Loans', granted: false },
      { name: 'Disburse Loans', granted: false },
      { name: 'View Reports', granted: true },
      { name: 'Export Reports', granted: true },
    ]
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Manager Details"
        showBack={true}
        backUrl="/managers"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'User Management' },
          { label: 'Managers', to: '/managers' },
          { label: 'Manager Details' },
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {/* Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-[72px] h-[72px] rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm shrink-0">
              {managerData.hasImage ? (
                <img src={managerData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#f4f2ff] text-[#225091] flex items-center justify-center text-2xl font-bold">
                  {managerData.initials || 'CK'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#1b2559] mb-1.5">{managerData.name}</h2>
              <span className="inline-block px-3.5 py-1 bg-[#225091] text-white text-[12px] font-semibold rounded-full">
                {managerData.type}
              </span>
            </div>
          </div>

          <div className="flex bg-[#f4f2ff] rounded-xl p-4 gap-8">
            <div>
              <p className="text-[13px] text-gray-500 font-medium mb-1">Shift</p>
              <p className="text-[14px] text-[#1b2559] font-bold">10:00-21:00</p>
            </div>
            <div>
              <p className="text-[13px] text-gray-500 font-medium mb-1">Weekly Off</p>
              <p className="text-[14px] text-[#1b2559] font-bold">Sat & Sun</p>
            </div>
            <div>
              <p className="text-[13px] text-gray-500 font-medium mb-1">Joined</p>
              <p className="text-[14px] text-[#1b2559] font-bold">01-01-2025</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Personal Details */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#333] mb-6">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Users} label="Gender" value={managerData.gender} />
            <DetailCard icon={Calendar} label="Date Of Birth" value={managerData.dob} />
            <DetailCard icon={Phone} label="Phone" value={managerData.phone} />
            <DetailCard icon={Mail} label="Email" value={managerData.email} />
            <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-[#225091] flex-shrink-0">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-gray-500 font-medium mb-0.5">Password</p>
                  <p className="text-[#1b2559] font-bold text-[14px] truncate font-mono">
                    {showPassword ? (managerData.password || '••••••••') : '••••••••'}
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
            <DetailCard icon={MapPin} label="Address" value={managerData.address} />
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Job Details */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#333] mb-6">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Map} label="Region" value={managerData.region} />
            <DetailCard icon={MapPin} label="Branch" value={managerData.branch} />
            <DetailCard icon={Banknote} label="Salary" value={managerData.salary} />
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Shift & Woff */}
        <div className="mb-10">
          <h2 className="text-[22px] font-bold text-[#333] mb-6">Shift & Woff</h2>
          
          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Shift</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Clock} label="In Time" value="10:00" />
              <DetailCard icon={Clock} label="Out Time" value="21:00" />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Weekly Off</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Calendar} label="Weekly Off Days" value="Saturday, Sunday" />
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Weekly Of Payable</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Variable Weekly Off</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Second weekly off</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Clock} label="Late Allowed (Mins)" value="15 (As Per Shift)" />
              <DetailCard icon={Clock} label="Early Allowed (Min)" value="15" />
              <DetailCard icon={Clock} label="Half Day (Min)" value="240" />
              <DetailCard icon={Clock} label="Full Day (Min)" value="480 (As Per Shift)" />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* Attendance */}
        <div>
          <h2 className="text-[22px] font-bold text-[#333] mb-6">Attendance</h2>
          
          <div>
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Punch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={ArrowUpToLine} label="Shift Type" value="Double" />
              <DetailCard icon={AlertCircle} label="No Out- Punch Found - Action" value="Mark Half Day" />
              <DetailCard icon={Clock} label="Present On Wo / Holiday - Action" value="Mark as COFF" />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Late Cut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Calendar} label="Allowed Day" value="3" />
              <DetailCard icon={ArrowLeftRight} label="Action" value="Half Day" />
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Late Cut Allowed</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Extra Late Cut Deduction</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Additional Late Cut In Leave Balance</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Lunch & Early Going</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Clock} label="Lunch Allowed (Mins)" value="15 (As Per Shift)" />
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Lunch Allowed</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Early Going Allowed</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Overtime</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Overtime Allowed</p>
              </div>
              <div className="hidden md:block"></div>
              
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Custom OT</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Before OT</p>
              </div>
              
              <DetailCard icon={Clock} label="OT Grace Period (Mins)" value="5" />
              <DetailCard icon={Clock} label="1 day OT Hrs" value="4" />
              
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">OT As Per Shift</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Consider OT As COFF</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        {/* WOFF & HOFF */}
        <div>
          <h2 className="text-[22px] font-bold text-[#333] mb-6">WOFF & HOFF</h2>
          
          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Sandwich Absence Rules - Weekly Off</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent Before Weekly Off</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent After Weekly Off</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent Before Or After Weekly Off</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Add Working Hrs On Weekly Off Day</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Late Deduction Not Applied On WO If Present</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Sandwich Absence Rules - Holidays</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent Before Holiday</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent After Holiday</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent Before & After Holiday</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Add Working Hours On Holiday Day</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Late Deduction Not Applied On Holiday If Present</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] font-bold text-[#333] mb-4">Leave Between Holiday Or Weekly Off</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Consider "Weekly Off" In Leave Application</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Consider "Holiday" In Leave Application</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent - WO - Leave = WO Absent</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Leave - WO - Absent = WO Absent</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Absent - Holiday - Leave = Holiday Absent</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4">
                <div className="text-[#225091] flex-shrink-0"><Check size={20} strokeWidth={2.5} /></div>
                <p className="text-[#1b2559] font-bold text-[14px]">Leave - Holiday - Absent = Holiday Absent</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />
        
        {/* Registration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailCard icon={Calendar} label="Registered On" value="January 1, 2026" />
        </div>

      </div>
    </div>
  );
};

export default ViewManager;
