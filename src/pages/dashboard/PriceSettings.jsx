import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Edit3,
  Save,
  X,
  AlertCircle,
  RefreshCw,
  Clock,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { settingsService } from '../../api/settingsService';
import PageHeader from '../../components/common/PageHeader';

// ─── Skeleton shimmer ────────────────────────────────────────────────────────
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl ${className}`} />
);

// ─── Field ───────────────────────────────────────────────────────────────────
const PriceField = ({ label, alias, value, name, prefix, suffix, isEditing, loading, error, onChange, min = 0, isInteger = false }) => (
  <div>
    <div className="flex items-start justify-between mb-1.5 gap-2 flex-wrap">
      <label className="block text-sm font-bold text-gray-800">{label}</label>
      <code className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono border border-slate-200 shrink-0">
        {alias}
      </code>
    </div>
    {loading ? (
      <Shimmer className="h-11 w-full" />
    ) : (
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <span className="text-sm font-bold text-gray-400">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          readOnly={!isEditing}
          min={min}
          step={isInteger ? 1 : 'any'}
          className={`w-full ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-16' : 'pr-4'} py-2.5 rounded-xl border text-sm font-semibold transition-all appearance-none ${
            isEditing
              ? `bg-white ${error ? 'border-rose-400 ring-2 ring-rose-100 focus:ring-rose-200' : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'} text-gray-800`
              : 'border-gray-100 bg-gray-50 text-gray-700 cursor-default'
          }`}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
            <span className="text-xs font-bold text-gray-400">{suffix}</span>
          </div>
        )}
      </div>
    )}
    {error && (
      <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, iconColor, iconBg, title, description, badge, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#225091]/10 text-[#225091] border border-[#225091]/20">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{description}</p>
      </div>
    </div>
    <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PriceSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const emptyPrices = {
    emiCardPriceForBank: 0,
    emiCardMinPurchaseQuantity: 0,
    verificationCreditPriceForBank: 0,
    verificationCreditMinPurchaseQuantity: 0
  };

  const [prices, setPrices] = useState(emptyPrices);
  const [editValues, setEditValues] = useState(emptyPrices);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSettings = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await settingsService.getPriceSettings();
      if (res?.success && res?.data) {
        const d = res.data;
        const mapped = {
          emiCardPriceForBank: d.emiCardPriceForBank ?? d.EMI_CARD_CHARGES ?? d.EMI_CARD_PRICE ?? 0,
          emiCardMinPurchaseQuantity: d.emiCardMinPurchaseQuantity ?? d.MIN_EMI_CARD_LIMIT ?? 0,
          verificationCreditPriceForBank: d.verificationCreditPriceForBank ?? d.VERIFICATION_CREDIT_PRICE ?? 0,
          verificationCreditMinPurchaseQuantity: d.verificationCreditMinPurchaseQuantity ?? d.MIN_VERIFICATION_CREDIT_LIMIT ?? 0
        };
        setPrices(mapped);
        setEditValues(mapped);
        if (d.updatedAt) setUpdatedAt(d.updatedAt);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load price settings. Please try again.';
      setApiError(msg);
      console.error('PriceSettings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (vals) => {
    const errs = {};
    if (vals.emiCardPriceForBank === '' || Number(vals.emiCardPriceForBank) < 0) {
      errs.emiCardPriceForBank = 'EMI Card price must be ≥ ₹0';
    }
    if (!Number.isInteger(Number(vals.emiCardMinPurchaseQuantity)) || Number(vals.emiCardMinPurchaseQuantity) < 1) {
      errs.emiCardMinPurchaseQuantity = 'Minimum quantity must be a whole number ≥ 1';
    }
    if (vals.verificationCreditPriceForBank === '' || Number(vals.verificationCreditPriceForBank) < 0) {
      errs.verificationCreditPriceForBank = 'Verification Credit price must be ≥ ₹0';
    }
    if (!Number.isInteger(Number(vals.verificationCreditMinPurchaseQuantity)) || Number(vals.verificationCreditMinPurchaseQuantity) < 1) {
      errs.verificationCreditMinPurchaseQuantity = 'Minimum quantity must be a whole number ≥ 1';
    }
    return errs;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditValues(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEdit = () => {
    setEditValues({ ...prices });
    setFieldErrors({});
    setApiError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors({});
    setApiError(null);
  };

  const handleSave = async () => {
    const errs = validate(editValues);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    setSaveLoading(true);
    setApiError(null);
    try {
      const payload = {
        emiCardPriceForBank: Number(editValues.emiCardPriceForBank),
        emiCardMinPurchaseQuantity: Number(editValues.emiCardMinPurchaseQuantity),
        verificationCreditPriceForBank: Number(editValues.verificationCreditPriceForBank),
        verificationCreditMinPurchaseQuantity: Number(editValues.verificationCreditMinPurchaseQuantity)
      };

      const res = await settingsService.updatePriceSettings(payload);
      if (res?.success && res?.data) {
        const d = res.data;
        const mapped = {
          emiCardPriceForBank: d.emiCardPriceForBank ?? d.EMI_CARD_CHARGES ?? payload.emiCardPriceForBank,
          emiCardMinPurchaseQuantity: d.emiCardMinPurchaseQuantity ?? d.MIN_EMI_CARD_LIMIT ?? payload.emiCardMinPurchaseQuantity,
          verificationCreditPriceForBank: d.verificationCreditPriceForBank ?? d.VERIFICATION_CREDIT_PRICE ?? payload.verificationCreditPriceForBank,
          verificationCreditMinPurchaseQuantity: d.verificationCreditMinPurchaseQuantity ?? d.MIN_VERIFICATION_CREDIT_LIMIT ?? payload.verificationCreditMinPurchaseQuantity
        };
        setPrices(mapped);
        if (d.updatedAt) setUpdatedAt(d.updatedAt);
        setIsEditing(false);
        setFieldErrors({});
        toast.success('Price settings updated successfully!');
      } else {
        throw new Error(res?.message || 'Unexpected response from server.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save price settings.';
      setApiError(msg);
      const details = err?.response?.data?.details;
      if (Array.isArray(details) && details.length > 0) {
        const newErrs = {};
        details.forEach(d => { if (d.field) newErrs[d.field] = d.message; });
        setFieldErrors(newErrs);
      }
      toast.error(msg);
      console.error('PriceSettings save error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatUpdatedAt = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch { return iso; }
  };

  const displayVal = (key) => isEditing ? editValues[key] : prices[key];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full pb-12">
      {/* ── Page Header ── */}
      <PageHeader
        title="Price Settings"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Settings' },
          { label: 'Price Settings' }
        ]}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saveLoading}
            title="Refresh"
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-[#225091] hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saveLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-sm transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <X size={15} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#225091] text-white font-bold text-sm hover:bg-[#193e73] transition-all cursor-pointer shadow-xs disabled:opacity-60 min-w-[130px] justify-center"
              >
                {saveLoading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#225091] text-white font-bold text-sm hover:bg-[#193e73] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Edit3 size={15} />
              Edit Settings
            </button>
          )}
        </div>
      </PageHeader>

      {/* ── API Error Banner ── */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 shadow-2xs">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      {/* ── Edit Mode Banner ── */}
      {isEditing && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 shadow-2xs">
          <Info size={16} className="shrink-0" />
          <p className="text-sm font-semibold">You are in edit mode. Changes will sync across all bank portals immediately on save.</p>
        </div>
      )}

      {/* ── EMI Card Settings ── */}
      <SectionCard
        icon={CreditCard}
        iconBg="bg-blue-50"
        iconColor="text-[#225091]"
        title="EMI Card Settings"
        description="Unit price and minimum purchase quantity threshold for EMI Cards issued to co-operative banks."
        badge="EMI Cards"
      >
        <PriceField
          label="EMI Card Price For Bank"
          alias="emiCardPriceForBank / EMI_CARD_CHARGES"
          name="emiCardPriceForBank"
          value={displayVal('emiCardPriceForBank')}
          prefix="₹"
          isEditing={isEditing}
          loading={loading}
          error={fieldErrors.emiCardPriceForBank}
          onChange={handleChange}
          min={0}
        />
        <PriceField
          label="Minimum Purchase Quantity"
          alias="emiCardMinPurchaseQuantity / MIN_EMI_CARD_LIMIT"
          name="emiCardMinPurchaseQuantity"
          value={displayVal('emiCardMinPurchaseQuantity')}
          suffix="cards"
          isEditing={isEditing}
          loading={loading}
          error={fieldErrors.emiCardMinPurchaseQuantity}
          onChange={handleChange}
          min={1}
          isInteger
        />
      </SectionCard>

      {/* ── Verification Credit Settings ── */}
      <SectionCard
        icon={ShieldCheck}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        title="Verification Credit Settings"
        description="Unit price and minimum purchase quantity threshold for Verification Credits used in KYC and onboarding."
        badge="Verification Credits"
      >
        <PriceField
          label="Verification Credit Price For Bank"
          alias="verificationCreditPriceForBank / VERIFICATION_CREDIT_PRICE"
          name="verificationCreditPriceForBank"
          value={displayVal('verificationCreditPriceForBank')}
          prefix="₹"
          isEditing={isEditing}
          loading={loading}
          error={fieldErrors.verificationCreditPriceForBank}
          onChange={handleChange}
          min={0}
        />
        <PriceField
          label="Minimum Purchase Quantity"
          alias="verificationCreditMinPurchaseQuantity / MIN_VERIFICATION_CREDIT_LIMIT"
          name="verificationCreditMinPurchaseQuantity"
          value={displayVal('verificationCreditMinPurchaseQuantity')}
          suffix="credits"
          isEditing={isEditing}
          loading={loading}
          error={fieldErrors.verificationCreditMinPurchaseQuantity}
          onChange={handleChange}
          min={1}
          isInteger
        />
      </SectionCard>

      {/* ── Last Updated Footer ── */}
      {updatedAt && !loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium px-1">
          <Clock size={13} className="text-gray-300" />
          <span>
            Last updated:{' '}
            <strong className="text-gray-500 font-semibold">{formatUpdatedAt(updatedAt)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default PriceSettings;

