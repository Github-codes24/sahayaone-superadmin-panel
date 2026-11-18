import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  RefreshCw, 
  Eye, 
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import TableWrapper from '../common/TableWrapper';
import Pagination from '../common/Pagination';
import { attendanceService } from '../../api/attendanceService';
import { formatDisplayString, formatStatusCode, formatAddress } from '../../utils/attendanceFormatters';

const StatusBadge = ({ status }) => {
  const upper = formatStatusCode(status);
  let styles = 'text-gray-500 border-gray-200 bg-gray-50';

  if (upper === 'P' || upper === 'PRESENT') {
    styles = 'text-[#15803D] border-emerald-300 bg-emerald-50';
  } else if (upper === 'P*' || upper === 'LATE' || upper === 'LATE_PRESENT') {
    styles = 'text-[#b45309] border-amber-300 bg-amber-50';
  } else if (upper === 'HD' || upper === 'HALF_DAY') {
    styles = 'text-[#7c3aed] border-purple-300 bg-purple-50';
  } else if (upper === 'A' || upper === 'ABSENT') {
    styles = 'text-[#b91c1c] border-rose-300 bg-rose-50';
  } else if (upper === 'L' || upper === 'LEAVE') {
    styles = 'text-[#225091] border-blue-300 bg-blue-50';
  } else if (upper === 'WO' || upper === 'WEEKLY_OFF') {
    styles = 'text-gray-600 border-gray-300 bg-gray-100';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles}`}>
      {upper || '—'}
    </span>
  );
};

export default function AttendanceHistoryTab({ onOpenSingleModal }) {
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL
  const urlStart = searchParams.get('startDate');
  const urlEnd = searchParams.get('endDate');
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const getDefaultStart = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  };

  // Filters State
  const [startDate, setStartDate] = useState(urlStart || getDefaultStart);
  const [endDate, setEndDate] = useState(urlEnd || (() => new Date().toISOString().split('T')[0]));
  const [search, setSearch] = useState(urlSearch);

  // Data & Pagination State
  const [loading, setLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(urlPage > 0 ? urlPage : 1);
  const [paginationMeta, setPaginationMeta] = useState({
    totalRecords: 0,
    totalPages: 1,
    limit: 10
  });

  // URL sync helper for History tab
  const updateHistoryUrl = useCallback((overrides = {}) => {
    const targetStart = overrides.startDate !== undefined ? overrides.startDate : startDate;
    const targetEnd = overrides.endDate !== undefined ? overrides.endDate : endDate;
    const targetSearch = (overrides.search !== undefined ? overrides.search : search).trim();
    const targetPage = overrides.page !== undefined ? overrides.page : currentPage;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'history');

    if (targetStart) nextParams.set('startDate', targetStart);
    else nextParams.delete('startDate');

    if (targetEnd) nextParams.set('endDate', targetEnd);
    else nextParams.delete('endDate');

    if (targetSearch) nextParams.set('search', targetSearch);
    else nextParams.delete('search');

    if (targetPage > 1) nextParams.set('page', String(targetPage));
    else nextParams.delete('page');

    setSearchParams(nextParams, { replace: true });
  }, [startDate, endDate, search, currentPage, searchParams, setSearchParams]);

  // Sync state with URL searchParams (handles browser Back/Forward navigation)
  useEffect(() => {
    const sDate = searchParams.get('startDate');
    const eDate = searchParams.get('endDate');
    const sTerm = searchParams.get('search') || '';
    const pNum = parseInt(searchParams.get('page') || '1', 10);

    if (sDate && sDate !== startDate) setStartDate(sDate);
    if (eDate && eDate !== endDate) setEndDate(eDate);
    if (sTerm !== search) setSearch(sTerm);
    const validPage = pNum > 0 ? pNum : 1;
    if (validPage !== currentPage) setCurrentPage(validPage);
  }, [searchParams]);

  const fetchHistory = useCallback(async (pageToLoad = currentPage) => {
    setLoading(true);
    try {
      const res = await attendanceService.getAttendanceHistory({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search.trim() || undefined,
        page: pageToLoad,
        limit: 10
      });

      if (res && (res.success || res.statusCode === 200 || res.data)) {
        const rawItems = Array.isArray(res.data?.items)
          ? res.data.items
          : (Array.isArray(res.data) ? res.data : (res.data?.logs || res.data?.history || []));
        setHistoryItems(rawItems);

        const meta = res.data?.meta || res.meta;
        if (meta) {
          setPaginationMeta({
            totalRecords: Number(meta.totalRecords) || rawItems.length,
            totalPages: Number(meta.totalPages) || 1,
            limit: Number(meta.limit) || 10
          });
        } else {
          setPaginationMeta({
            totalRecords: rawItems.length,
            totalPages: 1,
            limit: 10
          });
        }
      }
    } catch (err) {
      console.error('Failed to load attendance history logs:', err);
      toast.error(formatDisplayString(err.response?.data?.message || err.message, 'Failed to fetch attendance history'));
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, search, currentPage]);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [startDate, endDate, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateHistoryUrl({ startDate, endDate, search, page: 1 });
    fetchHistory(1);
  };

  const handleReset = () => {
    const defaultStart = getDefaultStart();
    const defaultEnd = new Date().toISOString().split('T')[0];
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSearch('');
    setCurrentPage(1);

    const nextParams = new URLSearchParams();
    nextParams.set('tab', 'history');
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                updateHistoryUrl({ startDate: e.target.value, page: 1 });
              }}
              className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-white cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                updateHistoryUrl({ endDate: e.target.value, page: 1 });
              }}
              className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-white cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Search Personnel
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, Code, Role..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#225091] bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#225091] hover:bg-[#1a3f73] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              Filter Logs
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
        <TableWrapper ref={tableRef} minHeight="360px">
          <table className="w-full min-w-[950px] text-left border-collapse text-xs">
            <thead className="bg-[#225091] text-white uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-4 w-14 text-center border-r border-white/20">Sr.</th>
                <th className="py-3.5 px-4 border-r border-white/20">Date</th>
                <th className="py-3.5 px-5 border-r border-white/20">Employee</th>
                <th className="py-3.5 px-5 border-r border-white/20">Punch In</th>
                <th className="py-3.5 px-5 border-r border-white/20">Punch Out</th>
                <th className="py-3.5 px-4 border-r border-white/20">Duration</th>
                <th className="py-3.5 px-4 text-center border-r border-white/20">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <RefreshCw size={22} className="animate-spin text-[#225091] mx-auto mb-2" />
                    Loading attendance history logs...
                  </td>
                </tr>
              ) : historyItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                    No attendance logs found for the selected date range.
                  </td>
                </tr>
              ) : (
                historyItems.map((item, index) => {
                  const sr = ((currentPage - 1) * 10) + index + 1;
                  const empName = formatDisplayString(item.employeeName || item.name || item.fullName, 'Admin User');
                  const inAddr = formatAddress(item.punchInLocation || item.punchInAddress);
                  const outAddr = formatAddress(item.punchOutLocation || item.punchOutAddress);
                  const inTime = formatDisplayString(item.punchIn, '—');
                  const outTime = formatDisplayString(item.punchOut, '—');
                  const duration = formatDisplayString(
                    item.formattedWorkingHours || item.totalHrs || (item.workingMinutes ? `${Math.round(Number(item.workingMinutes) / 60)} hrs` : '—')
                  );

                  return (
                    <tr
                      key={item.id || item._id || index}
                      className="hover:bg-[#F4F8FD] transition-colors cursor-pointer"
                      onClick={() => onOpenSingleModal && onOpenSingleModal(item)}
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-gray-400 border-r border-gray-100">
                        {sr}
                      </td>

                      <td className="py-3.5 px-4 border-r border-gray-100 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{formatDisplayString(item.date, '—')}</div>
                        {item.dayName && (
                          <div className="text-[10px] text-gray-400">{formatDisplayString(item.dayName)}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 border-r border-gray-100">
                        <div className="font-bold text-gray-900">{empName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {formatDisplayString(item.designation || item.employeeCode || item.email, '')}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 border-r border-gray-100">
                        <div className="flex flex-col">
                          <span className={inTime !== '—' ? "font-bold text-gray-900" : "text-gray-400"}>
                            {inTime}
                          </span>
                          {inAddr && (
                            <span className="text-[10px] text-gray-400 truncate max-w-[180px] flex items-center gap-1" title={inAddr}>
                              <MapPin size={10} className="text-emerald-600 shrink-0" />
                              {inAddr}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 border-r border-gray-100">
                        <div className="flex flex-col">
                          <span className={outTime !== '—' ? "font-bold text-gray-900" : "text-gray-400"}>
                            {outTime}
                          </span>
                          {outAddr && (
                            <span className="text-[10px] text-gray-400 truncate max-w-[180px] flex items-center gap-1" title={outAddr}>
                              <MapPin size={10} className="text-rose-500 shrink-0" />
                              {outAddr}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 border-r border-gray-100 font-bold text-gray-800">
                        {duration}
                      </td>

                      <td className="py-3.5 px-4 text-center border-r border-gray-100">
                        <StatusBadge status={item.status || item.statusCode} />
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenSingleModal && onOpenSingleModal(item)}
                          className="p-1.5 rounded-lg text-[#225091] hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
                          title="View 360° Report"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableWrapper>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={paginationMeta.totalPages}
          totalRecords={paginationMeta.totalRecords}
          onPageChange={(p) => {
            setCurrentPage(p);
            updateHistoryUrl({ page: p });
            fetchHistory(p);
          }}
        />
      </div>
    </div>
  );
}
