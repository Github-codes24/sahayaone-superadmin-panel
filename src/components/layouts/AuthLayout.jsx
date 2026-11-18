import React from 'react';
import sahayaoneLogo from '../../assets/sahayaone-logo.png';

const AuthLayout = ({ children, illustration, welcomeHeading = "WELCOME TO\nSAHAYAONE SUPER ADMIN PORTAL" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b4e8c] via-[#174378] to-[#133866] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans antialiased select-none">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        
        {/* Left Side: Branding & Illustration */}
        <div className="hidden lg:flex flex-1 flex-col items-start justify-center pl-4 max-w-xl">
          {/* Header Banner with Logo and Welcome Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white rounded-[16px] shadow-lg p-2.5 flex items-center justify-center shrink-0 w-[60px] h-[60px] border border-white/20">
              <img src={sahayaoneLogo} alt="Sahayaone" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-white text-2xl xl:text-[28px] font-black tracking-wider uppercase leading-tight whitespace-pre-line drop-shadow-md">
                {welcomeHeading}
              </h1>
              <div className="w-32 h-[3.5px] bg-[#ef3b3a] rounded-full mt-2.5 shadow-sm"></div>
            </div>
          </div>

          {/* Illustration Area with Ambient Lighting */}
          <div className="w-full flex justify-center items-center relative py-2">
            {/* Ambient soft glow backdrop */}
            <div className="absolute w-[380px] h-[380px] bg-white/[0.07] rounded-full blur-2xl pointer-events-none"></div>
            
            {illustration ? (
              <div className="w-full max-w-[440px] xl:max-w-[480px] transition-transform duration-300 hover:scale-[1.01] relative z-10">
                {illustration}
              </div>
            ) : (
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xs">
                <div className="text-white/80 text-lg font-medium">Illustration</div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header Banner (Visible only on mobile/tablet) */}
        <div className="lg:hidden flex flex-col items-center text-center mb-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-white rounded-[14px] shadow-md p-2 flex items-center justify-center shrink-0 w-12 h-12">
              <img src={sahayaoneLogo} alt="Sahayaone" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-white text-lg sm:text-xl font-black tracking-wider uppercase text-left leading-tight">
              SAHAYAONE SUPER ADMIN<br />PORTAL
            </h1>
          </div>
          <div className="w-24 h-[3px] bg-[#ef3b3a] rounded-full mt-2.5"></div>
        </div>

        {/* Right Side: Floating Form Card */}
        <div className="w-full max-w-[480px] bg-white rounded-[32px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] p-8 sm:p-10 relative border border-white/90">
          {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
