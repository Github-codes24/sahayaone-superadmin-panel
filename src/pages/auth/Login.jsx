import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import useAuthStore from '../../store/authStore';
import { authService } from '../../api/authService';
import loginIllustration from '../../assets/images/login.png';
import { UserCog, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/validation';
import advitaLogo from '../../assets/advita-logo.png';

const Login = () => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ 
    role: 'SUPER_ADMIN', 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await authService.getRoles();
        if (response.success && response.data) {
          setRoles(response.data);
          if (response.data.length > 0) {
            setFormData(prev => ({ ...prev, role: response.data[0].value }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error);
      return;
    }

    const passwordCheck = validatePassword(formData.password, { minLength: 6 });
    if (!passwordCheck.isValid) {
      setError(passwordCheck.error);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(formData);
      if (response.success && response.data) {
        const user = response.data.user;
        const accessToken = response.data.accessToken || response.data.tokens?.accessToken || response.data.token;
        const refreshToken = response.data.refreshToken || response.data.tokens?.refreshToken || null;
        login(user, accessToken, refreshToken);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.details && err.response.data.details.length > 0) {
        setError(`Validation Error: ${err.response.data.details.map(d => d.message).join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
      }
      console.error('Login Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      welcomeHeading={"WELCOME TO\nADVITA SUPER ADMIN PORTAL"}
      illustration={<img src={loginIllustration} alt="Login Illustration" className="w-full h-auto object-contain drop-shadow-xl" />}
    >
      {/* Top Logo Badge inside Card */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-2 flex items-center justify-center shrink-0 w-[54px] h-[54px] mb-3.5">
          <img src={advitaLogo} alt="Advita Credit" className="w-full h-full object-contain" />
        </div>

        <h2 className="text-[22px] sm:text-[24px] font-black tracking-wide uppercase leading-tight">
          <span className="text-[#1B4E8C]">SUPER ADMIN </span>
          <span className="text-[#EF3B3A]">PORTAL</span>
        </h2>
        <p className="text-[13px] text-gray-500 font-medium mt-1.5 leading-normal">
          Sign in with your registered administrator credentials.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
          <AlertCircle className="text-red-500 w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        {roles.length > 0 && (
          <div className="flex justify-center gap-4 mb-3">
            {roles.map((roleOpt) => (
              <button
                key={roleOpt.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: roleOpt.value })}
                className={`flex flex-col items-center justify-center py-3.5 px-6 rounded-2xl transition-all border-2 cursor-pointer ${
                  formData.role === roleOpt.value
                    ? 'bg-[#1B4E8C] text-white border-[#1B4E8C] shadow-md shadow-[#1B4E8C]/20 scale-[1.02]'
                    : 'bg-[#F0F5FA] text-gray-700 border-transparent hover:bg-[#E4EDF7]'
                }`}
              >
                <div className={`p-2 rounded-xl mb-1.5 ${formData.role === roleOpt.value ? 'bg-white/20 text-white' : 'bg-white text-[#1B4E8C] shadow-xs'}`}>
                  {roleOpt.value === 'SUPER_ADMIN' ? <UserCog size={22} strokeWidth={2} /> : <User size={22} strokeWidth={2} />}
                </div>
                <span className="font-bold text-[13px] tracking-wide">{roleOpt.name}</span>
              </button>
            ))}
          </div>
        )}

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
            placeholder="Enter admin email"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-4 pr-12 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1B4E8C] transition-colors focus:outline-none"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right pt-0.5">
          <Link to="/forgot-password" className="text-[12.5px] font-bold text-[#1B4E8C] hover:text-[#EF3B3A] transition-colors">
            Forget Password ?
          </Link>
        </div>

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
              <span>Logging in...</span>
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
