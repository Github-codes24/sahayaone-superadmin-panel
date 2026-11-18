import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Settings, Lock, Shield, Camera, Edit, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { profileService } from '../../api/profileService';
import PageHeader from '../../components/common/PageHeader';
import { Skeleton } from '../../components/common/Skeleton';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Edit State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await profileService.getProfile();
      if (res.success) {
        const user = res.data.user;
        setProfile(user);
        setFormData({
          name: user.name || user.fullName || "",
          email: user.email || "",
          phone: user.phone || user.phoneNumber || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    // Reset file selection when opening modal
    setSelectedFile(null);
    setPreviewImage(null);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      
      if (selectedFile) {
        data.append('avatar', selectedFile);
      }

      const res = await profileService.updateProfile(data);
      if (res.success) {
        toast.success("Profile updated successfully");
        setIsEditModalOpen(false);
        fetchProfile(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New password and confirm password do not match");
    }
    
    setIsSaving(true);
    try {
      const res = await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      if (res.success) {
        toast.success(res.message || "Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="My Profile"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Profile' },
        ]}
      />

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#225091] via-[#2f75b8] to-[#453c9e] rounded-xl p-6 md:p-8 flex items-center justify-between text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 bg-white border-[3px] border-white/40 shadow-md text-[#225091] flex items-center justify-center text-3xl font-bold uppercase">
            {profile?.avatar || profile?.profileImage ? (
              <img src={profile.avatar || profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (profile?.name || profile?.fullName || "A").substring(0, 2)
            )}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">{profile?.name || profile?.fullName || "Admin"}</h2>
            <p className="text-white/90 text-sm mb-1">{profile?.email || "No email"}</p>
            <p className="text-white/90 text-sm">{profile?.phone || profile?.phoneNumber || "No phone"}</p>
          </div>
        </div>
        <div className="bg-white/90 text-gray-800 px-4 py-1.5 rounded-full flex items-center gap-2 relative z-10 shadow-sm">
          <Shield size={16} className="text-[#225091]" />
          <span className="text-sm font-bold text-[#225091]">{profile?.roleName || profile?.role || "Admin"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-[#f0f2ff] text-gray-800'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Settings size={18} />
          General
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'security'
              ? 'bg-[#f0f2ff] text-gray-800'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Lock size={18} />
          Security
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {isLoading ? (
          <div className="space-y-8" role="status" aria-busy="true">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-3.5 w-64 rounded-md" />
              </div>
            </div>
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'general' ? (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Personal Information</h3>
            <p className="text-gray-500 text-sm mb-8">Update Your Personal Details</p>

            <div className="relative w-24 h-24 mb-8">
              <div className="w-full h-full rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 p-0.5 text-[#225091] flex items-center justify-center text-3xl font-bold uppercase">
                {profile?.avatar || profile?.profileImage ? (
                  <img src={profile.avatar || profile.profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  (profile?.name || profile?.fullName || "A").substring(0, 2)
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Name</label>
                <input
                  type="text"
                  value={profile?.name || profile?.fullName || ""}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Phone</label>
                <input
                  type="text"
                  value={profile?.phone || profile?.phoneNumber || ""}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button 
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-[#225091] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#193e73] transition-colors shadow-sm"
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Change Password</h3>
            <p className="text-gray-500 text-sm mb-8">Ensure Your Account Stays Secure</p>

            <form onSubmit={handleChangePassword}>
              <div className="flex flex-col gap-6 mb-8 w-full">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="*********"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] transition-colors"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="*********"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] transition-colors"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="*********"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] transition-colors"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-[#225091] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#193e73] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Edit Personal Information</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm text-[#225091] text-2xl font-bold uppercase">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : profile?.avatar || profile?.profileImage ? (
                      <img src={profile.avatar || profile.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.name || profile?.fullName || "A").substring(0, 2)
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-[#225091] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#193e73] transition-colors shadow-sm cursor-pointer">
                    <Camera size={14} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent bg-white text-sm text-gray-700 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent bg-white text-sm text-gray-700 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Phone</label>
                <input 
                  type="tel"
                  maxLength={10}
                  pattern="\d{10}"
                  onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent bg-white text-sm text-gray-700 shadow-sm"
                />
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 bg-[#f4f3fb] border-t border-gray-100 flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="py-2 px-8 rounded-full border-2 border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors focus:outline-none text-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-full bg-[#225091] hover:bg-[#193e73] text-white font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
