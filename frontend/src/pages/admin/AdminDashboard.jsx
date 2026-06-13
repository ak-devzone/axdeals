import React, { useState, useEffect } from 'react';
import {
  MousePointer2, Users, Package, Layers, Tag, Activity,
  TrendingUp, Star, MessageSquare, CheckCircle, AlertCircle,
  Eye, Clock, BarChart2, Globe, ArrowUpRight, ArrowDownRight,
  RefreshCw, ShieldCheck, Zap
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ROLE_META } from '../../config/roles';

// ─── Shared: Tiny sparkline SVG ───────────────────────────────────────────────
const SparkLine = ({ data = [], color = '#6366f1', height = 36, width = 120 }) => {
  if (data.length < 2) return null;
  const vals = data.map(d => Number(d.clicks || d.users || d.value || 0));
  const max = Math.max(...vals, 1), min = 0, range = max - min || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} L${pts.split(' ').join(' L')} L${width},${height} Z`} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Shared: KPI Card ────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, color = 'indigo', sub, sparkData }) => {
  const c = {
    indigo: { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-100',  spark: '#6366f1' },
    emerald:{ bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', spark: '#10b981' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100',   spark: '#f59e0b' },
    rose:   { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100',    spark: '#ef4444' },
    violet: { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100',  spark: '#8b5cf6' },
    cyan:   { bg: 'bg-cyan-50',    text: 'text-cyan-600',    ring: 'ring-cyan-100',    spark: '#06b6d4' },
  }[color] || {};
  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${c.bg} ${c.text} rounded-xl flex items-center justify-center ring-4 ${c.ring}`}>
          <Icon size={18} />
        </div>
        {sub && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{sub}</span>}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-3xl font-black text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {sparkData && <div className="mt-3"><SparkLine data={sparkData} color={c.spark} /></div>}
    </div>
  );
};

// ─── Shared: Section Header ────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-5">
    <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{title}</h3>
    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN Dashboard — Full analytics
// ══════════════════════════════════════════════════════════════════════════════
const AdminFullDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); const t = setInterval(fetch, 60000); return () => clearInterval(t); }, []);

  if (loading) return <DashboardSkeleton count={8} />;

  const { stats, topProducts, topCategories, platformStats, dailyClicks, dailyUsers, recentClicks, recentUsers } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-500">Live • Auto-refresh 60s</span>
        </div>
        <button onClick={() => { setRefreshing(true); fetch(); }} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-60">
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Clicks"    value={stats.totalClicks}    icon={MousePointer2} color="indigo"  sub={`+${stats.todayClicks} today`} sparkData={dailyClicks} />
        <KpiCard label="Total Products"  value={stats.totalProducts}  icon={Package}       color="emerald" />
        <KpiCard label="Registered Users"value={stats.totalUsers}     icon={Users}         color="amber"   sub={`+${stats.newUsersToday} today`} sparkData={dailyUsers} />
        <KpiCard label="Monthly Clicks"  value={stats.monthClicks}    icon={Activity}      color="violet"  sparkData={dailyClicks} />
        <KpiCard label="Categories"      value={stats.totalCategories}icon={Layers}        color="cyan"    />
        <KpiCard label="Brands"          value={stats.totalBrands}    icon={Tag}           color="rose"    />
        <KpiCard label="Featured"        value={stats.featuredProducts}icon={Star}         color="amber"   />
        <KpiCard label="Pending Reviews" value={stats.pendingReviews} icon={MessageSquare} color="rose"    />
      </div>

      {/* Platform + Top Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <SectionHeader title="Platform Breakdown" subtitle="Clicks by affiliate platform" />
          <div className="space-y-3">
            {platformStats.map((p, i) => {
              const pct = Math.round((p.total / stats.totalClicks) * 100) || 0;
              const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444'];
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 capitalize">{p.platform}</span>
                    <span className="text-slate-900">{p.total} <span className="text-slate-400 font-medium">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <SectionHeader title="Top Products by Clicks" subtitle="Ranked by affiliate clicks" />
          <div className="space-y-2.5">
            {topProducts.slice(0, 6).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 group hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors">
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black shrink-0 ${i < 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400">₹{Number(p.price).toLocaleString('en-IN')}</div>
                </div>
                <span className="text-xs font-black text-indigo-600 shrink-0">{p.click_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Recent Users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <h3 className="font-black text-sm uppercase tracking-tight">Live Click Activity</h3>
          </div>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {recentClicks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 bg-indigo-600/30 rounded-lg flex items-center justify-center shrink-0">
                  <MousePointer2 size={12} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{c.product_name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300">{c.platform}</span>
                    <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <SectionHeader title="Recent Registrations" subtitle={`${stats.newUsersToday} new today`} />
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-slate-100 text-slate-600">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT MANAGER Dashboard — Products & catalog focus
// ══════════════════════════════════════════════════════════════════════════════
const ContentManagerDashboard = ({ myStats }) => {
  const { stats } = myStats;
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Package size={20} className="text-violet-200" />
          <span className="text-xs font-black uppercase tracking-widest text-violet-200">Content Manager</span>
        </div>
        <h2 className="text-2xl font-black mb-1">Manage Your Catalog</h2>
        <p className="text-violet-200 text-sm">Add, edit, and organize products, categories, and brands.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Products"   value={stats.totalProducts}   icon={Package}  color="emerald" />
        <KpiCard label="Draft Products"    value={stats.draftProducts}   icon={Eye}      color="amber"   />
        <KpiCard label="Inactive Products" value={stats.inactiveProducts}icon={AlertCircle} color="rose" />
        <KpiCard label="Categories"        value={stats.totalCategories} icon={Layers}   color="violet"  />
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Quick Actions" subtitle="Most common tasks" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Add New Product',  path: '/admin/products',   icon: Package, color: 'bg-indigo-600' },
            { label: 'Manage Categories',path: '/admin/categories', icon: Layers,  color: 'bg-violet-600' },
            { label: 'Manage Brands',    path: '/admin/brands',     icon: Tag,     color: 'bg-cyan-600'   },
          ].map(({ label, path, icon: Icon, color }) => (
            <a key={label} href={path}
              className={`${color} text-white rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-all active:scale-95 shadow-lg group`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon size={18} />
              </div>
              <span className="font-black text-sm">{label}</span>
              <ArrowUpRight size={16} className="ml-auto opacity-60 group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <SectionHeader title="Recently Added Products" subtitle="Last 8 products in the catalog" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(stats.recentProducts || []).map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-400">₹{Number(p.price).toLocaleString('en-IN')}</div>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${
                p.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                p.status === 'draft'  ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-500'
              }`}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MARKETING MANAGER Dashboard — Analytics focus
// ══════════════════════════════════════════════════════════════════════════════
const MarketingDashboard = ({ myStats }) => {
  const { stats } = myStats;
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={20} className="text-amber-200" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-200">Marketing Manager</span>
        </div>
        <h2 className="text-2xl font-black mb-1">Performance Analytics</h2>
        <p className="text-amber-100 text-sm">Track clicks, conversions, and product performance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Clicks Today"    value={stats.todayClicks || 0}   icon={MousePointer2} color="amber"   />
        <KpiCard label="Monthly Clicks"  value={stats.monthClicks || 0}   icon={Activity}      color="indigo"  sparkData={stats.dailyClicks} />
        <KpiCard label="Total Products"  value={stats.totalProducts}      icon={Package}       color="emerald" />
        <KpiCard label="Active Brands"   value={stats.totalBrands}        icon={Tag}           color="rose"    />
      </div>

      {/* Platform Breakdown */}
      {stats.platformStats?.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <SectionHeader title="Platform Breakdown" subtitle="Where clicks are coming from" />
            <div className="space-y-3">
              {stats.platformStats.map((p, i) => {
                const total = stats.platformStats.reduce((a, b) => a + b.total, 0) || 1;
                const pct = Math.round((p.total / total) * 100);
                const COLORS = ['#f59e0b','#6366f1','#10b981','#ef4444'];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700 capitalize">{p.platform}</span>
                      <span className="text-slate-900">{p.total} <span className="text-slate-400">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <SectionHeader title="Top Products" subtitle="Highest click-through rate" />
            <div className="space-y-2.5">
              {(stats.topProducts || []).slice(0, 6).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-black ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{i+1}</span>
                  <div className="flex-1 text-xs font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="flex items-center gap-1 shrink-0">
                    <MousePointer2 size={10} className="text-amber-500" />
                    <span className="text-xs font-black text-slate-800">{p.click_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SUPPORT Dashboard — Reviews & user tickets focus
// ══════════════════════════════════════════════════════════════════════════════
const SupportDashboard = ({ myStats }) => {
  const { stats } = myStats;
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={20} className="text-cyan-200" />
          <span className="text-xs font-black uppercase tracking-widest text-cyan-200">Support Staff</span>
        </div>
        <h2 className="text-2xl font-black mb-1">Support Dashboard</h2>
        <p className="text-cyan-100 text-sm">Manage customer reviews and queries.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pending Reviews" value={stats.pendingReviews || 0} icon={MessageSquare} color="rose"    />
        <KpiCard label="Total Reviews"   value={stats.totalReviews || 0}   icon={Star}          color="amber"   />
        <KpiCard label="Total Users"     value={stats.totalUsers || 0}     icon={Users}         color="cyan"    />
        <KpiCard label="Active Products" value={stats.totalProducts}       icon={Package}       color="emerald" />
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Review Pending Reviews', path: '/admin/reviews', icon: MessageSquare, color: 'bg-rose-600',  count: stats.pendingReviews },
            { label: 'Manage Users',           path: '/admin/users',   icon: Users,          color: 'bg-cyan-600',  count: stats.totalUsers },
          ].map(({ label, path, icon: Icon, color, count }) => (
            <a key={label} href={path}
              className={`${color} text-white rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-all shadow-lg group`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon size={18} />
              </div>
              <div>
                <div className="font-black text-sm">{label}</div>
                <div className="text-[11px] text-white/70 mt-0.5">{count} items</div>
              </div>
              <ArrowUpRight size={16} className="ml-auto opacity-60 group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      {stats.recentReviews?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <SectionHeader title="Recent Reviews" subtitle="Awaiting your attention" />
          <div className="space-y-3">
            {stats.recentReviews.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-cyan-200 transition-colors">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-black text-xs shrink-0 mt-0.5">
                  {r.user_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-slate-800">{r.user_name}</span>
                    <span className="text-[10px] text-slate-400">on</span>
                    <span className="text-[10px] font-bold text-slate-600 truncate">{r.product_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2">{r.review || 'No text review.'}</div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${
                  r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  r.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                            'bg-amber-100 text-amber-700'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const DashboardSkeleton = ({ count = 4 }) => (
  <div className="space-y-8 animate-pulse">
    <div className="h-32 bg-slate-100 rounded-2xl" />
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4`}>
      {[...Array(count)].map((_, i) => <div key={i} className="bg-white h-32 rounded-2xl border border-slate-100" />)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white h-64 rounded-2xl border border-slate-100" />
      <div className="bg-white h-64 rounded-2xl border border-slate-100" />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — Route to correct dashboard based on role
// ══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { user } = useAuth();
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyStats = async () => {
      try {
        const res = await api.get('/admin/my-stats');
        setMyStats(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchMyStats();
  }, []);

  if (!user) return null;

  // Admin gets full dashboard (uses /admin/stats internally)
  if (user.role === 'admin') return <AdminFullDashboard />;

  if (loading) return <DashboardSkeleton count={4} />;
  if (!myStats) return <div className="text-slate-400 p-8">Failed to load dashboard.</div>;

  if (user.role === 'content_manager')   return <ContentManagerDashboard myStats={myStats} />;
  if (user.role === 'marketing_manager') return <MarketingDashboard myStats={myStats} />;
  if (user.role === 'support')           return <SupportDashboard myStats={myStats} />;

  return <div className="text-slate-400 p-8">Unknown role: {user.role}</div>;
};

export default AdminDashboard;
