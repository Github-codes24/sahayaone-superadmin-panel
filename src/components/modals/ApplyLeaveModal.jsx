import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../api/attendanceService';

const LEAVE_TYPES = [
  { value: 'CASUAL', label: 'Casual Leave (CL)' },
  { value: 'SICK', label: 'Sick Leave (SL)' },
  { value: 'EARNED', label: 'Earned / Privilege Leave (EL)' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'UNPAID', label: 'Unpaid Leave (LOP)' }
];

export default function ApplyLeaveModal({ isOpen, onClose, onSuccess }) {
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await attendanceService.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim()
      });
      toast.success(res?.message || 'Leave application submitted successfully.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Leave submission failed:', err);
      const validationErr = err.response?.data?.errors?.[0]?.message;
      const generalErr = err.response?.data?.message;
      toast.error(validationErr || generalErr || err.message || 'Failed to submit leave.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#225091] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar size={20} className="text-blue-200" />
            <h3 className="text-lg font-bold">Apply Leave</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Leave Type *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-white font-medium"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason (Optional, Max 500 chars)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Provide reason for leave..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-white resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#225091] hover:bg-[#1a3f73] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
