import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { customerService } from '../../api/customerService';
import PageHeader from '../../components/common/PageHeader';

const LoanDetails = () => {
  const { id, loanId } = useParams();
  const navigate = useNavigate();
  
  const [loanDetails, setLoanDetails] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [loanRes, customerRes] = await Promise.all([
          customerService.getSingleLoanDetails(id, loanId),
          customerService.getCustomerDetails(id)
        ]);

        if (loanRes.success) setLoanDetails(loanRes.data);
        if (customerRes.success) setCustomer(customerRes.data);
      } catch (error) {
        console.error("Failed to fetch data for loan details", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id && loanId) {
      fetchData();
    }
  }, [id, loanId]);
  
  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Loading loan details...</div>;
  }

  if (!loanDetails) {
    return <div className="p-10 text-center text-gray-500">Loan not found.</div>;
  }

  const loanStatus = loanDetails.statusDisplay || loanDetails.status;
  
  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header */}
      <PageHeader
        title="Loan History Details"
        showBack={true}
        backUrl={`/customers/${id}/loans`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Customers', to: '/customers' },
          { label: 'Loan History', to: `/customers/${id}/loans` },
          { label: 'Loan Details' },
        ]}
      />

      <div className="text-sm font-medium text-gray-700">
        Application Number: <span className="text-[#225091]">{loanDetails.applicationId || 'N/A'}</span>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center text-[#225091] font-bold text-xl uppercase">
            {customer?.profileImage ? (
              <img src={customer.profileImage} alt={customer?.fullName} className="w-full h-full object-cover" />
            ) : (
              customer?.fullName ? customer.fullName.substring(0, 2) : 'NA'
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{customer?.fullName || 'Customer Name'}</h2>
            <div className="text-gray-500 font-medium">{customer?.phoneNumber || customer?.phone || 'N/A'}</div>
          </div>
        </div>
        <div className={`px-6 py-2 text-sm font-medium rounded-md border ${
          loanDetails.status === 'ACTIVE' ? 'bg-blue-50 text-[#225091] border-blue-200' :
          loanDetails.status === 'COMPLETED' ? 'bg-green-50 text-[#00c950] border-green-300' :
          loanDetails.status === 'REJECTED' ? 'bg-red-50 text-[#ff4c4c] border-red-300' :
          'bg-gray-200 text-gray-700 border-gray-300'
        }`}>
          {loanStatus}
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
        </div>
        <div className="p-6 space-y-4 bg-white">
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Date Of Birth:</span>
            <span className="font-bold text-gray-800">{customer?.formattedDob || 'N/A'}</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Gender:</span>
            <span className="font-bold text-gray-800 capitalize">{customer?.displayGender || customer?.gender?.toLowerCase() || 'N/A'}</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">PAN Number:</span>
            <span className="font-bold text-gray-800">ABCDE1234F</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Aadhaar Number:</span>
            <span className="font-bold text-gray-800">1234 5678 9876</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Address:</span>
            <span className="font-bold text-gray-800">{customer?.address || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Documents</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <div className="rounded-lg overflow-hidden flex items-center justify-center">
            {/* PAN Card placeholder */}
            <div className="w-full h-full bg-blue-100 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center p-2 bg-blue-50 border-b border-blue-200">
                    <div className="text-[10px] font-bold text-blue-900">INCOME TAX DEPARTMENT</div>
                    <div className="text-[10px] font-bold text-blue-900">GOVT. OF INDIA</div>
                </div>
                <div className="p-4 flex-1">
                    <div className="w-16 h-4 bg-blue-200 mb-2 rounded"></div>
                    <div className="w-24 h-4 bg-blue-200 mb-4 rounded"></div>
                    <div className="w-20 h-4 bg-blue-200 mb-1 rounded"></div>
                    <div className="w-32 h-4 bg-blue-200 rounded"></div>
                </div>
                <div className="absolute bottom-2 right-4 w-16 h-20 bg-white border border-gray-300 shadow-sm flex items-end justify-center rounded-sm">
                   <div className="w-12 h-12 bg-gray-200 rounded-t-full"></div>
                </div>
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden flex items-center justify-center">
            {/* Aadhaar Card placeholder */}
             <div className="w-full h-full flex flex-col relative bg-white border border-blue-400 rounded-lg">
                <div className="flex justify-between items-center p-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 px-4">
                        <div className="h-1.5 w-full bg-orange-500 mb-1"></div>
                        <div className="h-1.5 w-full bg-green-500"></div>
                    </div>
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-300">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    </div>
                </div>
                <div className="flex p-4 gap-4">
                    <div className="w-20 h-24 bg-gray-300 rounded-md overflow-hidden flex items-end justify-center border border-gray-400">
                        <div className="w-16 h-16 bg-gray-500 rounded-t-full"></div>
                    </div>
                    <div className="flex-1 space-y-3 pt-2">
                         <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                         <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                         <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                         <div className="mt-4 font-bold tracking-widest text-gray-800 text-lg">
                             XXXX XXXX XXXX
                         </div>
                    </div>
                    <div className="w-20 h-20 bg-gray-100 border border-gray-300 p-1 self-end">
                        <div className="w-full h-full border border-gray-800 border-dashed opacity-100"></div>
                    </div>
                </div>
                <div className="h-1 w-full bg-red-500 mt-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Information */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Loan Information</h3>
        </div>
        <div className="p-6 space-y-4 bg-white">
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">
              {loanDetails.status === 'NEW' || loanDetails.status === 'REJECTED' ? 'Applied On:' : 'Disbursed On:'}
            </span>
            <span className="font-bold text-gray-800">{loanDetails.disbursedOnFormatted || '10 Jan 2026'}</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">Loan Applied For:</span>
            <span className="font-bold text-gray-800">{loanDetails.productTitle || 'N/A'}</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">Phone Details:</span>
            <span className="font-bold text-gray-800">{loanDetails.productTitle || 'N/A'}</span>
          </div>
          
          {(loanDetails.status === 'NEW' || loanDetails.status === 'REJECTED') && (
            <div className="flex text-[15px] text-gray-800">
              <span className="w-48 font-semibold text-gray-600">Status:</span>
              <span className={`font-medium ${loanDetails.status === 'REJECTED' ? 'text-[#ff4c4c]' : 'text-gray-800 font-bold'}`}>
                {loanStatus}
              </span>
            </div>
          )}

          {(loanDetails.status === 'ACTIVE' || loanDetails.status === 'COMPLETED') && (
            <div className="mt-6 max-w-sm">
              <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-bold text-[15px] text-gray-900">Amount Info</h4>
                
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Price:</span>
                    <span className="text-gray-900 font-medium">₹80,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">EMI Card Charges:</span>
                    <span className="text-gray-900 font-medium">+₹500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Processing Fees:</span>
                    <span className="text-gray-900 font-medium">+₹200</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-bold">Total Amount:</span>
                    <span className="text-gray-900 font-bold">₹80,700</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down Payment:</span>
                    <span className="text-[#ff4c4c] font-medium">-₹30,700</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-bold">Total Loan Amount:</span>
                    <span className="text-gray-900 font-bold">₹50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Interest (1%):</span>
                    <span className="text-gray-900 font-medium">+₹500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Insurance:</span>
                    <span className="text-gray-900 font-medium">+₹1000</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-[13px] mb-4">
                  <span className="text-gray-800 font-bold">Total Loan Amount:</span>
                  <span className="text-gray-900 font-bold">{loanDetails.formattedLoanAmount}</span>
                </div>

                <h4 className="font-bold text-[15px] text-gray-900 mt-4">EMI Info</h4>
                
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Loan Amount:</span>
                    <span className="text-gray-900 font-medium">{loanDetails.formattedLoanAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">EMI Tenure:</span>
                    <span className="text-gray-900 font-medium">{loanDetails.schedule?.length || 6} Months</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-800 font-bold">EMI Amount:</span>
                  <span className="text-gray-900 font-bold">{loanDetails.formattedEmiAmount}/Month</span>
                </div>
              </div>

              <div className="flex text-[15px] text-gray-800 mt-4">
                <span className="w-16 font-semibold text-gray-600">Status:</span>
                <span className={`font-medium ${loanDetails.status === 'COMPLETED' ? 'text-[#00c950]' : 'text-[#225091]'}`}>
                  {loanStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMI Information (Only for Active) */}
      {loanDetails.status === 'ACTIVE' && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">EMI Information</h3>
          </div>
          <div className="p-6 space-y-4 bg-white">
            <div className="flex text-[15px] text-gray-800">
              <span className="w-32 font-semibold text-gray-600">EMI Tenure:</span>
              <span className="font-bold text-gray-800">{loanDetails.schedule?.length || 6} Months ({loanDetails.formattedEmiAmount}/Month)</span>
            </div>
            
            <div className="space-y-3 pt-2 w-full max-w-sm">
              {loanDetails.schedule && loanDetails.schedule.map((emi, index) => (
                <div key={index} className="flex justify-between text-[15px] font-medium">
                  <span className="text-gray-600 w-24">{emi.monthName}:</span>
                  <span className="text-gray-800 flex-1">₹{emi.amount}</span>
                  <span className={`${
                    emi.status === 'PAID' ? 'text-[#00c950]' :
                    emi.status === 'DUE' ? 'text-orange-500' : 'text-gray-500'
                  }`}>
                    {emi.status === 'PAID' ? 'Paid' : emi.status === 'DUE' ? 'Due' : 'Upcoming'}
                  </span>
                </div>
              ))}
              {(!loanDetails.schedule || loanDetails.schedule.length === 0) && (
                 <div className="text-gray-500 text-sm">No schedule available.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoanDetails;
