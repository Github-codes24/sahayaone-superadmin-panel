import React, { useState, useEffect, useCallback } from 'react';
import { 
  LogIn, 
  LogOut, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../api/attendanceService';
import PunchModal from './PunchModal';
import { formatDisplayString, formatNumeric, formatAddress } from '../../utils/attendanceFormatters';

export default function TodayPunchBanner({ onPunchSuccess }) {
  const [loading, setLoading] = useState(false);
  const [todayData, setTodayData] = useState(null);
  const [punchModalOpen, setPunchModalOpen] = useState(false);
  const [punchType, setPunchType] = useState('IN'); // 'IN' | 'OUT'

  const fetchTodayStatus = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await attendanceService.getTodayStatus();
      if (res && (res.success || res.statusCode === 200 || res.data)) {
        const payload = res.data?.todayAttendance || res.data || res.todayAttendance || null;
        setTodayData(payload);
      }
    } catch (err) {
      console.warn('Failed to fetch today attendance snapshot:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  const handleOpenPunch = (type) => {
    setPunchType(type);
    setPunchModalOpen(true);
  };

  const handleModalSuccess = (data) => {
    fetchTodayStatus(true);
    if (onPunchSuccess) onPunchSuccess(data);
  };

  // Safe field extractions
  const punchInTime = formatDisplayString(todayData?.punchIn, '');
  const punchOutTime = formatDisplayString(todayData?.punchOut, '');
  const isPunchedIn = Boolean(punchInTime);
  const isPunchedOut = Boolean(punchOutTime);
  const isLate = Boolean(todayData?.isLate || (formatNumeric(todayData?.lateMinutes) > 0));
  const lateMinutes = formatNumeric(todayData?.lateMinutes, 0);

  const rawWorkingHours = todayData?.formattedWorkingHours || (todayData?.workingMinutes ? `${Math.round(formatNumeric(todayData.workingMinutes) / 60)} hrs` : null);
  const workingHours = formatDisplayString(rawWorkingHours, isPunchedIn && !isPunchedOut ? 'In Progress...' : '0 hrs');

  const locationObj = todayData?.location || (todayData?.latitude ? { latitude: todayData.latitude, longitude: todayData.longitude, address: todayData.address } : null);
  const displayAddress = formatAddress(locationObj);
  const locLat = locationObj?.latitude;
  const locLng = locationObj?.longitude;

  const getStatusBadge = () => {
    if (!todayData || (!punchInTime && !punchOutTime)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
          <Clock size={13} /> NOT RECORDED
        </span>
      );
    }
    if (isPunchedOut) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#225091] border border-blue-200">
          <CheckCircle2 size={13} /> SHIFT COMPLETED
        </span>
      );
    }
    if (isLate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
          <AlertTriangle size={13} /> LATE PRESENT (+{lateMinutes}m)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
        <CheckCircle2 size={13} /> ON SHIFT
      </span>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#173a6b] via-[#225091] to-[#1e467d] text-white rounded-2xl p-5 shadow-sm border border-blue-900/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Shift Snapshot */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <ShieldCheck size={15} /> Today's Attendance Snapshot
              </span>
              {getStatusBadge()}
              <button
                type="button"
                onClick={() => {
                  fetchTodayStatus();
                  toast.info('Refreshed today status');
                }}
                disabled={loading}
                className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Refresh Status"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <LogIn size={13} className="text-emerald-400" /> Punch In
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  {punchInTime || '—'}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <LogOut size={13} className="text-rose-400" /> Punch Out
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  {punchOutTime || '—'}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock size={13} className="text-amber-400" /> Working Hours
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  {workingHours}
                </div>
              </div>
            </div>

            {/* Location Pill */}
            {displayAddress && (
              <div className="text-[11px] text-blue-100/90 flex items-center gap-1.5 pt-0.5 truncate max-w-xl">
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">{displayAddress}</span>
                {locLat && locLng && (
                  <a
                    href={`https://maps.google.com/?q=${locLat},${locLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline flex items-center gap-0.5 shrink-0 ml-1 text-[10px] font-bold bg-white/15 px-1.5 py-0.5 rounded"
                  >
                    View Map <ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Punch Actions */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            {/* Punch In Button */}
            <button
              type="button"
              onClick={() => handleOpenPunch('IN')}
              disabled={isPunchedIn}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                isPunchedIn
                  ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer active:scale-95'
              }`}
            >
              <LogIn size={16} />
              {isPunchedIn ? 'Already Punched In' : 'Punch In (Check-In)'}
            </button>

            {/* Punch Out Button */}
            <button
              type="button"
              onClick={() => handleOpenPunch('OUT')}
              disabled={!isPunchedIn || isPunchedOut}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                !isPunchedIn || isPunchedOut
                  ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                  : 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer active:scale-95'
              }`}
            >
              <LogOut size={16} />
              {isPunchedOut ? 'Already Punched Out' : 'Punch Out (Check-Out)'}
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Punch Action Modal */}
      <PunchModal
        isOpen={punchModalOpen}
        onClose={() => setPunchModalOpen(false)}
        type={punchType}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
