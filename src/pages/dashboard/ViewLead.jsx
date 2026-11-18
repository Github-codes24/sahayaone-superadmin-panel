import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Phone, MapPin, Briefcase, Fingerprint, FileText, UserCircle, Building2, Eye, ExternalLink, X, Smartphone } from 'lucide-react';
import { leadService } from '../../api/leadService';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { SkeletonDetailView } from '../../components/common/Skeleton';

const getStatusBadge = (status, display) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'NEW':
      return <span className="px-3.5 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold">{display || 'New'}</span>;
    case 'PENDING_DOWN_PAYMENT':
      return <span className="px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-600 text-xs font-semibold">{display || 'Pending Down Payment'}</span>;
    case 'ACTIVE':
      return <span className="px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#225091] text-xs font-semibold">{display || 'Active'}</span>;
    case 'COMPLETED':
      return <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-semibold">{display || 'Completed'}</span>;
    case 'REJECTED':
      return <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-xs font-semibold">{display || 'Rejected'}</span>;
    default:
      return <span className="px-3.5 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold">{display || status || 'N/A'}</span>;
  }
};

const ViewLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      setIsLoading(true);
      try {
        const response = await leadService.getLeadById(id);
        if (response.success && response.data) {
          setLead(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch lead details');
        }
      } catch (error) {
        console.error('Failed to load lead details', error);
        toast.error('Error loading lead details');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchLead();
  }, [id]);

  if (isLoading) {
    return <SkeletonDetailView />;
  }

  if (!lead) {
    return (
      <div className="p-10 text-center text-gray-500 flex flex-col items-center">
        <p className="mb-4">Lead not found.</p>
        <Link to="/leads" className="text-[#225091] hover:underline font-semibold">Back to Leads</Link>
      </div>
    );
  }

  // Parse structured sections
  const personalInfo = lead.personalInformation || lead.generalInformation || {};
  const documents = lead.documents || lead.identityDocuments || {};
  const bankInfo = lead.bankInformation || lead.assignedBank || null;
  const loanInfo = lead.loanInformation || {};

  const customerName = personalInfo.fullName || lead.customerName || lead.name || '—';
  const phoneNumber = personalInfo.phoneNumber || personalInfo.mobileNumber || lead.phoneNumber || '—';
  const applicationId = lead.applicationNumber || lead.applicationId || (id ? `ADVT-${id.slice(-4).toUpperCase()}` : '—');
  const status = lead.status || 'NEW';
  
  // Format Date of Birth
  const formatDob = (rawDob) => {
    if (!rawDob) return '—';
    try {
      const d = new Date(rawDob);
      if (!isNaN(d.getTime())) {
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}-${month}-${year}`;
      }
    } catch (e) {}
    return rawDob;
  };

  const dob = formatDob(personalInfo.dob || personalInfo.dateOfBirth || personalInfo.formattedDob);
  const gender = personalInfo.gender || '—';
  const pan = personalInfo.panNumber || documents.panNumber || '—';
  const rawAadhaar = personalInfo.aadhaarNumber || documents.aadhaarNumber || '—';
  const aadhaar = rawAadhaar !== '—' && rawAadhaar.length === 12 
    ? `${rawAadhaar.slice(0, 4)} ${rawAadhaar.slice(4, 8)} ${rawAadhaar.slice(8, 12)}` 
    : rawAadhaar;
  const address = personalInfo.address || lead.fullAddress || lead.address || '—';

  // Document URLs
  const panCardUrl = documents.panCardUrl || documents.panCardDocument?.url || documents.panCardDocument?.viewUrl || '';
  const aadhaarCardUrl = documents.aadhaarCardUrl || documents.aadhaarCardDocument?.url || documents.aadhaarCardDocument?.viewUrl || '';
  const digitalSignatureUrl = documents.digitalSignatureUrl || '';

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Lead Details"
        showBack={true}
        backUrl="/leads"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Lead Management' },
          { label: 'Leads', to: '/leads' },
          { label: 'View Details' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Overview */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            {lead.profileImage ? (
              <img src={lead.profileImage} alt={customerName} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 mb-4 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-[#225091] border-4 border-white shadow-sm mb-4">
                {customerName?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-800 mb-1">{customerName}</h2>
            <p className="text-sm text-gray-500 mb-4 font-mono bg-gray-50 px-3 py-1 rounded-md">ID: {applicationId}</p>
            {getStatusBadge(status, lead.statusDisplay)}
            
            <div className="w-full h-px bg-gray-100 my-6"></div>
            
            <div className="w-full flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <Phone size={18} className="text-[#225091]" />
                <span className="text-[15px] font-medium">{phoneNumber}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <MapPin size={18} className="text-[#225091] mt-0.5 shrink-0" />
                <span className="text-[14px] font-medium flex-1">{address}</span>
              </div>
            </div>

            {/* Assignment Box */}
            {(lead.assignedEmployee || bankInfo) && (
              <>
                <div className="w-full h-px bg-gray-100 my-6"></div>
                <div className="w-full text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Assignment</p>
                  {lead.assignedEmployee && (
                    <div className="flex items-center gap-3 bg-[#225091]/5 border border-[#225091]/10 p-3 rounded-lg mb-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#225091] shadow-sm">
                        <UserCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Employee</p>
                        <p className="text-[14px] font-semibold text-gray-800">{lead.assignedEmployee.fullName}</p>
                      </div>
                    </div>
                  )}
                  {bankInfo && (
                    <div className="flex items-center gap-3 bg-[#225091]/5 border border-[#225091]/10 p-3 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#225091] shadow-sm">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cooperative Bank</p>
                        <p className="text-[14px] font-semibold text-gray-800">{bankInfo.bankName || bankInfo.name || 'Assigned Bank'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* General Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
              <Briefcase size={18} className="text-[#225091]" />
              <h3 className="font-bold text-gray-800">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Full Name</p>
                <p className="text-[15px] font-semibold text-gray-800">{customerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Gender</p>
                <p className="text-[15px] font-semibold text-gray-800 capitalize">{gender}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Date of Birth</p>
                <p className="text-[15px] font-semibold text-gray-800">{dob}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Phone Number</p>
                <p className="text-[15px] font-semibold text-gray-800">{phoneNumber}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-gray-400 mb-1">Address</p>
                <p className="text-[15px] font-semibold text-gray-800">{address}</p>
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
              <Fingerprint size={18} className="text-[#225091]" />
              <h3 className="font-bold text-gray-800">Identity Documents</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">PAN Number</p>
                <p className="text-[15px] font-semibold text-gray-800 tracking-wider uppercase">{pan}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Aadhaar Number</p>
                <p className="text-[15px] font-semibold text-gray-800 tracking-wider">{aadhaar}</p>
              </div>

              {/* PAN Document Card */}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">PAN Card Document</p>
                {panCardUrl ? (
                  <div 
                    onClick={() => setPreviewImage({ url: panCardUrl, title: 'PAN Card' })}
                    className="h-32 border border-gray-200 rounded-lg p-2 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-[#225091] transition-colors relative group"
                  >
                    <img src={panCardUrl} alt="PAN Card" className="max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <Eye size={14} /> Click to view
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No document uploaded</p>
                )}
              </div>

              {/* Aadhaar Document Card */}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Aadhaar Card Document</p>
                {aadhaarCardUrl ? (
                  <div 
                    onClick={() => setPreviewImage({ url: aadhaarCardUrl, title: 'Aadhaar Card' })}
                    className="h-32 border border-gray-200 rounded-lg p-2 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-[#225091] transition-colors relative group"
                  >
                    <img src={aadhaarCardUrl} alt="Aadhaar Card" className="max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <Eye size={14} /> Click to view
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No document uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Loan & Product Information */}
          {loanInfo && (loanInfo.productName || loanInfo.productPrice) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
                <Smartphone size={18} className="text-[#225091]" />
                <h3 className="font-bold text-gray-800">Loan & Product Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Product Name</p>
                  <p className="text-[15px] font-semibold text-gray-800">{loanInfo.productName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Variant Details</p>
                  <p className="text-[15px] font-semibold text-gray-800">{loanInfo.variantName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Product Price</p>
                  <p className="text-[15px] font-semibold text-[#225091]">₹{Number(loanInfo.productPrice || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Total Payable Amount</p>
                  <p className="text-[15px] font-semibold text-gray-800">₹{Number(loanInfo.totalPayableAmount || loanInfo.totalAmount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Image Modal Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">{previewImage.title}</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={previewImage.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[#225091] hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink size={14} /> Open in new tab
                </a>
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 flex items-center justify-center bg-gray-900 overflow-auto max-h-[75vh]">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewLead;
