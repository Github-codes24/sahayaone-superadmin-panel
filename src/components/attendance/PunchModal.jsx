import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Building,
  Compass
} from 'lucide-react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../api/attendanceService';

export default function PunchModal({ 
  isOpen, 
  onClose, 
  type = 'IN', // 'IN' or 'OUT'
  onSuccess 
}) {
  const isPunchIn = type === 'IN';
  const [capturingGps, setCapturingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState('');
  const [gpsError, setGpsError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
          return;
        }
      }
    } catch {
      // Fallback silently if offline or blocked
    }
    setAddress(`Coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setGpsError(msg);
      toast.error(msg);
      return;
    }

    setCapturingGps(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);

        setCoords({ latitude: lat, longitude: lng });
        setAccuracy(acc);
        setCapturingGps(false);
        toast.success(`GPS acquired (±${acc}m accuracy)`);

        await reverseGeocode(lat, lng);
      },
      (err) => {
        setCapturingGps(false);
        let errorMsg = 'Failed to retrieve GPS location.';
        if (err.code === 1) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (err.code === 2) {
          errorMsg = 'Location unavailable. Ensure GPS / Location service is enabled.';
        } else if (err.code === 3) {
          errorMsg = 'Location request timed out. Please try again.';
        }
        setGpsError(errorMsg);
        toast.warning(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Auto trigger capture when modal opens
  useEffect(() => {
    if (isOpen) {
      handleCaptureGps();
    } else {
      setCoords(null);
      setAccuracy(null);
      setAddress('');
      setGpsError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        address: address.trim() || undefined
      };

      let res;
      if (isPunchIn) {
        res = await attendanceService.punchIn(payload);
        toast.success(res?.message || 'Punched in successfully!');
      } else {
        res = await attendanceService.punchOut(payload);
        toast.success(res?.message || 'Punched out successfully!');
      }

      if (onSuccess) onSuccess(res?.data || res);
      onClose();
    } catch (err) {
      console.error('Punch action failed:', err);
      const errMsg = err.response?.data?.message || err.message || `Failed to punch ${type.toLowerCase()}.`;
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          isPunchIn ? 'bg-[#15803D]' : 'bg-[#225091]'
        }`}>
          <div className="flex items-center gap-2.5">
            <Compass size={20} className="text-white/90" />
            <div>
              <h3 className="text-base font-bold">
                {isPunchIn ? 'Punch In (Check-In)' : 'Punch Out (Check-Out)'}
              </h3>
              <p className="text-[11px] text-white/80">Record shift attendance with GPS coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Live Clock Display */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <Clock size={13} className="text-[#225091]" />
              System Time
            </div>
            <div className="text-2xl font-black text-gray-800 tracking-tight font-mono">
              {currentTime}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* GPS Coordinates Section */}
          <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className={coords ? "text-emerald-600" : "text-amber-500"} />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  GPS Geolocation
                </span>
              </div>
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={capturingGps}
                className="text-[11px] font-bold text-[#225091] hover:text-[#173a6b] flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
              >
                {capturingGps ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Detecting...
                  </>
                ) : (
                  <>
                    <Navigation size={12} /> Re-detect GPS
                  </>
                )}
              </button>
            </div>

            {coords ? (
              <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-lg p-2.5 text-xs text-emerald-900 space-y-1">
                <div className="flex justify-between font-mono font-medium">
                  <span>Lat: {coords.latitude}</span>
                  <span>Lng: {coords.longitude}</span>
                </div>
                {accuracy !== null && (
                  <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={11} /> High Precision GPS Accuracy: ±{accuracy} meters
                  </div>
                )}
              </div>
            ) : gpsError ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <span>{gpsError}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic text-center py-2">
                Detecting current GPS coordinates...
              </div>
            )}

            {/* Address Input */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Detected / Office Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter or verify current office address..."
                rows={2}
                maxLength={500}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-gray-50 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer ${
                isPunchIn 
                  ? 'bg-[#15803D] hover:bg-[#166534]' 
                  : 'bg-[#225091] hover:bg-[#1a3f73]'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Recording...
                </>
              ) : isPunchIn ? (
                'Confirm Punch In'
              ) : (
                'Confirm Punch Out'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
