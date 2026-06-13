import React, { useState, useEffect } from 'react';
import {
  MousePointer2, TrendingUp, Activity, Package, Tag, Layers,
  BarChart2, RefreshCw, ArrowUpRight, ArrowDownRight, Globe,
  Star, Users, Clock
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Sparkline SVG ──────────────────────────────────────────────────────────────
const SparkLine = ({ data = [], color = '#6366f1', height = 40, width = 140 }) => {
  if (data.length < 2) return <div className="h-10 w-full" />;
  const vals = data.map(d => Number(d.clicks || d.value || 0));
  const max = Math.max(...vals, 1);
  const pts = vals
    .map((v, i) => `${(i / (vals.length - 1)) * width},${height - (v / max) * height}`)
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M0,${height} ${pts.split(' ').map((p, i) => (i === 0 ? `L${p}` : `L${p}`)).join(' ')} L${width},${height} Z`}
        fill={`url(#sg-${color.replace('#', '')})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon, color = 'indigo', trend, sparkData }) => {
  const c = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-100',  spark: '#6366f1', grad: 'from-indigo-600 to-indigo-400' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', spark: '#10b981', grad: 'from-emerald-600 to-emerald-400' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100',   spark: '#f59e0b', grad: 'from-amber-500 to-amber-300' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100',  spark: '#8b5cf6', grad: 'from-violet-600 to-violet-400' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100',    spark: '#ef4444', grad: 'from-rose-500 to-rose-400' },
    cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    ring: 'ring-cyan-100',    spark: '#06b6d4', grad: 'from-cyan-500 to-cyan-400' },
  }[color] || {};

  const isUp = trend > 0;
  const isDown = trend < 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${c.bg} ${c.text} rounded-xl flex items-center justify-center ring-4 ${c.ring} group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${
            isUp ? 'bg-emerald-50 text-emerald-600' : isDown ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
          }`}>
            {isUp ? <ArrowUpRight size={10} /> : isDown ? <ArrowDownRight size={10} /> : null}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-3xl font-black text-slate-900 mb-0.5">
        {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
      </div>
      {sub && <div className="text-[10px] text-slate-400 font-medium mb-3">{sub}</div>}
      {sparkData && <SparkLine data={sparkData} color={c.spark} />}
    </div>
  );
};

// ── Bar Chart (CSS-based) ──────────────────────────────────────────────────────
const BarChart = ({ data = [], valueKey = 'clicks', labelKey = 'date', color = '#6366f1', label = 'Clicks' }) => {
  if (!data.length) return <div className="text-center text-slate-300 py-12 text-sm">No data</div>;
  const max = Math.max(...data.map(d => Number(d[valueKey] || 0)), 1);
  const last14 = data.slice(-14);

  return (
    <div className="flex items-end gap-1 h-32 mt-2">
      {last14.map((d, i) => {
        const val = Number(d[valueKey] || 0);
        const pct = (val / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
            <div className="relative w-full flex justify-center">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none">
                {val} {label}
              </div>
              <div
                className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
                style={{ height: `${Math.max(pct, 2)}%`, background: color, minHeight: val > 0 ? '4px' : '2px' }}
              />
            </div>
            {last14.length <= 7 && (
              <span className="text-[8px] text-slate-400 font-medium rotate-0">
                {String(d[labelKey]).slice(-5)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Platform Breakdown ─────────────────────────────────────────────────────────
const PlatformBar = ({ platform, total, pct, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-slate-700 capitalize">{platform}</span>
      <span className="text-slate-900">{total} <span className="text-slate-400 font-medium">({pct}%)</span></span>
    </div>
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-28 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="bg-white h-36 rounded-2xl border border-slate-100" />)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white h-64 rounded-2xl border border-slate-100" />
      <div className="bg-white h-64 rounded-2xl border border-slate-100" />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN Analytics Page
// ══════════════════════════════════════════════════════════════════════════════
const AdminAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setError('');
      // admin gets full stats, marketing_manager gets my-stats
      const endpoint = user?.role === 'admin' ? '/admin/stats' : '/admin/my-stats';
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (e) {
      console.error('Analytics fetch error:', e);
      setError(e.response?.data?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) return <Skeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
        <BarChart2 size={28} className="text-rose-400" />
      </div>
      <p className="text-slate-500 font-medium text-sm">{error}</p>
      <button onClick={fetchStats} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
        Retry
      </button>
    </div>
  );

  // Normalise data shape — admin gets { stats, platformStats, dailyClicks, topProducts, ... }
  // marketing_manager gets { role, stats: { todayClicks, monthClicks, platformStats, topProducts, dailyClicks, ... } }
  const isAdmin = user?.role === 'admin';
  const stats        = isAdmin ? data.stats          : data.stats;
  const platformStats = isAdmin ? data.platformStats  : (data.stats?.platformStats || []);
  const dailyClicks  = isAdmin ? data.dailyClicks    : (data.stats?.dailyClicks || []);
  const topProducts  = isAdmin ? data.topProducts    : (data.stats?.topProducts || []);
  const recentClicks = isAdmin ? data.recentClicks   : [];

  const totalClicks  = isAdmin ? stats.totalClicks   : (stats.todayClicks + stats.monthClicks); // fallback
  const todayClicks  = stats.todayClicks || 0;
  const monthClicks  = stats.monthClicks || 0;
  const totalProducts = stats.totalProducts || 0;
  const totalBrands  = isAdmin ? stats.totalBrands   : (stats.totalBrands || 0);

  const PLATFORM_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const platformTotal = platformStats.reduce((a, b) => a + Number(b.total || 0), 0) || 1;

  return (
    <div className="space-y-8">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-16 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-white/80">Live Analytics</span>
            </div>
            <h2 className="text-2xl font-black mb-1">Performance Dashboard</h2>
            <p className="text-white/70 text-sm">
              Track clicks, conversions, and product performance in real-time.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60 backdrop-blur-sm border border-white/20"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Clicks Today"   value={todayClicks}   icon={MousePointer2} color="amber"   sub="Since midnight"      sparkData={dailyClicks.slice(-7)} />
        <KpiCard label="Monthly Clicks" value={monthClicks}   icon={Activity}      color="indigo"  sub="This month"           sparkData={dailyClicks} />
        <KpiCard label="Active Products" value={totalProducts} icon={Package}       color="emerald" sub="Live in catalog" />
        <KpiCard label="Active Brands"  value={totalBrands}   icon={Tag}           color="violet"  sub="Brand partners" />
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Click Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
          <SectionHeader
            title="Daily Click Trend"
            subtitle={`Last ${Math.min(dailyClicks.length, 14)} days`}
            action={
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {dailyClicks.length}d data
              </span>
            }
          />
          {dailyClicks.length > 0 ? (
            <>
              <BarChart data={dailyClicks} valueKey="clicks" labelKey="date" color="#6366f1" label="clicks" />
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Peak Day</div>
                  <div className="text-sm font-black text-slate-800">
                    {Math.max(...dailyClicks.map(d => Number(d.clicks || 0))).toLocaleString()} clicks
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Avg / Day</div>
                  <div className="text-sm font-black text-slate-800">
                    {dailyClicks.length
                      ? Math.round(dailyClicks.reduce((a, d) => a + Number(d.clicks || 0), 0) / dailyClicks.length).toLocaleString()
                      : 0} clicks
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-300 text-sm">No click data yet</div>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
          <SectionHeader title="Platform Breakdown" subtitle="Clicks by affiliate platform" />
          {platformStats.length > 0 ? (
            <div className="space-y-4">
              {platformStats.map((p, i) => {
                const pct = Math.round((Number(p.total) / platformTotal) * 100);
                return (
                  <PlatformBar
                    key={i}
                    platform={p.platform || 'Unknown'}
                    total={Number(p.total)}
                    pct={pct}
                    color={PLATFORM_COLORS[i % PLATFORM_COLORS.length]}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-300 text-sm">No platform data yet</div>
          )}

          {/* Total summary */}
          {platformStats.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Tracked</span>
              <span className="text-lg font-black text-slate-900">{platformTotal.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Products ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
        <SectionHeader
          title="Top Products by Clicks"
          subtitle="Ranked by total affiliate click-throughs"
          action={
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Top {Math.min(topProducts.length, 10)}
            </span>
          }
        />
        {topProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topProducts.slice(0, 9).map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-black shrink-0 ${
                  i === 0 ? 'bg-amber-400 text-white' :
                  i === 1 ? 'bg-slate-300 text-slate-700' :
                  i === 2 ? 'bg-orange-400 text-white' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {i + 1}
                </span>
                {p.image && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ₹{Number(p.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <MousePointer2 size={11} className="text-amber-500" />
                  <span className="text-xs font-black text-indigo-600">{p.click_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-slate-300 text-sm">No product data yet</div>
        )}
      </div>

      {/* ── Recent Click Activity (admin only) ───────────────────────────────── */}
      {isAdmin && recentClicks.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <h3 className="font-black text-sm uppercase tracking-tight">Live Click Activity</h3>
            <span className="ml-auto text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last {recentClicks.length}</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll">
            {recentClicks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 bg-indigo-600/30 rounded-lg flex items-center justify-center shrink-0">
                  <MousePointer2 size={13} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{c.product_name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300">
                      {c.platform}
                    </span>
                    {c.user_name && (
                      <span className="text-[10px] text-slate-500 truncate">{c.user_name}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 shrink-0 flex items-center gap-1">
                  <Clock size={9} />
                  {new Date(c.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
