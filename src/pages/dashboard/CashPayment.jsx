import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Eye, ChevronLeft, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { cashPaymentService } from '../../api/cashPaymentService';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';
import { Skeleton, SkeletonTableRow } from '../../components/common/Skeleton';

const CashPayment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cashPayments, setCashPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchCashPayments = async () => {
      setIsLoading(true);
      try {
        const response = await cashPaymentService.getCashPayments({
          page,
          limit,
          search: searchTerm
        });
        if (response.success) {
          setCashPayments(response.data);
          setTotalPages(response.meta.totalPages);
          setTotalRecords(response.meta.totalRecords);
        } else {
          toast.error(response.message || 'Failed to fetch cash payments');
        }
      } catch (error) {
        console.error('Failed to fetch cash payments', error);
        toast.error(error.response?.data?.message || 'Failed to fetch cash payments');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Using a simple debounce for search if needed, but here we just fetch directly
    const delayDebounceFn = setTimeout(() => {
      fetchCashPayments();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, limit, searchTerm]);

  const filteredData = cashPayments;

  const handleExport = () => {
    if (!cashPayments || cashPayments.length === 0) {
      toast.info('No cash payment records available to export');
      return;
    }
    const headers = ['Sr.No.', 'Employee Name', 'Designation', 'Total Cash Collection', 'Total Cash Submitted', 'Total Cash Pending'];
    const rows = cashPayments.map((item, index) => [
      index + 1,
      `"${item.employee?.name || item.name || 'N/A'}"`,
      `"${item.employee?.designation || item.designation || 'N/A'}"`,
      item.totalCashCollection ?? item.totalCollection ?? 0,
      item.totalCashSubmitted ?? item.totalSubmitted ?? 0,
      item.totalCashPending ?? item.totalPending ?? 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cash_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Cash payment records exported successfully');
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        title="Cash Payment"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Payment Operations' },
          { label: 'Cash Payment' },
        ]}
        showBack={false}
        backUrl="/dashboard"
      />

      {/* Toolbar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-xs text-sm"
            />
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="bg-[#225091] hover:bg-[#193e73] text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm shadow-sm cursor-pointer"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col min-h-0">
        <TableWrapper minHeight="360px">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-6 text-center w-20 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Sr.No.</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Employee Name</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Designation</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Total Cash Collection</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Total Cash Submitted</th>
                <th className="py-3.5 px-6 font-semibold text-white text-xs uppercase tracking-wider border-r border-white/20">Total Cash Pending</th>
                <th className="py-3.5 px-6 text-center w-24 font-semibold text-white text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} cols={7} />
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No records found</td>
                </tr>
              ) : (
                filteredData.map((employee, idx) => (
                  <tr key={employee.id} className="hover:bg-[#F4F8FD] transition-colors text-sm text-gray-600">
                    <td className="py-4 px-6 text-center font-medium text-gray-500">{(page - 1) * limit + idx + 1}</td>
                    <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${employee.profileImage ? '' : 'bg-blue-50 border border-blue-100 text-[#225091] font-bold text-xs'}`}>
                        {employee.profileImage ? (
                          <img src={employee.profileImage} alt={employee.employeeName} className="w-full h-full object-cover" />
                        ) : (
                          employee.employeeName?.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">{employee.employeeName}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="max-w-[120px] leading-tight font-medium">
                        {employee.designation}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-600">{employee.formattedTotalCashCollection}</td>
                    <td className="py-4 px-6 font-semibold text-[#225091]">{employee.formattedTotalCashSubmitted}</td>
                    <td className="py-4 px-6 font-semibold text-amber-600">{employee.formattedTotalCashPending}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to={`/cash-payment/view/${employee.id}`}
                          state={{ id: employee.id }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>

        {filteredData.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default CashPayment;
