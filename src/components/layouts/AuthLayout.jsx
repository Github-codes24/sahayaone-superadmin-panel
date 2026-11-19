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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-lg">
              <img src={sahayaoneLogo} alt="Sahayaone" className="h-full w-full object-contain object-center" />
            </div>
            
            <div className="relative flex min-w-0 flex-col">
              <h1 className="uppercase leading-tight text-white drop-shadow-md">
                {welcomeHeading.split('\n').map((line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className={index === 0
                      ? 'block text-lg font-semibold tracking-[0.12em] text-white/90'
                      : 'block text-xl font-bold tracking-wide xl:text-2xl'}
                  >
                    {line}
                  </span>
                ))}
              </h1>
              <div className="absolute -bottom-3.5 left-0 h-[3.5px] w-32 rounded-full bg-[#ef3b3a] shadow-sm"></div>
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
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-md">
              <img src={sahayaoneLogo} alt="Sahayaone" className="h-full w-full object-contain object-center" />
            </div>
            <h1 className="text-white text-lg sm:text-xl font-black tracking-wider uppercase text-center leading-tight">
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
