import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Edit, Trash2, ChevronLeft, X, Camera, AlertCircle, Upload, Plus } from 'lucide-react';
import { categoryService } from '../../api/categoryService';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || 'https://devapi.sahayaone.com/').replace(/\/api\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories({ page, limit: 10, search: searchTerm });
      if (response.success) {
        setCategories(response.data);
        setMeta(response.meta);
      }
    } catch (err) {
      setError('Failed to load categories. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!deleteCategoryData) return;
    setDeleteLoading(true);
    try {
      await categoryService.deleteCategory(deleteCategoryData._id);
      setDeleteCategoryData(null);
      fetchCategories(); // refresh list
    } catch (err) {
      alert('Failed to delete category: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title="Product Categories"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Product Management' },
          { label: 'Product Categories' },
        ]}
      />

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-xs text-sm"
          />
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#225091] hover:bg-[#193e73] text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 text-sm shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center gap-3 shrink-0">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 flex-1 overflow-hidden flex flex-col min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#225091] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <TableWrapper>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-5 text-center w-16 font-semibold border-r border-white/20">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold border-r border-white/20">Product Category</th>
                <th className="py-3.5 px-5 font-semibold text-center border-r border-white/20">Total Brands</th>
                <th className="py-3.5 px-5 font-semibold text-center border-r border-white/20">Total Models</th>
                <th className="py-3.5 px-5 font-semibold text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-sm font-medium">
                    No categories found. Click "+ Create Category" to add one.
                  </td>
                </tr>
              )}
              {categories.map((row, index) => (
                <tr key={row._id} className="hover:bg-[#F4F8FD] transition-colors">
                  <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium text-center">{((page - 1) * 10) + index + 1}</td>
                  <td className="py-3.5 px-5 font-medium text-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1 shrink-0 shadow-2xs">
                      {row.image ? (
                        <img src={getImageUrl(row.image)} alt={row.name} className="w-full h-full object-contain rounded-sm" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{row.name}</span>
                  </td>
                  <td className="py-3.5 px-5 text-xs font-semibold text-[#225091] text-center">{row.totalBrands || 0}</td>
                  <td className="py-3.5 px-5 text-xs font-semibold text-gray-700 text-center">{row.totalModels || 0}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => setEditCategoryData(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-xs"
                        title="Edit"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button 
                        onClick={() => setDeleteCategoryData(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-xs"
                        title="Delete"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </div>

      {/* Pagination */}
      <Pagination
        meta={meta}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CategoryModal 
          title="Create Category" 
          submitText="Create"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchCategories}
        />
      )}

      {/* Edit Modal */}
      {editCategoryData && (
        <CategoryModal 
          title="Edit Category" 
          submitText="Save Changes"
          initialData={editCategoryData}
          onClose={() => setEditCategoryData(null)}
          onSuccess={fetchCategories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCategoryData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
                <Trash2 size={30} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Category</h3>
              <p className="text-gray-500 text-[15px] mb-8 px-2">
                Are you sure you want to delete <strong className="text-gray-700">{deleteCategoryData.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteCategoryData(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-[15px] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm text-[15px] flex justify-center items-center disabled:opacity-70"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Modal Component
const CategoryModal = ({ title, submitText, onClose, onSuccess, initialData = null }) => {
  const [categoryName, setCategoryName] = useState(initialData ? initialData.name : '');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData ? getImageUrl(initialData.image) : null);
  
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
    if (!categoryName) {
      setError("Category Name is required.");
      return;
    }
    if (!initialData && !imageFile) {
      setError("Please select a category image.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', categoryName);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (initialData) {
        await categoryService.updateCategory(initialData._id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#f4f6fb] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-2 border-[#225091] p-1 bg-white overflow-hidden shadow-sm flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Category preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 rounded-full flex flex-col items-center justify-center text-[#225091]">
                    <Upload size={24} />
                  </div>
                )}
              </div>
              <input 
                type="file"
                id="categoryImageInput"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label 
                htmlFor="categoryImageInput"
                className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-[#225091] text-white p-2.5 rounded-full border-2 border-white hover:bg-[#193e73] transition-colors shadow-md cursor-pointer"
              >
                <Camera size={18} />
              </label>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-800 mb-2">Category Name *</label>
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm"
            />
          </div>

          <div className="flex justify-end items-center gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-full border border-[#225091] text-[#225091] bg-white hover:bg-blue-50/50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#225091] hover:bg-[#193e73] text-white font-medium transition-colors min-w-[120px] flex justify-center items-center disabled:opacity-70"
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

export default ProductCategories;
