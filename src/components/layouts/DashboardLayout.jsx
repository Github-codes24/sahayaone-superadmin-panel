import React, { useState, useEffect, createContext, useContext, Children, isValidElement, Fragment, useCallback, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  User, 
  UserPlus, 
  Bell, 
  ChevronDown, 
  IdCard, 
  Tag, 
  Headphones, 
  Landmark, 
  Image, 
  LogOut, 
  Banknote,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MapPin,
  UserCheck,
  CalendarCheck,
  FileText,
  Gift
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLoadingStore from '../../store/loadingStore';
import { useNotificationStore } from '../../store/notificationStore';
import GlobalLoader from '../GlobalLoader';
import sahayaoneLogo from '../../assets/sahayaone-logo.png';

// Route prefetch map for instantaneous 0ms transitions on click
const prefetchMap = {
  '/dashboard': () => import('../../pages/dashboard/Dashboard'),
  '/co-operative-bank': () => import('../../pages/dashboard/CooperativeBanks'),
  '/customers': () => import('../../pages/dashboard/Customers'),
  '/leads': () => import('../../pages/dashboard/Leads'),
  '/onboarding-team': () => import('../../pages/dashboard/OnboardingTeam'),
  '/attendance': () => import('../../pages/dashboard/AttendanceReport'),
  '/letters-payroll': () => import('../../pages/dashboard/LettersAndPayroll'),
  '/important-dates': () => import('../../pages/dashboard/ImportantDates'),
  '/geo-tagging': () => import('../../pages/dashboard/GeoTagging'),
  '/roles-permissions': () => import('../../pages/dashboard/RolesAndPermissions'),
  '/cash-payment': () => import('../../pages/dashboard/CashPayment'),
  '/price-settings': () => import('../../pages/dashboard/PriceSettings'),
  '/support-settings': () => import('../../pages/dashboard/SupportSettings'),
  '/banners': () => import('../../pages/dashboard/Banners'),
  '/profile': () => import('../../pages/dashboard/MyProfile'),
  '/notifications': () => import('../../pages/dashboard/Notifications'),
  '/managers': () => import('../../pages/dashboard/Managers'),
  '/employees': () => import('../../pages/dashboard/Employees'),
  '/products': () => import('../../pages/dashboard/Products'),
  '/product-brands': () => import('../../pages/dashboard/ProductBrands'),
  '/product-categories': () => import('../../pages/dashboard/ProductCategories'),
  '/product-models': () => import('../../pages/dashboard/Models'),
  '/region': () => import('../../pages/dashboard/Region'),
  '/branch': () => import('../../pages/dashboard/Branch'),
};

const prefetchRoute = (path) => {
  try {
    prefetchMap[path]?.();
  } catch {
    // Ignore prefetch error
  }
};

const flattenChildren = (children) => {
  const result = [];
  Children.forEach(children, (child) => {
    if (!child) return;
    if (isValidElement(child) && child.type === Fragment) {
      result.push(...flattenChildren(child.props.children));
    } else {
      result.push(child);
    }
  });
  return result;
};

const SidebarAccordionContext = createContext({
  openGroup: null,
  toggleGroup: () => {},
  setOpenGroup: () => {},
});

const SidebarGroup = ({ title, children, icon: Icon, onMouseEnter }) => {
  const location = useLocation();
  const { openGroup, toggleGroup, setOpenGroup } = useContext(SidebarAccordionContext);
  // Filter out any false/null/undefined children and unpack any Fragment
  const validChildren = flattenChildren(children).filter(Boolean);

  // Check if current route matches any child NavLink
  const hasActiveChild = validChildren.some(child => {
    if (!isValidElement(child)) return false;
    const to = child.props?.to;
    if (!to) return false;
    return location.pathname === to || location.pathname.startsWith(to + '/');
  });

  // Automatically open ONLY when the route changes (not on re-renders, allowing manual user toggle)
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      if (hasActiveChild) {
        setOpenGroup(title);
      }
    }
  }, [location.pathname, hasActiveChild, title, setOpenGroup]);

  // Initial check on mount
  useEffect(() => {
    if (hasActiveChild) {
      setOpenGroup(title);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If no children permitted/visible, do not render this sidebar group at all
  if (validChildren.length === 0) {
    return null;
  }

  const isOpen = openGroup === title;
  const groupId = `submenu-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const handleHeaderClick = () => {
    toggleGroup(title);
  };

  return (
    <div className="mb-1" onMouseEnter={onMouseEnter}>
      <div 
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
        aria-expanded={isOpen}
        aria-controls={groupId}
        className={`px-4.5 py-3 flex items-center justify-between cursor-pointer transition-all duration-200 border-l-4 select-none relative group ${
          hasActiveChild
            ? isOpen 
              ? 'border-brand-primary bg-brand-light' 
              : 'border-brand-primary bg-brand-primary/10'
            : isOpen 
              ? 'border-gray-200 bg-gray-50/70' 
              : 'border-transparent hover:bg-brand-surface'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {hasActiveChild && !isOpen && (
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shrink-0" title="Active module" />
          )}
          {Icon && (
            <Icon 
              size={20} 
              className={`shrink-0 ${hasActiveChild ? 'text-brand-primary' : isOpen ? 'text-text-heading' : 'text-text-muted'}`} 
            />
          )}
          <h3 
            title={title}
            className={`text-[14px] transition-all duration-200 m-0 select-none truncate ${
            hasActiveChild 
              ? 'font-bold text-brand-primary' 
              : isOpen 
                ? 'font-semibold text-text-heading' 
                : 'font-semibold text-text-body'
          }`}>
            {title}
          </h3>
        </div>
        <ChevronDown 
          size={16} 
          className={`shrink-0 ml-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            hasActiveChild 
              ? 'text-brand-primary' 
              : 'text-text-muted'
          } ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      <div 
        id={groupId}
        className={`sidebar-accordion-grid ${isOpen ? 'open' : ''}`}
      >
        <div className="sidebar-accordion-content">
          <div className="sidebar-accordion-inner py-1 space-y-0.5 bg-brand-surface/50 border-y border-border-divider/20">
            {validChildren}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('super_admin_desktop_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('super_admin_desktop_sidebar_open', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const resetLoader = useLoadingStore((state) => state.resetLoader);
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  // Automatically clear any stuck loader on route change
  useEffect(() => {
    if (resetLoader) resetLoader();
    setIsMobileMenuOpen(false);
  }, [location.pathname, resetLoader]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Background idle pre-warming: preloads lazy route chunks during browser idle time
  // This ensures even the very first click on any sidebar item is instant without network chunk delay
  useEffect(() => {
    const idleHandler = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const handle = idleHandler(() => {
      Object.keys(prefetchMap).forEach((path) => {
        prefetchRoute(path);
      });
    });
    return () => {
      if (window.cancelIdleCallback && typeof handle === 'number') {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  const userName = user?.fullName || user?.name || 'Super Admin';
  const roleName = (user?.role || user?.userType || 'SUPER_ADMIN').replace('_', ' ');
  const userAvatar = user?.avatar || user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=225091&color=fff`;

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const hasAccess = (moduleKey) => {
    if (!user) return true;
    const role = String(user.role || user.userType || '').trim().toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'ADMIN' || !role) return true;
    
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      return user.permissions.some(p => p.startsWith(`${moduleKey}:`) || p === moduleKey || p === '*');
    }
    
    return true;
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-4.5 py-3 text-[14px] font-semibold border-l-4 transition-colors ${
      isActive
        ? 'border-brand-primary text-brand-primary bg-brand-light'
        : 'border-transparent text-text-body hover:bg-brand-surface hover:text-text-heading'
    }`;

  const subNavLinkClass = (propsOrTo, explicitTo) => {
    let isActive = false;
    let targetTo = explicitTo;

    if (typeof propsOrTo === 'string') {
      targetTo = propsOrTo;
    } else if (propsOrTo && typeof propsOrTo === 'object') {
      isActive = propsOrTo.isActive;
    }

    const isNestedActive = targetTo
      ? location.pathname === targetTo || location.pathname.startsWith(targetTo + '/')
      : false;

    return `flex items-center gap-2.5 px-4.5 py-2.5 text-[13.5px] font-medium border-l-4 transition-all duration-200 ${
      isActive || isNestedActive
        ? 'border-brand-primary text-brand-primary bg-brand-light font-semibold'
        : 'border-transparent text-text-muted hover:bg-brand-surface hover:text-brand-primary hover:pl-5'
    }`;
  };

  const [openGroup, setOpenGroup] = useState(null);

  const toggleGroup = useCallback((title) => {
    setOpenGroup((prev) => (prev === title ? null : title));
  }, []);

  return (
    <div className="flex h-screen bg-bg-page overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Collapsible & Mobile Slide Drawer) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-brand-sidebar border-r border-border-divider flex flex-col shadow-2xl lg:shadow-sm lg:static lg:z-30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden print:hidden shrink-0 min-h-0 ${
          isMobileMenuOpen ? 'w-[260px] translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDesktopSidebarOpen
            ? 'lg:w-[260px] lg:opacity-100 lg:visible'
            : 'lg:w-0 lg:opacity-0 lg:invisible lg:border-none lg:p-0 lg:overflow-hidden'
        }`}
      >
        <div className="w-[260px] h-full flex flex-col shrink-0 min-h-0">
          {/* Logo Area */}
          <div className="h-[76px] flex items-center justify-between px-4 border-b border-border-divider shrink-0 overflow-hidden">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center hover:opacity-90 transition-opacity cursor-pointer group"
              title="Go to Dashboard"
            >
              <div className="flex h-[56px] w-[184px] shrink-0 items-center justify-center rounded-lg bg-white p-1">
                <img src={sahayaoneLogo} alt="Sahayaone" className="h-full w-full object-contain object-center" />
              </div>
            </Link>
            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <SidebarAccordionContext.Provider value={{ openGroup, toggleGroup, setOpenGroup }}>
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-0 space-y-1">
              {/* 1. Dashboard */}
              {hasAccess('dashboard') && (
                <div className="mb-2">
                  <NavLink 
                    to="/dashboard" 
                    className={navLinkClass}
                    onMouseEnter={() => prefetchRoute('/dashboard')}
                  >
                    <LayoutDashboard size={20} className="shrink-0" />
                    <span>Dashboard</span>
                  </NavLink>
                </div>
              )}

              {/* 2. Partner Management */}
              {(hasAccess('co_operative_bank') || hasAccess('partner_management')) && (
                <SidebarGroup 
                  title="Partner Management" 
                  icon={Landmark}
                  onMouseEnter={() => prefetchRoute('/co-operative-bank')}
                >
                  <NavLink 
                    to="/co-operative-bank" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/co-operative-bank')}
                  >
                    <Landmark size={20} className="shrink-0" /> <span>Co-operative Bank</span>
                  </NavLink>
                </SidebarGroup>
              )}

              {/* 3. Lead Management (CRM) */}
              {(hasAccess('customers') || hasAccess('leads')) && (
                <SidebarGroup 
                  title="Lead Management" 
                  icon={Users}
                  onMouseEnter={() => {
                    prefetchRoute('/customers');
                    prefetchRoute('/leads');
                  }}
                >
                  {hasAccess('customers') && (
                    <NavLink 
                      to="/customers" 
                      className={subNavLinkClass}
                      onMouseEnter={() => prefetchRoute('/customers')}
                    >
                      <Users size={20} className="shrink-0" /> <span>Customer Loans</span>
                    </NavLink>
                  )}
                  {hasAccess('leads') && (
                    <NavLink 
                      to="/leads" 
                      className={subNavLinkClass}
                      onMouseEnter={() => prefetchRoute('/leads')}
                    >
                      <UserPlus size={20} className="shrink-0" /> <span>Leads</span>
                    </NavLink>
                  )}
                </SidebarGroup>
              )}

              {/* 4. Onboarding */}
              {hasAccess('onboarding_team') && (
                <SidebarGroup 
                  title="Onboarding" 
                  icon={UserCog}
                  onMouseEnter={() => prefetchRoute('/onboarding-team')}
                >
                  <NavLink 
                    to="/onboarding-team" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/onboarding-team')}
                  >
                    <UserCog size={20} className="shrink-0" /> <span>Employee Onboarding</span>
                  </NavLink>
                </SidebarGroup>
              )}

              {/* 5. HR Management */}
              {(hasAccess('hr_management') || hasAccess('attendance') || hasAccess('employee_letters') || hasAccess('employees') || hasAccess('important_dates')) && (
                <SidebarGroup 
                  title="HR Management" 
                  icon={UserCheck}
                  onMouseEnter={() => {
                    prefetchRoute('/employees');
                    prefetchRoute('/attendance');
                    prefetchRoute('/letters-payroll');
                    prefetchRoute('/important-dates');
                  }}
                >
                  <NavLink 
                    to="/employees" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/employees')}
                  >
                    <User size={20} className="shrink-0" /> <span>Employees</span>
                  </NavLink>
                  <NavLink 
                    to="/attendance" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/attendance')}
                  >
                    <CalendarCheck size={20} className="shrink-0" /> <span>Attendance & Reports</span>
                  </NavLink>
                  <NavLink 
                    to="/letters-payroll" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/letters-payroll')}
                  >
                    <FileText size={20} className="shrink-0" /> <span>Letters & Payroll</span>
                  </NavLink>
                  <NavLink 
                    to="/important-dates" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/important-dates')}
                  >
                    <Gift size={20} className="shrink-0" /> <span>Important Dates</span>
                  </NavLink>
                </SidebarGroup>
              )}

              {/* 6. Geo Tagging */}
              {hasAccess('geo_tagging') && (
                <SidebarGroup 
                  title="Geo Tagging" 
                  icon={MapPin}
                  onMouseEnter={() => prefetchRoute('/geo-tagging')}
                >
                  <NavLink 
                    to="/geo-tagging" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/geo-tagging')}
                  >
                    <MapPin size={20} className="shrink-0" /> <span>Geo Tagging</span>
                  </NavLink>
                </SidebarGroup>
              )}

              {/* 7. Roles & Permissions */}
              {(hasAccess('roles_permissions') || hasAccess('role')) && (
                <SidebarGroup 
                  title="Roles & Permissions" 
                  icon={IdCard}
                  onMouseEnter={() => prefetchRoute('/roles-permissions')}
                >
                  <NavLink 
                    to="/roles-permissions" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/roles-permissions')}
                  >
                    <IdCard size={20} className="shrink-0" /> <span>Roles & Permissions</span>
                  </NavLink>
                </SidebarGroup>
              )}

              {/* 8. Cash Payment */}
              {hasAccess('cash_payment') && (
                <SidebarGroup 
                  title="Cash Payment" 
                  icon={Banknote}
                  onMouseEnter={() => prefetchRoute('/cash-payment')}
                >
                  <NavLink 
                    to="/cash-payment" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/cash-payment')}
                  >
                    <Banknote size={20} className="shrink-0" /> <span>Cash Payment</span>
                  </NavLink>
                </SidebarGroup>
              )}

              {/* 9. Settings */}
              {(hasAccess('price_settings') || hasAccess('support_settings') || hasAccess('settings')) && (
                <SidebarGroup 
                  title="Settings" 
                  icon={Tag}
                  onMouseEnter={() => {
                    prefetchRoute('/price-settings');
                    prefetchRoute('/support-settings');
                  }}
                >
                  {(hasAccess('price_settings') || hasAccess('settings')) && (
                    <NavLink 
                      to="/price-settings" 
                      className={subNavLinkClass}
                      onMouseEnter={() => prefetchRoute('/price-settings')}
                    >
                      <Tag size={20} className="shrink-0" /> <span>Price Settings</span>
                    </NavLink>
                  )}
                  {(hasAccess('support_settings') || hasAccess('settings')) && (
                    <NavLink 
                      to="/support-settings" 
                      className={subNavLinkClass}
                      onMouseEnter={() => prefetchRoute('/support-settings')}
                    >
                      <Headphones size={20} className="shrink-0" /> <span>Support Settings</span>
                    </NavLink>
                  )}
                </SidebarGroup>
              )}

              {/* 10. App Management */}
              {(hasAccess('banner_management') || hasAccess('banners')) && (
                <SidebarGroup 
                  title="App Management" 
                  icon={Image}
                  onMouseEnter={() => prefetchRoute('/banners')}
                >
                  <NavLink 
                    to="/banners" 
                    className={subNavLinkClass}
                    onMouseEnter={() => prefetchRoute('/banners')}
                  >
                    <Image size={20} className="shrink-0" /> <span>Banner Management</span>
                  </NavLink>
                </SidebarGroup>
              )}
            </div>
          </SidebarAccordionContext.Provider>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar Header */}
        <header className="h-[76px] bg-brand-header text-white flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0 print:hidden">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sidebar Toggle Button (Desktop & Mobile) */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  toggleDesktopSidebar();
                }
              }}
              aria-label={isDesktopSidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
              title={isDesktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className={`w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 border focus:outline-none focus:ring-2 focus:ring-white/30 active:scale-95 ${
                isDesktopSidebarOpen
                  ? "bg-white/10 hover:bg-white/20 border-white/15 text-white/90 hover:text-white shadow-2xs"
                  : "bg-white/25 hover:bg-white/35 border-white/30 text-white shadow-sm ring-2 ring-white/15"
              }`}
            >
              {isDesktopSidebarOpen ? (
                <PanelLeftClose size={20} className="hidden lg:block transition-transform duration-200" />
              ) : (
                <PanelLeftOpen size={20} className="hidden lg:block transition-transform duration-200" />
              )}
              <Menu size={22} className="lg:hidden" />
            </button>

            {/* Subtle Vertical Divider */}
            <div className="hidden sm:block h-6 w-px bg-white/20 shrink-0" />

            <div>
              <div className="text-[11px] sm:text-xs text-white/80 font-medium">Welcome</div>
              <div className="flex items-center gap-2">
                <div className="text-base sm:text-lg font-semibold tracking-wide truncate max-w-[130px] sm:max-w-none">{userName}</div>
                {roleName && (
                  <span className="hidden sm:inline-block bg-white/15 text-white/90 border border-white/20 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide">
                    {roleName}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5 relative">
            <Link to="/notifications" className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors block" title="Notifications">
              <Bell size={18} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-semantic-danger rounded-full border border-brand-header flex items-center justify-center text-[8px] font-bold"></span>
              )}
            </Link>
            
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-white/90 text-text-heading py-1.5 px-2 pr-3 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex items-center justify-center">
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">{userName.split(' ')[0]}</span>
                <ChevronDown size={14} className={`text-text-muted transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-text-body hover:bg-bg-page hover:text-text-heading transition-colors flex items-center gap-2 font-medium"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 font-medium border-t border-gray-100 mt-1 pt-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-bg-page p-3.5 sm:p-6 relative">
          <GlobalLoader />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
