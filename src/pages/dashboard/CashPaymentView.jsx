import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar, ChevronLeft, ChevronRight, Banknote, Wallet, Receipt } from 'lucide-react';
import SubmitCashModal from '../../components/modals/SubmitCashModal';
import { toast } from 'react-toastify';
import { cashPaymentService } from '../../api/cashPaymentService';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import { SkeletonDetailView, SkeletonTableRow } from '../../components/common/Skeleton';

const CashPaymentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employeeData, setEmployeeData] = useState(null);
  const [summaryCards, setSummaryCards] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      
      const response = await cashPaymentService.getCashPaymentDetails(id, params);
      if (response.success) {
        setEmployeeData(response.data?.employee || null);
        setSummaryCards(response.data?.summaryCards || null);
        setHistory(response.data?.cashSubmitHistory?.items || []);
        setTotalPages(response.data?.cashSubmitHistory?.meta?.totalPages || 1);
        setTotalRecords(response.data?.cashSubmitHistory?.meta?.totalRecords || 0);
      } else {
        toast.error(response.message || 'Failed to fetch details');
      }
    } catch (error) {
      console.error('Failed to fetch details', error);
      toast.error(error.response?.data?.message || 'Failed to fetch details');
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        if (error.response.data?.details) {
          console.error('Validation Details:', JSON.stringify(error.response.data.details, null, 2));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, page, limit, fromDate, toDate]);

  const handleCashSubmit = async (data) => {
    try {
      // Assuming data is { date, amount, remarks }
      const submitData = {
        date: data.date, // User inputs this date in the modal
        amount: Number(data.amount.replace(/[^0-9.]/g, '')), // Strips formatting like ₹, commas
        remarks: data.remarks
      };
      
      const response = await cashPaymentService.submitCash(id, submitData);
      if (response.success) {
        toast.success(response.message || 'Cash submitted successfully');
        setIsSubmitModalOpen(false);
        fetchDetails(); // Refresh
      } else {
        toast.error(response.message || 'Failed to submit cash');
      }
    } catch (error) {
      console.error('Failed to submit cash', error);
      toast.error(error.response?.data?.message || 'Failed to submit cash');
    }
  };

  if (isLoading && !employeeData) {
    return <SkeletonDetailView />;
  }

  if (!employeeData) {
    return <div className="p-6 text-red-500">Employee not found</div>;
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
      {/* Page Header */}
      <PageHeader
        title="Cash Payment Details"
        showBack={true}
        backUrl="/cash-payment"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Cash Payment', to: '/cash-payment' },
          { label: 'Employee Details' },
        ]}
      />

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 items-start shrink-0">
        <div className="w-24 h-24 rounded-full border-4 border-[#225091] overflow-hidden shrink-0 flex items-center justify-center bg-gray-50 text-2xl font-bold text-gray-500">
          {employeeData.profileImage ? (
            <img src={employeeData.profileImage} alt={employeeData.employeeName} className="w-full h-full object-cover" />
          ) : (
            employeeData.employeeName?.substring(0, 2).toUpperCase()
          )}
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="flex flex-col gap-2 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{employeeData.employeeName}</h1>
            <div className="inline-block bg-[#225091] text-white text-xs font-semibold px-3 py-1 rounded-full self-start">
              {employeeData.designation}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-medium">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#225091]" />
              {employeeData.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#225091]" />
              {employeeData.email}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#225091]" />
              {employeeData.branch}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        {/* Total Cash Collected */}
        <div className="bg-[#007bff] rounded-xl shadow-sm p-6 text-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <span className="text-sm font-semibold opacity-90">Total Cash Collected</span>
            <Banknote size={20} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold z-10">{summaryCards?.totalCashCollected?.formattedAmount}</div>
        </div>

        {/* Total Cash Submitted */}
        <div className="bg-[#28a745] rounded-xl shadow-sm p-6 text-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <span className="text-sm font-semibold opacity-90">Total Cash Submitted</span>
            <Receipt size={20} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold z-10">{summaryCards?.totalCashSubmitted?.formattedAmount}</div>
        </div>

        {/* Total Cash Pending */}
        <div className="bg-[#fd7e14] rounded-xl shadow-sm p-6 text-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <span className="text-sm font-semibold opacity-90">Total Cash Pending</span>
            <Wallet size={20} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold z-10">{summaryCards?.totalCashPending?.formattedAmount}</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end shrink-0">
        <button 
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-[#225091] hover:bg-[#193e73] text-white px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm text-sm cursor-pointer"
        >
          Submit Cash
        </button>
      </div>

      {/* History Table Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">Cash Submit History</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-36 focus:outline-none focus:border-[#225091]"
              />
            </div>
            <div className="relative">
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-36 focus:outline-none focus:border-[#225091]"
              />
            </div>
          </div>
        </div>

        <TableWrapper>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 w-20 text-center border-r border-white/20">Sr. No.</th>
                <th className="py-4 px-6 w-36 border-r border-white/20">Date</th>
                <th className="py-4 px-6 w-48 border-r border-white/20">Amount Submitted</th>
                <th className="py-4 px-6">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500 text-sm font-medium">No submission history found</td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-[#F4F8FD] transition-colors text-sm text-gray-600">
                    <td className="py-4 px-6 text-center">{(page - 1) * limit + idx + 1}</td>
                    <td className="py-4 px-6 font-medium text-gray-800">{item.formattedDate}</td>
                    <td className="py-4 px-6 font-semibold text-emerald-600">{item.formattedAmountSubmitted}</td>
                    <td className="py-4 px-6">
                      <p className="max-w-[400px] leading-relaxed">{item.remarks}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing {history.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} Entries</div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#225091] text-white border border-[#225091] shadow-sm">
              {page}
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#225091] hover:bg-[#225091] hover:text-white transition-colors shadow-sm disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <SubmitCashModal 
        isOpen={isSubmitModalOpen} 
        onClose={() => setIsSubmitModalOpen(false)} 
        onSubmit={handleCashSubmit} 
      />
    </div>
  );
};

export default CashPaymentView;
