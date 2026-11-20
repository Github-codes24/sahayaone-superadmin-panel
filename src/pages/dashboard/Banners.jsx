import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, Edit, Trash2, X, Upload, Image as ImageIcon, AlertCircle, Plus } from 'lucide-react';
import { bannerService } from '../../api/bannerService';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || 'https://devapi.sahayaone.com/').replace(/\/api\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [editBannerData, setEditBannerData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bannerService.getBanners({ page, limit: 10, search: searchTerm });
      if (response.success) {
        setBanners(response.data);
        setMeta(response.meta);
      }
    } catch (err) {
      setError('Failed to load banners. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBanners();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchBanners]);

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    setDeleteLoading(true);
    try {
      await bannerService.deleteBanner(bannerToDelete._id);
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
      fetchBanners(); // refresh list
    } catch (err) {
      alert('Failed to delete banner: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (banner) => {
    setEditBannerData(banner);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-10">
      {/* Page Header */}
      <PageHeader
        title="Banner Management"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'App Management' },
          { label: 'Banner Management' },
        ]}
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Side: Search */}
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] sm:text-sm bg-white shadow-xs text-sm"
              placeholder="Search banner..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Right Side: Add Banner Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#225091] hover:bg-[#193e73] text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 text-sm shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Banner</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center gap-3">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-[#225091] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <TableWrapper minHeight="360px">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Sr.No.</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Portal Type</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Banner Type</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Status</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Preview</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No banners found. Click "+ Create Banner" to add one.
                  </td>
                </tr>
              )}
              {banners.map((banner, idx) => (
                <tr key={banner._id} className="hover:bg-[#F4F8FD] transition-colors">
                  <td className="py-5 px-6 text-sm text-gray-600 font-medium">{((page - 1) * 10) + idx + 1}</td>
                  <td className="py-5 px-6 text-sm text-gray-900 font-semibold">{banner.portalType ? banner.portalType.replace(/_/g, ' ') : ''}</td>
                  <td className="py-5 px-6 text-sm text-gray-600">{banner.bannerType}</td>
                  <td className="py-5 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${banner.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      {banner.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div 
                      onClick={() => { setSelectedBanner(banner); setIsPreviewModalOpen(true); }}
                      className="relative w-44 h-18 rounded-lg overflow-hidden shadow-xs group cursor-pointer border border-gray-200"
                    >
                      <img src={getImageUrl(banner.image || banner.imageUrl)} alt={banner.bannerType} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                         <span className="text-white text-xs font-semibold px-2 py-1 bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">Click to View</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      <button 
                        onClick={() => openEditModal(banner)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => { setBannerToDelete(banner); setIsDeleteModalOpen(true); }}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Banner"
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
        {meta && (
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages || 1}
            totalRecords={meta.totalRecords || banners.length}
            limit={meta.limit || 10}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create Banner Modal */}
      {isAddModalOpen && (
        <BannerModal 
          title="Create Banner" 
          submitText="Create" 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchBanners}
        />
      )}

      {/* Edit Banner Modal */}
      {editBannerData && (
        <BannerModal 
          title="Edit Banner" 
          submitText="Save Changes" 
          initialData={editBannerData}
          onClose={() => setEditBannerData(null)} 
          onSuccess={fetchBanners}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Banner</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this banner? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setBannerToDelete(null); }}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm flex justify-center items-center disabled:opacity-70"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Banner Modal */}
      {isPreviewModalOpen && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsPreviewModalOpen(false)}>
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <span className="font-semibold text-sm tracking-wider uppercase">Close Preview</span>
              <X size={24} />
            </button>
            <img 
              src={getImageUrl(selectedBanner.image || selectedBanner.imageUrl)} 
              alt={selectedBanner.bannerType} 
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-black/20" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Modal Component
const BannerModal = ({ title, submitText, onClose, onSuccess, initialData = null }) => {
  const [portalType, setPortalType] = useState(initialData ? initialData.portalType : '');
  const [bannerType, setBannerType] = useState(initialData ? initialData.bannerType : '');
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData ? getImageUrl(initialData.image || initialData.imageUrl) : null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!portalType || !bannerType) {
      setError("Portal Type and Banner Type are required.");
      return;
    }
    if (!initialData && !imageFile) {
      setError("Please select an image for the new banner.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('portalType', portalType);
    formData.append('bannerType', bannerType);
    formData.append('status', status);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (initialData) {
        await bannerService.updateBanner(initialData._id, formData);
      } else {
        await bannerService.createBanner(formData);
      }
      onSuccess(); // Refresh table
      onClose(); // Close modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save banner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200/50 bg-white">
          <h2 className="text-[17px] font-bold text-[#1b2559]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
            <X size={22} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">App Type *</label>
              <div className="relative">
                <select 
                  value={portalType}
                  onChange={(e) => setPortalType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-sm"
                >
                  <option value="" disabled>Select</option>
                  <option value="CUSTOMER_APP">Customer App</option>
                  <option value="EXECUTIVE_APP">Loan Executive App</option>
                  <option value="ONBOARDING_APP">Onboarding App</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Banner Type *</label>
              <div className="relative">
                <select 
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-sm"
                >
                  <option value="" disabled>Select</option>
                  <option value="Top Slider">Top Slider</option>
                  <option value="Middle Banner">Middle Banner</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
            <div className="relative">
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Upload Banner {initialData ? '(Optional)' : '*'}
            </label>
            <div className="relative w-full px-4 py-8 rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-[#225091] transition-colors flex flex-col items-center justify-center cursor-pointer shadow-sm overflow-hidden group">
              
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/jpg, image/webp"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              {imagePreview ? (
                 <>
                   <img src={imagePreview} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                   <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Upload size={24} className="mb-2" />
                      <span className="text-sm font-medium">Click to replace</span>
                   </div>
                 </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-50/40 text-[#225091] rounded-full flex items-center justify-center mb-3">
                    <Upload size={20} />
                  </div>
                  <span className="text-[13px] text-gray-600 font-medium mb-1">Click to upload image</span>
                  <span className="text-[11px] text-gray-400">JPEG, PNG, WEBP (Max 10MB)</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm bg-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#193e73] transition-colors shadow-sm text-sm min-w-[120px] flex justify-center items-center disabled:opacity-70"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Saving...' : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banners;
