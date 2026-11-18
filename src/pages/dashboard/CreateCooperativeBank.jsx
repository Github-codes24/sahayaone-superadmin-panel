import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, ArrowLeft, UploadCloud, CheckCircle2, Smartphone, Landmark, Banknote, CreditCard, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { cooperativeBankService } from '../../api/cooperativeBankService';
import BankFeaturesGrid, { BANK_FEATURES } from '../../components/BankFeaturesGrid';
import axiosInstance from '../../api/axiosConfig';
import PageHeader from '../../components/common/PageHeader';

const FileUploadField = ({ label, id, name, onChange, selectedFile }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[15px] font-semibold text-gray-800">{label}</label>
      <div className={`relative flex items-center justify-center w-full h-24 border-2 border-dashed rounded-xl transition-colors cursor-pointer group ${
        selectedFile ? 'border-[#225091] bg-blue-50/40 hover:bg-blue-100/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}>
        <input 
          type="file" 
          id={id} 
          name={name}
          onChange={(e) => onChange(name, e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept="image/*,.pdf"
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-1 text-[#225091] transition-colors px-2 text-center w-full">
            <CheckCircle2 size={24} className="text-[#32c965]" />
            <span className="text-xs font-medium text-gray-700 truncate w-full px-2">{selectedFile.name}</span>
            <span className="text-[10px] text-gray-500">Click to change</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-[#225091] transition-colors">
            <UploadCloud size={24} />
            <span className="text-xs font-medium">Click to upload (PDF/Image)</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateCooperativeBank = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emiQty, setEmiQty] = useState(110);
  const [verQty, setVerQty] = useState(220);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', validThru: '', cvv: '', name: '' });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [createdBankId, setCreatedBankId] = useState(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  useEffect(() => {
    let interval;
    if (paymentLinkData && paymentLinkData.bankId) {
      interval = setInterval(async () => {
        try {
          const response = await cooperativeBankService.getBankDetails(paymentLinkData.bankId);
          if (response.success && response.data) {
            const status = response.data.paymentStatus || response.data.status;
            if (status === 'SUCCESS' || status === 'ACTIVE' || status === 'APPROVED') {
              setPaymentLinkData(null);
              setPaymentSuccessData(response.data);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentLinkData]);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardDetails({...cardDetails, number: formattedValue});
  };

  const handleValidThruChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    if (value.length >= 3) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardDetails({...cardDetails, validThru: value});
  };
  
  const [files, setFiles] = useState({
    bankLogo: null,
    registrationCertificate: null,
    companyPan: null,
    boardResolution: null,
    gstDeclaration: null,
    directorKyc: null,
    cancelledCheque: null
  });

  const [emiPricing, setEmiPricing] = useState({ price: 10000, totalPayableAmount: 11800 });
  const [verPricing, setVerPricing] = useState({ price: 5000, totalPayableAmount: 5900 });
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      if (emiQty >= 100 && verQty >= 100) {
        setIsCalculatingPrice(true);
        try {
          const [emiRes, verRes] = await Promise.all([
            axiosInstance.post('/v1/super-admin/co-operative-bank/calculate-emi-card-price', { quantity: emiQty }, { skipLoader: true }),
            axiosInstance.post('/v1/super-admin/co-operative-bank/calculate-verification-credit-price', { quantity: verQty }, { skipLoader: true })
          ]);
          
          if (emiRes.data?.success) {
            setEmiPricing(emiRes.data.data);
          }
          if (verRes.data?.success) {
            setVerPricing(verRes.data.data);
          }
        } catch (error) {
          console.error("Failed to calculate prices:", error);
        } finally {
          setIsCalculatingPrice(false);
        }
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchPrices();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [emiQty, verQty]);

  const emiPrice = emiPricing.price || 0;
  const verPrice = verPricing.price || 0;
  const totalAmount = (emiPricing.totalAmount || emiPrice) + (verPricing.totalAmount || verPrice);
  const totalPayableAmount = (emiPricing.totalPayableAmount || emiPrice) + (verPricing.totalPayableAmount || verPrice);

  const handleFileChange = (name, file) => {
    setFiles(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emiQty < 100 || verQty < 100) {
      toast.error("EMI Card and Verification Credit quantities must be at least 100.");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    
    // Append calculated pricing fields as expected by API
    formData.set('emiCardQuantity', String(emiQty));
    formData.set('verificationCreditQuantity', String(verQty));
    formData.set('emiCardPrice', String(emiPrice));
    formData.set('verificationCreditPrice', String(verPrice));
    formData.set('totalAmount', String(totalAmount));
    formData.set('totalPayableAmount', String(totalPayableAmount));
    
    if (transactionId) {
      formData.set('transactionId', transactionId);
    }

    // Append normalized payment method & status
    let normalizedPaymentMethod = 'Online';
    if (paymentMethod === 'CASH') {
      normalizedPaymentMethod = 'Cash';
    } else if (paymentMethod === 'UPI' || paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'CARD') {
      normalizedPaymentMethod = 'Online';
    } else if (paymentMethod) {
      normalizedPaymentMethod = paymentMethod;
    }
    formData.set('paymentMethod', normalizedPaymentMethod);
    formData.set('paymentStatus', normalizedPaymentMethod === 'Cash' ? 'SUCCESS' : 'PENDING');

    // Append selected features as JSON array string
    formData.set('features', JSON.stringify(selectedFeatures));

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

    try {
      const response = await cooperativeBankService.createBank(formData);
      if (response.success) {
        const newBankId = response.data?.bank?.id || response.data?.id || response.data?._id;
        
        if (normalizedPaymentMethod === 'Cash') {
          if (newBankId) {
            setCreatedBankId(newBankId);
            setIsOtpModalOpen(true);
            toast.success("Please verify OTP");
          } else {
            toast.success("Bank created successfully.");
            navigate('/co-operative-bank');
          }
        } else {
          toast.success("Bank created successfully.");
          
          const paymentLink = response.data?.paymentLink || response.data?.bank?.paymentLink || response.paymentLink;
          if (paymentLink && newBankId) {
            setPaymentLinkData({ link: paymentLink, bankId: newBankId });
          } else {
            navigate('/co-operative-bank');
          }
        }
      } else {
        toast.error(response.message || response.error || "Failed to create bank.");
      }
    } catch (error) {
      console.error("Create failed", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error creating bank.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Create Co-operative Bank"
        showBack={true}
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Co-operative Bank', to: '/co-operative-bank' },
          { label: 'Add New Bank' },
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
                <input type="text" name="bankName" required placeholder="Enter bank name" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Authorized Person *</label>
                <input type="text" name="authorizedPerson" required placeholder="Enter authorized person name" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Email *</label>
                <input type="email" name="email" required placeholder="Enter email" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Mail ID (Alternate/Contact)</label>
                <input type="email" name="alternateEmail" placeholder="Enter alternate mail ID" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  required 
                  maxLength={10}
                  pattern="\d{10}"
                  onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) }}
                  placeholder="Enter phone number" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>
              
              
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Create password" 
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
                  placeholder="Enter bank name" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Account number</label>
                <input 
                  type="text" 
                  name="accountNumber" 
                  placeholder="Enter account number" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">IFSC</label>
                <input 
                  type="text" 
                  name="ifsc" 
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
                  placeholder="Enter account holder name" 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>
            </div>
          </div>

          {/* Pricing / Credits */}
          <div className="mb-10">
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Pricing / Credits</h2>
            
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Input Section */}
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

              {/* Receipt Section */}
              <div className="w-full lg:w-[400px] bg-[#fafafa] rounded-2xl border border-gray-100 p-6">
                <h3 className="text-[17px] font-bold text-gray-900 mb-5">Price</h3>
                
                <div className="space-y-3.5 text-[15px] text-gray-600">
                  <div className="flex justify-between">
                    <span>EMI Card ({emiQty} qty:)</span>
                    <span className="font-medium text-gray-800">
                      {isCalculatingPrice ? <span className="animate-pulse bg-gray-200 rounded w-16 h-5 block"></span> : `₹${emiPrice.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verification Credit ({verQty} qty)</span>
                    <span className="font-medium text-gray-800">
                      {isCalculatingPrice ? <span className="animate-pulse bg-gray-200 rounded w-16 h-5 block"></span> : `₹${verPrice.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3.5 flex justify-between font-bold text-gray-900 text-[16px]">
                    <span>Total Payable Amount:</span>
                    <span>
                      {isCalculatingPrice ? <span className="animate-pulse bg-gray-300 rounded w-20 h-6 block"></span> : `₹${totalPayableAmount.toLocaleString('en-IN')}`}
                    </span>
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
              <FileUploadField label="Bank Logo" id="bank-logo" name="bankLogo" onChange={handleFileChange} selectedFile={files.bankLogo} />
              <FileUploadField label="Registration Certificate" id="reg-cert" name="registrationCertificate" onChange={handleFileChange} selectedFile={files.registrationCertificate} />
              <FileUploadField label="Company PAN" id="comp-pan" name="companyPan" onChange={handleFileChange} selectedFile={files.companyPan} />
              <FileUploadField label="Board Resolution" id="board-res" name="boardResolution" onChange={handleFileChange} selectedFile={files.boardResolution} />
              <FileUploadField label="GST / Declaration" id="gst-decl" name="gstDeclaration" onChange={handleFileChange} selectedFile={files.gstDeclaration} />
              <FileUploadField label="Director KYC (Aadhar, PAN etc.)" id="dir-kyc" name="directorKyc" onChange={handleFileChange} selectedFile={files.directorKyc} />
              <FileUploadField label="Cancelled Cheque" id="cancelled-cheque" name="cancelledCheque" onChange={handleFileChange} selectedFile={files.cancelledCheque} />
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-10">
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Payment Method</h2>
            <div className="flex flex-col gap-4 max-w-xl">
              {/* UPI */}
              <div className={`border rounded-xl transition-all ${paymentMethod === 'UPI' ? 'bg-[#eef8f8] border-[#225091]' : 'bg-white border-gray-200'}`}>
                <label className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setPaymentMethod('UPI')}>
                  <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-[#225091]' : 'border-gray-400'}`}>
                    {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-[#225091]"></div>}
                  </div>
                  <Smartphone size={20} className="text-[#225091]" />
                  <span className="font-semibold text-gray-800">UPI</span>
                </label>
              </div>

              {/* Bank Transfer */}
              <div className={`border rounded-xl transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'bg-[#eef8f8] border-[#225091]' : 'bg-white border-gray-200'}`}>
                <label className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setPaymentMethod('BANK_TRANSFER')}>
                  <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'BANK_TRANSFER' ? 'border-[#225091]' : 'border-gray-400'}`}>
                    {paymentMethod === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-[#225091]"></div>}
                  </div>
                  <Landmark size={20} className="text-[#225091]" />
                  <span className="font-semibold text-gray-800">Bank Transfer</span>
                </label>
              </div>

              {/* Cash */}
              <div className={`border rounded-xl transition-all ${paymentMethod === 'CASH' ? 'bg-[#eef8f8] border-[#225091]' : 'bg-white border-gray-200'}`}>
                <label className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setPaymentMethod('CASH')}>
                  <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'CASH' ? 'border-[#225091]' : 'border-gray-400'}`}>
                    {paymentMethod === 'CASH' && <div className="w-2.5 h-2.5 rounded-full bg-[#225091]"></div>}
                  </div>
                  <Banknote size={20} className="text-[#225091]" />
                  <span className="font-semibold text-gray-800">Cash</span>
                  {isOtpVerified && <span className="text-xs text-green-600 font-medium ml-auto">Verified</span>}
                </label>
              </div>

              {/* Card */}
              <div className={`border rounded-xl transition-all ${paymentMethod === 'CARD' ? 'bg-[#eef8f8] border-[#225091]' : 'bg-white border-gray-200'}`}>
                <label className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setPaymentMethod('CARD')}>
                  <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-[#225091]' : 'border-gray-400'}`}>
                    {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full bg-[#225091]"></div>}
                  </div>
                  <CreditCard size={20} className="text-[#225091]" />
                  <span className="font-semibold text-gray-800">Credit / Debit / ATM Card</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 border-t border-gray-100 pt-8">
            <Link to="/co-operative-bank" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px]">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-[#225091] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px] disabled:opacity-70 flex items-center justify-center">
              {isSubmitting ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                 "Create"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* OTP Verification Modal for Cash */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Verify OTP</h3>
            <p className="text-sm text-gray-600 mb-6">
              A 6 digit OTP has been sent to customer mobile number <br/><span className="font-semibold text-[#225091]">XXXXXX3210</span>
            </p>
            <div className="flex justify-center gap-2 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[index] = e.target.value;
                    setOtp(newOtp);
                    if (e.target.value && index < 5) {
                      document.getElementById(`otp-${index + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      document.getElementById(`otp-${index - 1}`)?.focus();
                    }
                  }}
                  className="w-10 h-12 border border-gray-200 rounded-lg text-center text-lg font-bold focus:outline-none focus:border-[#225091] focus:ring-1 focus:ring-[#225091]"
                />
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => { setIsOtpModalOpen(false); navigate('/co-operative-bank'); }}
                disabled={isVerifyingOtp}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (otp.join('').length < 6) {
                    toast.error("Please enter complete OTP.");
                    return;
                  }
                  setIsVerifyingOtp(true);
                  try {
                    const response = await cooperativeBankService.verifyCashOtp({
                      bankId: createdBankId,
                      otp: otp.join('')
                    });
                    if (response.success) {
                      toast.success(response.message || "Cash payment verified successfully.");
                      setIsOtpModalOpen(false);
                      navigate('/co-operative-bank');
                    } else {
                      toast.error(response.message || "Verification failed.");
                    }
                  } catch (error) {
                    console.error("OTP verification failed", error);
                    toast.error(error.response?.data?.message || "OTP verification failed.");
                  } finally {
                    setIsVerifyingOtp(false);
                  }
                }}
                disabled={isVerifyingOtp}
                className="flex-1 py-3 px-4 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#159499] transition-colors text-sm shadow-sm flex items-center justify-center disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Modal */}
      {paymentLinkData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 p-8 text-center">
            <h3 className="text-xl font-bold text-[#1b2559] mb-4">Complete Payment</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bank created successfully. Please complete the online payment to proceed with approval.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 break-all text-[13px] font-mono text-gray-700 text-left">
              {paymentLinkData.link}
            </div>
            <div className="flex flex-col gap-3">
              <a 
                href={paymentLinkData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-sm block"
              >
                Open Payment Link
              </a>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentLinkData.link);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#225091] text-[#225091] font-semibold hover:bg-blue-50/50 transition-colors text-sm"
                >
                  Copy Link
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setPaymentLinkData(null);
                    navigate('/co-operative-bank');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Your payment has been verified. The bank application has been successfully processed.
            </p>
            <button 
              onClick={() => {
                setPaymentSuccessData(null);
                navigate('/co-operative-bank');
              }}
              className="w-full py-3 px-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-sm"
            >
              Go to Bank List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCooperativeBank;
