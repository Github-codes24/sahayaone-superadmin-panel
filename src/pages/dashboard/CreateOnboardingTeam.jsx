import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Camera, Calendar, ChevronDown, Clock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { onboardingTeamService } from '../../api/onboardingTeamService';
import PageHeader from '../../components/common/PageHeader';
import {
  validatePassword,
  validatePhone,
  validateEmail,
  validatePositiveNumber,
  sanitizeDigits,
  preventInvalidNumberKeys
} from '../../utils/validation';

const CreateOnboardingTeam = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop");
  const [profileFile, setProfileFile] = useState(null);

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    onboardingTeamTypes: [],
    regions: [],
    branches: []
  });

  // Form Fields State
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    password: '',
    address: '',

    // Job Details
    onboardingTeamType: '',
    salary: '',

    // Shift & WOFF
    punchInTime: '09:30',
    punchOutTime: '18:30',
    weeklyOffDay: 'sunday',
    weeklyOffPayable: true,
    variableWeeklyOff: false,
    secondWeeklyOff: false,
    lateAllowedMins: '15',
    lateAllowedAsPerShift: true,
    earlyAllowedMins: '15',
    earlyAllowedAsPerShift: false,
    halfDayMins: '240',
    halfDayAsPerShift: false,
    fullDayMins: '480',
    fullDayAsPerShift: true,

    // Attendance
    punchType: 'double',
    noOutPunchAction: 'mark_half_day',
    presentOnWeeklyOffHolidayAction: 'pay_extra',
    lunchAllowedMins: '0',
    lunchAsPerShift: true,
    lunchAllowed: false,
    earlyGoingAllowed: false,
    lateCutAllowedDays: '3',
    lateCutAction: 'deduct',
    lateCutAllowed: false,
    extraLateCutDeduction: false,
    additionalLateCutInLeaveBalance: false,
    overtimeAllowed: false,
    customOT: false,
    beforeOT: false,
    otGracePeriodMins: '5',
    oneDayOTHrs: '4',
    otAsPerShift: false,
    considerOTAsCOFF: false,

    // WOFF & HOFF
    absentBeforeWO: true,
    absentAfterWO: true,
    absentBeforeOrAfterWO: false,
    addWorkingHrsOnWO: false,
    lateDeductionNotAppliedWO: false,
    absentBeforeHoliday: false,
    absentAfterHoliday: false,
    absentBeforeAfterHoliday: false,
    addWorkingHoursOnHoliday: false,
    lateDeductionNotAppliedHoliday: false,
    considerWOInLeave: true,
    considerHolidayInLeave: true,
    absentWOLeaveWOAbsent: true,
    leaveWOAbsentWOAbsent: false,
    absentHolidayLeaveHolidayAbsent: false,
    leaveHolidayAbsentHolidayAbsent: false
  });

  // Validation Errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await onboardingTeamService.getFilterOptions();
        if (response.success && response.data) {
          setFilterOptions(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch filters', error);
      }
    };
    fetchFilters();
  }, []);

  const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'job', label: 'Job Details' },
    { id: 'shift', label: 'Shift & WOFF' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'woff', label: 'WOFF & HOFF' },
  ];

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    if (name === 'phone') {
      val = sanitizeDigits(val, 10);
    }

    setFormData(prev => ({ ...prev, [name]: val }));

    // Real-time validation for the edited field
    if (touched[name] || errors[name]) {
      validateSingleField(name, val);
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateSingleField(name, val);
  };

  // Image Upload Handler
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Profile image must be less than 5MB.");
        return;
      }
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Validate single field
  const validateSingleField = (name, value) => {
    let errorMsg = null;

    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) {
          errorMsg = 'Full Name is required.';
        } else if (value.trim().length < 2) {
          errorMsg = 'Full Name must be at least 2 characters.';
        }
        break;

      case 'gender':
        if (!value) {
          errorMsg = 'Please select a gender.';
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          errorMsg = 'Date of Birth is required.';
        } else {
          const dob = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          if (dob >= today) {
            errorMsg = 'Date of Birth must be in the past.';
          } else if (age < 18) {
            errorMsg = 'Member must be at least 18 years old.';
          }
        }
        break;

      case 'phone': {
        const phoneCheck = validatePhone(value, { required: true, fieldName: 'Phone Number' });
        if (!phoneCheck.isValid) errorMsg = phoneCheck.error;
        break;
      }

      case 'email': {
        const emailCheck = validateEmail(value, { required: true });
        if (!emailCheck.isValid) errorMsg = emailCheck.error;
        break;
      }

      case 'password': {
        const passCheck = validatePassword(value, { minLength: 6, required: true, fieldName: 'Password' });
        if (!passCheck.isValid) errorMsg = passCheck.error;
        break;
      }

      case 'address':
        if (value && value.trim().length < 5) {
          errorMsg = 'Address must be at least 5 characters.';
        }
        break;

      case 'onboardingTeamType':
        if (!value) {
          errorMsg = 'Please select Onboarding Team Type.';
        }
        break;


      case 'salary': {
        const salaryCheck = validatePositiveNumber(value, 'Salary', { min: 1, required: true });
        if (!salaryCheck.isValid) errorMsg = salaryCheck.error;
        break;
      }

      case 'punchInTime':
        if (!value || !value.trim()) {
          errorMsg = 'Punch In Time is required.';
        }
        break;

      case 'punchOutTime':
        if (!value || !value.trim()) {
          errorMsg = 'Punch Out Time is required.';
        }
        break;

      case 'weeklyOffDay':
        if (!value) {
          errorMsg = 'Please select a Weekly Off Day.';
        }
        break;

      case 'lateAllowedMins':
      case 'earlyAllowedMins':
      case 'halfDayMins':
      case 'fullDayMins':
      case 'lunchAllowedMins':
      case 'lateCutAllowedDays':
      case 'otGracePeriodMins':
      case 'oneDayOTHrs':
        if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) {
          errorMsg = 'Must be a valid positive number.';
        }
        break;

      default:
        break;
    }

    setErrors(prev => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[name] = errorMsg;
      } else {
        delete updated[name];
      }
      return updated;
    });

    return errorMsg;
  };

  // Validate all fields for a given tab
  const validateTab = (tabId) => {
    const tabErrors = {};

    if (tabId === 'personal') {
      const fields = ['fullName', 'gender', 'dateOfBirth', 'phone', 'email', 'password', 'address'];
      fields.forEach(f => {
        const err = validateSingleField(f, formData[f]);
        if (err) tabErrors[f] = err;
      });
    } else if (tabId === 'job') {
      const fields = ['onboardingTeamType', 'salary'];
      fields.forEach(f => {
        const err = validateSingleField(f, formData[f]);
        if (err) tabErrors[f] = err;
      });
    } else if (tabId === 'shift') {
      const fields = ['punchInTime', 'punchOutTime', 'weeklyOffDay', 'lateAllowedMins', 'earlyAllowedMins', 'halfDayMins', 'fullDayMins'];
      fields.forEach(f => {
        const err = validateSingleField(f, formData[f]);
        if (err) tabErrors[f] = err;
      });
    } else if (tabId === 'attendance') {
      const fields = ['lunchAllowedMins', 'lateCutAllowedDays', 'otGracePeriodMins', 'oneDayOTHrs'];
      fields.forEach(f => {
        const err = validateSingleField(f, formData[f]);
        if (err) tabErrors[f] = err;
      });
    }

    return tabErrors;
  };

  // Handle Tab Switching
  const handleTabClick = (targetTabId) => {
    // If moving forward, validate current tab first
    const currentIdx = tabs.findIndex(t => t.id === activeTab);
    const targetIdx = tabs.findIndex(t => t.id === targetTabId);

    if (targetIdx > currentIdx) {
      const currentTabErrors = validateTab(activeTab);
      if (Object.keys(currentTabErrors).length > 0) {
        const firstErrMsg = Object.values(currentTabErrors)[0];
        toast.error(firstErrMsg || "Please correct the errors in the current section.");
        return;
      }
    }

    setActiveTab(targetTabId);
  };

  // Handle Next Tab Button
  const handleNextTab = () => {
    const currentTabErrors = validateTab(activeTab);
    if (Object.keys(currentTabErrors).length > 0) {
      const firstErrMsg = Object.values(currentTabErrors)[0];
      toast.error(firstErrMsg || "Please complete all required fields correctly.");
      return;
    }

    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all tabs from first to last
    const allTabIds = ['personal', 'job', 'shift', 'attendance', 'woff'];
    for (const tabId of allTabIds) {
      const tabErrors = validateTab(tabId);
      if (Object.keys(tabErrors).length > 0) {
        setActiveTab(tabId);
        const firstErrMsg = Object.values(tabErrors)[0];
        toast.error(firstErrMsg || "Please fix all errors before submitting.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();

      // Append text fields
      Object.keys(formData).forEach(key => {
        formPayload.append(key, formData[key]);
      });

      // Append profile image if uploaded
      if (profileFile) {
        formPayload.append('profileImage', profileFile);
      }

      const response = await onboardingTeamService.createOnboardingTeam(formPayload);
      if (response.success) {
        toast.success("Onboarding Team member created successfully!");
        navigate('/onboarding-team');
      } else {
        toast.error(response.message || "Failed to create onboarding team member.");
      }
    } catch (error) {
      console.error('Failed to create onboarding team', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create onboarding team member.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Create Onboarding Team"
        showBack={true}
        backUrl="/onboarding-team"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Onboarding Team', to: '/onboarding-team' },
          { label: 'Create Onboarding Team' },
        ]}
      />

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-gray-50/80 p-1.5 rounded-xl border border-gray-200/60 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#225091] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PERSONAL DETAILS */}
        {/* ======================================================== */}
        <div className={activeTab === 'personal' ? 'block' : 'hidden'} data-tab="personal">
          <div className="mb-10">
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">General Info</h2>
            
            {/* Avatar Upload */}
            <div className="mb-8">
              <div className="relative inline-block group cursor-pointer">
                <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden flex items-center justify-center p-0.5 relative shadow-sm">
                  <img 
                    src={profilePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                  <input 
                    type="file" 
                    name="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="absolute bottom-0 right-1 left-0 flex justify-center translate-y-1/4 pointer-events-none">
                  <div className="bg-[#225091] text-white p-1.5 rounded-full border-[2.5px] border-white shadow-sm">
                    <Camera size={14} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              {/* Full Name */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter full name" 
                  className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white shadow-sm text-[15px] ${
                    errors.fullName 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                  }`}
                  required 
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.fullName}
                  </p>
                )}
              </div>
              
              {/* Gender */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white appearance-none shadow-sm text-[15px] ${
                      !formData.gender ? 'text-gray-400' : 'text-gray-800'
                    } ${
                      errors.gender 
                        ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                        : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                    }`}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.gender && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.gender}
                  </p>
                )}
              </div>

              {/* Date Of Birth */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Date Of Birth <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white shadow-sm text-[15px] ${
                      errors.dateOfBirth 
                        ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                        : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                    }`} 
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.dateOfBirth}
                  </p>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number" 
                  className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white shadow-sm text-[15px] ${
                    errors.phone 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                  }`} 
                  required 
                />
                {errors.phone && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.phone}
                  </p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="name@example.com" 
                  className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white shadow-sm text-[15px] ${
                    errors.email 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                  }`} 
                  required 
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.email}
                  </p>
                )}
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create secure password (min 6 chars)" 
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border transition-all bg-white shadow-sm text-[15px] ${
                      errors.password 
                        ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                        : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                    }`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter full street address" 
                  className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white shadow-sm text-[15px] ${
                    errors.address 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                  }`} 
                />
                {errors.address && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 2: JOB DETAILS */}
        {/* ======================================================== */}
        <div className={activeTab === 'job' ? 'block' : 'hidden'} data-tab="job">
          <div>
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Employment Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              {/* Onboarding Team Type */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Onboarding Team Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    name="onboardingTeamType" 
                    value={formData.onboardingTeamType} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white appearance-none shadow-sm text-[15px] ${
                      !formData.onboardingTeamType ? 'text-gray-400' : 'text-gray-800'
                    } ${
                      errors.onboardingTeamType 
                        ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                        : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                    }`}
                  >
                    <option value="" disabled>Select Team Type</option>
                    {filterOptions.onboardingTeamTypes.map(opt => (
                      <option key={opt._id || opt.id || opt.value} value={opt._id || opt.id || opt.value}>
                        {opt.name || opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.onboardingTeamType && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.onboardingTeamType}
                  </p>
                )}
              </div>


              {/* Salary */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">
                  Monthly Salary (₹) <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="salary" 
                  value={formData.salary} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => preventInvalidNumberKeys(e, { allowDecimal: true })}
                  placeholder="e.g. 35000" 
                  className={`w-full px-4 py-3.5 rounded-xl border transition-all bg-white shadow-sm text-[15px] ${
                    errors.salary 
                      ? 'border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500' 
                      : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                  }`} 
                />
                {errors.salary && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.salary}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 3: SHIFT & WOFF */}
        {/* ======================================================== */}
        <div className={activeTab === 'shift' ? 'block' : 'hidden'} data-tab="shift">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Shift</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Punch In Time</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        name="punchInTime"
                        value={formData.punchInTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Punch Out Time</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        name="punchOutTime"
                        value={formData.punchOutTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Off Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Weekly Off</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Weekly Off Day</label>
                    <div className="relative">
                      <select 
                        name="weeklyOffDay"
                        value={formData.weeklyOffDay}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-[15px]"
                      >
                        <option value="sunday">Sunday</option>
                        <option value="saturday">Saturday</option>
                        <option value="monday">Monday</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="weeklyOffPayable"
                      checked={formData.weeklyOffPayable} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Weekly Off Payable</span>
                  </label>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="variableWeeklyOff"
                      checked={formData.variableWeeklyOff} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Variable Weekly Off</span>
                  </label>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="secondWeeklyOff"
                      checked={formData.secondWeeklyOff} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Second Weekly Off</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Other Details Card */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Shift Tolerances & Durations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                {/* Late Allowed */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Late Allowed (Mins)</label>
                  <input 
                    type="number" 
                    name="lateAllowedMins"
                    value={formData.lateAllowedMins} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" 
                  />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <input 
                      type="checkbox" 
                      name="lateAllowedAsPerShift"
                      checked={formData.lateAllowedAsPerShift} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>

                {/* Early Allowed */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Early Allowed (Mins)</label>
                  <input 
                    type="number" 
                    name="earlyAllowedMins"
                    value={formData.earlyAllowedMins} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" 
                  />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <input 
                      type="checkbox" 
                      name="earlyAllowedAsPerShift"
                      checked={formData.earlyAllowedAsPerShift} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>

                {/* Half Day */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Half Day (Mins)</label>
                  <input 
                    type="number" 
                    name="halfDayMins"
                    value={formData.halfDayMins} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" 
                  />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <input 
                      type="checkbox" 
                      name="halfDayAsPerShift"
                      checked={formData.halfDayAsPerShift} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>

                {/* Full Day */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Full Day (Mins)</label>
                  <input 
                    type="number" 
                    name="fullDayMins"
                    value={formData.fullDayMins} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" 
                  />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <input 
                      type="checkbox" 
                      name="fullDayAsPerShift"
                      checked={formData.fullDayAsPerShift} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 4: ATTENDANCE */}
        {/* ======================================================== */}
        <div className={activeTab === 'attendance' ? 'block' : 'hidden'} data-tab="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Punch Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Punch Rules</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Punch Type</label>
                    <div className="flex items-center gap-5">
                      {['single', 'double', 'multiple'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer capitalize">
                          <input 
                            type="radio" 
                            name="punchType" 
                            value={type} 
                            checked={formData.punchType === type}
                            onChange={handleChange}
                            className="w-5 h-5 accent-[#225091] cursor-pointer" 
                          />
                          <span className="text-[15px] text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">No Out-Punch Found — Action</label>
                    <div className="relative">
                      <select 
                        name="noOutPunchAction"
                        value={formData.noOutPunchAction}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-[15px]"
                      >
                        <option value="mark_half_day">Mark Half Day</option>
                        <option value="mark_absent">Mark Absent</option>
                        <option value="ignore">Ignore</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Present On WO / Holiday — Action</label>
                    <div className="relative">
                      <select 
                        name="presentOnWeeklyOffHolidayAction"
                        value={formData.presentOnWeeklyOffHolidayAction}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-[15px]"
                      >
                        <option value="pay_extra">Pay Extra</option>
                        <option value="compensatory_off">Compensatory Off (COFF)</option>
                        <option value="standard_pay">Standard Pay</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lunch & Early Going Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Lunch & Early Going</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Lunch Allowed (Mins)</label>
                      <input 
                        type="number" 
                        name="lunchAllowedMins"
                        value={formData.lunchAllowedMins} 
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                      />
                    </div>
                    <div className="pb-3.5">
                      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                        <input 
                          type="checkbox" 
                          name="lunchAsPerShift"
                          checked={formData.lunchAsPerShift} 
                          onChange={handleChange}
                          className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                        />
                        <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="lunchAllowed"
                      checked={formData.lunchAllowed} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Lunch Allowed</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="earlyGoingAllowed"
                      checked={formData.earlyGoingAllowed} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Early Going Allowed</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Late Cut Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Late Cut Rules</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Allowed Days</label>
                      <input 
                        type="number" 
                        name="lateCutAllowedDays"
                        value={formData.lateCutAllowedDays} 
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Action</label>
                      <div className="relative">
                        <select 
                          name="lateCutAction"
                          value={formData.lateCutAction} 
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-700 shadow-sm text-[15px]"
                        >
                          <option value="deduct">Deduct Half Day</option>
                          <option value="mark_absent">Mark Absent</option>
                          <option value="warning">Send Warning</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="lateCutAllowed"
                      checked={formData.lateCutAllowed} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Late Cut Allowed</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="extraLateCutDeduction"
                      checked={formData.extraLateCutDeduction} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Extra Late Cut Deduction</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="additionalLateCutInLeaveBalance"
                      checked={formData.additionalLateCutInLeaveBalance} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Additional Late Cut In Leave Balance</span>
                  </label>
                </div>
              </div>

              {/* Overtime Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Overtime Rules</h2>
                <div className="space-y-5">
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="overtimeAllowed"
                      checked={formData.overtimeAllowed} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Overtime Allowed</span>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        name="customOT"
                        checked={formData.customOT} 
                        onChange={handleChange}
                        className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                      />
                      <span className="text-[15px] text-gray-700 font-medium">Custom OT</span>
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        name="beforeOT"
                        checked={formData.beforeOT} 
                        onChange={handleChange}
                        className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                      />
                      <span className="text-[15px] text-gray-700 font-medium">Before OT</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">OT Grace Period (Mins)</label>
                      <input 
                        type="number" 
                        name="otGracePeriodMins"
                        value={formData.otGracePeriodMins} 
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">1 Day OT Hrs</label>
                      <input 
                        type="number" 
                        name="oneDayOTHrs"
                        value={formData.oneDayOTHrs} 
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="otAsPerShift"
                      checked={formData.otAsPerShift} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">OT As Per Shift</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="considerOTAsCOFF"
                      checked={formData.considerOTAsCOFF} 
                      onChange={handleChange}
                      className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                    />
                    <span className="text-[15px] text-gray-700 font-medium">Consider OT As COFF</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 5: WOFF & HOFF */}
        {/* ======================================================== */}
        <div className={activeTab === 'woff' ? 'block' : 'hidden'} data-tab="woff">
          <div className="space-y-6">
            {/* Sandwich Absence Rules — Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Sandwich Absence Rules — Weekly Off</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="absentBeforeWO"
                    checked={formData.absentBeforeWO} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer mt-0.5" 
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] text-gray-700 font-medium leading-tight">Absent Before Weekly Off</span>
                    <span className="text-[12px] text-gray-500 mt-1">Mark Absent If Employee Absent The Day Before WO.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="absentAfterWO"
                    checked={formData.absentAfterWO} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer mt-0.5" 
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] text-gray-700 font-medium leading-tight">Absent After Weekly Off</span>
                    <span className="text-[12px] text-gray-500 mt-1">Mark Absent If Employee Absent The Day After WO.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="absentBeforeOrAfterWO"
                    checked={formData.absentBeforeOrAfterWO} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer mt-0.5" 
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] text-gray-700 font-medium leading-tight">Absent Before Or After Weekly Off</span>
                    <span className="text-[12px] text-gray-500 mt-1">Either Side Triggers WO Absent.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="addWorkingHrsOnWO"
                    checked={formData.addWorkingHrsOnWO} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Add Working Hrs On Weekly Off Day</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="lateDeductionNotAppliedWO"
                    checked={formData.lateDeductionNotAppliedWO} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Late Deduction Not Applied On WO If Present</span>
                </label>
              </div>
            </div>

            {/* Sandwich Absence Rules — Holiday */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Sandwich Absence Rules — Holiday</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="absentBeforeHoliday"
                    checked={formData.absentBeforeHoliday} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Absent Before Holiday</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="absentAfterHoliday"
                    checked={formData.absentAfterHoliday} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Absent After Holiday</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="absentBeforeAfterHoliday"
                    checked={formData.absentBeforeAfterHoliday} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Absent Before & After Holiday</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="addWorkingHoursOnHoliday"
                    checked={formData.addWorkingHoursOnHoliday} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Add Working Hours On Holiday Day</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="lateDeductionNotAppliedHoliday"
                    checked={formData.lateDeductionNotAppliedHoliday} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Late Deduction Not Applied On Holiday If Present</span>
                </label>
              </div>
            </div>

            {/* Leave Between Holiday Or Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Leave Between Holiday Or Weekly Off</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="considerWOInLeave"
                    checked={formData.considerWOInLeave} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Consider "Weekly Off" In Leave Application</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="considerHolidayInLeave"
                    checked={formData.considerHolidayInLeave} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Consider "Holiday" In Leave Application</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="absentWOLeaveWOAbsent"
                    checked={formData.absentWOLeaveWOAbsent} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Absent — WO — Leave = WO Absent</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="leaveWOAbsentWOAbsent"
                    checked={formData.leaveWOAbsentWOAbsent} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Leave — WO — Absent = WO Absent</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="absentHolidayLeaveHolidayAbsent"
                    checked={formData.absentHolidayLeaveHolidayAbsent} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Absent — Holiday — Leave = Holiday Absent</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <input 
                    type="checkbox" 
                    name="leaveHolidayAbsentHolidayAbsent"
                    checked={formData.leaveHolidayAbsentHolidayAbsent} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded-[4px] border-2 border-gray-300 accent-[#225091] cursor-pointer" 
                  />
                  <span className="text-[15px] text-gray-700 font-medium">Leave — Holiday — Absent = Holiday Absent</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ACTION BUTTONS (Previous / Next / Create / Cancel) */}
        {/* ======================================================== */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100 mt-8">
          <Link
            to="/onboarding-team"
            className="px-8 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold transition-colors text-sm shadow-xs"
          >
            Cancel
          </Link>
          
          {activeTab !== 'personal' && (
            <button
              type="button"
              onClick={() => {
                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].id);
                }
              }}
              className="group inline-flex items-center gap-2 px-8 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-[#225091] font-semibold transition-all text-sm shadow-xs cursor-pointer"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Previous</span>
            </button>
          )}

          {activeTab === 'woff' ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-lg bg-[#225091] hover:bg-[#193e73] text-white font-semibold transition-colors shadow-xs text-sm disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                'Create Team Member'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextTab}
              className="px-8 py-2.5 rounded-lg bg-[#225091] hover:bg-[#193e73] text-white font-semibold transition-colors shadow-xs text-sm"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateOnboardingTeam;
