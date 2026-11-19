import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pencil, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { authService } from '../../api/authService';
import otpIllustration from '../../assets/images/enter-otp.png';
import sahayaoneLogo from '../../assets/sahayaone-logo.png';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    setError(null);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await authService.resendOtp(email);
      if (response.success) {
        setSuccessMsg('A new OTP has been sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const response = await authService.verifyOtp({ email, otp: otpString });
      if (response.success) {
        navigate('/reset-password', { state: { email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      welcomeHeading={"WELCOME TO\nSAHAYAONE SUPER ADMIN PORTAL"}
      illustration={<img src={otpIllustration} alt="Verify OTP Illustration" className="w-full h-auto object-contain drop-shadow-xl" />}
    >
      {/* Top Logo Badge inside Card */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-1 flex items-center justify-center shrink-0 w-[160px] h-[56px] mb-3.5">
          <img src={sahayaoneLogo} alt="Sahayaone" className="w-full h-full object-contain object-center" />
        </div>

        <h2 className="text-[22px] sm:text-[24px] font-black tracking-wide uppercase leading-tight">
          <span className="text-[#1B4E8C]">VERIFY </span>
          <span className="text-[#EF3B3A]">OTP</span>
        </h2>
        <p className="text-[13px] text-gray-500 font-medium mt-1.5 leading-normal">
          A 6-digit OTP has been sent to
          <span className="text-[#1B4E8C] font-bold flex items-center justify-center gap-1.5 mt-0.5 text-[13.5px]">
            {email || 'your email'}
            <Link to="/forgot-password" className="text-[#EF3B3A] hover:opacity-80 p-0.5 transition-opacity">
              <Pencil size={13} />
            </Link>
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium w-full">
          <AlertCircle className="text-red-500 w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {successMsg && (
        <div className="mb-4 p-3.5 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-center gap-2.5 text-xs text-green-700 font-medium w-full">
          <CheckCircle2 className="text-green-500 w-4 h-4 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center w-full">
        <div className="flex justify-center gap-2 sm:gap-2.5 mb-1 w-full">
          {otp.map((data, index) => (
            <input
              className="w-11 h-13 sm:w-12 sm:h-13 rounded-[14px] text-center text-xl font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#1B4E8C]/10 focus:border-[#1B4E8C] bg-[#EEF4FA] focus:bg-white transition-all border border-transparent shadow-xs"
              type="text"
              name="otp"
              maxLength="1"
              key={index}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <p className="text-[13px] text-gray-500 my-1 font-medium">
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={handleResend}
            disabled={resending}
            className={`text-[#1B4E8C] font-bold hover:text-[#EF3B3A] transition-colors ${resending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] active:scale-[0.99] disabled:opacity-70 text-white font-bold rounded-[14px] shadow-lg shadow-[#1B4E8C]/25 hover:shadow-xl transition-all flex justify-center items-center text-[15px] tracking-wide cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[13px] text-gray-500 font-medium">
          Remember Password ?{' '}
          <Link to="/login" className="text-[#1B4E8C] hover:text-[#EF3B3A] font-bold transition-colors">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
