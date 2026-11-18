import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';

// Lazy Layout
const DashboardLayout = lazy(() => import('./components/layouts/DashboardLayout'));

// Lazy Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const PasswordChanged = lazy(() => import('./pages/auth/PasswordChanged'));

// Lazy Dashboard Pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications'));
const Managers = lazy(() => import('./pages/dashboard/Managers'));
const CreateManager = lazy(() => import('./pages/dashboard/CreateManager'));
const EditManager = lazy(() => import('./pages/dashboard/EditManager'));
const ViewManager = lazy(() => import('./pages/dashboard/ViewManager'));

const OnboardingTeam = lazy(() => import('./pages/dashboard/OnboardingTeam'));
const CreateOnboardingTeam = lazy(() => import('./pages/dashboard/CreateOnboardingTeam'));
const EditOnboardingTeam = lazy(() => import('./pages/dashboard/EditOnboardingTeam'));
const ViewOnboardingTeam = lazy(() => import('./pages/dashboard/ViewOnboardingTeam'));
const GeoTagging = lazy(() => import('./pages/dashboard/GeoTagging'));

const MyProfile = lazy(() => import('./pages/dashboard/MyProfile'));
const PriceSettings = lazy(() => import('./pages/dashboard/PriceSettings'));
const SupportSettings = lazy(() => import('./pages/dashboard/SupportSettings'));

const Employees = lazy(() => import('./pages/dashboard/Employees'));
const CreateEmployee = lazy(() => import('./pages/dashboard/CreateEmployee'));
const EditEmployee = lazy(() => import('./pages/dashboard/EditEmployee'));
const ViewEmployee = lazy(() => import('./pages/dashboard/ViewEmployee'));
const AttendanceReport = lazy(() => import('./pages/dashboard/AttendanceReport'));
const LettersAndPayroll = lazy(() => import('./pages/dashboard/LettersAndPayroll'));
const ImportantDates = lazy(() => import('./pages/dashboard/ImportantDates'));

const Customers = lazy(() => import('./pages/dashboard/Customers'));
const CustomerLoans = lazy(() => import('./pages/dashboard/CustomerLoans'));
const LoanDetails = lazy(() => import('./pages/dashboard/LoanDetails'));
const Leads = lazy(() => import('./pages/dashboard/Leads'));
const ViewLead = lazy(() => import('./pages/dashboard/ViewLead'));

const Region = lazy(() => import('./pages/dashboard/Region'));
const Branch = lazy(() => import('./pages/dashboard/Branch'));
const RolesAndPermissions = lazy(() => import('./pages/dashboard/RolesAndPermissions'));
const CreateRole = lazy(() => import('./pages/dashboard/CreateRole'));
const EditRole = lazy(() => import('./pages/dashboard/EditRole'));
const ViewRole = lazy(() => import('./pages/dashboard/ViewRole'));

const ProductCategories = lazy(() => import('./pages/dashboard/ProductCategories'));
const ProductBrands = lazy(() => import('./pages/dashboard/ProductBrands'));
const Products = lazy(() => import('./pages/dashboard/Products'));
const Models = lazy(() => import('./pages/dashboard/Models'));
const Banners = lazy(() => import('./pages/dashboard/Banners'));

const CooperativeBanks = lazy(() => import('./pages/dashboard/CooperativeBanks'));
const CreateCooperativeBank = lazy(() => import('./pages/dashboard/CreateCooperativeBank'));
const EditCooperativeBank = lazy(() => import('./pages/dashboard/EditCooperativeBank'));
const ViewCooperativeBank = lazy(() => import('./pages/dashboard/ViewCooperativeBank'));


const CashPayment = lazy(() => import('./pages/dashboard/CashPayment'));
const CashPaymentView = lazy(() => import('./pages/dashboard/CashPaymentView'));

import TopProgressBar from './components/common/TopProgressBar';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ShieldCheck } from 'lucide-react';

const PageFallback = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-blue-100 animate-ping opacity-30"></div>
      <div className="absolute inset-0 rounded-full border-[2.5px] border-slate-100"></div>
      <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#225091] border-r-teal-500 animate-spin"></div>
      <ShieldCheck size={18} className="text-[#225091]" />
    </div>
    <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Loading module...</span>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <TopProgressBar />
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-changed" element={<PasswordChanged />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="managers" element={<Managers />} />
            <Route path="managers/create" element={<CreateManager />} />
            <Route path="managers/edit" element={<EditManager />} />
            <Route path="managers/view" element={<ViewManager />} />
            <Route path="onboarding-team" element={<OnboardingTeam />} />
            <Route path="onboarding-team/create" element={<CreateOnboardingTeam />} />
            <Route path="onboarding-team/edit/:id" element={<EditOnboardingTeam />} />
            <Route path="onboarding-team/view/:id" element={<ViewOnboardingTeam />} />
            <Route path="geo-tagging" element={<GeoTagging />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/create" element={<CreateEmployee />} />
            <Route path="employees/edit" element={<EditEmployee />} />
            <Route path="employees/edit/:id" element={<EditEmployee />} />
            <Route path="employees/view" element={<ViewEmployee />} />
            <Route path="employees/view/:id" element={<ViewEmployee />} />
            <Route path="attendance" element={<AttendanceReport />} />
            <Route path="hr/attendance-report" element={<AttendanceReport />} />
            <Route path="letters-payroll" element={<LettersAndPayroll />} />
            <Route path="hr/letters" element={<LettersAndPayroll />} />
            <Route path="employees/letters" element={<LettersAndPayroll />} />
            <Route path="important-dates" element={<ImportantDates />} />
            <Route path="hr/important-dates" element={<ImportantDates />} />
            <Route path="employees/important-dates" element={<ImportantDates />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id/loans" element={<CustomerLoans />} />
            <Route path="customers/:id/loans/:loanId" element={<LoanDetails />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id/view" element={<ViewLead />} />
            <Route path="region" element={<Region />} />
            <Route path="branch" element={<Branch />} />
            <Route path="roles-permissions" element={<RolesAndPermissions />} />
            <Route path="roles-permissions/create" element={<CreateRole />} />
            <Route path="roles-permissions/edit/:id" element={<EditRole />} />
            <Route path="roles-permissions/view/:id" element={<ViewRole />} />
            <Route path="product-categories" element={<ProductCategories />} />
            <Route path="product-brands" element={<ProductBrands />} />
            <Route path="products" element={<Products />} />
            <Route path="product-models" element={<Models />} />
            <Route path="banners" element={<Banners />} />
            <Route path="co-operative-bank" element={<CooperativeBanks />} />
            <Route path="co-operative-bank/create" element={<CreateCooperativeBank />} />
            <Route path="co-operative-bank/:id/edit" element={<EditCooperativeBank />} />
            <Route path="co-operative-bank/:id/view" element={<ViewCooperativeBank />} />

            <Route path="price-settings" element={<PriceSettings />} />
            <Route path="support-settings" element={<SupportSettings />} />
            <Route path="cash-payment" element={<CashPayment />} />
            <Route path="cash-payment/view/:id" element={<CashPaymentView />} />
            <Route path="*" element={
              <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Route Not Found</h2>
                <p className="text-gray-700">The requested page does not exist.</p>
              </div>
            } />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
