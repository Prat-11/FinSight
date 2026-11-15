import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart as LineChartIcon,
  GitCompare,
  Briefcase,
  Bookmark,
  Sparkles,
  Newspaper,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Stock Analysis', path: '/stocks', icon: <LineChartIcon className="w-5 h-5" /> },
  { label: 'Compare Stocks', path: '/compare', icon: <GitCompare className="w-5 h-5" /> },
  { label: 'Portfolio', path: '/portfolio', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Watchlist', path: '/watchlist', icon: <Bookmark className="w-5 h-5" /> },
  { label: 'AI Insights', path: '/insights', icon: <Sparkles className="w-5 h-5" /> },
  { label: 'Market News', path: '/news', icon: <Newspaper className="w-5 h-5" /> },
];

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-gray-800 z-40 sticky top-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white font-mono">
            Fin<span className="text-blue-500">Sight</span>
          </span>
        </NavLink>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#111827] border-r border-gray-800 p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg text-white font-mono">
                    Fin<span className="text-blue-500">Sight</span>
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                      )
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'Investor'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || 'user@finsight.io'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col justify-between bg-[#111827] border-r border-gray-800/90 transition-all duration-300 sticky top-0 h-screen select-none z-30',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-gray-800/80">
            <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0 border border-blue-400/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-white font-mono tracking-tight leading-none">
                    Fin<span className="text-blue-500">Sight</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">
                    Analytics
                  </span>
                </div>
              )}
            </NavLink>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 items-center justify-center transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/70'
                  )
                }
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User profile & Logout footer */}
        <div className="p-3 border-t border-gray-800/80">
          <div
            className={clsx(
              'flex items-center gap-3 p-2 rounded-xl bg-gray-900/60 border border-gray-800 mb-2',
              isSidebarCollapsed && 'justify-center p-2'
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Investor'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || 'investor@finsight.io'}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Sign Out' : undefined}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors',
              isSidebarCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-800/60 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <span>&copy; {new Date().getFullYear()} FinSight Financial Analytics Platform. All rights reserved.</span>
          <span className="font-mono text-gray-400">Institutional Grade Market Intelligence</span>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
