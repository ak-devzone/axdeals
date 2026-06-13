import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Package, TrendingUp, MessageSquare } from 'lucide-react';
import { STAFF_ROLES, ROLE_META } from '../../config/roles';

// Role previews shown on the login page
const ROLE_PREVIEWS = [
  { role: 'admin',             icon: ShieldCheck, label: 'Admin',          desc: 'Full access' },
  { role: 'content_manager',   icon: Package,     label: 'Content Mgr',    desc: 'Products & catalog' },
  { role: 'marketing_manager', icon: TrendingUp,  label: 'Marketing Mgr',  desc: 'Analytics & deals' },
  { role: 'support',           icon: MessageSquare, label: 'Support',      desc: 'Reviews & users' },
];

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login(formData);
      const { user, token } = res.data;

      // Allow all staff roles into the admin panel
      if (!STAFF_ROLES.includes(user.role)) {
        setError('Access denied. This portal is for staff members only.');
        return;
      }

      login(user, token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />

      {/* Left panel — Role info */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 xl:px-24">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-white">AK Deals Hub</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
            Staff<br />
            <span className="text-indigo-400">Control Center</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium mb-12">
            Role-based access for your team. Each role gets a tailored dashboard.
          </p>

          {/* Role cards */}
          <div className="space-y-3">
            {ROLE_PREVIEWS.map(({ role, icon: Icon, label, desc }) => {
              const meta = ROLE_META[role];
              return (
                <div key={role} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div className={`w-10 h-10 ${meta.badgeBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={meta.badgeText} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{label}</div>
                    <div className="text-xs text-slate-400 font-medium">{desc}</div>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${meta.badgeBg} ${meta.badgeText}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex items-center justify-center flex-1 px-4 py-12 lg:border-l lg:border-white/5">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Shield size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white text-center">Staff Login</h2>
              <p className="text-slate-400 mt-2 font-medium text-sm">Access your role-based dashboard</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="email"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600 text-sm font-medium"
                    placeholder="yourname@akdealshub.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="password"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600 text-sm font-medium"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Authenticating...</>
                ) : (
                  <>'Sign In' <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-500 text-sm">
                New staff member?{' '}
                <Link to="/admin/portal/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  Register here
                </Link>
              </p>
            </div>
          </div>
          <p className="text-center text-slate-700 text-xs mt-6 uppercase tracking-widest font-bold">
            Protected Environment &copy; {new Date().getFullYear()} AK Deals Hub
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
