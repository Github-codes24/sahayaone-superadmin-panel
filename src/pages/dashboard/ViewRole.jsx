import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';
import { subAdminService } from '../../api/subAdminService';
import PageHeader from '../../components/common/PageHeader';

const ViewRole = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [subAdminName, setSubAdminName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password] = useState('********'); // Read-only

  const [systemPermissions, setSystemPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const permsRes = await subAdminService.getPermissions();
        if (permsRes.success) {
          setSystemPermissions(permsRes.data);
        }

        if (id) {
          const detailsRes = await subAdminService.getSubAdminDetails(id);
          if (detailsRes.success) {
            const data = detailsRes.data;
            setSubAdminName(data.name || '');
            setPhone(data.phoneNumber || '');
            setEmail(data.email || '');
            if (data.permissions) {
              setSelectedPermissions(data.permissions);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500 font-medium">Loading details...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="View Sub-Admin"
        showBack={true}
        backUrl="/roles-permissions"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Roles & Permissions', to: '/roles-permissions' },
          { label: 'View Sub-Admin' },
        ]}
      />

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-8 flex flex-col">
        {/* Form Section: Roles */}
        <div className="mb-8">
          <h2 className="text-[20px] font-bold text-[#172B4D] font-heading mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Sub-Admin Name</label>
            <input
              type="text"
              value={subAdminName}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="text"
              value={phone}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="flex-1">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Assigned Permissions</h2>
        
        <div className="space-y-6">
          {systemPermissions.map((group, groupIdx) => (
            <div key={groupIdx} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">{group.category}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.permissions?.map((perm, permIdx) => (
                  <label key={permIdx} className="flex items-center gap-2.5 cursor-default select-none">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      selectedPermissions.includes(perm.key)
                        ? 'bg-[#225091] border-[#225091] text-white'
                        : 'bg-gray-100 border-gray-300'
                    }`}>
                      <svg
                        className={`w-3 h-3 text-white fill-current ${selectedPermissions.includes(perm.key) ? 'block' : 'hidden'}`}
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-gray-100">
        <button
          onClick={() => navigate('/roles-permissions')}
          className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors text-sm shadow-xs cursor-pointer"
        >
          Back to Roles
        </button>
      </div>
    </div>
  </div>
  );
};

export default ViewRole;
