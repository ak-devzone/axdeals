import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  Link, useLocation, useNavigate
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import {
  Zap, Heart, Search, X, Menu, LogOut,
  ChevronDown, ShoppingBag, User, LayoutGrid, TrendingUp,
  Flame, Tag, Star
} from 'lucide-react';
import { productService } from './services/api';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBrands from './pages/admin/AdminBrands';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import NotFound from './pages/NotFound';
import Categories from './pages/Categories';
import Wishlist from './pages/Wishlist';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import RoleGuard from './components/RoleGuard';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AffiliateDisclosure from './pages/AffiliateDisclosure';

/* ─────────────────────────────────────────────────────────
   INJECT GLOBAL STYLES
───────────────────────────────────────────────────────── */
const INJECT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #f8fafc;
    color: #0f172a;
    margin: 0;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Mobile menu slide ── */
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mobile-menu { animation: slideDown 0.2s ease; }

  /* ── Hide scrollbar ── */
  .no-scroll::-webkit-scrollbar { display: none; }
  .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* ── Footer link hover ── */
  .footer-link { transition: color 0.2s; }
  .footer-link:hover { color: #f43f5e; }
`;

if (!document.getElementById('axdeals-global')) {
  const s = document.createElement('style');
  s.id = 'axdeals-global';
  s.textContent = INJECT_CSS;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────
   LOGO
───────────────────────────────────────────────────────── */
const Logo = () => (
  <Link to="/" className="flex items-center select-none shrink-0 group p-1 rounded-xl hover:bg-slate-100 transition-colors">
    <span 
      className="text-2xl sm:text-4xl font-black tracking-tighter transition-transform group-hover:scale-105"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">AX</span>
      <span className="text-slate-800">Deals</span>
    </span>
  </Link>
);

/* ─────────────────────────────────────────────────────────
   LIVE SEARCH
───────────────────────────────────────────────────────── */
const LiveSearch = () => {
  const [q, setQ]         = useState('');
  const [hits, setHits]   = useState([]);
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const navigate           = useNavigate();
  const timer              = useRef(null);
  const ref                = useRef(null);

  useEffect(() => {
    if (q.length < 2) { setHits([]); setOpen(false); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await productService.getAll({ search: q, limit: 6 });
        setHits(res.data.products || []);
        setOpen(true);
      } catch (_) {} finally { setBusy(false); }
    }, 240);
    return () => clearTimeout(timer.current);
  }, [q]);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const submit = (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div ref={ref} className="flex-1 max-w-2xl relative hidden md:block">
      <form onSubmit={submit} className="flex h-[42px] w-full shadow-sm rounded-full bg-white border border-slate-200 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-50 transition-all">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder="Search for products, brands and more..."
          className="flex-1 bg-transparent text-slate-800 px-5 py-2 text-[15px] outline-none rounded-l-full placeholder:text-slate-400"
        />
        {q && (
          <button type="button" onClick={() => { setQ(''); setHits([]); setOpen(false); }} className="text-slate-400 hover:text-slate-600 px-2 flex items-center bg-transparent">
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="text-white px-6 rounded-r-full flex items-center justify-center transition-all hover:opacity-90 shadow-lg shadow-rose-500/20"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
        >
          <Search size={18} strokeWidth={2.5} />
        </button>
      </form>

      {/* Dropdown */}
      {open && hits.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 z-50 overflow-hidden">
          {hits.map(p => (
            <button
              key={p.id}
              onMouseDown={() => { setOpen(false); navigate(`/product/${p.slug}`); }}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 group"
            >
              <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden shrink-0 bg-white p-1">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">{p.name}</p>
                <p className="text-[13px] text-rose-500 font-black">₹{parseFloat(p.price).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────── */
const Navbar = () => {
  const [mobileOpen, setMobile]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const { user, logout }          = useAuth();
  const location                  = useLocation();
  const navigate                  = useNavigate();
  const userRef                   = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobile(false); }, [location]);

  const NAV_LINKS = [
    { label: 'Deals',      href: '/products',             icon: <Tag size={15}/> },
    { label: 'Categories', href: '/categories',            icon: <LayoutGrid size={15}/> },
    { label: 'Trending',   href: '/products?trending=1',  icon: <TrendingUp size={15}/> },
    { label: 'Flash Sale', href: '/products?deal=1',      icon: <Flame size={15}/> },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm text-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 h-20 flex items-center justify-between gap-6">

          {/* Logo */}
          <Logo />

          {/* Search */}
          <LiveSearch />

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">

            {user ? (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  title="Wishlist"
                >
                  <Heart size={20} className="mb-0.5" />
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserOpen(o => !o)}
                    className="flex items-center gap-3 px-3 py-2 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start hidden sm:flex">
                      <span className="text-[11px] font-bold text-slate-400 leading-none">Account</span>
                      <span className="text-[13px] font-bold text-slate-800 leading-none mt-1">{user.name.split(' ')[0]}</span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {userOpen && (
                    <div
                      className="absolute right-0 top-full mt-3 w-56 rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-900/10"
                      style={{ animation: 'slideDown .18s ease' }}
                    >
                      <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-[14px] font-black text-slate-900">{user.name}</p>
                        <p className="text-[12px] font-medium text-slate-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link to="/wishlist" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-[14px] font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                          <Heart size={16} /> My Wishlist
                        </Link>
                        {(user.role === 'admin' || user.role !== 'user') && (
                          <Link to="/admin" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-[14px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <LayoutGrid size={16} /> Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-slate-100 py-2">
                        <button
                          onClick={() => { setUserOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-[14px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut size={16} /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden sm:flex items-center justify-center px-5 h-11 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-6 h-11 rounded-xl text-[14px] font-bold text-white shadow-lg shadow-rose-500/20 hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobile(o => !o)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Secondary Nav Bar (Categories/Links) */}
        <div className="bg-white border-b border-slate-200/60 px-4 py-2.5 flex items-center gap-6 overflow-x-auto no-scroll text-[14px] font-medium text-slate-600 shadow-sm">
          <Link to="/categories" className="flex items-center gap-1.5 hover:text-rose-500 transition-colors shrink-0 font-bold">
            <Menu size={16} /> All Categories
          </Link>
          <div className="w-px h-4 bg-slate-200 shrink-0" />
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} to={href} className="hover:text-rose-500 transition-colors shrink-0">
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-2xl">
            {/* Mobile Search */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <form onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.search.value;
                if(q) { setMobile(false); navigate(`/products?search=${encodeURIComponent(q)}`); }
              }} className="flex h-11 w-full shadow-sm rounded-full bg-white border border-slate-200 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-50 transition-all">
                <input
                  name="search"
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-slate-800 px-5 text-[15px] outline-none rounded-l-full placeholder:text-slate-400"
                />
                <button type="submit" className="text-white px-6 rounded-r-full hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </form>
            </div>
            <div className="p-2 space-y-1">
               {NAV_LINKS.map(({ label, href, icon }) => (
                 <Link key={label} to={href} onClick={() => setMobile(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                   <span className="text-rose-500">{icon}</span> {label}
                 </Link>
               ))}
            </div>
            {!user && (
               <div className="p-4 border-t border-slate-100 flex flex-col gap-3 bg-slate-50/50">
                 <Link to="/login" onClick={() => setMobile(false)} className="w-full text-center py-3 border border-slate-300 text-slate-700 font-bold rounded-xl bg-white hover:bg-slate-50">Log in</Link>
                 <Link to="/register" onClick={() => setMobile(false)} className="w-full text-center py-3 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20" style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>Create Account</Link>
               </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

/* ─────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="bg-[#0f172a] text-slate-300 mt-20 border-t-4 border-rose-500">
    <div className="max-w-screen-2xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 select-none shrink-0 mb-6 inline-flex">
            <img src="/logo.png" alt="AXDeals Logo" className="h-14 sm:h-16 w-auto object-contain" />
          </Link>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm mb-6">
            Your ultimate shopping companion. We compare prices across the web's top platforms so you always get the best deal without the hassle.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/axdeals_official/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer text-white" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://t.me/axdeals_official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer text-white" aria-label="Telegram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-[16px] mb-6 text-white uppercase tracking-wider text-sm">Explore</h4>
          <ul className="space-y-3 text-[15px] text-slate-400">
            <li><Link to="/products" className="hover:text-rose-400 transition-colors">All Deals</Link></li>
            <li><Link to="/categories" className="hover:text-rose-400 transition-colors">Categories</Link></li>
            <li><Link to="/products?trending=1" className="hover:text-rose-400 transition-colors">Trending Now</Link></li>
            <li><Link to="/products?deal=1" className="hover:text-rose-400 transition-colors">Flash Sales</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[16px] mb-6 text-white uppercase tracking-wider text-sm">Legal</h4>
          <ul className="space-y-3 text-[15px] text-slate-400">
            <li><Link to="/privacy-policy" className="hover:text-rose-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-rose-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/affiliate-disclosure" className="hover:text-rose-400 transition-colors">Affiliate Disclosure</Link></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-[14px] text-slate-500 font-medium">
          © {new Date().getFullYear()} axdeals. All rights reserved.
        </p>
        <p className="text-[13px] text-slate-500">
          
        </p>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────────────────
   APP
───────────────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        {/* Adjusted padding for larger nav */}
        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-12 overflow-x-hidden min-h-[calc(100vh-350px)]">
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/products"       element={<Products />} />
            <Route path="/product/:slug"  element={<ProductDetail />} />
            <Route path="/categories"     element={<Categories />} />
            <Route path="/wishlist"       element={<Wishlist />} />
            <Route path="/trending"       element={<Products />} />

            <Route path="/privacy-policy"       element={<PrivacyPolicy />} />
            <Route path="/terms-of-service"     element={<TermsOfService />} />
            <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />

            <Route path="/admin/portal/login"    element={<AdminLogin />} />
            <Route path="/admin/portal/register" element={<AdminRegister />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={
                <RoleGuard allowedRoles={['admin','content_manager','marketing_manager','support']}>
                  <AdminProducts />
                </RoleGuard>
              }/>
              <Route path="categories" element={
                <RoleGuard allowedRoles={['admin','content_manager']}>
                  <AdminCategories />
                </RoleGuard>
              }/>
              <Route path="brands" element={
                <RoleGuard allowedRoles={['admin','content_manager']}>
                  <AdminBrands />
                </RoleGuard>
              }/>
              <Route path="users" element={
                <RoleGuard allowedRoles={['admin','support']}>
                  <AdminUsers />
                </RoleGuard>
              }/>
              <Route path="analytics" element={
                <RoleGuard allowedRoles={['admin','marketing_manager']}>
                  <AdminAnalytics />
                </RoleGuard>
              }/>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
