import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowLeft, Package } from 'lucide-react';
import WalletIllustration from '../../assets/wallet-illustration.png';
import { customerService } from '../../api/customerService';
import PageHeader from '../../components/common/PageHeader';

const tabs = [
  { label: 'All Loans', value: 'ALL' },
  { label: 'New Application', value: 'NEW' },
  { label: 'Active Loans', value: 'ACTIVE' },
  { label: 'Completed Loans', value: 'COMPLETED' },
  { label: 'Rejected Loans', value: 'REJECTED' }
];

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'NEW':
      return <span className="px-5 py-1.5 rounded-md bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold">New</span>;
    case 'ACTIVE':
      return <span className="px-5 py-1.5 rounded-md bg-transparent border border-blue-400 text-blue-500 text-xs font-semibold">Active</span>;
    case 'COMPLETED':
      return <span className="px-5 py-1.5 rounded-md bg-transparent border border-green-400 text-green-500 text-xs font-semibold">Completed</span>;
    case 'REJECTED':
      return <span className="px-5 py-1.5 rounded-md bg-red-50 border border-red-300 text-[#ff4c4c] text-xs font-semibold">Rejected</span>;
    default:
      return null;
  }
};

const CustomerLoans = () => {
  const { id } = useParams(); // customer ID
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalRecords: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchLoans = async (page = 1) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const params = { page, limit: 10, status: activeTab };
      const response = await customerService.getCustomerLoans(id, params);
      if (response.success) {
        setLoans(response.data);
        setSummary(response.summary);
        setMeta(response.meta);
      }
    } catch (error) {
      console.error("Failed to fetch customer loans", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(1);
  }, [id, activeTab]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchLoans(newPage);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-10">
      {/* Page Header */}
      <PageHeader
        title="Customer Loan History"
        showBack={true}
        backUrl="/customers"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Customers', to: '/customers' },
          { label: 'Loans' },
        ]}
      />

      {/* Summary Card */}
      {summary && (
        <div className="bg-[#e9fae7] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center overflow-hidden relative shadow-sm border border-[#d6efd4] mb-8">
          <div className="z-10 flex flex-col gap-10">
            {/* Top Stat */}
            <div>
              <div className="text-[15px] font-semibold text-gray-600 mb-1">Total Outstanding</div>
              <div className="text-[32px] md:text-[40px] font-bold text-[#225091] leading-tight tracking-tight mb-2">
                {summary.formattedTotalOutstanding}
              </div>
              <div className="text-[13px] font-bold text-[#225091]">
                {summary.activeLoansText}
              </div>
            </div>

            {/* Bottom Stat */}
            <div>
              <div className="text-[15px] font-semibold text-gray-600 mb-1">Total Loan Amount</div>
              <div className="text-[28px] md:text-[32px] font-bold text-gray-900 leading-tight tracking-tight">
                {summary.formattedTotalLoanAmount}
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="mt-8 md:mt-0 relative z-10 w-full max-w-[280px] md:max-w-[320px] self-end md:self-auto">
            <img 
              src={WalletIllustration} 
              alt="Wallet with Cash and Coins" 
              className="w-full h-auto object-contain drop-shadow-xl"
            />
          </div>
          
          {/* Decorative background shape */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-white/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-[#f5f6f8] rounded-xl p-1.5 inline-flex gap-1 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value 
                ? 'bg-[#225091] text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loan Cards List */}
      <div className="space-y-4 mb-8">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No loans found for this category.</div>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              {/* Top Row: Product Info & Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 flex items-center justify-center">
                    {(loan.variantImage || loan.variantImageUrl || loan.productImage || loan.productImageUrl || loan.image) ? (
                      <img 
                        src={loan.variantImage || loan.variantImageUrl || loan.productImage || loan.productImageUrl || loan.image} 
                        alt={loan.productTitle || 'Product Variant'} 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base mb-1.5">{loan.productTitle}</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Application ID: <span className="text-gray-600 font-medium">{loan.applicationId}</span></div>
                      <div>Disbursed on: <span className="text-gray-600 font-medium">{loan.disbursedOnFormatted || '-'}</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 self-end md:self-start">
                  {getStatusBadge(loan.status)}
                  <Link to={`/customers/${id}/loans/${loan.loanId}`} className="text-[#225091] font-semibold text-[15px] hover:text-[#159a9f] transition-colors">
                    View Details
                  </Link>
                </div>
              </div>

              {/* Middle Row & Bottom Row (Only for Active / Completed) */}
              {(loan.status === 'ACTIVE' || loan.status === 'COMPLETED') && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {/* Financial Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center md:text-left">
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-2">Loan Amount</div>
                      <div className="text-[17px] font-bold text-gray-900">{loan.formattedLoanAmount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-2">Outstanding</div>
                      <div className="text-[17px] font-bold text-gray-900">{loan.formattedOutstanding}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-2">EMI Amount</div>
                      <div className="text-[17px] font-bold text-gray-900">{loan.formattedEmiAmount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-2">Next EMI Due Date</div>
                      <div className="text-[17px] font-bold text-gray-900">{loan.nextEmiDueDateFormatted || 'NA'}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="text-sm font-bold text-gray-800 mb-2">Loan Progress</div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-semibold text-gray-500">{loan.progressPercentage}% Completed</span>
                      <span className="text-xs font-medium text-gray-500">{loan.progressText}</span>
                    </div>
                    <div className="w-full bg-[#f4f3fb] rounded-full h-1.5">
                      <div 
                        className="bg-[#225091] h-1.5 rounded-full" 
                        style={{ width: `${loan.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && loans.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-800 font-medium">
          <div className="mb-4 sm:mb-0">
            Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.totalRecords)} of {meta.totalRecords} Entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={!meta.hasPrevPage}
              onClick={() => handlePageChange(meta.page - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#225091] text-[#225091] hover:bg-blue-50/50 transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#225091] text-white font-medium shadow-sm">
              {meta.page}
            </button>
            <button 
              disabled={!meta.hasNextPage}
              onClick={() => handlePageChange(meta.page + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#225091] text-[#225091] hover:bg-blue-50/50 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerLoans;
