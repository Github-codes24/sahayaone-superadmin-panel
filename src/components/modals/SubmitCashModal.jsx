import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const SubmitCashModal = ({ isOpen, onClose, onSubmit }) => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ date, amount, remarks });
    setDate('');
    setAmount('');
    setRemarks('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col transform scale-100 transition-transform">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1b2559]">Submit Cash</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-700 shadow-sm pr-10"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Amount</label>
            <div className="relative">
              <input
                type="text"
                placeholder="₹4,20,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-700 shadow-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Remarks</label>
            <textarea
              rows="4"
              placeholder="Lorem ipsum dolor sit amet consectetur. A aliquam sagittis maecenas accumsan."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-700 shadow-sm resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-4 mt-2">
            <button 
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 border-2 border-[#225091] text-[#225091] font-semibold rounded-full hover:bg-blue-50/50 transition-colors focus:outline-none text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="py-2.5 px-6 bg-[#225091] hover:bg-[#193e73] text-white font-semibold rounded-full shadow-md transition-colors focus:outline-none text-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitCashModal;
