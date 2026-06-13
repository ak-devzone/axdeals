import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/ProductCard';

/* ── Hero Carousel ────────────────────────────────────────────────────────────── */
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
      title: 'Shop the Latest Gadgets',
      link: '/products?category=electronics'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
      title: 'Fashion Mega Sale',
      link: '/products?category=fashion'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop',
      title: 'Home & Kitchen Upgrades',
      link: '/products?category=home'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden group">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Gradient overlay to make it blend with background */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/40 to-slate-900/80 z-10"></div>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-top mix-blend-overlay" />
          <div className="absolute top-1/3 left-10 md:left-20 z-20 max-w-lg">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{slide.title}</h2>
            <Link to={slide.link} className="inline-block text-white px-8 py-3.5 rounded-full text-[15px] font-bold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:opacity-90 active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
              Shop Now
            </Link>
          </div>
        </div>
      ))}
      <button 
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/3 z-30 p-2 bg-white/50 hover:bg-white/90 text-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={30} />
      </button>
      <button 
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/3 z-30 p-2 bg-white/50 hover:bg-white/90 text-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={30} />
      </button>
    </div>
  );
};

/* ── Category Square ──────────────────────────────────────────────────────────── */
const CategorySquare = ({ cat }) => (
  <Link
    to={`/products?category=${cat.slug}`}
    className="bg-white p-5 flex flex-col h-full rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 group"
  >
    <h3 className="font-black text-[18px] text-slate-800 mb-4 line-clamp-1 group-hover:text-rose-600 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>{cat.name}</h3>
    <div className="flex-1 w-full bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden mb-4 border border-slate-100 relative">
      {cat.image ? (
        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      ) : (
        <div className="text-4xl font-black text-slate-300 group-hover:scale-110 transition-transform duration-500">{cat.name[0]}</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
    <span className="text-rose-600 hover:text-rose-700 text-[14px] font-bold mt-auto flex items-center gap-1 group-hover:translate-x-1 transition-transform">
      Explore <ArrowRight size={14} />
    </span>
  </Link>
);

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
const Home = () => {
  const [trending,    setTrending]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [deals,       setDeals]       = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, cRes, dRes] = await Promise.all([
          productService.getAll({ trending: 1, limit: 8 }),
          categoryService.getAll(),
          productService.getAll({ deal: 1, limit: 8 })
        ]);
        setTrending(tRes.data.products || []);
        setCategories(cRes.data || []);
        setDeals(dRes.data.products || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="w-full pb-12">
      
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div className="-mx-4 -mt-4 relative mb-8">
        <HeroCarousel />
        
        {/* Overlapping Category Grid */}
        <div className="max-w-screen-2xl mx-auto px-4 relative z-20 -mt-[120px] md:-mt-[180px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.slice(0, 4).map((c) => (
               <div key={c.id} className="h-80 shadow-md">
                 <CategorySquare cat={c} />
               </div>
            ))}
            {/* If we have fewer than 4 categories, fill the rest */}
            {categories.length < 4 && Array.from({ length: 4 - categories.length }).map((_, i) => (
              <div key={`empty-${i}`} className="h-80 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="font-black text-[18px] text-slate-800 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Keep Shopping</h3>
                <div className="flex-1 w-full bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100 border-dashed">
                  <span className="text-slate-400 font-bold text-sm">More coming soon</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-8">
        
        {/* ── TRENDING DEALS ROW ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                   <TrendingUp size={14} strokeWidth={3} />
                 </div>
                 <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Hot Right Now</span>
              </div>
              <h2 className="text-[28px] md:text-[32px] font-black text-gray-900 leading-none tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Trending Deals</h2>
            </div>
            <Link to="/products?trending=1" className="text-[14px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
              Explore All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 no-scroll snap-x snap-mandatory relative z-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="min-w-[240px] h-[340px] bg-gray-50 animate-pulse rounded-2xl snap-start border border-gray-100" />
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 no-scroll snap-x snap-mandatory relative z-10">
              {trending.map(p => (
                <div key={p.id} className="min-w-[240px] w-[240px] shrink-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed relative z-10">
               <TrendingUp size={32} className="text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500 font-medium text-[14px]">No trending deals right now.</p>
            </div>
          )}
        </section>

        {/* ── FLASH DEALS ROW ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center">
                   <Zap size={14} strokeWidth={3} className="fill-rose-600" />
                 </div>
                 <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Limited Time</span>
              </div>
              <h2 className="text-[28px] md:text-[32px] font-black text-gray-900 leading-none tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Flash Deals</h2>
            </div>
            <Link to="/products?deal=1" className="text-[14px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 group bg-rose-50 px-4 py-2 rounded-lg hover:bg-rose-100 transition-colors">
              Shop Flash Deals <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 no-scroll snap-x snap-mandatory relative z-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="min-w-[240px] h-[340px] bg-gray-50 animate-pulse rounded-2xl snap-start border border-gray-100" />
              ))}
            </div>
          ) : deals.length > 0 ? (
            <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 no-scroll snap-x snap-mandatory relative z-10">
              {deals.map(p => (
                <div key={p.id} className="min-w-[240px] w-[240px] shrink-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed relative z-10">
               <Zap size={32} className="text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500 font-medium text-[14px]">No flash deals right now.</p>
            </div>
          )}
        </section>

        {/* ── MORE CATEGORIES GRID ──────────────────────────────────────────────── */}
        {categories.length > 4 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.slice(4, 8).map(c => (
              <div key={c.id} className="h-80 shadow-sm">
                <CategorySquare cat={c} />
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
};

export default Home;
