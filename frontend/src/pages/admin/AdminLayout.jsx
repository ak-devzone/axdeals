import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LogOut, Settings, Menu, X, ShoppingBag, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMenu, ROLE_META, STAFF_ROLES, canAccessRoute } from '../../config/roles';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Redirect if not authenticated or not staff
  React.useEffect(() => {
    if (!user || !STAFF_ROLES.includes(user.role)) {
      navigate('/admin/portal/login');
    }
  }, [user, navigate]);

  if (!user || !STAFF_ROLES.includes(user.role)) return null;

  const roleMeta = ROLE_META[user.role] || ROLE_META.support;
  const menuItems = getMenu(user.role);
  const RoleIcon = roleMeta.icon;

  const isActive = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-400
        flex flex-col transition-all duration-300 shadow-2xl shadow-black/30
        ${isSidebarOpen ? 'w-64' : 'w-20'} lg:relative
      `}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-white/5 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/50">
              <ShoppingBag size={18} className="text-white" />
            </div>
            {isSidebarOpen && (
              <span className="text-white font-black tracking-tight text-base">ADMIN HUB</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Role Badge & User Info */}
        {isSidebarOpen && (
          <div className="px-5 py-5 border-b border-white/5 shrink-0">
            {/* Role pill */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl mb-4 ${roleMeta.badgeBg}`}>
              <RoleIcon size={12} className={roleMeta.badgeText} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${roleMeta.badgeText}`}>
                {roleMeta.label}
              </span>
            </div>
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 ring-2 ring-indigo-400/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-medium truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {!isSidebarOpen && (
            <div className="mb-3 flex justify-center">
              <div className={`w-8 h-8 ${roleMeta.badgeBg} rounded-lg flex items-center justify-center`}>
                <RoleIcon size={14} className={roleMeta.badgeText} />
              </div>
            </div>
          )}
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                title={!isSidebarOpen ? item.name : undefined}
                className={`
                  flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-150 group relative
                  ${active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'hover:bg-white/5 hover:text-white text-slate-400'}
                `}
              >
                <item.icon
                  size={18}
                  className={`shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}
                />
                {isSidebarOpen && (
                  <span className="text-sm font-bold truncate">{item.name}</span>
                )}
                {active && isSidebarOpen && (
                  <ChevronRight size={14} className="ml-auto text-indigo-300 shrink-0" />
                )}
                {/* Tooltip when collapsed */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-3 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-1 shrink-0">
          <button
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-all group"
            title={!isSidebarOpen ? 'Settings' : undefined}
          >
            <Settings size={18} className="text-slate-500 group-hover:text-white shrink-0" />
            {isSidebarOpen && <span className="text-sm font-bold">Settings</span>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all group"
            title={!isSidebarOpen ? 'Logout' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className={`flex-grow flex flex-col min-h-screen overflow-x-hidden transition-all duration-300`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Menu size={18} />
            </button>

            <div>
              <h1 className="text-lg font-black text-slate-900 capitalize">
                {location.pathname === '/admin'
                  ? 'Dashboard'
                  : location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'
                }
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                {roleMeta.description}
              </p>
            </div>
          </div>

          {/* Right side — user info + role */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${roleMeta.badgeBg}`}>
              <RoleIcon size={12} className={roleMeta.badgeText} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${roleMeta.badgeText}`}>
                {roleMeta.label}
              </span>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-slate-900 leading-none">{user.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{user.email}</div>
              </div>
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
