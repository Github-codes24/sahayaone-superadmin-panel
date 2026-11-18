import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, ArrowLeft, ChevronDown, X } from 'lucide-react';
import { subAdminService } from '../../api/subAdminService';
import PageHeader from '../../components/common/PageHeader';

import { toast } from 'react-toastify';

const CreateRole = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subAdminName, setSubAdminName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [systemPermissions, setSystemPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchSystemPermissions = async () => {
      try {
        const response = await subAdminService.getPermissions();
        if (response.success) {
          setSystemPermissions(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch system permissions', error);
      }
    };
    fetchSystemPermissions();
  }, []);

  const getPermKey = (perm) => {
    if (!perm) return '';
    return typeof perm === 'string' ? perm : (perm.key || perm.value || '');
  };

  const isPermDisabled = (modGroup, perm) => {
    if (!modGroup || !perm) return false;
    const permKey = getPermKey(perm);
    const permObj = (modGroup.permissions || []).find(p => getPermKey(p) === permKey) || perm;
    const isView = (permObj.label || '').toLowerCase().includes('view');
    if (isView) return false;

    const viewPerm = (modGroup.permissions || []).find(p => (p.label || '').toLowerCase().includes('view'));
    if (viewPerm && !selectedPermissions.includes(getPermKey(viewPerm))) {
      return true;
    }
    return false;
  };

  const togglePermission = (modGroup, perm) => {
    const permKey = getPermKey(perm);
    if (!permKey) return;
    const permObj = (modGroup.permissions || []).find(p => getPermKey(p) === permKey) || perm;
    const isView = (permObj.label || '').toLowerCase().includes('view');

    setSelectedPermissions((prev) => {
      const exists = prev.includes(permKey);
      if (exists) {
        if (isView) {
          const modKeys = (modGroup.permissions || []).map(p => getPermKey(p));
          return prev.filter(k => !modKeys.includes(k));
        } else {
          return prev.filter(k => k !== permKey);
        }
      } else {
        return [...prev, permKey];
      }
    });
  };

  const handleCheckboxChange = (permKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((key) => key !== permKey)
        : [...prev, permKey]
    );
  };

  const handleSelectAll = (category) => {
    const group = systemPermissions.find((g) => (g.category || g.module) === category);
    if (!group) return;
    const groupKeys = (group.permissions || []).map((p) => getPermKey(p));
    const allSelected = groupKeys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !groupKeys.includes(k)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...groupKeys])]);
    }
  };

  const isGroupAllSelected = (category) => {
    const group = systemPermissions.find((g) => (g.category || g.module) === category);
    if (!group) return false;
    const groupKeys = (group.permissions || []).map((p) => getPermKey(p));
    return groupKeys.length > 0 && groupKeys.every((k) => selectedPermissions.includes(k));
  };

  const isGroupIndeterminate = (category) => {
    const group = systemPermissions.find((g) => (g.category || g.module) === category);
    if (!group) return false;
    const groupKeys = (group.permissions || []).map((p) => getPermKey(p));
    const selectedCount = groupKeys.filter((k) => selectedPermissions.includes(k)).length;
    return selectedCount > 0 && selectedCount < groupKeys.length;
  };

  const handleCreate = async () => {
    if (!subAdminName.trim()) {
      toast.error('Sub-Admin Name is required.');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required.');
      return;
    }
    if (!password) {
      toast.error('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: subAdminName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        password,
        permissions: selectedPermissions,
        role: 'SUB_ADMIN'
      };
      const response = await subAdminService.createSubAdmin(data);
      if (response.success) {
        toast.success(response.message || 'Sub-Admin created successfully!');
        navigate('/roles-permissions');
      } else {
        toast.error(response.message || 'Failed to create sub-admin');
      }
    } catch (error) {
      console.error('Failed to create sub-admin', error);
      toast.error(error.response?.data?.message || 'Failed to create sub-admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Create Sub-Admin"
        showBack={true}
        backUrl="/roles-permissions"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Roles & Permissions', to: '/roles-permissions' },
          { label: 'Create Sub-Admin' },
        ]}
      />

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-8 flex flex-col">
        {/* Form Section: Roles */}
        <div className="mb-8">
          <h2 className="text-[20px] font-bold text-[#172B4D] font-heading mb-4">Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub-Admin Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={subAdminName}
              onChange={(e) => setSubAdminName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              type="tel"
              maxLength={10}
              pattern="\d{10}"
              onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Set password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section: Permissions */}
      <div className="flex-1 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {systemPermissions.map((modGroup, idx) => {
            const moduleName = modGroup.module || modGroup.category || '';
            const displayPerms = moduleName.toLowerCase() === 'dashboard'
              ? (modGroup.permissions || []).filter(p => (p.label || '').toLowerCase().includes('view'))
              : (modGroup.permissions || []);

            return (
              <div key={idx} className="bg-[#f8f9fc] rounded-xl p-5 border border-indigo-50/50">
                <h3 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200/60">{moduleName}</h3>
                <div className="space-y-3">
                  {displayPerms.map((perm, pIdx) => {
                    const permKey = getPermKey(perm);
                    const disabled = isPermDisabled(modGroup, perm);
                    return (
                      <label key={pIdx} className={`flex items-center gap-3 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className={`peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-md checked:bg-[#225091] checked:border-[#225091] transition-colors ${disabled ? 'cursor-not-allowed bg-gray-200' : 'cursor-pointer'}`}
                            checked={selectedPermissions.includes(permKey)}
                            onChange={() => {
                              if (!disabled) togglePermission(modGroup, perm);
                            }}
                            disabled={disabled}
                          />
                          <svg
                            className="absolute inset-0 w-5 h-5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className={`text-sm text-gray-700 ${!disabled && 'group-hover:text-gray-900'}`}>{perm.label || perm.name || permKey}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
        <button
          onClick={() => navigate('/roles-permissions')}
          className="px-6 py-2.5 rounded-full border border-[#225091] text-[#225091] hover:bg-blue-50/50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-full bg-[#225091] hover:bg-[#193e73] text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm text-sm"
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </div>
  </div>
  );
};

export default CreateRole;
