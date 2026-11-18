import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { Users, Banknote, Landmark, CreditCard, Wallet } from 'lucide-react';

import { dashboardService } from '../../api/dashboardService';
import { Skeleton, SkeletonStatCards, SkeletonChart, SkeletonTable } from '../../components/common/Skeleton';
import TableWrapper from '../../components/common/TableWrapper';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Module-level cache so returning to dashboard is instant (0ms) without flashing skeleton
let cachedDashboardData = null;
let lastDashboardFilter = 'Today';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(() => cachedDashboardData);
  const [isLoading, setIsLoading] = useState(() => !cachedDashboardData);
  const [timeFilter, setTimeFilter] = useState(lastDashboardFilter); // Today, Weekly, Monthly, Yearly

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only show full skeleton loader if we don't have cached data for this filter
      if (!cachedDashboardData || timeFilter !== lastDashboardFilter) {
        setIsLoading(true);
      }
      try {
        const response = await dashboardService.getDashboardOverview(timeFilter);
        if (response.success) {
          cachedDashboardData = response.data;
          lastDashboardFilter = timeFilter;
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in" role="status" aria-busy="true">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>

        {/* 4 Top KPI Stat Cards */}
        <SkeletonStatCards count={4} />

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <SkeletonChart type="line" height="h-[280px]" />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <SkeletonChart type="bar" height="h-[280px]" />
          </div>
        </div>

        {/* Bottom Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <Skeleton className="h-5 w-48 rounded-md" />
            <SkeletonTable rows={4} cols={5} />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <SkeletonChart type="pie" height="h-[240px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="flex items-center justify-center h-full min-h-[400px]">Failed to load dashboard data.</div>;
  }

  const { summaryCards, totalRevenueChart, loanSalesChart, salesContributionOfServices, last5Actions } = dashboardData;

  // Format stats data with target module routes
  const statsData = [
    { 
      title: summaryCards.totalCustomer.title, 
      value: summaryCards.totalCustomer.formattedCount, 
      change: summaryCards.totalCustomer.changeText, 
      color: 'bg-[#00c5d5]', 
      icon: <Users size={20} />, 
      link: '/customers' 
    },
    { 
      title: summaryCards.totalLoanDistributed.title, 
      value: summaryCards.totalLoanDistributed.formattedAmount, 
      change: summaryCards.totalLoanDistributed.changeText, 
      color: 'bg-[#b68962]', 
      icon: <Banknote size={20} />, 
      link: '/customers' 
    },
    { 
      title: summaryCards.collectionPending.title, 
      value: summaryCards.collectionPending.formattedAmount, 
      change: summaryCards.collectionPending.changeText, 
      color: 'bg-[#f48b29]', 
      icon: <CreditCard size={20} />, 
      link: '/cash-payment' 
    },
    { 
      title: summaryCards.totalRevenue.title, 
      value: summaryCards.totalRevenue.formattedAmount, 
      change: summaryCards.totalRevenue.changeText, 
      color: 'bg-[#3bc454]', 
      icon: <Wallet size={20} />, 
      link: '/cash-payment' 
    },
    { 
      title: summaryCards.totalCooperativeBank.title, 
      value: summaryCards.totalCooperativeBank.formattedCount, 
      change: summaryCards.totalCooperativeBank.changeText, 
      color: 'bg-[#6154ff]', 
      icon: <Landmark size={20} />, 
      link: '/co-operative-bank' 
    },
    { 
      title: summaryCards.totalMerchant.title, 
      value: summaryCards.totalMerchant.formattedCount, 
      change: summaryCards.totalMerchant.changeText, 
      color: 'bg-[#ff3c3c]', 
      icon: <Banknote size={20} />, 
      link: '/merchant' 
    },
  ];

  // Format revenue data
  const revenueData = totalRevenueChart.map(item => ({
    name: item.month,
    thisYear: item.thisYear,
    lastYear: item.lastYear
  }));

  // Format loan sales data
  const loanSalesDataFormatted = loanSalesChart.categories.map((item, index) => {
    // Add newline manually if category is long, simulating previous behavior
    let name = item.category;
    if (name.includes('on EMI')) name = name.replace(' on EMI', '\non EMI');
    else if (name.includes('Loan')) name = name.replace(' Loan', '\nLoan');
    
    return {
      name: name,
      value: item.amount,
      fill: '#225091' // Make 2nd item highlight
    };
  });

  // Format pie chart data
  const pieData = salesContributionOfServices.services.map(item => ({
    name: item.service,
    value: item.percentage,
    color: item.color
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => stat.link && navigate(stat.link)}
            className="bg-brand-bg-card border border-border-default rounded-xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between h-[130px] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-all duration-300 block cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                stat.link && navigate(stat.link);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[14px] font-medium text-text-muted">{stat.title}</span>
              <div className="p-2 rounded-lg bg-brand-light text-brand-primary shadow-sm">
                {stat.icon}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 tracking-tight text-text-heading">{stat.value}</div>
              <div className="text-[13px] font-medium flex items-center gap-1.5 mt-1 text-text-muted">
                <span className={`px-2 py-0.5 rounded-md font-semibold ${
                  stat.change && stat.change.startsWith('+') ? 'bg-semantic-success-light text-semantic-success' :
                  stat.change && stat.change.startsWith('-') ? 'bg-semantic-danger-light text-semantic-danger' :
                  'bg-brand-surface text-text-muted'
                }`}>{stat.change}</span>
                <span>This Month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-2">
          <div className="flex items-center gap-6 mb-6">
            <h3 className="text-[17px] font-bold text-gray-800">Total Revenue Chart <span className="text-gray-300 font-light mx-2">|</span></h3>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#225091]"></span>This year</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#A9BDD3]"></span>Last year</div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} tickFormatter={(val) => val === 0 ? '₹0' : `₹${val/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="thisYear" stroke="#225091" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lastYear" stroke="#A9BDD3" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Sales Chart */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[17px] font-bold text-gray-800">Loan Sales Chart</h3>
            <select 
              className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#225091] focus:border-[#225091] block px-3 py-1.5 outline-none"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Weekly">This Week</option>
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanSalesDataFormatted} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const lines = payload.value.split('\n');
                    return (
                      <g transform={`translate(${x},${y})`}>
                        {lines.map((line, index) => (
                          <text key={index} x={0} y={index * 12 + 10} dy={0} textAnchor="middle" fill="#64748b" fontSize={10}>
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  }}
                  dy={10} 
                  width={60} 
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => val === 0 ? '0' : `₹${val/1000}k`} />
                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[10, 10, 10, 10]} 
                  barSize={16}
                  fill="#225091" 
                >
                  <LabelList dataKey="value" position="top" content={(props) => {
                    const { x, y, width, value, index } = props;
                    if (index === 1) {
                      return (
                        <g>
                           <rect x={x + width/2 - 14} y={y - 24} width={28} height={18} fill="#225091" rx={9} ry={9} />
                           <text x={x + width / 2} y={y - 11} fill="white" textAnchor="middle" fontSize={10} fontWeight="bold">
                             {Math.round(value/1000)}k
                           </text>
                        </g>
                      );
                    }
                    return null;
                  }} />
                  {loanSalesDataFormatted.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#4b5563'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[17px] font-bold text-gray-800">Sales contribution of Services</h3>
            <select 
              className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#225091] focus:border-[#225091] block px-3 py-1.5 outline-none"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Weekly">This Week</option>
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center pt-4">
            <div className="h-[250px] w-full flex">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={0}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return percent > 0.05 ? (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={500}>
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] flex flex-col justify-center gap-2.5 pl-4">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Table */}
        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200/80 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-800 mb-4">Last 5 Actions</h3>
          <div className="rounded-xl overflow-hidden border border-gray-200/80">
            <TableWrapper>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 w-1/3 border-r border-white/20">Time</th>
                    <th className="py-3 px-4 w-2/3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {last5Actions && last5Actions.length > 0 ? (
                    last5Actions.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F8FD] transition-colors">
                        <td className="py-3.5 px-4 text-xs text-gray-700 whitespace-nowrap font-semibold">{item.formattedTime}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-700">{item.actionDetails || item.actions}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-8 text-center text-xs text-gray-500 font-medium">
                        No recent actions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

