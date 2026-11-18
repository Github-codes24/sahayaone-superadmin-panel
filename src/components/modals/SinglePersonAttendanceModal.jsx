import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  CalendarDays, 
  Loader2, 
  Briefcase, 
  Mail, 
  Phone, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'react-toastify';
import TableWrapper from '../common/TableWrapper';
import { attendanceService } from '../../api/attendanceService';
import { formatDisplayString, formatStatusCode, formatNumeric, formatAddress } from '../../utils/attendanceFormatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => 2020 + i);

const StatusBadge = ({ code }) => {
  const upper = formatStatusCode(code);
  let color = 'bg-gray-100 text-gray-700 border-gray-300';
  if (upper === 'P' || upper === 'PRESENT') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  } else if (upper === 'P*' || upper === 'LATE' || upper === 'LATE_PRESENT') {
    color = 'bg-amber-50 text-amber-700 border-amber-300';
  } else if (upper === 'HD' || upper === 'HALF_DAY') {
    color = 'bg-purple-50 text-purple-700 border-purple-300';
  } else if (upper === 'A' || upper === 'ABSENT') {
    color = 'bg-rose-50 text-rose-700 border-rose-300';
  } else if (upper === 'L' || upper === 'LEAVE') {
    color = 'bg-blue-50 text-blue-700 border-blue-300';
  } else if (upper === 'WO' || upper === 'WEEKLY_OFF') {
    color = 'bg-gray-100 text-gray-600 border-gray-300';
  } else if (upper === 'COFF' || upper === 'COMP_OFF') {
    color = 'bg-indigo-50 text-indigo-700 border-indigo-300';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${color}`}>
      {upper || '—'}
    </span>
  );
};

export default function SinglePersonAttendanceModal({
  isOpen,
  onClose,
  employeeId,
  initialEmployee = null,
  initialMonth = new Date().getMonth() + 1,
  initialYear = new Date().getFullYear()
}) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (initialMonth) setMonth(Number(initialMonth));
    if (initialYear) setYear(Number(initialYear));
  }, [initialMonth, initialYear]);

  const fetchReport = useCallback(async () => {
    if (!isOpen) return;
    const targetId = employeeId || initialEmployee?.id || initialEmployee?.userId || initialEmployee?._id;
    if (!targetId) return;

    setLoading(true);
    try {
      const res = await attendanceService.getSinglePersonReport({
        userId: targetId,
        employeeId: targetId,
        month,
        year
      });
      if (res && (res.success || res.statusCode === 200 || res.data)) {
        setReportData(res.data || res);
      } else {
        throw new Error(res?.message || 'Failed to load report');
      }
    } catch (err) {
      console.error('Failed to load employee attendance details:', err);
      toast.error(formatDisplayString(err.response?.data?.message || err.message, 'Failed to load employee details'));
    } finally {
      setLoading(false);
    }
  }, [isOpen, employeeId, initialEmployee, month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (!isOpen) return null;

  const emp = reportData?.employee || initialEmployee || {};
  const monthlySummary = reportData?.monthlySummary || {};
  const dailySheet = Array.isArray(reportData?.dailySheet) ? reportData.dailySheet : [];
  const yearlySummary = reportData?.yearlySummary || {};
  const yearlyMatrix = Array.isArray(reportData?.yearlyMatrix) ? reportData.yearlyMatrix : [];

  const empFullName = formatDisplayString(emp.fullName || emp.name, 'Employee Attendance');
  const empInitial = empFullName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#173a6b] to-[#225091] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-lg font-bold">
              {empInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{empFullName}</h3>
                {emp.employeeCode && (
                  <span className="text-xs px-2 py-0.5 rounded bg-white/20 font-mono">
                    {formatDisplayString(emp.employeeCode)}
                  </span>
                )}
              </div>
              <div className="text-xs text-blue-100 flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Briefcase size={13} /> {formatDisplayString(emp.designation || emp.type, 'Staff')}
                </span>
                {emp.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} /> {formatDisplayString(emp.email)}
                  </span>
                )}
                {emp.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {formatDisplayString(emp.phoneNumber)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Month & Year Filter in Modal */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 text-xs">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent text-white focus:outline-hidden font-medium cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx + 1} className="text-gray-800">
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent text-white focus:outline-hidden font-medium cursor-pointer border-l border-white/20 pl-2"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y} className="text-gray-800">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 size={36} className="animate-spin text-[#225091]" />
              <p className="text-sm font-medium">Loading attendance breakdown...</p>
            </div>
          ) : (
            <>
              {/* Monthly KPI Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60">
                  <span className="text-xs font-semibold text-emerald-800 block">Present Days</span>
                  <span className="text-xl font-bold text-emerald-700 mt-1 block">
                    {formatNumeric(monthlySummary.presentDays, 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/60">
                  <span className="text-xs font-semibold text-amber-800 block">Late Days (P*)</span>
                  <span className="text-xl font-bold text-amber-700 mt-1 block">
                    {formatNumeric(monthlySummary.lateDays, 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/60">
                  <span className="text-xs font-semibold text-purple-800 block">Half Days (HD)</span>
                  <span className="text-xl font-bold text-purple-700 mt-1 block">
                    {formatNumeric(monthlySummary.halfDays, 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/60">
                  <span className="text-xs font-semibold text-rose-800 block">Absent Days</span>
                  <span className="text-xl font-bold text-rose-700 mt-1 block">
                    {formatNumeric(monthlySummary.absentDays, 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60">
                  <span className="text-xs font-semibold text-blue-800 block">Total Work Hours</span>
                  <span className="text-xl font-bold text-blue-700 mt-1 block truncate">
                    {formatDisplayString(monthlySummary.formattedTotalWorkingHours, '0 hrs')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/60">
                  <span className="text-xs font-semibold text-indigo-800 block">Attendance Rate</span>
                  <span className="text-xl font-bold text-indigo-700 mt-1 block">
                    {formatDisplayString(monthlySummary.attendancePercentage ? `${monthlySummary.attendancePercentage}%` : '0%')}
                  </span>
                </div>
              </div>

              {/* Day-by-Day Detailed Log Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={16} className="text-[#225091]" />
                    Daily Punch Logs ({MONTH_NAMES[month - 1]} {year})
                  </h4>
                  <span className="text-xs text-gray-400">Total Days: {formatNumeric(monthlySummary.totalDays || dailySheet.length)}</span>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                  <TableWrapper minHeight="240px">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#225091] text-white uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-3 w-10 text-center">Day</th>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3 text-center">Status</th>
                          <th className="py-3 px-4">Punch In & Location</th>
                          <th className="py-3 px-4">Punch Out & Location</th>
                          <th className="py-3 px-3">Working Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {dailySheet.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-400">
                              No daily punch records found for this period.
                            </td>
                          </tr>
                        ) : (
                          dailySheet.map((item, idx) => {
                            const inAddr = formatAddress(item.punchInLocation || item.punchInAddress);
                            const outAddr = formatAddress(item.punchOutLocation || item.punchOutAddress);
                            const inLat = item.punchInLocation?.latitude || item.punchInLatitude;
                            const inLng = item.punchInLocation?.longitude || item.punchInLongitude;
                            const outLat = item.punchOutLocation?.latitude || item.punchOutLatitude;
                            const outLng = item.punchOutLocation?.longitude || item.punchOutLongitude;
                            const inTime = formatDisplayString(item.punchIn, '—');
                            const outTime = formatDisplayString(item.punchOut, '—');
                            const hours = formatDisplayString(item.formattedWorkingHours || (item.workingMinutes ? `${item.workingMinutes} mins` : '—'));

                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-3 text-center font-bold text-gray-800">
                                  {formatNumeric(item.day)}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap font-medium">
                                  {formatDisplayString(item.date)} <span className="text-gray-400">({formatDisplayString(item.dayName, '—')})</span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <StatusBadge code={item.statusCode || item.status} />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className={inTime !== '—' ? "font-bold text-gray-900" : "text-gray-400"}>
                                      {inTime}
                                    </span>
                                    {inAddr && (
                                      <span className="text-[10px] text-gray-500 truncate max-w-[200px] flex items-center gap-1" title={inAddr}>
                                        <MapPin size={10} className="text-emerald-600 shrink-0" />
                                        {inAddr}
                                        {inLat && inLng && (
                                          <a
                                            href={`https://maps.google.com/?q=${inLat},${inLng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#225091] hover:underline shrink-0"
                                            title="Open in Google Maps"
                                          >
                                            <ExternalLink size={9} />
                                          </a>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className={outTime !== '—' ? "font-bold text-gray-900" : "text-gray-400"}>
                                      {outTime}
                                    </span>
                                    {outAddr && (
                                      <span className="text-[10px] text-gray-500 truncate max-w-[200px] flex items-center gap-1" title={outAddr}>
                                        <MapPin size={10} className="text-rose-500 shrink-0" />
                                        {outAddr}
                                        {outLat && outLng && (
                                          <a
                                            href={`https://maps.google.com/?q=${outLat},${outLng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#225091] hover:underline shrink-0"
                                            title="Open in Google Maps"
                                          >
                                            <ExternalLink size={9} />
                                          </a>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-800">
                                  {hours}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </TableWrapper>
                </div>
              </div>

              {/* 12-Month Matrix Overview */}
              {yearlyMatrix.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#225091]" />
                      {year} Annual Attendance Distribution
                    </h4>
                    {yearlySummary.formattedAverageAttendance && (
                      <span className="text-xs font-semibold text-[#225091] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        Year Avg: {formatDisplayString(yearlySummary.formattedAverageAttendance)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {yearlyMatrix.map((m, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/70 text-center">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">{formatDisplayString(m.code || m.name)}</span>
                        <div className="text-sm font-bold text-gray-900 mt-1">
                          {formatNumeric(m.presentDays, 0)} <span className="text-[11px] font-normal text-gray-400">days</span>
                        </div>
                        <span className="text-[10px] text-[#225091] font-semibold">
                          {formatNumeric(m.attendancePercentage, 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
