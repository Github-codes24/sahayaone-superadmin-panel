import React from 'react';
import { 
  Users, 
  HandCoins, 
  Boxes, 
  ShieldCheck, 
  Receipt, 
  ArrowLeftRight, 
  Repeat, 
  Fingerprint, 
  IdCard, 
  Check 
} from 'lucide-react';

const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

export const BANK_FEATURES = [
  // Row 1 - Blue
  {
    id: 'HR_MANAGEMENT',
    key: 'hr_management',
    name: 'HR Management',
    icon: Users,
    theme: 'blue',
    bgColor: 'bg-[#0f4b86]',
  },
  {
    id: 'LOAN_MANAGEMENT',
    key: 'loan_management',
    name: 'Loan Management',
    icon: HandCoins,
    theme: 'blue',
    bgColor: 'bg-[#0f4b86]',
  },
  {
    id: 'INVENTORY_MANAGEMENT',
    key: 'inventory_management',
    name: 'Inventory Management',
    icon: Boxes,
    theme: 'blue',
    bgColor: 'bg-[#0f4b86]',
  },
  {
    id: 'VERIFICATION_SERVICE',
    key: 'verification_services',
    name: 'Verification Service',
    icon: ShieldCheck,
    theme: 'blue',
    bgColor: 'bg-[#0f4b86]',
  },
  {
    id: 'RECEIPT_MANAGEMENT',
    key: 'receipt_management',
    name: 'Receipt Management',
    icon: Receipt,
    theme: 'blue',
    bgColor: 'bg-[#0f4b86]',
  },

  // Row 2 - Red
  {
    id: 'UPI_AUTOPAY',
    key: 'upi_autopay',
    name: 'UPI Autopay',
    icon: ArrowLeftRight,
    theme: 'red',
    bgColor: 'bg-[#d2232a]',
  },
  {
    id: 'E_NACH',
    key: 'e_nach',
    name: 'E-NACH',
    icon: Repeat,
    theme: 'red',
    bgColor: 'bg-[#d2232a]',
  },
  {
    id: 'WHATSAPP_BANKING',
    key: 'whatsapp_banking',
    name: 'WhatsApp Banking',
    customIcon: WhatsAppIcon,
    theme: 'red',
    bgColor: 'bg-[#d2232a]',
  },
  {
    id: 'BIOMETRIC_INTEGRATION',
    key: 'biometric_integration',
    name: 'Biometric Integration',
    icon: Fingerprint,
    theme: 'red',
    bgColor: 'bg-[#d2232a]',
  },
  {
    id: 'PAPERLESS_E_KYC',
    key: 'paperless_ekyc',
    name: 'Paperless e-KYC',
    icon: IdCard,
    theme: 'red',
    bgColor: 'bg-[#d2232a]',
  },
];

const BankFeaturesGrid = ({ selectedFeatures = [], onChange, isReadOnly = false }) => {
  const isSelected = (feature) => {
    return (
      selectedFeatures.includes(feature.id) ||
      selectedFeatures.includes(feature.key) ||
      selectedFeatures.includes(feature.name)
    );
  };

  const handleToggle = (feature) => {
    if (isReadOnly || !onChange) return;
    
    const currentlySelected = isSelected(feature);
    let next;
    if (currentlySelected) {
      next = selectedFeatures.filter(
        (f) => f !== feature.id && f !== feature.key && f !== feature.name
      );
    } else {
      next = [...selectedFeatures, feature.id];
    }
    onChange(next);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {BANK_FEATURES.map((feature) => {
          const active = isSelected(feature);
          const IconComponent = feature.customIcon || feature.icon;
          
          const themeBg = feature.theme === 'blue' ? 'bg-[#0f4b86]' : 'bg-[#d2232a]';
          const themeLightBg = feature.theme === 'blue' ? 'bg-[#0f4b86]/5' : 'bg-[#d2232a]/5';
          const themeBorder = feature.theme === 'blue' ? 'border-[#0f4b86]' : 'border-[#d2232a]';
          const themeRing = feature.theme === 'blue' ? 'ring-[#0f4b86]' : 'ring-[#d2232a]';

          return (
            <div
              key={feature.id}
              onClick={() => handleToggle(feature)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 select-none min-h-[110px] border ${
                active
                  ? `${themeLightBg} ${themeBorder} shadow-sm ring-1 ${themeRing}`
                  : isReadOnly
                  ? 'bg-white border-gray-200 opacity-50 grayscale'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              } ${!isReadOnly ? 'cursor-pointer active:scale-[0.98]' : ''}`}
              role={!isReadOnly ? 'checkbox' : undefined}
              aria-checked={active}
              tabIndex={!isReadOnly ? 0 : undefined}
              onKeyDown={(e) => {
                if (!isReadOnly && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleToggle(feature);
                }
              }}
            >
              {/* Checkbox indicator */}
              {!isReadOnly && (
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                    active
                      ? `${themeBg} text-white shadow-sm scale-100`
                      : 'border-2 border-gray-300 bg-transparent scale-95'
                  }`}
                >
                  {active && <Check size={12} strokeWidth={4} />}
                </div>
              )}

              {/* Icon Circle */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 transition-colors duration-200 ${
                active 
                  ? `${themeBg} text-white shadow-md` 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}>
                {IconComponent && <IconComponent size={20} />}
              </div>

              {/* Name */}
              <span className={`text-[13px] font-semibold text-center leading-tight px-1 line-clamp-2 transition-colors duration-200 ${
                active ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {feature.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BankFeaturesGrid;
