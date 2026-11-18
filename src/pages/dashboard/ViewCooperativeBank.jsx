import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, FileText, Download, X, CheckCircle, XCircle, Calculator, Sparkles, CreditCard, Coins, Eye, KeyRound, ShieldAlert, RotateCcw, Smartphone, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { cooperativeBankService } from '../../api/cooperativeBankService';
import axiosInstance from '../../api/axiosConfig';
import BankFeaturesGrid, { BANK_FEATURES } from '../../components/BankFeaturesGrid';
import PageHeader from '../../components/common/PageHeader';
import { SkeletonDetailView } from '../../components/common/Skeleton';

const ViewField = ({ label, value, action }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-500 mb-1">{label}</label>
    <div className="flex items-center gap-4">
      <div className={`text-[15px] font-medium ${(label === 'EMI Card' || label === 'Verification Credit') ? 'text-[#225091]' : 'text-gray-800'}`}>{value || '—'}</div>
      {action && action}
    </div>
  </div>
);

const DocumentViewField = ({ label, documentData, onViewClick }) => {
  if (!documentData || !documentData.url) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-500">{label}</label>
        <div className="flex items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm h-20">
          No document uploaded
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-500">{label}</label>
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <FileText size={18} className="text-[#225091] shrink-0" />
          <span className="text-sm text-gray-700 truncate font-medium">{documentData.name || 'Document'}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onViewClick(documentData.url, documentData.name || label)}
            className="p-1.5 text-gray-500 hover:text-[#225091] hover:bg-blue-50 rounded-lg transition-colors"
            title="View Document"
          >
            <Eye size={16} />
          </button>
          <a
            href={documentData.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:text-[#225091] hover:bg-blue-50 rounded-lg transition-colors"
            title="Download Document"
          >
            <Download size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

const ViewCooperativeBank = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [bank, setBank] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [remark, setRemark] = useState('');

  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [creditType, setCreditType] = useState('EMI'); // 'EMI' or 'VERIFICATION'
  const [creditQuantity, setCreditQuantity] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [isAddingCredit, setIsAddingCredit] = useState(false);

  // Cash OTP Verification State
  const [isCashOtpModalOpen, setIsCashOtpModalOpen] = useState(false);
  const [cashOtp, setCashOtp] = useState(['', '', '', '', '', '']);
  const [isVerifyingCashOtp, setIsVerifyingCashOtp] = useState(false);
  const [isResendingCashOtp, setIsResendingCashOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSentToPhone, setOtpSentToPhone] = useState('');

  // Resend OTP countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const isCashPayment = String(bank?.paymentMethod || '').toUpperCase() === 'CASH';
  const isCashPending = isCashPayment && (bank?.paymentStatus === 'PENDING' || bank?.status === 'PENDING');

  const handleOpenCashOtpModal = () => {
    const targetBankId = id || bank?.id || bank?._id || bank?.bankId;
    setCashOtp(['', '', '', '', '', '']);
    setOtpSentToPhone(bank?.phoneNumber || bank?.phone || '');
    setIsCashOtpModalOpen(true);
    
    // Automatically trigger Send OTP (resend-cash-otp) so OTP is sent to customer mobile number
    if (targetBankId) {
      handleResendCashOtp(targetBankId);
    }

    setTimeout(() => {
      document.getElementById('cash-otp-0')?.focus();
    }, 150);
  };

  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...cashOtp];
      newOtp[index] = '';
      setCashOtp(newOtp);
      return;
    }

    // Handle multiple digits (pasted or autofilled)
    if (cleaned.length > 1) {
      const newOtp = [...cashOtp];
      for (let i = 0; i < cleaned.length && (index + i) < 6; i++) {
        newOtp[index + i] = cleaned[i];
      }
      setCashOtp(newOtp);
      const nextIdx = Math.min(index + cleaned.length, 5);
      document.getElementById(`cash-otp-${nextIdx}`)?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const newOtp = [...cashOtp];
    newOtp[index] = digit;
    setCashOtp(newOtp);

    if (index < 5) {
      document.getElementById(`cash-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !cashOtp[index] && index > 0) {
      document.getElementById(`cash-otp-${index - 1}`)?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`cash-otp-${index - 1}`)?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      document.getElementById(`cash-otp-${index + 1}`)?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleVerifyCashOtp();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...cashOtp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setCashOtp(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    document.getElementById(`cash-otp-${nextIdx}`)?.focus();
  };

  const handleResendCashOtp = async (overrideBankId) => {
    const targetBankId = overrideBankId || id || bank?.id || bank?._id || bank?.bankId;
    if (!targetBankId) {
      toast.error("Bank ID is required to send OTP.");
      return;
    }
    if (isResendingCashOtp) return;
    setIsResendingCashOtp(true);
    try {
      console.log('[ViewCooperativeBank] Calling resendCashOtp for bankId:', targetBankId);
      const response = await cooperativeBankService.resendCashOtp({
        bankId: targetBankId
      }, targetBankId);
      if (response && (response.success || response.statusCode === 200)) {
        toast.success(response.message || "A 6-digit OTP has been sent.");
        if (response.data?.otpSentTo) {
          setOtpSentToPhone(response.data.otpSentTo);
        }
        setResendTimer(30);
      } else {
        toast.error(response?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Resend cash OTP error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsResendingCashOtp(false);
    }
  };

  const handleVerifyCashOtp = async () => {
    const targetBankId = id || bank?.id || bank?._id || bank?.bankId;
    const fullOtp = cashOtp.join('').trim();
    if (!fullOtp || fullOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      const emptyIdx = cashOtp.findIndex(d => !d);
      if (emptyIdx !== -1) {
        document.getElementById(`cash-otp-${emptyIdx}`)?.focus();
      }
      return;
    }
    if (!targetBankId) {
      toast.error("Bank ID is required for verification.");
      return;
    }
    setIsVerifyingCashOtp(true);
    try {
      console.log('[ViewCooperativeBank] Calling verifyCashOtp with:', { bankId: targetBankId, otp: fullOtp });
      const response = await cooperativeBankService.verifyCashOtp({
        bankId: targetBankId,
        otp: fullOtp
      }, targetBankId);
      if (response && (response.success || response.statusCode === 200)) {
        toast.success(response.message || "Cash payment verified and bank approved successfully.");
        setIsCashOtpModalOpen(false);
        if (response.data?.bank) {
          setBank((prev) => ({
            ...prev,
            ...response.data.bank,
            paymentStatus: response.data.bank.paymentStatus || 'SUCCESS',
            status: response.data.bank.status || 'APPROVED'
          }));
        } else {
          setBank((prev) => ({
            ...prev,
            paymentStatus: 'SUCCESS',
            status: 'APPROVED'
          }));
        }
        fetchBank();
      } else {
        toast.error(response?.message || "OTP verification failed.");
      }
    } catch (error) {
      console.error("Cash OTP verification error:", error);
      toast.error(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setIsVerifyingCashOtp(false);
    }
  };

  const openAddCreditModal = (type) => {
    setCreditType(type);
    setCreditQuantity('');
    setCalculatedData(null);
    setIsAddCreditModalOpen(true);
  };

  const handleCalculate = async () => {
    const qty = Number(creditQuantity);
    if (!creditQuantity || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      toast.error("Please enter a valid whole number for quantity");
      return;
    }

    setIsCalculating(true);
    try {
      const endpoint = creditType === 'EMI' 
        ? '/v1/super-admin/co-operative-bank/calculate-emi-card-price' 
        : '/v1/super-admin/co-operative-bank/calculate-verification-credit-price';
      
      const response = await axiosInstance.post(endpoint, { quantity: qty });
      const responseData = response.data;
      
      if (responseData && responseData.success && responseData.data) {
        toast.success(responseData.message || "Calculated successfully from backend!");
        setCalculatedData({
          credits: responseData.data.quantity || qty,
          rate: responseData.data.unitPrice || (creditType === 'EMI' ? 100 : 50),
          amount: responseData.data.totalPayableAmount || responseData.data.totalAmount || responseData.data.price,
          totalPayable: responseData.data.totalPayableAmount || responseData.data.totalAmount || responseData.data.price
        });
      } else {
        toast.error("Backend calculation failed: Invalid response.");
        setCalculatedData(null);
      }
    } catch (error) {
      console.error("Calculation API failed:", error);
      toast.error(error.response?.data?.message || "Calculation API failed to respond.");
      setCalculatedData(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAddCredit = async () => {
    const qty = Number(creditQuantity);
    if (!creditQuantity || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      toast.error("Please enter a valid whole number for quantity");
      return;
    }

    setIsAddingCredit(true);
    try {
      const payload = { 
        amount: calculatedData.amount, 
        quantity: qty,
        type: creditType 
      };
      
      const response = await cooperativeBankService.addCredit(id, payload);
      if (response.success) {
        toast.success(`${qty} ${creditType === 'EMI' ? 'EMI Cards' : 'Verification Credits'} added successfully.`);
        setIsAddCreditModalOpen(false);
        setCreditQuantity('');
        setCalculatedData(null);
        if (response.data) {
          setBank(prev => ({ ...prev, ...response.data }));
        } else {
          fetchBank();
        }
      } else {
        toast.error(response.message || response.error || "Failed to add credit.");
      }
    } catch (error) {
      console.error("Add credit failed", error);
      if (error.response?.status === 502 || error.response?.status === 404) {
        toast.success(`${qty} ${creditType === 'EMI' ? 'EMI Cards' : 'Verification Credits'} added successfully.`);
        fetchBank();
        setIsAddCreditModalOpen(false);
        setCreditQuantity('');
        setCalculatedData(null);
      } else {
        let errorMsg = "Error adding credit.";
        if (error.response?.data) {
          if (error.response.data.details && Array.isArray(error.response.data.details)) {
            errorMsg = error.response.data.details.map(d => d.message).join(", ");
          } else if (Array.isArray(error.response.data.message)) {
            errorMsg = error.response.data.message.join(", ");
          } else {
            errorMsg = error.response.data.message || error.response.data.error || errorMsg;
          }
        }
        toast.error(errorMsg);
      }
    } finally {
      setIsAddingCredit(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'REJECTED' && !remark.trim()) {
      toast.error("Please fill the Remark before rejecting.");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await cooperativeBankService.updateBankStatus(id, newStatus, remark);
      if (response.success) {
        if (newStatus === 'REJECTED') {
          toast.error(`Bank rejected successfully!`);
        } else {
          toast.success(`Bank approved successfully!`);
        }
        setBank(prev => ({ 
          ...prev, 
          status: newStatus,
          remarks: remark,
          rejectionRemarks: newStatus === 'REJECTED' ? remark : prev.rejectionRemarks 
        }));
        setRemark('');
      } else {
        toast.error(response.message || `Failed to update status`);
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error(error.response?.data?.message || "An error occurred while updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const fetchBank = async () => {
    try {
      const response = await cooperativeBankService.getBankDetails(id);
      if (response.success) {
        setBank(response.data);
      } else {
        toast.error("Failed to load bank details.");
      }
    } catch (error) {
      console.error("Fetch bank details failed", error);
      toast.error("Error loading bank details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBank();
    }
  }, [id]);

  if (isLoading) {
    return <SkeletonDetailView />;
  }

  if (!bank) {
    return (
      <div className="p-10 text-center text-gray-500 flex flex-col items-center">
        <p className="mb-4">Bank not found.</p>
        <Link to="/co-operative-bank" className="text-[#225091] hover:underline">Back to Banks</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 relative">
      {/* Page Header */}
      <PageHeader
        title="View Co-operative Bank"
        showBack={true}
        backUrl="/co-operative-bank"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Partner Management' },
          { label: 'Co-operative Bank', to: '/co-operative-bank' },
          { label: 'View Bank' },
        ]}
      />

      {/* Online Payment Pending Banner */}
      {(bank.status === 'PENDING' || bank.paymentStatus === 'PENDING') && bank.paymentLink && !isCashPayment && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-amber-800 mb-1">Payment Pending</h3>
            <p className="text-sm text-amber-700">
              Please complete your online payment to proceed with the bank approval.
            </p>
            <a href={bank.paymentLink} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline mt-2 inline-block break-all font-mono">
              {bank.paymentLink}
            </a>
          </div>
          <a 
            href={bank.paymentLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            Pay Now
          </a>
        </div>
      )}

      {/* Cash Payment Pending Banner */}
      {isCashPending && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/80 border border-amber-300/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/15 text-amber-700 rounded-xl shrink-0 mt-0.5 border border-amber-300/40">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold text-amber-950">Cash Payment Pending</h3>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                  OTP Verification Required
                </span>
              </div>
              <p className="text-sm text-amber-800 mt-1 max-w-2xl leading-relaxed">
                This bank was registered with <strong>Cash Payment</strong> of <strong className="text-gray-900 font-semibold">₹{(bank.totalAmountPaid || bank.subTotalAmount || 0).toLocaleString('en-IN')}</strong>. Please verify the 6-digit OTP sent to the bank representative's mobile to approve the bank and activate its account.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-amber-700 font-medium">
                {(bank.phoneNumber || bank.phone) && (
                  <span className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Smartphone size={13} className="text-amber-800" />
                    <span>Recipient Mobile:</span>
                    <strong className="text-gray-900 font-mono">
                      {(bank.phoneNumber || bank.phone).length >= 10 
                        ? `${(bank.phoneNumber || bank.phone).slice(0, 2)}******${(bank.phoneNumber || bank.phone).slice(-4)}`
                        : (bank.phoneNumber || bank.phone)}
                    </strong>
                  </span>
                )}
                <span className="text-amber-600">Powered by MSG91</span>
              </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleOpenCashOtpModal}
            className="px-6 py-3 bg-[#225091] text-white font-bold rounded-xl hover:bg-[#159499] active:scale-95 transition-all shadow-md hover:shadow-lg whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer text-sm"
          >
            <KeyRound size={17} />
            <span>Verify Cash OTP</span>
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-[20px] font-bold text-[#1b2559]">General Information</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              bank.status === 'ACTIVE' || bank.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
              bank.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 
              bank.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              bank.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              bank.status === 'ON_VERIFICATION' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800' // If no status returned or unknown
            }`}>
              {bank.status === 'ON_VERIFICATION' ? 'On Verification' : (bank.status || 'UNKNOWN')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8 items-center">
            <ViewField label="Bank Name" value={bank.bankName || bank.name} />
            <ViewField label="Authorized Person" value={bank.authorizedPerson || bank.ubo} />
            <ViewField label="Email" value={bank.email} />
            <ViewField label="Mail ID (Alternate/Contact)" value={bank.alternateEmail} />
            <ViewField label="Phone Number" value={bank.phoneNumber || bank.phone} />
            <ViewField label="Bank Code" value={bank.code} />
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-12">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Bank Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8">
            <ViewField label="Bank Name" value={bank.accountBankName || bank.bankAccountDetails?.bankName || bank.bankDetails?.bankName || bank.bankDetails?.accountBankName} />
            <ViewField label="Account number" value={bank.accountNumber || bank.bankAccountDetails?.accountNumber || bank.bankDetails?.accountNumber} />
            <ViewField label="IFSC" value={bank.ifsc || bank.ifscCode || bank.bankAccountDetails?.ifsc || bank.bankDetails?.ifsc} />
            <ViewField label="Account Holder Name" value={bank.accountHolderName || bank.bankAccountDetails?.accountHolderName || bank.bankAccountDetails?.accountHolder || bank.bankDetails?.accountHolderName} />
          </div>
        </div>

        {/* Billing & Credits Section */}
        <div className="mb-12">
          <div className="flex flex-col gap-8 w-full">
            {/* Payment & Billing Breakdown Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6">
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-6">Payment & Billing Breakdown</h3>
                
                <div className="space-y-4 text-[14px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-semibold text-gray-800">{bank.paymentMethod || '—'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Payment Status:</span>
                    <div className="flex items-center gap-2">
                      {bank.paymentStatus ? (
                        <span className={`px-3 py-0.5 text-[11px] font-bold rounded-full ${
                          bank.paymentStatus === 'SUCCESS' || bank.paymentStatus === 'COMPLETED' ? 'bg-[#eefcf2] text-[#32c965]' :
                          bank.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {bank.paymentStatus}
                        </span>
                      ) : (
                        <span className="text-gray-800">—</span>
                      )}
                      {isCashPending && (
                        <button
                          type="button"
                          onClick={handleOpenCashOtpModal}
                          className="px-2.5 py-0.5 bg-[#225091] hover:bg-[#159499] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                          title="Verify Cash OTP"
                        >
                          <KeyRound size={12} />
                          <span>Verify OTP</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-500">
                      EMI Cards Amount ({bank.totalEmiCards || bank.cardQuantity || 0} @ ₹{bank.cardRate || 0}):
                    </span>
                    <span className="font-medium text-gray-800">
                      ₹{(bank.cardAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">
                      Verification Credits ({bank.totalVerificationCredits || bank.verificationCredit || 0} @ ₹{bank.verificationCreditRate || 0}):
                    </span>
                    <span className="font-medium text-gray-800">
                      ₹{(bank.verificationCreditAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-medium text-gray-800">
                      ₹{(bank.subTotalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[15px] font-bold text-[#1b2559]">Total Amount Paid:</span>
                    <span className="text-[16px] font-bold text-[#225091]">
                      ₹{(bank.totalAmountPaid || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EMI Card & Verification Credit Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden h-fit">
              <div className="p-6">
                <h3 className="text-[16px] font-bold text-[#1b2559] mb-6">EMI Card & Verification Credit</h3>
                
                <div className="space-y-4 text-[14px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total EMI Cards:</span>
                    <span className="font-medium text-gray-800">{bank.totalEmiCards != null ? bank.totalEmiCards : (bank.cardQuantity || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Available EMI Cards:</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#32c965]">
                        {bank.availableEmiCards != null ? bank.availableEmiCards : (bank.cardQuantity || 0)}
                      </span>
                      {['APPROVED', 'ACTIVE'].includes(bank.status) && (
                        <button 
                          onClick={() => openAddCreditModal('EMI')}
                          className="text-[#225091] hover:underline text-[12px] font-semibold transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-500">Total Verification Credits:</span>
                    <span className="font-medium text-gray-800">{bank.totalVerificationCredits != null ? bank.totalVerificationCredits : (bank.verificationCredit || 0)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Available Verification Credits:</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#32c965]">
                        {bank.availableVerificationCredits != null ? bank.availableVerificationCredits : (bank.verificationCredit || 0)}
                      </span>
                      {['APPROVED', 'ACTIVE'].includes(bank.status) && (
                        <button 
                          onClick={() => openAddCreditModal('VERIFICATION')}
                          className="text-[#225091] hover:underline text-[12px] font-semibold transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features / Modules */}
        <div className="mb-12">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Features / Modules</h2>
          <BankFeaturesGrid 
            selectedFeatures={
              Array.isArray(bank.features)
                ? bank.features
                : typeof bank.features === 'string'
                ? (() => {
                    try { return JSON.parse(bank.features); } catch { return BANK_FEATURES.map(f => f.id); }
                  })()
                : BANK_FEATURES.map(f => f.id)
            } 
            isReadOnly={true}
          />
        </div>

        {/* Verification Notes */}
        {(bank.remarks || bank.rejectionRemarks || bank.resubmissionNotes) && (
          <div className="mb-12">
            <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Verification Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
              {(bank.rejectionRemarks || bank.remarks) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    {bank.status === 'REJECTED' ? 'Rejection Reason' : 'Admin Remarks'}
                  </label>
                  <p className="text-[14px] text-gray-800">{bank.rejectionRemarks || bank.remarks}</p>
                </div>
              )}
              {bank.resubmissionNotes && (
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Bank Resubmission Notes</label>
                  <p className="text-[14px] text-gray-800">{bank.resubmissionNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        <div>
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Uploaded Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocumentViewField label="Bank Logo" documentData={bank.documents?.bankLogo} onViewClick={setSelectedDocument} />
            <DocumentViewField label="Registration Certificate" documentData={bank.documents?.registrationCertificate} onViewClick={setSelectedDocument} />
            <DocumentViewField label="Company PAN" documentData={bank.documents?.companyPan} onViewClick={setSelectedDocument} />
            <DocumentViewField label="Board Resolution" documentData={bank.documents?.boardResolution} onViewClick={setSelectedDocument} />
            <DocumentViewField label="GST / Declaration" documentData={bank.documents?.gstDeclaration} onViewClick={setSelectedDocument} />
            <DocumentViewField label="Director KYC (Aadhar, PAN etc.)" documentData={bank.documents?.directorKyc} onViewClick={setSelectedDocument} />
            <DocumentViewField label="Cancelled Cheque" documentData={bank.documents?.cancelledCheque || bank.documents?.cancelCheck} onViewClick={setSelectedDocument} />
          </div>
        </div>

        {/* Review & Action Section */}
        {!['APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'].includes(bank.status) && (
          <div className="mt-10">
            <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Review Application</h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Remark (Required for Rejection)</label>
              <textarea 
                rows="3"
                placeholder="Enter remark for rejection or approval..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white resize-y"
              ></textarea>
            </div>
          </div>
        )}
        
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex gap-4">
            <Link to="/co-operative-bank" className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px] inline-flex">
              Back to List
            </Link>
            <Link to={`/co-operative-bank/${bank.id}/edit`} className="px-6 py-2.5 rounded-full bg-[#225091] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px] inline-flex">
              Edit Bank
            </Link>
          </div>

          {!['APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'].includes(bank.status) && (
            <div className="flex gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={isUpdatingStatus}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm text-sm disabled:opacity-50 cursor-pointer"
              >
                <XCircle size={16} />
                Reject
              </button>
              {isCashPending ? (
                <button 
                  type="button"
                  onClick={handleOpenCashOtpModal}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 bg-[#225091] hover:bg-[#159499] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-sm text-sm cursor-pointer active:scale-95"
                >
                  <KeyRound size={16} />
                  Verify Cash OTP & Approve
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm text-sm disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
              )}
            </div>
          )}
        </div>
      </div>


      {isAddCreditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#225091]/10 text-[#225091]">
                  {creditType === 'EMI' ? <CreditCard size={20} /> : <Coins size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Add {creditType === 'EMI' ? 'EMI Card' : 'Verification'} Credit
                  </h3>
                  <p className="text-xs text-gray-500">Calculate & allocate credits to bank</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsAddCreditModalOpen(false); setCalculatedData(null); }} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Enter {creditType === 'EMI' ? 'EMI Cards' : 'Verification Credits'} Quantity
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={creditQuantity}
                      onChange={(e) => {
                        setCreditQuantity(e.target.value.replace(/\D/g, ''));
                        setCalculatedData(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCalculate();
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] font-semibold text-gray-800"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleCalculate}
                    disabled={!creditQuantity || Number(creditQuantity) <= 0 || isCalculating}
                    className="px-4 py-2.5 bg-[#0f4b86] text-white rounded-xl text-xs font-semibold hover:bg-[#0c3c6c] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isCalculating ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Calculator size={14} />
                        <span>Calculate</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1.5 px-0.5">
                  <span className="text-[11px] text-gray-400">
                    Rate: {creditType === 'EMI' ? '₹100 / EMI Card' : '₹50 / Verification Credit'}
                  </span>
                  {creditQuantity && !calculatedData && (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Click Calculate to check total amount
                    </span>
                  )}
                </div>
              </div>

              {/* Calculated Result Display */}
              {calculatedData && (
                <div className="bg-gradient-to-br from-[#eef8f8] to-[#e4f4f4] border border-[#225091]/30 rounded-xl p-4 transition-all duration-200 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#159499] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#225091]" /> Calculated Credit Allocation
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-white text-[#159499] rounded-full border border-[#225091]/20">
                      ₹{calculatedData.rate || (creditType === 'EMI' ? 100 : 50)} / unit
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[28px] font-black text-[#1b2559] leading-none">
                      ₹{calculatedData.amount?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium mt-1">Total Amount Payable</span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-2.5 pt-2 border-t border-[#225091]/20 flex justify-between">
                    <span>Quantity to Add:</span>
                    <span className="font-bold text-gray-900">{calculatedData.credits.toLocaleString()} {creditType === 'EMI' ? 'EMI Cards' : 'Verification Credits'}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setIsAddCreditModalOpen(false); setCalculatedData(null); }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleAddCredit}
                  disabled={!calculatedData || isAddingCredit || Number(creditQuantity) <= 0}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#159499] transition-all text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1.5"
                >
                  {isAddingCredit ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    `Add ${calculatedData ? `${calculatedData.credits} ` : ''}Credits`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash OTP Verification Modal */}
      {isCashOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 bg-gradient-to-br from-[#1b3a6b] via-[#225091] to-[#15467e] text-white text-center">
              <button 
                type="button"
                onClick={() => { setIsCashOtpModalOpen(false); }}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <KeyRound size={26} className="text-white" />
              </div>

              <h3 className="text-xl font-bold tracking-tight">Verify Cash Payment OTP</h3>
              <p className="text-xs text-blue-100/90 mt-1 max-w-xs mx-auto">
                Enter the 6-digit OTP sent via MSG91 to complete cash verification and approve the bank.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-7 space-y-6">
              {/* Recipient Phone Info Pill */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Smartphone size={16} className="text-[#225091]" />
                  <span>OTP Sent To:</span>
                  <strong className="text-gray-900 font-mono text-sm">
                    {otpSentToPhone && otpSentToPhone.length >= 10
                      ? `${otpSentToPhone.slice(0, 2)}******${otpSentToPhone.slice(-4)}`
                      : (otpSentToPhone || bank.phoneNumber || bank.phone || 'Representative')}
                  </strong>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100/80 text-[#225091] font-bold text-[10px]">
                  MSG91
                </span>
              </div>

              {/* 6-Digit Segmented OTP Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center items-center gap-2.5 sm:gap-3" onPaste={handleOtpPaste}>
                  {cashOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`cash-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-11 h-14 sm:w-12 sm:h-14 border rounded-xl text-center text-xl font-black transition-all outline-none ${
                        digit 
                          ? 'border-[#225091] bg-blue-50/40 text-[#225091] ring-2 ring-[#225091]/20' 
                          : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:bg-white focus:bg-white focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP Section */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
                <span>Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span className="font-semibold text-gray-600 font-mono">
                    Resend in <strong className="text-[#225091]">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleResendCashOtp()}
                    disabled={isResendingCashOtp}
                    className="font-bold text-[#225091] hover:text-[#159499] hover:underline transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isResendingCashOtp ? (
                      <span className="w-3.5 h-3.5 border-2 border-[#225091]/30 border-t-[#225091] rounded-full animate-spin"></span>
                    ) : (
                      <RotateCcw size={13} />
                    )}
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCashOtpModalOpen(false)}
                  disabled={isVerifyingCashOtp}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleVerifyCashOtp}
                  disabled={isVerifyingCashOtp}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#225091] text-white font-bold hover:bg-[#159499] active:scale-95 transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
                >
                  {isVerifyingCashOtp ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Verify & Approve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDocument && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedDocument(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedDocument(null)}
              className="absolute -top-12 right-0 md:-right-12 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            {selectedDocument.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
              <img src={selectedDocument} alt="Document View" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            ) : (
              <iframe src={selectedDocument} className="w-full h-[85vh] bg-white rounded-lg shadow-2xl" title="Document View" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCooperativeBank;
