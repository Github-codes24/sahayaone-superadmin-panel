import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BadgeCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { authService } from '../../api/authService';
import resetIllustration from '../../assets/images/reset-password.png';
import advitaLogo from '../../assets/advita-logo.png';

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword({ 
        email, 
        password: passwords.newPassword, 
        confirmPassword: passwords.confirmPassword 
      });
      if (response.success) {
        setShowModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout 
        welcomeHeading={"WELCOME TO\nADVITA SUPER ADMIN PORTAL"}
        illustration={<img src={resetIllustration} alt="Reset Password Illustration" className="w-full h-auto object-contain drop-shadow-xl" />}
      >
        {/* Top Logo Badge inside Card */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-2 flex items-center justify-center shrink-0 w-[54px] h-[54px] mb-3.5">
            <img src={advitaLogo} alt="Advita Credit" className="w-full h-full object-contain" />
          </div>

          <h2 className="text-[22px] sm:text-[24px] font-black tracking-wide uppercase leading-tight">
            <span className="text-[#1B4E8C]">RESET </span>
            <span className="text-[#EF3B3A]">PASSWORD</span>
          </h2>
          <p className="text-[13px] text-gray-500 font-medium mt-1.5 leading-normal">
            Please enter your new password (minimum 6 characters)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
            <AlertCircle className="text-red-500 w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                required
                value={passwords.newPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1B4E8C] transition-colors focus:outline-none"
              >
                {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1B4E8C] transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] active:scale-[0.99] disabled:opacity-70 text-white font-bold rounded-[14px] shadow-lg shadow-[#1B4E8C]/25 hover:shadow-xl transition-all flex justify-center items-center text-[15px] tracking-wide cursor-pointer"
          >
            {loading ? 'Updating Password...' : 'Set Password'}
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

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-opacity">
          <div className="bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 transition-transform animate-in fade-in zoom-in duration-300">
            <div className="mb-3.5 text-[#1B4E8C]">
              <BadgeCheck className="w-16 h-16 text-[#1B4E8C]" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-[20px] font-black text-gray-900 mb-1.5 leading-tight uppercase">
              Password Changed<br />Successfully!
            </h2>
            
            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
              Your password has been successfully updated. You can now use your new credentials to log in.
            </p>

            <Link
              to="/login"
              className="w-full py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] text-white font-bold text-[15px] rounded-[14px] transition-colors shadow-md shadow-[#1B4E8C]/20 text-center"
            >
              Login Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPassword;
