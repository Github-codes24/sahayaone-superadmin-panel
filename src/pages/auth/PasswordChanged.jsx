import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import advitaLogo from '../../assets/advita-logo.png';

const PasswordChanged = () => {
  return (
    <AuthLayout welcomeHeading={"WELCOME TO\nADVITA SUPER ADMIN PORTAL"}>
      {/* Top Logo Badge inside Card */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-2 flex items-center justify-center shrink-0 w-[54px] h-[54px] mb-3.5">
          <img src={advitaLogo} alt="Advita Credit" className="w-full h-full object-contain" />
        </div>

        <div className="mb-3.5 mt-1 text-[#1B4E8C]">
          <BadgeCheck className="w-16 h-16 text-[#1B4E8C]" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-[22px] sm:text-[24px] font-black tracking-wide uppercase leading-tight">
          <span className="text-[#1B4E8C]">PASSWORD </span>
          <span className="text-[#EF3B3A]">CHANGED</span>
        </h2>
        
        <p className="text-[13px] text-gray-500 font-medium mt-1.5 max-w-sm px-2 leading-relaxed">
          Your password has been successfully updated. You can now use your new credentials to log in.
        </p>
      </div>

      <Link
        to="/login"
        className="w-full inline-block py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] text-white font-bold text-[15px] text-center rounded-[14px] transition-all shadow-lg shadow-[#1B4E8C]/25"
      >
        Login Now
      </Link>
    </AuthLayout>
  );
};

export default PasswordChanged;
