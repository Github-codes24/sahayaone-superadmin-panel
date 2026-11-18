import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Loader2, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  Briefcase, 
  ArrowRightLeft, 
  Receipt, 
  Sparkles, 
  Building2, 
  Calendar, 
  IndianRupee, 
  CreditCard,
  User, 
  History, 
  FileCheck, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Info,
  Send, 
  Mail, 
  Phone, 
  Check, 
  PenTool, 
  UploadCloud, 
  AlertCircle, 
  Save, 
  Image as ImageIcon, 
  FileUp,
  RefreshCcw,
  Undo2,
  RotateCcw, 
  Pen,
  ChevronDown, 
  X, 
  ChevronRight,
  Copy
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import ExportDropdown from '../../components/common/ExportDropdown';
import { Skeleton } from '../../components/common/Skeleton';
import { cooperativeBankService } from '../../api/cooperativeBankService';
import { letterService, DOCUMENT_TYPE_CODES } from '../../api/letterService';
import { validateEmail } from '../../utils/validation';

const LETTER_TYPES = [
  { 
    id: 'Offer Letter', 
    name: 'Offer Letter', 
    code: 'OL',
    icon: Award,
    description: 'Official offer / appointment letter containing legal terms & compensation Annexure',
    badgeColor: 'bg-blue-50 text-[#225091] border-blue-200/60'
  },
  { 
    id: 'Confirmation Letter', 
    name: 'Confirmation Letter', 
    code: 'CL',
    icon: ShieldCheck,
    description: 'Employment confirmation upon successful probation review completion',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
  },
  { 
    id: 'Performance Letter', 
    name: 'Performance Appraisal', 
    code: 'PA',
    icon: Sparkles,
    description: 'Annual performance evaluation with 4-column KRA rating grid & manager comments',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/60'
  },
  { 
    id: 'Promotion Letter', 
    name: 'Promotion Letter', 
    code: 'PL',
    icon: Briefcase,
    description: 'Official promotion to upgraded designation & responsibilities',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200/60'
  },
  { 
    id: 'Transfer Letter', 
    name: 'Transfer Letter', 
    code: 'TL',
    icon: ArrowRightLeft,
    description: 'Branch relocation letter & automatic system branch assignment update',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
  },
  { 
    id: 'Salary Increment', 
    name: 'Salary Increment', 
    code: 'SI',
    icon: TrendingUp,
    description: 'Revised compensation structure & annual increment letter',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60'
  },
  { 
    id: 'Salary Slip', 
    name: 'Salary Slip', 
    code: 'SS',
    icon: Receipt,
    description: 'Monthly payroll statement with side-by-side Earnings vs Deductions grid',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60'
  },
  { 
    id: 'Termination Letter', 
    name: 'Termination Letter', 
    code: 'TM',
    icon: Trash2,
    description: 'Exit / relieving documentation & automatic employee deactivation in database',
    badgeColor: 'bg-red-50 text-red-700 border-red-200/60'
  }
];

const INITIAL_KRA_RATINGS = [
  { kraName: 'Business / Portfolio Growth', target: '₹5.0 Cr', achievement: '₹6.2 Cr', rating: '5.0' },
  { kraName: 'Collections / NPA Management', target: '< 1.0%', achievement: '0.4%', rating: '5.0' },
  { kraName: 'Compliance & Process Adherence', target: '100%', achievement: '98%', rating: '4.0' },
  { kraName: 'Team & Stakeholder Management', target: 'Satisfactory', achievement: 'Excellent', rating: '4.0' }
];

const DEFAULT_CORPORATE_OFFICES = [
  { id: '66ce7a901234567890abc999', name: 'Sahayaone Corporate Head Office, Pune', city: 'Pune', state: 'Maharashtra' },
  { id: '66ce7a901234567890abc002', name: 'Sahayaone Regional Office, Mumbai', city: 'Mumbai', state: 'Maharashtra' },
  { id: '66ce7a901234567890abc998', name: 'Sahayaone Zonal Center, Nagpur', city: 'Nagpur', state: 'Maharashtra' },
  { id: '66ce7a901234567890abc997', name: 'Sahayaone Regional Desk, Nashik', city: 'Nashik', state: 'Maharashtra' }
];

const DEFAULT_ROLES = [
  { id: 'R1', name: 'Team Lead - Regional Onboarding' },
  { id: 'R2', name: 'Senior Onboarding Specialist' },
  { id: 'R3', name: 'Assistant Vice President - Operations' },
  { id: 'R4', name: 'Operations & Technical Lead' },
  { id: 'R5', name: 'Executive Administrator' },
  { id: 'R6', name: 'Head - Client Onboarding' }
];

// --- High-Performance Searchable Employee Selector ---
const SearchableEmployeeSelect = ({ employees, selectedEmployeeId, onSelect, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedEmployee = useMemo(() => {
    return (employees || []).find(e => (e.id || e._id) === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees || [];
    const q = searchTerm.toLowerCase().trim();
    return (employees || []).filter(e => {
      const name = (e.fullName || e.name || '').toLowerCase();
      const code = (e.employeeCode || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      const desig = (e.designation || e.role?.name || e.role || '').toLowerCase();
      const branch = (e.branch?.name || e.branchName || '').toLowerCase();
      return name.includes(q) || code.includes(q) || email.includes(q) || desig.includes(q) || branch.includes(q);
    });
  }, [employees, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border rounded-xl text-sm transition-all text-left flex items-center justify-between shadow-2xs cursor-pointer ${
          isOpen ? 'border-[#225091] ring-2 ring-[#225091]/20 bg-white' : 'border-gray-200'
        }`}
      >
        {selectedEmployee ? (
          <div className="flex items-center gap-3 truncate">
            <div className="w-7 h-7 rounded-lg bg-[#225091]/10 text-[#225091] font-bold text-xs flex items-center justify-center shrink-0">
              {(selectedEmployee.fullName || selectedEmployee.name || 'E').slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate flex items-center gap-2">
              <span className="font-semibold text-gray-900">{selectedEmployee.fullName || selectedEmployee.name}</span>
              {selectedEmployee.employeeCode && (
                <span className="text-gray-400 font-mono text-xs">({selectedEmployee.employeeCode})</span>
              )}
              {selectedEmployee.modelLabel && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedEmployee.model === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedEmployee.modelLabel}
                </span>
              )}
              <span className="text-gray-500 text-xs font-normal truncate">
                • {selectedEmployee.designation || selectedEmployee.role?.name || selectedEmployee.role || 'Staff'}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 font-medium">
            {loading ? 'Loading Sahayaone staff directory...' : '-- Choose Corporate Employee from Directory --'}
          </span>
        )}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {employees && employees.length > 0 && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {employees.length} Staff
            </span>
          )}
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#225091]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, EMP code, designation, department..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#225091] focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 space-y-0.5 pr-1">
            {filteredEmployees.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 font-medium">
                No matching staff found in Sahayaone corporate directory.
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const empId = emp.id || emp._id;
                const isSelected = empId === selectedEmployeeId;
                return (
                  <button
                    key={empId}
                    type="button"
                    onClick={() => {
                      onSelect(empId);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full p-2.5 rounded-lg text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 text-[#225091]' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#225091] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {(emp.fullName || emp.name || 'E').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-gray-900">{emp.fullName || emp.name}</span>
                          {emp.employeeCode && (
                            <span className="text-[10px] font-mono font-bold text-[#225091] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                              {emp.employeeCode}
                            </span>
                          )}
                          {emp.modelLabel && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              emp.model === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {emp.modelLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5 truncate">
                          <span>{emp.designation || emp.role?.name || emp.role || 'Staff'}</span>
                          {emp.department && (
                            <>
                              <span>•</span>
                              <span className="truncate">{emp.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-[#225091] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};



// --- Interactive Touchpad & Mouse Signature Pad Canvas Component ---
const TouchpadSignatureCanvas = ({ onSaveSignature, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1B58A6'); // Bank Blue
  const [penWidth, setPenWidth] = useState(2.5);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  const colors = [
    { name: 'Bank Blue', hex: '#1B58A6', bg: 'bg-[#1B58A6]' },
    { name: 'Navy Blue', hex: '#0F294A', bg: 'bg-[#0F294A]' },
    { name: 'Black', hex: '#111827', bg: 'bg-gray-900' }
  ];

  const strokeWidths = [
    { name: 'Fine', value: 1.5 },
    { name: 'Medium', value: 2.5 },
    { name: 'Bold', value: 4.0 }
  ];

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (stroke.points.length < 1) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      
      if (stroke.points.length === 1) {
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
        return;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        const xc = (stroke.points[i].x + stroke.points[i - 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i - 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
      }
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    });

    if (currentStroke.length > 0) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.beginPath();
      if (currentStroke.length === 1) {
        ctx.arc(currentStroke[0].x, currentStroke[0].y, penWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = penColor;
        ctx.fill();
      } else {
        ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
        for (let i = 1; i < currentStroke.length; i++) {
          const xc = (currentStroke[i].x + currentStroke[i - 1].x) / 2;
          const yc = (currentStroke[i].y + currentStroke[i - 1].y) / 2;
          ctx.quadraticCurveTo(currentStroke[i - 1].x, currentStroke[i - 1].y, xc, yc);
        }
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
        ctx.stroke();
      }
    }
  }, [strokes, currentStroke, penColor, penWidth]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (e.target.setPointerCapture) {
      try { e.target.setPointerCapture(e.pointerId); } catch {}
    }
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setCurrentStroke([coords]);
    setHasDrawn(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    if (e.target.releasePointerCapture) {
      try { e.target.releasePointerCapture(e.pointerId); } catch {}
    }
    setIsDrawing(false);
    if (currentStroke.length > 0) {
      const newStrokes = [...strokes, { points: currentStroke, color: penColor, width: penWidth }];
      setStrokes(newStrokes);
      setCurrentStroke([]);
      exportSignatureData(newStrokes);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setHasDrawn(false);
    if (onClear) onClear();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    toast.info('Signature canvas cleared.');
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    if (newStrokes.length === 0) {
      setHasDrawn(false);
      if (onClear) onClear();
      toast.info('All strokes undone.');
    } else {
      exportSignatureData(newStrokes, false);
      toast.info('Last signature stroke undone.');
    }
  };

  const exportSignatureData = (targetStrokes, notify = true) => {
    const canvas = canvasRef.current;
    if (!canvas || targetStrokes.length === 0) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSaveSignature) {
      onSaveSignature(dataUrl);
    }
    if (notify) {
      toast.success('Touchpad signature rendered in PNG format.');
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Control Bar: Pen Color & Stroke Size & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50/90 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 mr-1">Ink:</span>
            {colors.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setPenColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  c.bg
                } ${penColor === c.hex ? 'ring-2 ring-offset-2 ring-[#225091] scale-110' : 'opacity-70 hover:opacity-100'}`}
                title={c.name}
              >
                {penColor === c.hex && <Check size={10} className="text-white" />}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Stroke Widths */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-gray-500 mr-1">Tip:</span>
            {strokeWidths.map(w => (
              <button
                key={w.name}
                type="button"
                onClick={() => setPenWidth(w.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  penWidth === w.value ? 'bg-[#225091] text-white shadow-2xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* Undo & Clear Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            title="Undo last stroke"
          >
            <Undo2 size={12} />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0 && !hasDrawn}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            title="Clear signature pad"
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Canvas Box */}
      <div className="relative border-2 border-dashed border-[#225091]/50 hover:border-[#225091] rounded-2xl bg-white p-1 overflow-hidden shadow-inner transition-colors">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-44 cursor-crosshair touch-none select-none rounded-xl bg-white block"
          style={{ touchAction: 'none' }}
        />

        {/* Watermark Guidelines & Hint */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Pen size={11} /> Touchpad / Mouse Signature Pad
            </span>
            <span>Smooth Bézier Mode</span>
          </div>

          <div className="w-full border-b border-dashed border-gray-200 pb-1 text-right">
            <span className="text-[10px] text-gray-400 italic">Sign with touchpad / mouse above ✍️</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          💡 <strong className="text-gray-700">Touchpad signing:</strong> Click & drag your finger across your touchpad.
        </span>
        {hasDrawn && strokes.length > 0 && (
          <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <Check size={12} /> Captured ({strokes.length} stroke{strokes.length > 1 ? 's' : ''})
          </span>
        )}
      </div>
    </div>
  );
};

export const LettersAndPayroll = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // RBAC Permission Check Helper
  const hasPermission = (permKey) => {
    if (!user) return true;
    const role = String(user.role || user.userType || '').trim().toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'ADMIN' || !role) return true;
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      return user.permissions.includes(permKey) || user.permissions.includes('*:*') || user.permissions.includes('*');
    }
    return true;
  };

  const canCreateLetters = hasPermission('employee_letters:create');
  const canEditSignature = hasPermission('employee_letters:edit');

  const [activeTab, setActiveTab] = useState('generate');
  const [selectedLetterType, setSelectedLetterType] = useState('Offer Letter');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  
  // Dual Output Modes: 'pdf' (Binary Stream Download/Preview) | 'json' (Metadata & S3 Link)
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [lastGeneratedMetadata, setLastGeneratedMetadata] = useState(null);

  // Super Admin Multi-Bank State
  const [bankOptions, setBankOptions] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  
  // All Banks Signature Overview State
  const [allBanksSignatures, setAllBanksSignatures] = useState([]);
  const [allBanksSignaturesLoading, setAllBanksSignaturesLoading] = useState(false);

  // Employee, Branch, Roles States
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [branches] = useState(DEFAULT_CORPORATE_OFFICES);
  const [roles] = useState(DEFAULT_ROLES);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Document Generation Output States
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');
  const [generatedDocTitle, setGeneratedDocTitle] = useState('');
  const [generatedRefNo, setGeneratedRefNo] = useState('');

  // History & Audit Logs States
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotalRecords, setHistoryTotalRecords] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyEmployeeFilter, setHistoryEmployeeFilter] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 10;
  const historyTableRef = useRef(null);

  // Modals States
  const [viewingHistoryItem, setViewingHistoryItem] = useState(null);
  const [autoSendEmail, setAutoSendEmail] = useState(false);
  const [emailModalItem, setEmailModalItem] = useState(null);
  const [emailModalAddress, setEmailModalAddress] = useState('');
  const [sendingHistoryEmail, setSendingHistoryEmail] = useState(false);
  const [sentHistoryIds, setSentHistoryIds] = useState([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Form Fields per Document Type
  const [offerCandidateName, setOfferCandidateName] = useState('');
  const [offerDesignation, setOfferDesignation] = useState('');
  const [offerJoiningDate, setOfferJoiningDate] = useState('');
  const [offerAnnualSalary, setOfferAnnualSalary] = useState('');
  const [offerDepartment, setOfferDepartment] = useState('Client Operations & Onboarding');
  const [offerPlaceOfPosting, setOfferPlaceOfPosting] = useState('Sahayaone Corporate Head Office, Pune');
  const [offerEmploymentType, setOfferEmploymentType] = useState('Full-Time Permanent');
  const [offerReportingManager, setOfferReportingManager] = useState('Vice President - Operations');

  const [probationStartDate, setProbationStartDate] = useState('');
  const [probationEndDate, setProbationEndDate] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [confirmationNoticePeriod, setConfirmationNoticePeriod] = useState('60');

  const [perfReviewPeriod, setPerfReviewPeriod] = useState('FY 2025–26');
  const [perfOverallRating, setPerfOverallRating] = useState('4.5 / 5.0 (Exceeds Expectations)');
  const [perfManagerComments, setPerfManagerComments] = useState('Consistently exceeded institution onboarding and technical delivery targets.');
  const [perfLetterText, setPerfLetterText] = useState('In recognition of your exceptional dedication and performance during this review period, the management conveys this formal appraisal evaluation.');
  const [perfAppraisalOutcome, setPerfAppraisalOutcome] = useState('Eligible for annual increment and promotion consideration.');
  const [kraRatings, setKraRatings] = useState(INITIAL_KRA_RATINGS);

  // Promotion Letter Fields
  const [promoNewRole, setPromoNewRole] = useState('Team Lead - Regional Onboarding');
  const [promoCurrentDesignation, setPromoCurrentDesignation] = useState('');
  const [promoDepartment, setPromoDepartment] = useState('Client Operations & Onboarding');
  const [promoEffectiveDate, setPromoEffectiveDate] = useState('');
  const [promoRevisedCtc, setPromoRevisedCtc] = useState('');
  const [promoResponsibilities, setPromoResponsibilities] = useState('Leading western zone onboarding desk, training field associates, and overseeing society software deployments.');
  const [promoReportingManager, setPromoReportingManager] = useState('Vice President - Operations');

  // Transfer Letter Fields
  const [transferToOffice, setTransferToOffice] = useState('Sahayaone Regional Office, Mumbai');
  const [transferToBranchId, setTransferToBranchId] = useState('');
  const [transferEffectiveDate, setTransferEffectiveDate] = useState('');
  const [transferReportingDate, setTransferReportingDate] = useState('');
  const [transferNewReportingManager, setTransferNewReportingManager] = useState('Regional Director (West)');
  const [transferHandoverTo, setTransferHandoverTo] = useState('Senior Operations Associate');

  // Salary Increment Fields
  const [incReviewPeriod, setIncReviewPeriod] = useState('FY 2025–26');
  const [incEffectiveDate, setIncEffectiveDate] = useState('');
  const [incFromMonth, setIncFromMonth] = useState('August');
  const [incPercentage, setIncPercentage] = useState('15');
  const [incCurrentCtc, setIncCurrentCtc] = useState('600000');
  const [incRevisedCtc, setIncRevisedCtc] = useState('690000');

  const [salaryDate, setSalaryDate] = useState('2026-08-01');
  const [payDate, setPayDate] = useState('2026-08-31');
  const [payPeriod, setPayPeriod] = useState('August 2026');
  const [salaryWorkingDays, setSalaryWorkingDays] = useState('31');
  const [salaryPresentDays, setSalaryPresentDays] = useState('30');
  const [salaryPaidDays, setSalaryPaidDays] = useState('30');
  const [salaryLopDays, setSalaryLopDays] = useState('1');
  const [salaryAccountNumber, setSalaryAccountNumber] = useState('912010045678901');
  const [salaryPfUan, setSalaryPfUan] = useState('100908765432');
  
  const [earnings, setEarnings] = useState([
    { label: 'Basic Salary', amount: 25000 },
    { label: 'House Rent Allowance (HRA)', amount: 12500 },
    { label: 'Special Allowance', amount: 12500 }
  ]);
  const [deductions, setDeductions] = useState([
    { label: 'Provident Fund (PF)', amount: 1800 },
    { label: 'Professional Tax (PT)', amount: 200 }
  ]);

  const [termDate, setTermDate] = useState('');
  const [termReason, setTermReason] = useState('Mutual separation agreement and conclusion of tenure.');
  const [termNoticePeriodDays, setTermNoticePeriodDays] = useState('30');
  const [termHandoverTo, setTermHandoverTo] = useState('Senior Operations Associate');

  // Bank Official Signature & Signatory Management State
  const [bankSignatureData, setBankSignatureData] = useState(null);
  const [sigLoading, setSigLoading] = useState(false);
  const [sigSaving, setSigSaving] = useState(false);
  const [sigSignatoryName, setSigSignatoryName] = useState('Authorized Signatory');
  const [sigSignatoryDesignation, setSigSignatoryDesignation] = useState('Head - Human Resources');
  const [sigFile, setSigFile] = useState(null);
  const [sigFilePreview, setSigFilePreview] = useState('');
  const [sigDirectUrl, setSigDirectUrl] = useState('');
  const [sigMode, setSigMode] = useState('file'); // 'file' | 'draw' | 'url'
  const [isDraggingSig, setIsDraggingSig] = useState(false);

  // 1. Fetch Banks
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const res = await cooperativeBankService.getBankDropdown();
        if (res && res.success && Array.isArray(res.data)) {
          setBankOptions(res.data);
          if (res.data.length > 0 && !selectedBankId) {
            setSelectedBankId(res.data[0]._id || res.data[0].id || '');
          }
        }
      } catch (err) {
        console.warn('Failed to load bank dropdown:', err);
      }
    };
    loadBanks();
  }, [selectedBankId]);

  // Selected Bank Object
  const selectedBank = useMemo(() => {
    return bankOptions.find(b => (b._id || b.id) === selectedBankId) || null;
  }, [bankOptions, selectedBankId]);

  // 2. Fetch Bank Signature Settings
  const fetchBankSignature = useCallback(async (bankId = null) => {
    setSigLoading(true);
    try {
      const targetId = bankId || selectedBankId;
      const res = await letterService.getBankSignatureSettings(targetId || undefined);
      if (res && res.success) {
        const data = Array.isArray(res.data) 
          ? res.data.find(b => (b.bankId || b.id || b._id) === targetId) || res.data[0]
          : res.data;

        if (data) {
          setBankSignatureData(data);
          if (data.signatoryName) setSigSignatoryName(data.signatoryName);
          if (data.signatoryDesignation) setSigSignatoryDesignation(data.signatoryDesignation);
          if (data.signatureUrl) {
            setSigDirectUrl(data.signatureUrl);
            setSigFilePreview(data.signatureUrl);
          }
        }
      }
    } catch (err) {
      console.warn('Bank signature fetch fallback:', err);
    } finally {
      setSigLoading(false);
    }
  }, [selectedBankId]);

  useEffect(() => {
    fetchBankSignature();
  }, [fetchBankSignature]);

  // Fetch all banks signature status overview for Tab 3
  const fetchAllBanksSignatures = useCallback(async () => {
    setAllBanksSignaturesLoading(true);
    try {
      const res = await letterService.getBankSignatureSettings(null);
      if (res && res.success && Array.isArray(res.data)) {
        setAllBanksSignatures(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch all banks signature overview:', err);
    } finally {
      setAllBanksSignaturesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'signature') {
      fetchAllBanksSignatures();
    }
  }, [activeTab, fetchAllBanksSignatures]);

  // Listen for direct navigation from Employee Profile / other views
  useEffect(() => {
    if (location.state?.employeeId) {
      setSelectedEmployeeId(location.state.employeeId);
    }
    if (location.state?.bankId) {
      setSelectedBankId(location.state.bankId);
    }
    if (location.state?.letterType) {
      setSelectedLetterType(location.state.letterType);
    }
  }, [location.state]);

  // 3. Fetch Sahayaone Corporate Staff (OnboardingTeam & Admin Staff)
  const loadCorporateStaff = useCallback(async () => {
    setFetchingEmployees(true);
    try {
      const list = await letterService.fetchAdvitaCorporateStaff();
      setEmployees(list);
      if (list.length > 0) {
        if (location.state?.employeeId) {
          const match = list.find(e => (e.id || e._id) === location.state.employeeId);
          if (match) {
            setSelectedEmployeeId(match.id || match._id);
            return;
          }
        }
        if (!selectedEmployeeId) {
          setSelectedEmployeeId(list[0].id || list[0]._id);
        }
      } else {
        setSelectedEmployeeId('');
        setCurrentEmployee(null);
      }
    } catch (err) {
      console.warn('Failed to load Sahayaone corporate staff:', err);
      setEmployees([]);
    } finally {
      setFetchingEmployees(false);
    }
  }, [location.state?.employeeId, selectedEmployeeId]);

  useEffect(() => {
    loadCorporateStaff();
  }, [loadCorporateStaff]);

  // Auto-fill current employee details
  useEffect(() => {
    if (!selectedEmployeeId || employees.length === 0) {
      setCurrentEmployee(null);
      return;
    }
    const emp = employees.find(e => (e.id || e._id) === selectedEmployeeId);
    if (emp) {
      setCurrentEmployee(emp);
      setOfferCandidateName(emp.fullName || emp.name || '');
      setOfferDesignation(emp.designation || emp.role?.name || emp.role || 'Senior Onboarding Specialist');
      setOfferAnnualSalary(emp.salary ? String(emp.salary) : '650000');
      setOfferDepartment(emp.department || 'Client Operations & Onboarding');
      setOfferPlaceOfPosting(emp.placeOfPosting || emp.branchName || 'Sahayaone Corporate Head Office, Pune');
      setOfferEmploymentType('Full-Time Permanent');
      setOfferReportingManager(emp.reportingManager || 'Vice President - Operations');
      setIncCurrentCtc(emp.salary ? String(emp.salary) : '600000');
      
      const salaryNum = Number(emp.salary) || 600000;
      const revised = Math.round(salaryNum * (1 + Number(incPercentage || 15) / 100));
      setIncRevisedCtc(String(revised));

      // Auto-calibrate Promotion & Transfer details
      setPromoCurrentDesignation(emp.designation || emp.role?.name || emp.role || 'Senior Onboarding Specialist');
      setPromoDepartment(emp.department || 'Client Operations & Onboarding');
      setPromoRevisedCtc(String(Math.round(salaryNum * 1.2)));
      setPromoEffectiveDate(new Date().toISOString().split('T')[0]);
      setTransferToOffice('Sahayaone Regional Office, Mumbai');
      setTransferEffectiveDate(new Date().toISOString().split('T')[0]);
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      setTransferReportingDate(nextDay.toISOString().split('T')[0]);
      setIncEffectiveDate(new Date().toISOString().split('T')[0]);

      // Dynamically calibrate monthly payroll breakdown
      const monthlyGross = Math.round(salaryNum / 12);
      const basic = Math.round(monthlyGross * 0.5);
      const hra = Math.round(monthlyGross * 0.25);
      const special = Math.max(0, monthlyGross - basic - hra);
      const pf = Math.min(1800, Math.round(basic * 0.12));
      setEarnings([
        { label: 'Basic Salary', amount: basic },
        { label: 'House Rent Allowance (HRA)', amount: hra },
        { label: 'Special Allowance', amount: special }
      ]);
      setDeductions([
        { label: 'Provident Fund (PF)', amount: pf },
        { label: 'Professional Tax (PT)', amount: 200 }
      ]);

      setSalaryAccountNumber(emp.accountNumber || '912010045678901');
      setSalaryPfUan(emp.pfUan || '100908765432');

      if (emp.joiningDate) {
        const jDate = new Date(emp.joiningDate).toISOString().split('T')[0];
        setOfferJoiningDate(jDate);
        setProbationStartDate(jDate);
        const pEnd = new Date(emp.joiningDate);
        pEnd.setMonth(pEnd.getMonth() + 6);
        setProbationEndDate(pEnd.toISOString().split('T')[0]);
        setConfirmationDate(pEnd.toISOString().split('T')[0]);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setOfferJoiningDate(today);
        setProbationStartDate(today);
        setConfirmationDate(today);
      }

      if (branches.length > 0 && !transferToBranchId) {
        setTransferToBranchId(branches[0].id || branches[0]._id);
      }
    }
  }, [selectedEmployeeId, employees, incPercentage, branches, transferToBranchId]);

  const handleWorkingDaysChange = (val) => {
    setSalaryWorkingDays(val);
    const w = Number(val) || 0;
    const p = Number(salaryPresentDays) || 0;
    setSalaryLopDays(String(Math.max(0, w - p)));
    setSalaryPaidDays(String(Math.min(w, p)));
  };

  const handlePresentDaysChange = (val) => {
    setSalaryPresentDays(val);
    const p = Number(val) || 0;
    const w = Number(salaryWorkingDays) || 0;
    setSalaryLopDays(String(Math.max(0, w - p)));
    setSalaryPaidDays(String(Math.min(w, p)));
  };

  // Recalculate revised CTC
  const handleCurrentCtcChange = (value) => {
    setIncCurrentCtc(value);
    const curr = Number(value) || 0;
    const perc = Number(incPercentage) || 0;
    setIncRevisedCtc(String(Math.round(curr * (1 + perc / 100))));
  };

  const handleIncrementPercentageChange = (value) => {
    setIncPercentage(value);
    const curr = Number(incCurrentCtc) || 0;
    const perc = Number(value) || 0;
    setIncRevisedCtc(String(Math.round(curr * (1 + perc / 100))));
  };

  // KRA matrix row handlers
  const handleKraChange = (index, field, value) => {
    setKraRatings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddKraRow = () => {
    setKraRatings(prev => [...prev, { kraName: '', target: '', achievement: '', rating: '4.0' }]);
  };

  const handleRemoveKraRow = (index) => {
    setKraRatings(prev => prev.filter((_, i) => i !== index));
  };

  // Salary Slip Earnings & Deductions handlers
  const handleEarningChange = (index, field, value) => {
    setEarnings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'amount' ? (Number(value) || 0) : value };
      return updated;
    });
  };

  const handleAddEarning = () => {
    setEarnings(prev => [...prev, { label: 'Performance Bonus', amount: 3000 }]);
  };

  const handleRemoveEarning = (index) => {
    setEarnings(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeductionChange = (index, field, value) => {
    setDeductions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'amount' ? (Number(value) || 0) : value };
      return updated;
    });
  };

  const handleAddDeduction = () => {
    setDeductions(prev => [...prev, { label: 'TDS / Tax', amount: 1000 }]);
  };

  const handleRemoveDeduction = (index) => {
    setDeductions(prev => prev.filter((_, i) => i !== index));
  };

  const grossSalaryCalc = useMemo(() => {
    return earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [earnings]);

  const totalDeductionsCalc = useMemo(() => {
    return deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [deductions]);

  const netSalaryCalc = useMemo(() => {
    return Math.max(0, grossSalaryCalc - totalDeductionsCalc);
  }, [grossSalaryCalc, totalDeductionsCalc]);

  // Signature File validation & preview
  const handleSignatureFileChange = (file) => {
    if (!file) return;
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    if (!isPng) {
      toast.error('Invalid format! Official signatures must be strictly in PNG format (.png).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Signature PNG file size should not exceed 5MB.');
      return;
    }
    setSigFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSigFilePreview(ev.target.result);
      toast.success(`PNG signature file "${file.name}" loaded successfully.`);
    };
    reader.readAsDataURL(file);
  };

  // Save Signature profile
  const handleSaveBankSignature = async (e) => {
    if (e) e.preventDefault();
    if (!canEditSignature) {
      toast.error('You do not have permission to modify bank signature settings (requires employee_letters:edit).');
      return;
    }
    if (!sigSignatoryName.trim()) {
      toast.error('Please enter the Authorized Signatory Name.');
      return;
    }
    if (!sigSignatoryDesignation.trim()) {
      toast.error('Please enter the Signatory Designation / Title.');
      return;
    }

    setSigSaving(true);
    try {
      let payload;
      if (sigMode === 'file' && sigFile) {
        payload = new FormData();
        payload.append('bankId', selectedBankId);
        payload.append('signature', sigFile);
        payload.append('signatoryName', sigSignatoryName.trim());
        payload.append('signatoryDesignation', sigSignatoryDesignation.trim());
      } else if (sigMode === 'url' && sigDirectUrl.trim()) {
        payload = {
          bankId: selectedBankId,
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureUrl: sigDirectUrl.trim()
        };
      } else if (sigFilePreview && sigFilePreview.startsWith('data:image')) {
        payload = {
          bankId: selectedBankId,
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureBase64: sigFilePreview
        };
      } else {
        payload = {
          bankId: selectedBankId,
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureUrl: bankSignatureData?.signatureUrl || sigDirectUrl || undefined
        };
      }

      const res = await letterService.updateBankSignatureSettings(payload, selectedBankId);
      if (res && res.success) {
        toast.success(res.message || 'Official bank PNG signature & authorized signatory profile saved successfully!');
        const updatedData = res.data || {
          ...bankSignatureData,
          bankId: selectedBankId,
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureUrl: res.data?.signatureUrl || sigFilePreview || bankSignatureData?.signatureUrl,
          updatedAt: new Date().toISOString()
        };
        setBankSignatureData(updatedData);
        setSigFile(null);
        fetchAllBanksSignatures();
      } else {
        toast.error(res?.message || 'Failed to update bank signature settings.');
      }
    } catch (err) {
      console.error('Error updating bank signature settings:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update signature settings.');
    } finally {
      setSigSaving(false);
    }
  };

  const handleResetSignatureForm = () => {
    if (bankSignatureData) {
      setSigSignatoryName(bankSignatureData.signatoryName || '');
      setSigSignatoryDesignation(bankSignatureData.signatoryDesignation || '');
      setSigDirectUrl(bankSignatureData.signatureUrl || '');
      setSigFilePreview(bankSignatureData.signatureUrl || '');
      setSigFile(null);
      toast.info('Reset signature form to current active server configuration.');
    } else {
      setSigSignatoryName('Aman Verma');
      setSigSignatoryDesignation('Head - Human Resources');
      setSigDirectUrl('');
      setSigFilePreview('');
      setSigFile(null);
    }
  };

  // Remove signature graphic
  const handleRemoveSignature = async () => {
    if (!canEditSignature) {
      toast.error('You do not have permission to remove bank signature settings (requires employee_letters:edit).');
      return;
    }
    if (!window.confirm('Are you sure you want to remove the bank official signature stamp image?')) return;
    setSigSaving(true);
    try {
      const payload = {
        bankId: selectedBankId,
        removeSignature: true,
        signatoryName: sigSignatoryName.trim(),
        signatoryDesignation: sigSignatoryDesignation.trim()
      };
      const res = await letterService.updateBankSignatureSettings(payload, selectedBankId);
      if (res && res.success) {
        toast.success(res.message || 'Signature image removed successfully.');
        setSigFilePreview('');
        setSigDirectUrl('');
        setSigFile(null);
        setBankSignatureData(prev => ({
          ...prev,
          signatureUrl: null,
          signatureKey: null,
          hasSignature: false
        }));
        fetchAllBanksSignatures();
      } else {
        toast.error(res?.message || 'Failed to remove signature.');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to remove signature.';
      toast.error(msg);
    } finally {
      setSigSaving(false);
    }
  };

  // 4. Fetch History Logs
  const fetchHistoryLogs = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = {
        page: historyPage,
        limit: historyLimit,
      };
      if (historyEmployeeFilter) params.employeeId = historyEmployeeFilter;
      if (historyTypeFilter !== 'ALL') {
        params.documentTypeCode = DOCUMENT_TYPE_CODES[historyTypeFilter] || historyTypeFilter;
      }
      if (historySearch.trim()) params.search = historySearch.trim();
      if (historyStartDate) params.startDate = historyStartDate;
      if (historyEndDate) params.endDate = historyEndDate;

      const response = await letterService.getHistory(params);
      let list = [];
      if (response && response.success) {
        list = Array.isArray(response.data) ? response.data : response.data?.items || [];
        setHistoryLogs(list);
        const total = response.meta?.totalRecords ?? list.length;
        setHistoryTotalRecords(total);
        setHistoryTotalPages(response.meta?.totalPages || Math.ceil(total / historyLimit) || 1);
      } else {
        setHistoryLogs([]);
        setHistoryTotalRecords(0);
        setHistoryTotalPages(1);
      }
    } catch (err) {
      console.warn('Failed to fetch history logs:', err);
      setHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyLimit, historyEmployeeFilter, historyTypeFilter, historySearch, historyStartDate, historyEndDate]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoryLogs();
    }
  }, [activeTab, fetchHistoryLogs]);

  // 5. Document Generation Handler
  const handleGenerateDocument = async (e) => {
    if (e) e.preventDefault();
    if (!canCreateLetters) {
      toast.error('You do not have permission to generate employee letters (requires employee_letters:create).');
      return;
    }
    if (!selectedEmployeeId) {
      toast.warning('Please select a Sahayaone corporate employee first.');
      return;
    }

    try {
      setLoading(true);
      setSentSuccess(false);

      const activeSignatoryName = sigSignatoryName || 'Authorized Signatory';
      const activeSignatoryDesignation = sigSignatoryDesignation || 'Head - Human Resources';

      let payload = { 
        letterType: selectedLetterType, 
        employeeId: selectedEmployeeId,
        signatoryName: activeSignatoryName,
        signatoryDesignation: activeSignatoryDesignation
      };
      const empName = currentEmployee?.fullName || currentEmployee?.name || offerCandidateName || 'Employee';
      const empEmail = currentEmployee?.email || '';

      switch (selectedLetterType) {
        case 'Offer Letter':
          payload = { 
            ...payload, 
            candidateName: offerCandidateName.trim() || empName, 
            designation: offerDesignation.trim() || currentEmployee?.designation || 'Senior Onboarding Specialist', 
            joiningDate: offerJoiningDate || new Date().toISOString().split('T')[0], 
            annualSalary: Number(offerAnnualSalary) || Number(currentEmployee?.salary) || 650000,
            salary: Number(offerAnnualSalary) || Number(currentEmployee?.salary) || 650000,
            department: offerDepartment.trim() || currentEmployee?.department || 'Client Operations & Onboarding',
            placeOfPosting: offerPlaceOfPosting.trim() || currentEmployee?.placeOfPosting || 'Sahayaone Corporate Head Office, Pune',
            employmentType: offerEmploymentType || 'Full-Time Permanent',
            reportingManager: offerReportingManager.trim() || 'Vice President - Operations'
          };
          break;

        case 'Confirmation Letter':
          payload = { 
            ...payload, 
            confirmationDate: confirmationDate || new Date().toISOString().split('T')[0], 
            dateOfJoining: probationStartDate || currentEmployee?.joiningDate,
            probationEndDate: probationEndDate || confirmationDate,
            noticePeriodDays: Number(confirmationNoticePeriod) || 60 
          };
          break;

        case 'Performance Letter':
          payload = { 
            ...payload, 
            reviewPeriod: perfReviewPeriod, 
            overallRating: perfOverallRating.includes('EXCELLENT') ? 'EXCELLENT' : (perfOverallRating.includes('AVERAGE') ? 'AVERAGE' : 'GOOD'), 
            ratingLabel: perfOverallRating,
            managerComments: perfManagerComments, 
            letterText: perfLetterText.trim() || undefined,
            appraisalOutcome: perfAppraisalOutcome, 
            kras: kraRatings.map(k => ({ kra: k.kraName, target: k.target, achievement: k.achievement, rating: k.rating }))
          };
          break;

        case 'Promotion Letter':
          payload = { 
            ...payload, 
            currentDesignation: promoCurrentDesignation.trim() || currentEmployee?.designation || 'Senior Onboarding Specialist',
            promotedToDesignation: promoNewRole,
            department: promoDepartment.trim() || currentEmployee?.department || 'Client Operations & Onboarding',
            effectiveDate: promoEffectiveDate || new Date().toISOString().split('T')[0],
            promotionDate: promoEffectiveDate || new Date().toISOString().split('T')[0],
            revisedCtc: Number(promoRevisedCtc) || Math.round((Number(currentEmployee?.salary) || 650000) * 1.2),
            responsibilitiesSummary: promoResponsibilities.trim(),
            reportingManager: promoReportingManager.trim()
          };
          break;

        case 'Transfer Letter':
          payload = { 
            ...payload, 
            transferToOffice: transferToOffice.trim() || 'Sahayaone Regional Office, Mumbai',
            transferToBranchId: transferToBranchId || undefined, 
            transferDate: transferEffectiveDate,
            effectiveDate: transferEffectiveDate, 
            reportingDate: transferReportingDate,
            newReportingManager: transferNewReportingManager.trim() || 'Regional Director (West)',
            handoverTo: transferHandoverTo.trim() || 'Senior Operations Associate'
          };
          break;

        case 'Salary Increment':
          payload = { 
            ...payload, 
            incrementPercentage: Number(incPercentage) || 12.5, 
            effectiveDate: incEffectiveDate, 
            fromMonth: incFromMonth,
            currentCtc: Number(incCurrentCtc) || Number(currentEmployee?.salary) || 500000, 
            revisedCtc: Number(incRevisedCtc) || 562500, 
            reviewPeriod: incReviewPeriod 
          };
          break;

        case 'Salary Slip':
          payload = { 
            ...payload, 
            fromMonth: payPeriod.split(' ')[0] || 'July',
            toMonth: payPeriod.split(' ')[0] || 'July',
            salaryMonth: payPeriod,
            salaryDate, 
            payDate, 
            workingDays: Number(salaryWorkingDays) || 31, 
            presentDays: Number(salaryPresentDays) || 30, 
            paidDays: Number(salaryPaidDays) || 30, 
            lopDays: Number(salaryLopDays) || 0, 
            grossSalary: grossSalaryCalc,
            totalDeductions: totalDeductionsCalc,
            netSalary: netSalaryCalc,
            accountNumber: salaryAccountNumber.trim() || undefined, 
            pfUan: salaryPfUan.trim() || undefined,
            earnings: earnings.map(e => ({ name: e.label, amount: Number(e.amount) || 0 })),
            deductions: deductions.map(d => ({ name: d.label, amount: Number(d.amount) || 0 }))
          };
          break;

        case 'Termination Letter':
          payload = { 
            ...payload, 
            terminationDate: termDate, 
            reason: termReason, 
            noticePeriodDays: Number(termNoticePeriodDays) || 30, 
            signatoryName: activeSignatoryName,
            signatoryDesignation: activeSignatoryDesignation
          };
          break;

        default:
          break;
      }

      // Branching between JSON Mode vs PDF Binary Stream Download
      if (outputFormat === 'json') {
        const jsonResponse = await letterService.generate(payload, { format: 'json' });
        const metadata = jsonResponse?.data || jsonResponse;
        setLastGeneratedMetadata(metadata);
        const refNum = metadata?.referenceNumber || `SAHAYAONE/HR/${DOCUMENT_TYPE_CODES[selectedLetterType]?.slice(0, 4) || 'DOC'}/2026/${Date.now().toString().slice(-3)}`;
        setGeneratedRefNo(refNum);
        setGeneratedDocTitle(`${selectedLetterType}_${(empName).replace(/\s+/g, '_')}`);
        if (metadata?.fileUrl) {
          setGeneratedPdfUrl(metadata.fileUrl);
        }

        setIsSuccessModalOpen(true);
        toast.success(`${selectedLetterType} generated successfully in JSON metadata mode!`);

        if (autoSendEmail && empEmail) {
          handleSendToEmployee(empEmail, refNum);
        }
        return;
      }

      // Generate in binary stream mode for immediate download & preview
      const responseData = await letterService.generate(payload, { format: 'blob' });
      const blob = responseData instanceof Blob ? responseData : new Blob([responseData], { type: 'application/pdf' });

      const blobUrl = URL.createObjectURL(blob);
      setGeneratedPdfUrl(blobUrl);

      const refNum = blob?.referenceNumber || `SAHAYAONE/HR/${DOCUMENT_TYPE_CODES[selectedLetterType]?.slice(0, 4) || 'DOC'}/2026/${Date.now().toString().slice(-3)}`;
      setGeneratedRefNo(refNum);
      setGeneratedDocTitle(`${selectedLetterType}_${(empName).replace(/\s+/g, '_')}`);

      if (blob?.fileUrl) {
        setLastGeneratedMetadata({
          fileUrl: blob.fileUrl,
          referenceNumber: refNum,
          documentType: selectedLetterType,
          generatedAt: new Date().toISOString()
        });
      }

      // Auto-download file directly
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${selectedLetterType}_${(empName).replace(/\s+/g, '_')}_${refNum.replace(/[/\\]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSuccessModalOpen(true);
      toast.success(`${selectedLetterType} generated and downloaded successfully!`);

      // If auto-send email is enabled
      if (autoSendEmail && empEmail) {
        handleSendToEmployee(empEmail);
      }
    } catch (err) {
      console.error('Error generating document:', err);
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to generate document.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Direct Download Trigger
  const handleDownload = () => {
    if (!generatedPdfUrl) return;
    const link = document.createElement('a');
    link.href = generatedPdfUrl;
    link.download = `${generatedDocTitle || 'Employee_Letter'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Document downloaded.');
  };

  // Direct Print Trigger
  const handlePrint = () => {
    if (!generatedPdfUrl) return;
    const printWindow = window.open(generatedPdfUrl);
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  // Dispatch Email to Employee
  const handleSendToEmployee = async (targetEmail = null) => {
    const empName = currentEmployee?.fullName || currentEmployee?.name || offerCandidateName || 'Employee';
    const empEmail = targetEmail || currentEmployee?.email || '';
    const empId = currentEmployee?._id || currentEmployee?.id || selectedEmployeeId;

    if (!empEmail) {
      toast.warning('No email address registered for this employee.');
      return;
    }

    setSendingEmail(true);
    try {
      const payload = {
        logId: lastGeneratedMetadata?.id || lastGeneratedMetadata?._id || lastGeneratedMetadata?.logId || undefined,
        employeeId: empId,
        documentTypeCode: DOCUMENT_TYPE_CODES[selectedLetterType] || 'OFFER_LETTER',
        customEmail: empEmail.trim(),
        variables: { employeeName: empName, designation: offerDesignation }
      };

      const res = await letterService.sendLetterEmail(payload);
      setSentSuccess(true);
      const msgId = res?.data?.messageId ? ` (ID: ${res.data.messageId})` : '';
      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Document Dispatched!</span>
          <span className="text-xs">Successfully sent {selectedLetterType} to {empName} ({empEmail}){msgId}.</span>
        </div>,
        { icon: <Send className="text-emerald-500" size={18} /> }
      );
    } catch (err) {
      console.error('Failed to dispatch email:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to dispatch document to employee.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Modal Email from History
  const handleOpenEmailModal = (item) => {
    setEmailModalItem(item);
    setEmailModalAddress(item.employeeEmail || (item.employeeName ? `${item.employeeName.toLowerCase().replace(/\s+/g, '.')}@advitacredit.com` : ''));
  };

  const handleSendHistoryEmail = async () => {
    if (!emailModalItem) return;
    const emailCheck = validateEmail(emailModalAddress.trim());
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error);
      return;
    }

    setSendingHistoryEmail(true);
    try {
      const rawId = emailModalItem.id || emailModalItem._id;
      const logId = rawId && String(rawId).length === 24 ? rawId : undefined;
      const docType = emailModalItem.documentType || emailModalItem.letterType || 'Offer Letter';
      const docCode = emailModalItem.documentTypeCode || DOCUMENT_TYPE_CODES[docType] || 'OFFER_LETTER';

      const payload = {
        logId,
        employeeId: emailModalItem.employeeId,
        documentTypeCode: docCode,
        customEmail: emailModalAddress.trim(),
        variables: {
          employeeName: emailModalItem.employeeName,
          designation: emailModalItem.metadata?.designation || 'Staff Member'
        }
      };

      const res = await letterService.sendLetterEmail(payload, logId);
      const itemId = emailModalItem.id || emailModalItem._id;
      setSentHistoryIds(prev => [...new Set([...prev, itemId])]);
      setHistoryLogs(prev => prev.map(h => ((h.id || h._id) === itemId ? { ...h, sentStatus: true } : h)));
      
      const msgId = res?.data?.messageId ? ` (MSG91 Ref: ${res.data.messageId})` : '';
      toast.success(`Successfully sent ${docType} to ${emailModalItem.employeeName || 'Employee'} (${emailModalAddress})${msgId}.`);
      setEmailModalItem(null);
    } catch (err) {
      console.error('Failed to dispatch history email:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to dispatch document email.');
    } finally {
      setSendingHistoryEmail(false);
    }
  };

  const handleResetForm = () => {
    if (generatedPdfUrl && generatedPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedPdfUrl);
    }
    setGeneratedPdfUrl('');
    setGeneratedRefNo('');
    setGeneratedDocTitle('');
    setSentSuccess(false);
    toast.info('Form ready for new document generation.');
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans antialiased pb-16">
      {/* Page Header */}
      <PageHeader
        title="Letters & Payroll"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR Management" },
          { label: "Letters & Payroll" }
        ]}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button" 
            onClick={() => setActiveTab('generate')} 
            className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${
              activeTab === 'generate' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileCheck size={16} />
            <span>Generate Document</span>
          </button>

          <button 
            type="button" 
            onClick={() => setActiveTab('history')} 
            className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${
              activeTab === 'history' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <History size={16} />
            <span>History ({historyTotalRecords})</span>
          </button>

          <button 
            type="button" 
            onClick={() => setActiveTab('signature')} 
            className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${
              activeTab === 'signature' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PenTool size={16} />
            <span>Tenant Bank Signatures</span>
            {bankSignatureData?.signatureUrl ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" title="Signature Active" />
            ) : (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">Setup</span>
            )}
          </button>
        </div>
      </PageHeader>

      {/* =========================================================================
          TAB 1: GENERATE DOCUMENT
         ========================================================================= */}
      {activeTab === 'generate' && (
        <div className="flex flex-col gap-5">
          {/* Official Sahayaone Corporate Letterhead Banner */}
          <div className="bg-gradient-to-r from-[#1b2559] via-[#225091] to-[#1e3a8a] text-white border border-blue-900/40 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/15 shadow-inner">
                  <Building2 size={24} className="text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-300/20">
                      Official Sahayaone Corporate Letterhead
                    </span>
                    <span className="text-[10px] font-semibold text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">
                      Direct Sahayaone Corporate Staff • No Bank Association Required
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
                    Sahayaone Urban Multistate Credit Co-operative Society Ltd.
                  </h3>
                  <div className="text-xs text-blue-100/80 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Head Office: A-303, Swagat Enclave Housing Society, Jambhulwadi Road, Pune – 411046, Maharashtra</span>
                    <span>•</span>
                    <span>support@advitacredit.com</span>
                    <span>•</span>
                    <a href="https://www.advitacredit.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">advitacredit.com</a>
                  </div>
                </div>
              </div>

              {/* Reference preview & Output format toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto bg-black/20 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shrink-0">
                <div className="text-xs pr-2">
                  <span className="text-[10px] uppercase font-bold text-blue-200 block">Reference No. Standard</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    SAHAYAONE/HR/{LETTER_TYPES.find(l => l.id === selectedLetterType)?.code || 'DOC'}/2026/001
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setOutputFormat('pdf')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      outputFormat === 'pdf' ? 'bg-white text-[#1b2559] shadow-xs' : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    PDF Stream
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('json')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      outputFormat === 'json' ? 'bg-white text-[#1b2559] shadow-xs' : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    JSON Mode
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-8 space-y-6">
              <form onSubmit={handleGenerateDocument} className="space-y-6">
                {/* Step 1: Select Document Type Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                      <span>Select Document Type</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-[#225091] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100/80">
                      {LETTER_TYPES.find(l => l.id === selectedLetterType)?.code} Standard
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedLetterType}
                      onChange={(e) => setSelectedLetterType(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-semibold cursor-pointer shadow-2xs appearance-none"
                    >
                      {LETTER_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.code}) — {type.description}
                        </option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                {/* Step 2: Searchable Employee Selection Dropdown */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                      <span>Select Sahayaone Corporate Employee</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {employees.length} corporate staff in directory
                    </span>
                  </div>

                  <SearchableEmployeeSelect
                    employees={employees}
                    selectedEmployeeId={selectedEmployeeId}
                    onSelect={(id) => setSelectedEmployeeId(id)}
                    loading={fetchingEmployees}
                  />

                  {/* Selected Employee Profile Details Card */}
                  {currentEmployee && (
                    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[#225091]" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Selected Employee Profile</span>
                        </div>
                        {currentEmployee.status && (
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            currentEmployee.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {currentEmployee.status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Avatar & Title */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#225091] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                            {(currentEmployee.fullName || currentEmployee.name || 'E').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-gray-900">{currentEmployee.fullName || currentEmployee.name}</h4>
                              {currentEmployee.employeeCode && (
                                <span className="font-mono text-[10px] font-bold text-[#225091] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                  {currentEmployee.employeeCode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#225091] mt-0.5">
                              {currentEmployee.designation || currentEmployee.role?.name || currentEmployee.role || 'Society Staff Member'}
                            </p>
                          </div>
                        </div>

                        {/* Metadata Badges & Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-gray-600 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/70">
                          {(currentEmployee.branch?.name || currentEmployee.branchName) && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <Building2 size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700 truncate max-w-[130px]" title={currentEmployee.branch?.name || currentEmployee.branchName}>
                                {currentEmployee.branch?.name || currentEmployee.branchName}
                              </span>
                            </div>
                          )}
                          {currentEmployee.email && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60 truncate">
                              <Mail size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700 truncate max-w-[130px]" title={currentEmployee.email}>
                                {currentEmployee.email}
                              </span>
                            </div>
                          )}
                          {currentEmployee.phoneNumber && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <Phone size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700">{currentEmployee.phoneNumber}</span>
                            </div>
                          )}
                          {currentEmployee.joiningDate && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <Calendar size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700">Joined {new Date(currentEmployee.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                          {currentEmployee.salary && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <CreditCard size={13} className="text-emerald-600 shrink-0" />
                              <span className="font-bold text-emerald-700">₹{Number(currentEmployee.salary).toLocaleString()}/yr</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informational Callout for Offer Letter */}
                  {selectedLetterType === 'Offer Letter' && currentEmployee && (
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-gray-700 animate-in fade-in duration-150">
                      <Info size={16} className="text-[#225091] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#225091]">Ready to Issue: </span>
                        <span>
                          Official Offer Letter will be generated for <strong>{currentEmployee.fullName || currentEmployee.name}</strong> as <strong>{offerDesignation || currentEmployee.designation || 'Staff Member'}</strong>. You can customize the offered terms and compensation below.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Parameter Fields for All Document Types */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                      <span>{selectedLetterType} Parameters</span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium ml-7 block">{LETTER_TYPES.find(l => l.id === selectedLetterType)?.description}</span>
                  </div>

                  {/* Offer Letter */}
                  {selectedLetterType === 'Offer Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Candidate / Staff Name <span className="text-rose-500">*</span></label>
                        <input type="text" required value={offerCandidateName} onChange={(e) => setOfferCandidateName(e.target.value)} placeholder="Full Name" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Offered Designation <span className="text-rose-500">*</span></label>
                        <input type="text" required value={offerDesignation} onChange={(e) => setOfferDesignation(e.target.value)} placeholder="e.g. Senior Associate" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Annual CTC / Compensation (₹/yr) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={offerAnnualSalary} onChange={(e) => setOfferAnnualSalary(e.target.value)} placeholder="e.g. 650000" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date of Joining <span className="text-rose-500">*</span></label>
                        <input type="date" required value={offerJoiningDate} onChange={(e) => setOfferJoiningDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
                        <input type="text" value={offerDepartment} onChange={(e) => setOfferDepartment(e.target.value)} placeholder="e.g. Operations / Retail Credit" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Place of Posting</label>
                        <input type="text" value={offerPlaceOfPosting} onChange={(e) => setOfferPlaceOfPosting(e.target.value)} placeholder="e.g. Mumbai Main Branch" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Employment Type</label>
                        <select value={offerEmploymentType} onChange={(e) => setOfferEmploymentType(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer">
                          <option value="Full-Time Permanent">Full-Time Permanent</option>
                          <option value="Probationary">Probationary (6 Months)</option>
                          <option value="Contractual">Contractual (Fixed Term)</option>
                          <option value="Part-Time / Consultant">Part-Time / Consultant</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reporting Manager</label>
                        <input type="text" value={offerReportingManager} onChange={(e) => setOfferReportingManager(e.target.value)} placeholder="e.g. Branch Head" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Confirmation Letter */}
                  {selectedLetterType === 'Confirmation Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Probation Start Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={probationStartDate} onChange={(e) => setProbationStartDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Probation End Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={probationEndDate} onChange={(e) => setProbationEndDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirmation Effective Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={confirmationDate} onChange={(e) => setConfirmationDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notice Period (Days) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={confirmationNoticePeriod} onChange={(e) => setConfirmationNoticePeriod(e.target.value)} placeholder="e.g. 60" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Performance Letter */}
                  {selectedLetterType === 'Performance Letter' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Review Period <span className="text-rose-500">*</span></label>
                          <input type="text" required value={perfReviewPeriod} onChange={(e) => setPerfReviewPeriod(e.target.value)} placeholder="e.g. FY 2025–26" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Overall Rating <span className="text-rose-500">*</span></label>
                          <input type="text" required value={perfOverallRating} onChange={(e) => setPerfOverallRating(e.target.value)} placeholder="e.g. 4.5 / 5.0 (Exceeds Expectations)" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Manager Comments <span className="text-rose-500">*</span></label>
                        <textarea rows={2} required value={perfManagerComments} onChange={(e) => setPerfManagerComments(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Official Letter Narrative (Body Text)</label>
                        <textarea rows={3} value={perfLetterText} onChange={(e) => setPerfLetterText(e.target.value)} placeholder="Custom narrative for the appraisal letter body..." className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Appraisal Outcome</label>
                        <input type="text" value={perfAppraisalOutcome} onChange={(e) => setPerfAppraisalOutcome(e.target.value)} placeholder="e.g. Eligible for annual increment and promotion." className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-xs border-collapse text-center text-sm whitespace-nowrap">
                          <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                            <tr>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">KRA Description</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Target</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Achieved</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Rating</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {kraRatings.map((row, idx) => (
                              <tr key={idx}>
                                <td className="p-2"><input value={row.kraName} onChange={(e) => handleKraChange(idx, 'kraName', e.target.value)} placeholder="Key Result Area" className="w-full p-1.5 border rounded-lg text-xs" /></td>
                                <td className="p-2"><input value={row.target} onChange={(e) => handleKraChange(idx, 'target', e.target.value)} placeholder="Target" className="w-full p-1.5 border rounded-lg text-xs" /></td>
                                <td className="p-2"><input value={row.achievement} onChange={(e) => handleKraChange(idx, 'achievement', e.target.value)} placeholder="Achieved" className="w-full p-1.5 border rounded-lg text-xs" /></td>
                                <td className="p-2"><input value={row.rating} onChange={(e) => handleKraChange(idx, 'rating', e.target.value)} placeholder="Rating" className="w-full p-1.5 border rounded-lg text-xs" /></td>
                                <td className="p-2 text-center"><button type="button" onClick={() => handleRemoveKraRow(idx)} className="text-rose-600 p-1 hover:bg-rose-50 rounded cursor-pointer" title="Delete KRA row"><Trash2 size={14}/></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button type="button" onClick={handleAddKraRow} className="text-xs font-bold text-[#225091] hover:underline cursor-pointer flex items-center gap-1">+ Add KRA Row</button>
                    </div>
                  )}

                  {/* Promotion Letter */}
                  {selectedLetterType === 'Promotion Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Promoted To Designation / Role <span className="text-rose-500">*</span></label>
                        <select
                          required
                          value={promoNewRole}
                          onChange={(e) => setPromoNewRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer"
                        >
                          <option value="">Select Upgraded Role</option>
                          {roles.map((r) => (
                            <option key={r.id || r._id} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Designation</label>
                        <input type="text" value={promoCurrentDesignation} onChange={(e) => setPromoCurrentDesignation(e.target.value)} placeholder="Pre-existing designation" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
                        <input type="text" value={promoDepartment} onChange={(e) => setPromoDepartment(e.target.value)} placeholder="e.g. Credit & Risk Management" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective Promotion Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={promoEffectiveDate} onChange={(e) => setPromoEffectiveDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Revised Annual CTC (₹/yr) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={promoRevisedCtc} onChange={(e) => setPromoRevisedCtc(e.target.value)} placeholder="e.g. 950000" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reporting Manager</label>
                        <input type="text" value={promoReportingManager} onChange={(e) => setPromoReportingManager(e.target.value)} placeholder="e.g. Managing Director / General Manager" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Responsibilities & Leadership Mandate</label>
                        <textarea rows={2} value={promoResponsibilities} onChange={(e) => setPromoResponsibilities(e.target.value)} placeholder="Summary of elevated leadership mandates, branch operations, and portfolio targets..." className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Transfer Letter */}
                  {selectedLetterType === 'Transfer Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Destination Office / Center <span className="text-rose-500">*</span></label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            required
                            value={transferToOffice}
                            onChange={(e) => setTransferToOffice(e.target.value)}
                            placeholder="e.g. Sahayaone Regional Office, Mumbai"
                            className="flex-1 px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]"
                          />
                          <select
                            value={transferToOffice}
                            onChange={(e) => {
                              setTransferToOffice(e.target.value);
                              const matched = branches.find(b => b.name === e.target.value);
                              if (matched) setTransferToBranchId(matched.id);
                            }}
                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer shadow-2xs"
                          >
                            <option value="">Quick Presets...</option>
                            {branches.map(b => (
                              <option key={b.id} value={b.name}>{b.name} ({b.city})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Transfer Effective Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={transferEffectiveDate} onChange={(e) => setTransferEffectiveDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reporting Date at Target Office <span className="text-rose-500">*</span></label>
                        <input type="date" required value={transferReportingDate} onChange={(e) => setTransferReportingDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Reporting Manager</label>
                        <input type="text" value={transferNewReportingManager} onChange={(e) => setTransferNewReportingManager(e.target.value)} placeholder="e.g. Regional Director (West)" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Handover Assigned To</label>
                        <input type="text" value={transferHandoverTo} onChange={(e) => setTransferHandoverTo(e.target.value)} placeholder="Colleague receiving operational charge" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Salary Increment */}
                  {selectedLetterType === 'Salary Increment' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Appraisal Review Period <span className="text-rose-500">*</span></label>
                        <input type="text" required value={incReviewPeriod} onChange={(e) => setIncReviewPeriod(e.target.value)} placeholder="e.g. FY 2025–26" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={incEffectiveDate} onChange={(e) => setIncEffectiveDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Commencing Month <span className="text-rose-500">*</span></label>
                        <select
                          value={incFromMonth}
                          onChange={(e) => setIncFromMonth(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer"
                        >
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current CTC (₹/yr) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={incCurrentCtc} onChange={(e) => handleCurrentCtcChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Increment Percentage (%) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={incPercentage} onChange={(e) => handleIncrementPercentageChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Salary Slip */}
                  {selectedLetterType === 'Salary Slip' && (
                    <div className="space-y-5">
                      {/* Payroll Core Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Statement Date <span className="text-rose-500">*</span></label>
                          <input type="date" value={salaryDate} onChange={(e) => setSalaryDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Salary Month / Cycle <span className="text-rose-500">*</span></label>
                          <input type="text" value={payPeriod} onChange={(e) => setPayPeriod(e.target.value)} placeholder="e.g. July 2026" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pay Date</label>
                          <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Working Days</label>
                          <input type="number" min="0" value={salaryWorkingDays} onChange={(e) => handleWorkingDaysChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Present Days</label>
                          <input type="number" min="0" value={salaryPresentDays} onChange={(e) => handlePresentDaysChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Paid Days</label>
                          <input type="number" min="0" value={salaryPaidDays} onChange={(e) => setSalaryPaidDays(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Loss of Pay (LOP) Days</label>
                          <input type="number" min="0" value={salaryLopDays} onChange={(e) => setSalaryLopDays(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Disbursement Account No.</label>
                          <input type="text" value={salaryAccountNumber} onChange={(e) => setSalaryAccountNumber(e.target.value)} placeholder="e.g. 912010045678901" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                        <div className="sm:col-span-2 md:col-span-4">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Provident Fund UAN (PF UAN)</label>
                          <input type="text" value={salaryPfUan} onChange={(e) => setSalaryPfUan(e.target.value)} placeholder="e.g. 100908765432" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                        </div>
                      </div>

                      {/* Dual-Column Interactive Payroll Breakdown: Earnings vs Deductions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        {/* Column 1: Earnings (Cr) */}
                        <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-2xl p-4.5 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Plus size={14} className="text-emerald-700" />
                              <span>Earnings (Allowances)</span>
                            </span>
                            <span className="text-xs font-bold text-emerald-700 font-mono">
                              ₹{grossSalaryCalc.toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {earnings.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(e) => handleEarningChange(idx, 'label', e.target.value)}
                                  placeholder="Earning Name"
                                  className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <div className="relative w-28">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.amount}
                                    onChange={(e) => handleEarningChange(idx, 'amount', e.target.value)}
                                    placeholder="Amount"
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEarning(idx)}
                                  disabled={earnings.length <= 1}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                                  title="Remove earning row"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleAddEarning}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add Earning Item</span>
                          </button>
                        </div>

                        {/* Column 2: Deductions (Dr) */}
                        <div className="bg-rose-50/40 border border-rose-200/70 rounded-2xl p-4.5 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Receipt size={14} className="text-rose-700" />
                              <span>Deductions (Taxes & PF)</span>
                            </span>
                            <span className="text-xs font-bold text-rose-700 font-mono">
                              -₹{totalDeductionsCalc.toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {deductions.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(e) => handleDeductionChange(idx, 'label', e.target.value)}
                                  placeholder="Deduction Name"
                                  className="flex-1 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                                <div className="relative w-28">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.amount}
                                    onChange={(e) => handleDeductionChange(idx, 'amount', e.target.value)}
                                    placeholder="Amount"
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-rose-500 text-right"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDeduction(idx)}
                                  disabled={deductions.length <= 1}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                                  title="Remove deduction row"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleAddDeduction}
                            className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add Deduction Item</span>
                          </button>
                        </div>
                      </div>

                      {/* Net Salary Summary Highlight */}
                      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                            <IndianRupee size={18} />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-gray-300 block">Calculated Net Take-Home Salary</span>
                            <span className="text-xs text-gray-400">
                              Gross: ₹{grossSalaryCalc.toLocaleString()} — Deductions: ₹{totalDeductionsCalc.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 rounded-xl flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Net Pay:</span>
                          <span className="text-base font-extrabold text-emerald-300 font-mono">
                            ₹{netSalaryCalc.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Termination Letter */}
                  {selectedLetterType === 'Termination Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Relieving / Exit Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={termDate} onChange={(e) => setTermDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notice Period (Days)</label>
                        <input type="number" min="0" required value={termNoticePeriodDays} onChange={(e) => setTermNoticePeriodDays(e.target.value)} placeholder="e.g. 30" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason for Exit</label>
                        <input type="text" required value={termReason} onChange={(e) => setTermReason(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Handover Assigned To</label>
                        <input type="text" required value={termHandoverTo} onChange={(e) => setTermHandoverTo(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: Official Sahayaone Corporate Authorized Signatory */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                      <span>Authorized Corporate Signatory</span>
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Sahayaone Corporate Head Office, Pune letterhead
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Signatory Name
                      </label>
                      <input
                        type="text"
                        value={sigSignatoryName}
                        onChange={(e) => setSigSignatoryName(e.target.value)}
                        placeholder="e.g. Authorized Signatory / Aman Verma"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Signatory Designation / Title
                      </label>
                      <input
                        type="text"
                        value={sigSignatoryDesignation}
                        onChange={(e) => setSigSignatoryDesignation(e.target.value)}
                        placeholder="e.g. Head - Human Resources"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#225091]"
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Options & Submit Button */}
                <div className="space-y-3 pt-2">
                  {/* Dual Mode Switcher: PDF Stream vs JSON Metadata */}
                  <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">Response Mode:</span>
                      <span className="text-[11px] text-gray-500">Dual output format per enterprise API specification</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setOutputFormat('pdf')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          outputFormat === 'pdf' ? 'bg-[#225091] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Download size={12} />
                        <span>PDF Stream (Default)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOutputFormat('json')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          outputFormat === 'json' ? 'bg-[#225091] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FileCheck size={12} />
                        <span>JSON Metadata</span>
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={autoSendEmail}
                      onChange={(e) => setAutoSendEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-[#225091] focus:ring-[#225091] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                        <Mail size={13} className="text-[#225091]" />
                        <span>Send copy to employee email automatically on generate</span>
                      </span>
                      <span className="text-[11px] text-gray-500">
                        The generated PDF will be downloaded immediately and automatically dispatched to the recipient's email.
                      </span>
                    </div>
                  </label>

                  <button 
                    type="submit" 
                    disabled={loading || !canCreateLetters} 
                    className="w-full bg-[#225091] hover:bg-[#193e73] text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Generating {outputFormat === 'json' ? 'Metadata' : 'PDF Document'}...</span>
                      </>
                    ) : (
                      <>
                        {outputFormat === 'json' ? <FileCheck size={18} /> : <Download size={18} />}
                        <span>{outputFormat === 'json' ? `Generate ${selectedLetterType} (JSON Mode)` : `Generate & Download ${selectedLetterType}`}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LETTER HISTORY & AUDIT LOGS
         ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
          {/* History Search & Filter Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  placeholder="Search by employee name, code, email, reference number..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                {/* Corporate Staff Filter for Super Admin */}
                <select
                  value={historyEmployeeFilter}
                  onChange={(e) => {
                    setHistoryEmployeeFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs shrink-0 max-w-[210px]"
                >
                  <option value="">All Corporate Staff</option>
                  {employees.map(emp => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.fullName || emp.name} ({emp.employeeCode || emp.modelLabel || 'Staff'})
                    </option>
                  ))}
                </select>

                <select
                  value={historyTypeFilter}
                  onChange={(e) => {
                    setHistoryTypeFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs shrink-0"
                >
                  <option value="ALL">All Document Types</option>
                  {LETTER_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <button
                  type="button"
                  onClick={fetchHistoryLogs}
                  disabled={historyLoading}
                  className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:text-[#225091] transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh history logs"
                >
                  <RefreshCw size={15} className={historyLoading ? 'animate-spin text-[#225091]' : ''} />
                </button>

                <ExportDropdown
                  title="Employee Letters Audit History"
                  filename={`Letters_Audit_History_${historyTypeFilter}_${Date.now()}`}
                  tableRef={historyTableRef}
                />
              </div>
            </div>

            {/* Date Range & Quick Clear Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/80 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={13} className="text-[#225091]" />
                  <span>Issue Date Range:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[11px]">From:</span>
                  <input
                    type="date"
                    value={historyStartDate}
                    onChange={(e) => {
                      setHistoryStartDate(e.target.value);
                      setHistoryPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[11px]">To:</span>
                  <input
                    type="date"
                    value={historyEndDate}
                    onChange={(e) => {
                      setHistoryEndDate(e.target.value);
                      setHistoryPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091]"
                  />
                </div>
              </div>

              {(historySearch || historyEmployeeFilter || historyTypeFilter !== 'ALL' || historyStartDate || historyEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setHistorySearch('');
                    setHistoryEmployeeFilter('');
                    setHistoryTypeFilter('ALL');
                    setHistoryStartDate('');
                    setHistoryEndDate('');
                    setHistoryPage(1);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table ref={historyTableRef} className="w-full border-collapse min-w-[950px] text-center text-sm whitespace-nowrap">
              <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                <tr>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Ref Number</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Employee & Role</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Posting Office</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Document Type</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Issued Date</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Details Summary</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {historyLoading ? (
                  Array.from({ length: 5 }).map((_, rIdx) => (
                    <tr key={rIdx} className="animate-pulse">
                      <td className="py-4 px-5"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-36 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-4 w-36 rounded" /></td>
                      <td className="py-4 px-5"><Skeleton className="h-8 w-28 rounded-lg" /></td>
                    </tr>
                  ))
                ) : historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                      <FileText size={32} className="mx-auto mb-2 opacity-50" />
                      <span>No Sahayaone staff letter logs found matching the filter criteria.</span>
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((item) => {
                    const docTypeConfig = LETTER_TYPES.find(t => t.id === item.documentType || t.id === item.letterType);
                    return (
                      <tr key={item.id || item._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#225091] text-xs">
                          {item.referenceNumber || item.id || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-900">{item.employeeName || 'Staff Member'}</span>
                            {item.employeeModel && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                item.employeeModel === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.employeeModel === 'OnboardingTeam' ? 'Onboarding' : item.employeeModel}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 font-normal">
                            {item.employeeCode ? `${item.employeeCode} • ` : ''}{item.employeeEmail || ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {item.branchName || 'Sahayaone Corporate Head Office, Pune'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${docTypeConfig ? docTypeConfig.badgeColor : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {item.documentType || item.letterType || 'Letter'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                          {item.formattedIssuedDate || (item.issuedDate ? new Date(item.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (item.generatedAt ? new Date(item.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'))}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate text-left" title={item.detailsSummary}>
                          {item.detailsSummary || 'Official employment record'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.fileUrl && (
                              <>
                                <a
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={`${item.referenceNumber || 'document'}.pdf`}
                                  className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                                  title="Download PDF file"
                                >
                                  <Download size={14} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.fileUrl);
                                    toast.info('S3 Cloud URL copied to clipboard!');
                                  }}
                                  className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                  title="Copy Permanent S3 Link"
                                >
                                  <Copy size={14} />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setViewingHistoryItem(item)}
                              className="p-1.5 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEmailModal(item)}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                item.sentStatus || sentHistoryIds.includes(item.id || item._id)
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-blue-50 text-[#225091] hover:bg-blue-100 border border-blue-200'
                              }`}
                              title="Send document to employee email"
                            >
                              {item.sentStatus || sentHistoryIds.includes(item.id || item._id) ? (
                                <>
                                  <CheckCircle2 size={13} className="text-purple-600" />
                                  <span>Sent</span>
                                </>
                              ) : (
                                <>
                                  <Mail size={13} />
                                  <span>Send</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* History Pagination */}
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing page {historyPage} of {historyTotalPages || 1} ({historyTotalRecords} total records)
            </span>
            <Pagination
              page={historyPage}
              totalPages={historyTotalPages || 1}
              totalRecords={historyTotalRecords}
              limit={historyLimit}
              onPageChange={setHistoryPage}
              disabled={historyLoading}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TENANT CLIENT BANK SIGNATURE SETTINGS (SOCIETY PANEL ADMIN)
         ========================================================================= */}
      {activeTab === 'signature' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Header Info Banner */}
          <div className="bg-gradient-to-r from-[#225091] via-[#1a4077] to-[#153460] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-xs font-semibold">
                <ShieldCheck size={14} />
                <span>Tenant Co-operative Banks Letterhead Configuration (Society Panel Admin)</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Tenant Client Bank Signature Settings</h2>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Administrative configuration for tenant client co-operative banks. Upload official PNG stamps and set signatory profiles for client banks (rendered in the Society Panel). Letters issued for direct Sahayaone corporate staff use Sahayaone's own official letterhead.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-xs text-white shrink-0 min-w-[220px]">
              <span className="text-blue-200 block text-[11px]">Select Client Bank</span>
              <select
                value={selectedBankId}
                onChange={(e) => {
                  setSelectedBankId(e.target.value);
                  fetchBankSignature(e.target.value);
                }}
                className="w-full mt-1 px-2.5 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
              >
                {bankOptions.map(b => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.bankName || b.name}
                  </option>
                ))}
              </select>
              {bankSignatureData?.updatedAt && (
                <span className="text-[10px] text-blue-200/80 block mt-1.5">
                  Last Updated: {new Date(bankSignatureData.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* All-Banks Authorized Signatory Overview Cards */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#225091] flex items-center justify-center font-bold">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Co-operative Banks Signatory Status Overview</h3>
                  <p className="text-[11px] text-gray-500">
                    Live verification and signature graphic readiness across all registered institutions ({bankOptions.length} banks)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchAllBanksSignatures}
                disabled={allBanksSignaturesLoading}
                className="self-start sm:self-auto px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-200 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} className={allBanksSignaturesLoading ? 'animate-spin text-[#225091]' : ''} />
                <span>Refresh Overview</span>
              </button>
            </div>

            {allBanksSignaturesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2 animate-pulse">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-36 rounded" />
                    <Skeleton className="h-6 w-20 rounded-full mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {bankOptions.map((bank) => {
                  const bId = bank._id || bank.id;
                  const sigInfo = allBanksSignatures.find(s => (s.bankId || s.id || s._id) === bId);
                  const hasSig = sigInfo?.hasSignature || !!sigInfo?.signatureUrl || (bId === selectedBankId && !!bankSignatureData?.signatureUrl);
                  const signatory = sigInfo?.signatoryName || (bId === selectedBankId ? (bankSignatureData?.signatoryName || sigSignatoryName) : 'Authorized Signatory');
                  const designation = sigInfo?.signatoryDesignation || (bId === selectedBankId ? (bankSignatureData?.signatoryDesignation || sigSignatoryDesignation) : 'Head of HR');
                  const isSelected = selectedBankId === bId;

                  return (
                    <div
                      key={bId}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected 
                          ? 'bg-blue-50/40 border-[#225091] ring-1 ring-[#225091]/30 shadow-xs' 
                          : 'bg-white hover:bg-gray-50/60 border-gray-200/80 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-gray-900 truncate" title={bank.bankName || bank.name}>
                            {bank.bankName || bank.name}
                          </h4>
                          {hasSig ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                              <AlertCircle size={10} /> Pending
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400 mt-0.5">Code: {bank.bankCode || 'UCB'}</div>
                        <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] space-y-0.5">
                          <div className="font-semibold text-gray-800 truncate">{signatory}</div>
                          <div className="text-gray-500 truncate text-[10px]">{designation}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBankId(bId);
                          fetchBankSignature(bId);
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#225091] text-white shadow-2xs'
                            : 'bg-gray-100 hover:bg-[#225091] hover:text-white text-gray-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} />
                            <span>Currently Editing</span>
                          </>
                        ) : (
                          <>
                            <PenTool size={12} />
                            <span>Edit Signatory</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Section */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
              <form onSubmit={handleSaveBankSignature} className="space-y-6">
                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                    Signature Graphic Input Source
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSigMode('file')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sigMode === 'file' ? 'bg-white text-[#225091] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <UploadCloud size={14} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigMode('draw')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sigMode === 'draw' ? 'bg-white text-[#225091] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Pen size={14} />
                      <span>Draw on Touchpad</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigMode('url')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sigMode === 'url' ? 'bg-white text-[#225091] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ExternalLink size={14} />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* Draw on Touchpad Mode */}
                {sigMode === 'draw' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>Draw Signature with Laptop Touchpad / Mouse <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-[#225091] font-semibold">Real-time vector smoothing</span>
                    </label>
                    <TouchpadSignatureCanvas
                      onSaveSignature={(dataUrl) => {
                        setSigFilePreview(dataUrl);
                        setSigFile(null);
                      }}
                      onClear={() => {
                        setSigFilePreview('');
                        setSigFile(null);
                      }}
                    />
                  </div>
                )}

                {/* File Upload Mode Dropzone */}
                {sigMode === 'file' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>Signature Graphic Image (PNG Only) <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] font-bold text-[#225091] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">.png format</span>
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingSig(true); }}
                      onDragLeave={() => setIsDraggingSig(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingSig(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleSignatureFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                        isDraggingSig
                          ? 'border-[#225091] bg-blue-50/50 scale-[0.99]'
                          : 'border-gray-300 hover:border-[#225091] bg-gray-50/50 hover:bg-gray-50'
                      }`}
                      onClick={() => document.getElementById('signature-file-input')?.click()}
                    >
                      <input
                        id="signature-file-input"
                        type="file"
                        accept="image/png, .png"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleSignatureFileChange(e.target.files[0]);
                          }
                        }}
                      />

                      {sigFilePreview ? (
                        <div className="space-y-3">
                          <div className="max-w-[260px] h-24 mx-auto bg-white border border-gray-200 rounded-xl p-2 flex items-center justify-center shadow-2xs relative group">
                            <img
                              src={sigFilePreview}
                              alt="Signature Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSigFile(null);
                                setSigFilePreview('');
                                toast.info('Signature graphic removed.');
                              }}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
                              title="Remove Signature"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {sigFile ? `Selected PNG: ${sigFile.name} (${(sigFile.size / 1024).toFixed(1)} KB)` : 'Current Active PNG Graphic'}
                          </p>
                          <span className="text-[11px] font-bold text-[#225091] hover:underline block">Click or Drag to Replace PNG Graphic</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#225091] flex items-center justify-center mx-auto border border-blue-100">
                            <FileUp size={22} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-800">Click to browse PNG</span>
                            <span className="text-xs text-gray-500"> or drag and drop PNG image here</span>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            PNG format only with transparent background (.png, Max: 5MB, Recommended: 400×120px)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Direct URL Mode */}
                {sigMode === 'url' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">
                      Direct HTTP / S3 Signature Graphic URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <ImageIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={sigDirectUrl}
                        onChange={(e) => {
                          setSigDirectUrl(e.target.value);
                          setSigFilePreview(e.target.value);
                        }}
                        placeholder="https://storage.advitacredit.com/society/banks/signature.png"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
                      />
                    </div>
                    {sigDirectUrl && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                        <img
                          src={sigDirectUrl}
                          alt="Signature Preview"
                          className="h-12 max-w-[140px] object-contain bg-white rounded border p-1"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-xs text-gray-600">URL preview rendering</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Signatory Profile Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Authorized Signatory Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sigSignatoryName}
                      onChange={(e) => setSigSignatoryName(e.target.value)}
                      placeholder="e.g. Aman Verma"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Signatory Designation / Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sigSignatoryDesignation}
                      onChange={(e) => setSigSignatoryDesignation(e.target.value)}
                      placeholder="e.g. Head - Human Resources"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetSignatureForm}
                      className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCcw size={13} />
                      <span>Reset</span>
                    </button>

                    {(bankSignatureData?.signatureUrl || sigFilePreview) && (
                      <button
                        type="button"
                        disabled={sigSaving || sigLoading}
                        onClick={handleRemoveSignature}
                        className="px-4 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Remove signature stamp image from server"
                      >
                        <Trash2 size={13} />
                        <span>Remove Signature Stamp</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={sigSaving || sigLoading}
                    className="px-6 py-2.5 bg-[#225091] hover:bg-[#193e73] text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sigSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Signature & Signatory Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Signatory Preview Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Document Stamp Preview
                      </h3>
                      <span className="text-[10px] text-gray-400">Live rendering on letter footer</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Official Stamp
                  </span>
                </div>

                {/* Stamp Simulation Box */}
                <div className="bg-gradient-to-b from-slate-50/80 to-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">
                    Authorized Signatory
                  </div>

                  <div className="h-20 flex items-center justify-center my-2">
                    {sigFilePreview || bankSignatureData?.signatureUrl ? (
                      <img
                        src={sigFilePreview || bankSignatureData?.signatureUrl}
                        alt="Authorized Signature"
                        className="max-h-full max-w-[200px] object-contain drop-shadow-xs"
                      />
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-lg px-6 py-3 text-xs text-gray-400 italic">
                        [ Signature Graphic Image Space ]
                      </div>
                    )}
                  </div>

                  {/* Signatory line */}
                  <div className="w-48 mx-auto border-t-2 border-gray-800 pt-1">
                    <div className="font-extrabold text-xs text-gray-900 tracking-wide uppercase">
                      {sigSignatoryName.trim() || 'Aman Verma'}
                    </div>
                    <div className="text-[11px] font-semibold text-[#225091]">
                      {sigSignatoryDesignation.trim() || 'Head - Human Resources'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {selectedBank?.bankName || 'Sahayaone Co-operative Bank Society Ltd.'}
                    </div>
                  </div>
                </div>

                {/* Checklist & Instructions */}
                <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-xs space-y-2.5 text-gray-700">
                  <span className="font-bold text-[#225091] flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Cross-Document Integration</span>
                  </span>
                  <ul className="text-[11px] space-y-1.5 text-gray-600 list-disc list-inside">
                    <li>Renders above signatory line on Offer, Confirmation & Appraisal letters.</li>
                    <li>Embedded into Promotion, Branch Transfer, Increment & Termination notices.</li>
                    <li>Printed in monthly Salary Slips alongside authorized stamp.</li>
                    <li>Uploaded once and automatically synchronized for all future letter issuances.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & DIALOGS
         ========================================================================= */}
      
      {/* 1. In-App Full-Screen Document Preview Modal */}
      {isPreviewModalOpen && generatedPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#225091]/10 text-[#225091] flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedLetterType} Document Preview</h3>
                  <span className="text-[11px] font-mono text-gray-500">Ref: {generatedRefNo}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Embedded Iframe PDF Viewer */}
            <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
              <iframe
                src={`${generatedPdfUrl}#toolbar=0&navpanes=0`}
                title="Generated Letter Preview"
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs shrink-0">
              <div className="text-gray-500">
                Recipient: <strong className="text-gray-800">{currentEmployee?.fullName || currentEmployee?.name || offerCandidateName || 'Employee'}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={sendingEmail}
                  onClick={() => handleSendToEmployee()}
                  className="px-4 py-1.5 bg-[#225091] hover:bg-[#193e73] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>{sendingEmail ? 'Sending...' : 'Send to Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Document Generated Success Modal */}
      {isSuccessModalOpen && generatedPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header with Success Badge */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    Generated & Logged in History
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    {selectedLetterType} Ready
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document & Recipient Details */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 text-xs space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <span>Reference Number:</span>
                <span className="font-mono font-bold text-[#225091] bg-white px-2 py-0.5 rounded border border-blue-100">
                  {generatedRefNo}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Recipient Employee:</span>
                <span className="font-bold text-gray-900">
                  {currentEmployee?.fullName || currentEmployee?.name || 'Employee'}
                </span>
              </div>
              {currentEmployee?.designation && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Designation:</span>
                  <span className="font-medium text-gray-700">{currentEmployee.designation}</span>
                </div>
              )}
              {currentEmployee?.email && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Email:</span>
                  <span className="font-mono text-gray-700">{currentEmployee.email}</span>
                </div>
              )}
            </div>

            {/* Permanent Cloud Storage (AWS S3) Link */}
            {lastGeneratedMetadata?.fileUrl && (
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#225091] flex items-center gap-1">
                    <ExternalLink size={12} /> Permanent AWS S3 Document Link:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(lastGeneratedMetadata.fileUrl);
                      toast.success('Permanent S3 URL copied to clipboard!');
                    }}
                    className="text-[11px] font-bold text-[#225091] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={11} /> Copy URL
                  </button>
                </div>
                <div className="font-mono text-[10px] text-gray-600 truncate bg-white p-1.5 rounded border border-gray-200" title={lastGeneratedMetadata.fileUrl}>
                  {lastGeneratedMetadata.fileUrl}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl bg-[#225091] hover:bg-[#193e73] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Download size={15} />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsPreviewModalOpen(true);
                }}
                className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Eye size={15} />
                <span>Preview Document</span>
              </button>
            </div>

            {/* Email & Print Secondary Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={sendingEmail}
                onClick={() => handleSendToEmployee()}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  sentSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white hover:bg-blue-50 text-[#225091] border-blue-200'
                }`}
              >
                {sendingEmail ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : sentSuccess ? (
                  <Check size={13} />
                ) : (
                  <Send size={13} />
                )}
                <span>{sentSuccess ? 'Email Dispatched' : 'Send via Email'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Document</span>
              </button>
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveTab('history');
                  fetchHistoryLogs();
                }}
                className="text-xs font-bold text-[#225091] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <History size={14} />
                <span>Open in History Table ➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  handleResetForm();
                }}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Generate Another</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* 4. View-Only History Document Modal */}
      {viewingHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#225091] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {viewingHistoryItem.documentType || viewingHistoryItem.letterType || 'Document'}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  Document History Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingHistoryItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Reference Number</span>
                <span className="font-mono font-bold text-[#225091]">{viewingHistoryItem.referenceNumber || viewingHistoryItem.id || '—'}</span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Issued Date</span>
                <span className="font-bold text-gray-800">
                  {viewingHistoryItem.formattedIssuedDate || (viewingHistoryItem.issuedDate ? new Date(viewingHistoryItem.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (viewingHistoryItem.generatedAt ? new Date(viewingHistoryItem.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'))}
                </span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Recipient Employee</span>
                <span className="font-bold text-gray-900">{viewingHistoryItem.employeeName || 'Staff'}</span>
                {viewingHistoryItem.employeeCode && (
                  <span className="text-gray-500 font-mono block text-[10px]">Code: {viewingHistoryItem.employeeCode}</span>
                )}
                <span className="text-gray-400 block text-[11px] truncate">{viewingHistoryItem.employeeEmail}</span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Branch Location</span>
                <span className="font-bold text-gray-800">{viewingHistoryItem.branchName || 'Main Branch'}</span>
                {viewingHistoryItem.branchCity && (
                  <span className="text-gray-400 block text-[11px]">{viewingHistoryItem.branchCity}{viewingHistoryItem.branchState ? `, ${viewingHistoryItem.branchState}` : ''}</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs">
              <span className="text-gray-500 font-bold block mb-1">Summary Breakdown</span>
              <p className="text-gray-700 font-medium leading-relaxed">{viewingHistoryItem.detailsSummary || 'Official document generated and registered in system.'}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const item = viewingHistoryItem;
                  setViewingHistoryItem(null);
                  handleOpenEmailModal(item);
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
              >
                <Mail size={13} />
                <span>Send to Email</span>
              </button>
              {viewingHistoryItem.fileUrl && (
                <a
                  href={viewingHistoryItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${viewingHistoryItem.referenceNumber || 'document'}.pdf`}
                  className="px-4 py-2 bg-[#225091] hover:bg-[#193e73] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setViewingHistoryItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Dedicated Send to Email Modal from History */}
      {emailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#225091]/10 text-[#225091] flex items-center justify-center font-bold">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Send Document to Email</h3>
                  <p className="text-[11px] text-gray-500">
                    {emailModalItem.documentType || emailModalItem.letterType || 'Document'} ({emailModalItem.referenceNumber || 'Official Record'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Recipient:</span>
                  <span className="font-bold text-gray-800">{emailModalItem.employeeName || 'Staff Member'}</span>
                </div>
                {emailModalItem.branchName && (
                  <div className="flex justify-between text-gray-500">
                    <span>Branch:</span>
                    <span className="font-medium text-gray-700">{emailModalItem.branchName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recipient Email Address <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={emailModalAddress}
                    onChange={(e) => setEmailModalAddress(e.target.value)}
                    placeholder="Enter recipient email (e.g. employee@advitabank.com)"
                    className="w-full pl-8.5 pr-3 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
                  />
                </div>
              </div>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-[11px] text-[#225091] flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>The official PDF document attachment along with reference details will be dispatched immediately.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEmailModalItem(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingHistoryEmail}
                onClick={handleSendHistoryEmail}
                className="px-5 py-2.5 bg-[#225091] hover:bg-[#193e73] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {sendingHistoryEmail ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Email Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LettersAndPayroll;
