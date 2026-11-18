import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Edit, Save, X, Clock, AlertCircle } from 'lucide-react';
import { settingsService } from '../../api/settingsService';
import PageHeader from '../../components/common/PageHeader';

const SupportSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

  const [contacts, setContacts] = useState({
    customerSupportNumber: '',
    customerSupportNumberTimeFrom: '',
    customerSupportNumberTimeTo: '',
    bankSupportNumber: '',
    bankSupportNumberTimeFrom: '',
    bankSupportNumberTimeTo: '',
    customerSupportEmail: '',
    customerSupportEmailTimeFrom: '',
    customerSupportEmailTimeTo: '',
    bankSupportEmail: '',
    bankSupportEmailTimeFrom: '',
    bankSupportEmailTimeTo: '',
  });
  
  const [editValues, setEditValues] = useState({ ...contacts });

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getSupportSettings();
      if (res.success && res.data) {
        setContacts(res.data);
        setEditValues(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load support settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEditClick = () => {
    setEditValues({ ...contacts });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      const res = await settingsService.updateSupportSettings(editValues);
      if (res.success && res.data) {
        setContacts(res.data);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save support settings');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border transition-all text-[14px] outline-none ${
    isEditing 
      ? 'border-gray-300 bg-white focus:border-[#225091] text-gray-800 shadow-sm' 
      : 'border-gray-200 bg-gray-50 text-gray-600'
  }`;

  const renderField = (label, name, isTime = false) => (
    <div className={isTime ? "col-span-12 md:col-span-3" : "col-span-12 md:col-span-6"}>
      <label className="block text-[14px] font-medium text-gray-800 mb-2">{label}</label>
      <div className="relative">
        <input
          type={isTime ? "time" : "text"}
          name={name}
          value={isEditing ? editValues[name] : contacts[name]}
          onChange={handleChange}
          readOnly={!isEditing}
          className={`${inputClass} ${isTime && !isEditing ? 'pr-10' : ''}`}
        />
        {isTime && !isEditing && (
          <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Support Settings"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Settings' },
          { label: 'Support Settings' },
        ]}
      />

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center gap-3 shrink-0">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-4 border-[#225091] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="space-y-10">
          
          {/* Support Contact Number Section */}
          <div>
            <h2 className="text-[20px] font-bold text-[#333] mb-5">Support Contact Number</h2>
            <div className="grid grid-cols-12 gap-x-6 gap-y-6">
              {renderField("Contact Number For Customer", "customerSupportNumber")}
              {renderField("Contact Time (From)", "customerSupportNumberTimeFrom", true)}
              {renderField("Contact Time (To)", "customerSupportNumberTimeTo", true)}

              {renderField("Contact Number For Co-Operative Bank", "bankSupportNumber")}
              {renderField("Contact Time (From)", "bankSupportNumberTimeFrom", true)}
              {renderField("Contact Time (To)", "bankSupportNumberTimeTo", true)}
            </div>
          </div>

          {/* Support Email ID Section */}
          <div>
            <h2 className="text-[20px] font-bold text-[#333] mb-5">Support Email ID</h2>
            <div className="grid grid-cols-12 gap-x-6 gap-y-6">
              {renderField("Contact Email For Customer", "customerSupportEmail")}
              {renderField("Contact Time (From)", "customerSupportEmailTimeFrom", true)}
              {renderField("Contact Time (To)", "customerSupportEmailTimeTo", true)}

              {renderField("Contact Email For Co-Operative Bank", "bankSupportEmail")}
              {renderField("Contact Time (From)", "bankSupportEmailTimeFrom", true)}
              {renderField("Contact Time (To)", "bankSupportEmailTimeTo", true)}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancelClick}
                  disabled={saveLoading}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px] disabled:opacity-50"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  onClick={handleSaveClick}
                  disabled={saveLoading}
                  className="flex items-center justify-center gap-2 bg-[#225091] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px] min-w-[120px] disabled:opacity-70"
                >
                  {saveLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Save size={18} />
                  )}
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button 
                onClick={handleEditClick}
                disabled={loading}
                className="flex items-center gap-2 bg-[#225091] text-white px-8 py-2.5 rounded-full font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px] disabled:opacity-50"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportSettings;
