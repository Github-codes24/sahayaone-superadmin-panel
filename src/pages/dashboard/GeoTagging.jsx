import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Clock, 
  Map as MapIcon, 
  List, 
  Building2, 
  X,
  Phone,
  Navigation
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import geoTaggingService from '../../api/geoTaggingService';
import { toast } from 'react-toastify';

const GeoTagging = () => {
  const [activeStatus, setActiveStatus] = useState('ALL'); // ALL, IN_TERRITORY, OUT_OF_TERRITORY
  const [viewMode, setViewMode] = useState('MAP'); // MAP, TABLE
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [capturingGps, setCapturingGps] = useState(false);

  const [punchData, setPunchData] = useState({
    employeeName: '',
    designation: 'Onboarding Lead',
    assignedRegion: 'Central Business District',
    officeLat: 19.076000,
    officeLng: 72.877700,
    punchLat: 19.076040,
    punchLng: 72.877720,
    punchAddress: 'Central Plaza Entrance',
    remarks: 'Field visit check-in.'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const recordsData = await geoTaggingService.getRecords();
      setRecords(recordsData);
      if (recordsData.length > 0 && !selectedRecord) {
        setSelectedRecord(recordsData[0]);
      }
    } catch {
      toast.error('Failed to load onboarding team attendance geolocation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCaptureCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by browser');
      return;
    }
    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPunchData(prev => ({
          ...prev,
          punchLat: parseFloat(pos.coords.latitude.toFixed(6)),
          punchLng: parseFloat(pos.coords.longitude.toFixed(6)),
          punchAddress: `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
        }));
        setCapturingGps(false);
        toast.success('Live GPS coordinates captured!');
      },
      () => {
        setCapturingGps(false);
        toast.warn('Could not read GPS coordinates');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      if (activeStatus === 'IN_TERRITORY' && item.geofenceStatus !== 'IN_TERRITORY') return false;
      if (activeStatus === 'OUT_OF_TERRITORY' && item.geofenceStatus !== 'OUT_OF_TERRITORY') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.employeeName?.toLowerCase().includes(q) ||
          item.employeeId?.toLowerCase().includes(q) ||
          item.assignedRegion?.toLowerCase().includes(q) ||
          item.punchAddress?.toLowerCase().includes(q) ||
          item.designation?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [records, activeStatus, searchQuery]);

  useEffect(() => {
    if (filteredRecords.length > 0) {
      const exists = filteredRecords.some(r => r.id === selectedRecord?.id);
      if (!exists) {
        setSelectedRecord(filteredRecords[0]);
      }
    }
  }, [filteredRecords, selectedRecord]);

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDc5r82MahA9rhAXROP0kv7rf0ZzUKOFR4';

  const inTerritoryCount = records.filter(r => r.geofenceStatus === 'IN_TERRITORY').length;
  const outOfTerritoryCount = records.filter(r => r.geofenceStatus === 'OUT_OF_TERRITORY').length;

  return (
    <div className="space-y-5 pb-10 w-full animate-in fade-in duration-200">
      {/* Header */}
      <PageHeader
        title="Territory Geo Tagging"
        breadcrumbs={[
          { label: 'Super Admin', to: '/dashboard' },
          { label: 'Geo Tagging' }
        ]}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#225091]' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsPunchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#225091] hover:bg-[#183e70] active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <MapPin size={14} />
            <span>Record Check-In</span>
          </button>
        </div>
      </PageHeader>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Team', count: records.length },
            { id: 'IN_TERRITORY', label: 'In Territory', count: inTerritoryCount },
            { id: 'OUT_OF_TERRITORY', label: 'Out of Territory', count: outOfTerritoryCount, isAmber: true }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStatus(tab.id)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStatus === tab.id
                  ? tab.isAmber
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-[#225091] text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search officer or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'MAP' ? 'bg-white text-[#225091] shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Map View"
            >
              <MapIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-[#225091] shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table Log View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Streamlined Content */}
      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Staff List (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-2xs">
                <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-700">No officers found</p>
              </div>
            ) : (
              filteredRecords.map(item => {
                const isSelected = selectedRecord?.id === item.id;
                const isInside = item.geofenceStatus === 'IN_TERRITORY';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isInside
                          ? 'border-[#225091] bg-blue-50/40 shadow-xs'
                          : 'border-amber-500 bg-amber-50/40 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isInside ? 'bg-blue-100 text-[#225091]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{item.employeeName}</h4>
                          <p className="text-[11px] text-gray-500">{item.designation}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isInside ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isInside ? 'In Territory' : 'Out of Territory'}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="truncate max-w-[170px] flex items-center gap-1 font-medium">
                        <Building2 size={12} className="text-gray-400 shrink-0" />
                        {item.assignedRegion}
                      </span>
                      <span className={`font-bold ${isInside ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {item.distanceMeters > 1000 ? `${(item.distanceMeters / 1000).toFixed(1)} km` : `${item.distanceMeters} m`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Google Map & Minimal Detail Bar */}
          <div className="lg:col-span-7 space-y-3 sticky top-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
              <div className="relative w-full h-[380px] bg-slate-100">
                {selectedRecord ? (
                  <iframe
                    title="Google Maps Location"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${selectedRecord.punchLat},${selectedRecord.punchLng}&zoom=16`}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <MapPin size={40} className="mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Select an officer to view location</p>
                  </div>
                )}
              </div>

              {selectedRecord && (
                <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{selectedRecord.employeeName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecord.geofenceStatus === 'IN_TERRITORY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {selectedRecord.geofenceStatus === 'IN_TERRITORY' ? 'In Territory (<100m)' : `${selectedRecord.distanceMeters > 1000 ? `${(selectedRecord.distanceMeters / 1000).toFixed(1)} km` : `${selectedRecord.distanceMeters}m`} Outside`}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {selectedRecord.assignedRegion} • {selectedRecord.punchAddress}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://www.google.com/maps?q=${selectedRecord.punchLat},${selectedRecord.punchLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#225091] hover:bg-[#183e70] transition-colors shadow-2xs"
                    >
                      <span>Google Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Minimal Table View */
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
          <TableWrapper minHeight="300px">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                <tr>
                  <th className="py-3 px-4 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Officer</th>
                  <th className="py-3 px-4 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Territory / Region</th>
                  <th className="py-3 px-4 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Punch Time</th>
                  <th className="py-3 px-4 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Distance</th>
                  <th className="py-3 px-4 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Status</th>
                  <th className="py-3 px-4 text-center font-semibold text-white text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4F8FD] transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{item.employeeName}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{item.assignedRegion}</td>
                    <td className="py-3 px-4 text-gray-500 font-medium">
                      {new Date(item.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {item.distanceMeters > 1000 ? `${(item.distanceMeters / 1000).toFixed(1)} km` : `${item.distanceMeters} m`}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.geofenceStatus === 'IN_TERRITORY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {item.geofenceStatus === 'IN_TERRITORY' ? 'In Territory' : 'Out of Territory'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecord(item);
                          setViewMode('MAP');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <MapIcon size={12} />
                        <span>Map</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}

      {/* Modal */}
      {isPunchModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Record Territory Check-In</h3>
              <button
                type="button"
                onClick={() => setIsPunchModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">Officer Name</label>
                <input
                  type="text"
                  placeholder="Enter officer name"
                  value={punchData.employeeName}
                  onChange={(e) => setPunchData(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">Region</label>
                <input
                  type="text"
                  value={punchData.assignedRegion}
                  onChange={(e) => setPunchData(prev => ({ ...prev, assignedRegion: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-600 font-bold">GPS Coordinates</label>
                  <button
                    type="button"
                    onClick={handleCaptureCurrentLocation}
                    disabled={capturingGps}
                    className="text-[#225091] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation size={11} />
                    <span>{capturingGps ? 'Capturing...' : 'Use My GPS'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Lat"
                    value={punchData.punchLat}
                    onChange={(e) => setPunchData(prev => ({ ...prev, punchLat: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px]"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Lng"
                    value={punchData.punchLng}
                    onChange={(e) => setPunchData(prev => ({ ...prev, punchLng: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPunchModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!punchData.employeeName.trim()) {
                    toast.error('Please enter officer name');
                    return;
                  }
                  const newEntry = {
                    id: `ONB-GEO-${Date.now().toString().slice(-4)}`,
                    employeeId: `ONB-${Math.floor(100 + Math.random() * 90)}`,
                    employeeName: punchData.employeeName.trim(),
                    designation: punchData.designation,
                    assignedRegion: punchData.assignedRegion,
                    officeLat: punchData.officeLat,
                    officeLng: punchData.officeLng,
                    punchInTime: new Date().toISOString(),
                    punchOutTime: null,
                    punchLat: punchData.punchLat,
                    punchLng: punchData.punchLng,
                    punchAddress: punchData.punchAddress || punchData.assignedRegion,
                    distanceMeters: 25,
                    geofenceStatus: 'IN_TERRITORY',
                    deviceInfo: 'Web GPS Portal',
                    currentBankVisit: 'Regional Branch Visit',
                    remarks: punchData.remarks || 'Standard check-in.'
                  };
                  setRecords(prev => [newEntry, ...prev]);
                  setSelectedRecord(newEntry);
                  setIsPunchModalOpen(false);
                  toast.success('Check-in recorded successfully!');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#225091] hover:bg-[#183e70] rounded-xl shadow-xs"
              >
                Save Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoTagging;
