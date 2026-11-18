import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, ArrowLeft, UploadCloud, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { cooperativeBankService } from '../../api/cooperativeBankService';
import BankFeaturesGrid, { BANK_FEATURES } from '../../components/BankFeaturesGrid';
import PageHeader from '../../components/common/PageHeader';

const FileUploadField = ({ label, id, name, onChange, selectedFile, initialFileName, initialFileUrl }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[15px] font-semibold text-gray-800">{label}</label>
      <div className={`relative flex items-center justify-center w-full h-24 border-2 border-dashed rounded-xl transition-colors cursor-pointer group ${
        selectedFile || initialFileName ? 'border-[#225091] bg-blue-50/40 hover:bg-blue-100/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}>
        <input 
          type="file" 
          id={id} 
          name={name}
          onChange={(e) => onChange(name, e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          accept="image/*,.pdf"
        />
        {selectedFile || initialFileName ? (
          <div className="flex flex-col items-center gap-1 text-[#225091] transition-colors px-2 text-center w-full">
            <CheckCircle2 size={24} className="text-[#32c965]" />
            <span className="text-xs font-semibold truncate max-w-full">
              {selectedFile ? selectedFile.name : initialFileName}
            </span>
            <span className="text-[11px] text-gray-500">Click to change file</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-[#225091] transition-colors">
            <UploadCloud size={24} />
            <span className="text-xs font-medium">Click to upload document</span>
            <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
          </div>
        )}

        {!selectedFile && initialFileUrl && (
          <div className="absolute top-1 right-2 z-20">
             <a href={initialFileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline relative z-20" onClick={(e) => e.stopPropagation()}>
               View
             </a>
          </div>
        )}
      </div>
    </div>
  );
};

const EditCooperativeBank = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bank, setBank] = useState(null);

  const [emiQty, setEmiQty] = useState(110);
  const [verQty, setVerQty] = useState(220);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  
  const [files, setFiles] = useState({
    bankLogo: null,
    registrationCertificate: null,
    companyPan: null,
    boardResolution: null,
    gstDeclaration: null,
    directorKyc: null,
    cancelledCheque: null
  });

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const response = await cooperativeBankService.getBankDetails(id);
        if (response.success) {
          setBank(response.data);
          const emiVal = response.data.pricing?.emiCardQuantity ?? response.data.totalEmiCards ?? response.data.cardQuantity ?? response.data.emiCard ?? 110;
          const verVal = response.data.pricing?.verificationCreditQuantity ?? response.data.totalVerificationCredits ?? response.data.verificationCredit ?? 220;
          setEmiQty(Number(emiVal) || 110);
          setVerQty(Number(verVal) || 220);
          if (response.data.features) {
            if (Array.isArray(response.data.features)) {
              setSelectedFeatures(response.data.features);
            } else if (typeof response.data.features === 'string') {
              try {
                setSelectedFeatures(JSON.parse(response.data.features));
              } catch {
                setSelectedFeatures([]);
              }
            }
          }
        } else {
          toast.error("Failed to load bank details.");
          navigate('/co-operative-bank');
        }
      } catch (error) {
        console.error("Fetch bank details failed", error);
        toast.error("Error loading bank details.");
        navigate('/co-operative-bank');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchBank();
    }
  }, [id, navigate]);

  const emiPrice = emiQty * 100;
  const verPrice = verQty * 50;
  const totalAmount = emiPrice + verPrice;
  const cgst = Number((totalAmount * 0.09).toFixed(2));
  const sgst = Number((totalAmount * 0.09).toFixed(2));
  const totalPayableAmount = totalAmount + cgst + sgst;

  const handleFileChange = (name, file) => {
    setFiles(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emiQty < 100 || verQty < 100) {
      toast.error("EMI Card and Verification Credit quantities must be at least 100.");
      return;
    }


    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    
    // Ensure authorizedPerson and ubo compatibility
    const authPerson = formData.get('authorizedPerson');
    if (authPerson && !formData.get('ubo')) {
      formData.append('ubo', authPerson);
    }
    if (formData.get('bankName') && !formData.get('name')) {
      formData.append('name', formData.get('bankName'));
    }
    if (formData.get('phoneNumber') && !formData.get('phone')) {
      formData.append('phone', formData.get('phoneNumber'));
    }

    // Logo alias compatibility
    const logoFile = formData.get('bankLogo');
    if (logoFile && logoFile.size > 0 && !formData.get('logo')) {
      formData.append('logo', logoFile);
    }

    // Clean up empty optional text fields
    const optionalText = ['alternateEmail', 'password', 'accountBankName', 'accountNumber', 'ifsc', 'accountHolderName'];
    optionalText.forEach(field => {
      if (!formData.get(field)) formData.delete(field);
    });

    // Clean up empty file objects
    const fileFields = ['bankLogo', 'logo', 'registrationCertificate', 'companyPan', 'boardResolution', 'gstDeclaration', 'directorKyc', 'cancelledCheque'];
    fileFields.forEach(field => {
      const file = formData.get(field);
      if (!file || file.size === 0) {
        formData.delete(field);
      }
    });

    // Append calculated pricing fields as expected by API
    formData.set('emiCardQuantity', String(emiQty));
    formData.set('verificationCreditQuantity', String(verQty));
    formData.set('emiCardPrice', String(emiPrice));
    formData.set('verificationCreditPrice', String(verPrice));
    formData.set('totalAmount', String(totalAmount));
    formData.set('totalPayableAmount', String(totalPayableAmount));
    
    const transactionId = formData.get('transactionId');
    if (!transactionId) formData.delete('transactionId');

    // Append selected features
    formData.set('features', JSON.stringify(selectedFeatures));

    try {
      const response = await cooperativeBankService.updateBank(id, formData);
      if (response.success) {
        toast.success("Bank updated successfully.");
        navigate('/co-operative-bank');
      } else {
        toast.error(response.message || response.error || "Failed to update bank.");
      }
    } catch (error) {
      console.error("Update failed", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error updating bank.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Loading bank details...</div>;
  }

  if (!bank) return null;

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Edit Co-operative Bank"
        showBack={true}
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Co-operative Bank', to: '/co-operative-bank' },
          { label: 'Edit Bank' },
        ]}
      />

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-8">
        <form onSubmit={handleSubmit}>
          {/* General Info */}
          <div className="mb-10">
            <h2 className="text-[20px] font-bold text-[#172B4D] font-heading mb-6">General Info</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Bank Name *</label>
                <input type="text" name="bankName" defaultValue={bank.bankName || bank.name} required placeholder="Enter bank name" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Authorized Person *</label>
                <input type="text" name="authorizedPerson" defaultValue={bank.authorizedPerson || bank.ubo} required placeholder="Enter authorized person name" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Email *</label>
                <input type="email" name="email" defaultValue={bank.email} required placeholder="Enter email" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Mail ID (Alternate/Contact)</label>
                <input type="email" name="alternateEmail" defaultValue={bank.alternateEmail} placeholder="Enter alternate mail ID" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  defaultValue={bank.phoneNumber || bank.phone} 
                  required 
                  maxLength={10}
                  pattern="\d{10}"
                  onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
                  placeholder="Enter phone number" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>
              
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Status</label>
                <select name="status" defaultValue={bank.status || "ACTIVE"} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] appearance-none">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Change password (leave empty to keep current)" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="mb-10">
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Bank Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Bank Name</label>
                <input 
                  type="text" 
                  name="accountBankName" 
                  defaultValue={bank.accountBankName || bank.bankAccountDetails?.bankName || bank.bankAccountDetails?.accountBankName || bank.bankDetails?.bankName || bank.bankDetails?.accountBankName || ''} 
                  placeholder="Enter bank name" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Account number</label>
                <input 
                  type="text" 
                  name="accountNumber" 
                  defaultValue={bank.accountNumber || bank.bankAccountDetails?.accountNumber || bank.bankDetails?.accountNumber || ''} 
                  placeholder="Enter account number" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">IFSC</label>
                <input 
                  type="text" 
                  name="ifsc" 
                  defaultValue={bank.ifsc || bank.ifscCode || bank.bankAccountDetails?.ifsc || bank.bankAccountDetails?.ifscCode || bank.bankDetails?.ifsc || ''} 
                  placeholder="Enter IFSC code" 
                  onInput={(e) => { e.target.value = e.target.value.toUpperCase(); }}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Account Holder Name</label>
                <input 
                  type="text" 
                  name="accountHolderName" 
                  defaultValue={bank.accountHolderName || bank.bankAccountDetails?.accountHolderName || bank.bankAccountDetails?.accountHolder || bank.bankDetails?.accountHolderName || bank.bankDetails?.accountHolder || ''} 
                  placeholder="Enter account holder name" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>
            </div>
          </div>

          {/* Pricing / Credits (Read-only for Edit usually, or let them update it?) */}
          {/* I will keep it interactive just in case they want to adjust, but won't send it unless needed */}
          <div className="mb-10">
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Pricing / Credits</h2>
            
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">EMI Card (Minimum 100 Quantity)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={emiQty}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setEmiQty(val === '' ? '' : Number(val));
                      }}
                      onBlur={() => {
                        if (emiQty === '' || Number(emiQty) < 100) {
                          setEmiQty(100);
                        }
                      }}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Verification Credit (Minimum 100 Quantity)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={verQty}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setVerQty(val === '' ? '' : Number(val));
                      }}
                      onBlur={() => {
                        if (verQty === '' || Number(verQty) < 100) {
                          setVerQty(100);
                        }
                      }}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[400px] bg-[#fafafa] rounded-2xl border border-gray-100 p-6">
                <h3 className="text-[17px] font-bold text-gray-900 mb-5">Price</h3>
                
                <div className="space-y-3.5 text-[15px] text-gray-600">
                  <div className="flex justify-between">
                    <span>EMI Card ({emiQty} qty:)</span>
                    <span className="font-medium text-gray-800">₹{emiPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verification Credit ({verQty} qty)</span>
                    <span className="font-medium text-gray-800">₹{verPrice.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3.5 flex justify-between font-bold text-gray-900 text-[16px]">
                    <span>Total Payable Amount:</span>
                    <span>₹{totalPayableAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features / Modules */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1b2559]">Features / Modules</h2>
                <p className="text-sm text-gray-500 mt-1">Select the features and services enabled for this co-operative bank</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedFeatures(BANK_FEATURES.map(f => f.id))} 
                  className="text-xs font-semibold text-[#225091] hover:underline"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  type="button" 
                  onClick={() => setSelectedFeatures([])} 
                  className="text-xs font-semibold text-gray-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <BankFeaturesGrid 
              selectedFeatures={selectedFeatures} 
              onChange={setSelectedFeatures} 
            />
          </div>

          {/* Documents */}
          <div>
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Documents Upload</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FileUploadField 
                label="Bank Logo" id="bank-logo" name="bankLogo" 
                onChange={handleFileChange} selectedFile={files.bankLogo} 
                initialFileName={bank.documents?.bankLogo?.filename || (typeof bank.logo === 'string' ? bank.logo.split('/').pop() : bank.logo?.filename)} 
                initialFileUrl={bank.documents?.bankLogo?.url || (typeof bank.logo === 'string' ? bank.logo : bank.logo?.url)}
              />
              <FileUploadField 
                label="Registration Certificate" id="reg-cert" name="registrationCertificate" 
                onChange={handleFileChange} selectedFile={files.registrationCertificate} 
                initialFileName={bank.documents?.registrationCertificate?.filename} initialFileUrl={bank.documents?.registrationCertificate?.url}
              />
              <FileUploadField 
                label="Company PAN" id="comp-pan" name="companyPan" 
                onChange={handleFileChange} selectedFile={files.companyPan} 
                initialFileName={bank.documents?.companyPan?.filename} initialFileUrl={bank.documents?.companyPan?.url}
              />
              <FileUploadField 
                label="Board Resolution" id="board-res" name="boardResolution" 
                onChange={handleFileChange} selectedFile={files.boardResolution} 
                initialFileName={bank.documents?.boardResolution?.filename} initialFileUrl={bank.documents?.boardResolution?.url}
              />
              <FileUploadField 
                label="GST / Declaration" id="gst-decl" name="gstDeclaration" 
                onChange={handleFileChange} selectedFile={files.gstDeclaration} 
                initialFileName={bank.documents?.gstDeclaration?.filename} initialFileUrl={bank.documents?.gstDeclaration?.url}
              />
              <FileUploadField 
                label="Director KYC (Aadhar, PAN etc.)" id="dir-kyc" name="directorKyc" 
                onChange={handleFileChange} selectedFile={files.directorKyc} 
                initialFileName={bank.documents?.directorKyc?.filename} initialFileUrl={bank.documents?.directorKyc?.url}
              />
              <FileUploadField 
                label="Cancelled Cheque" id="cancelled-cheque" name="cancelledCheque" 
                onChange={handleFileChange} selectedFile={files.cancelledCheque} 
                initialFileName={bank.documents?.cancelledCheque?.filename || bank.documents?.cancelCheck?.filename} 
                initialFileUrl={bank.documents?.cancelledCheque?.url || bank.documents?.cancelCheck?.url}
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <Link to="/co-operative-bank" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px]">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-[#225091] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px] disabled:opacity-70 flex items-center justify-center">
              {isSubmitting ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                 "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCooperativeBank;
