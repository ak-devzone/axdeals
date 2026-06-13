import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RotateCcw, Zap, ExternalLink, ChevronRight, Info, TrendingUp, Search } from 'lucide-react';
import { productService, clickService } from '../services/api';

/* ── 3D mouse tilt card wrapper ─────────────────────────────────────────────── */
const TiltWrap = ({ children, className = '' }) => {
  const r = useRef(null);
  const move = useCallback((e) => {
    if (!r.current) return;
    const rect = r.current.getBoundingClientRect();
    const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
    const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    r.current.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  }, []);
  const leave = useCallback(() => {
    if (r.current) r.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
  }, []);
  return (
    <div
      ref={r}
      className={className}
      style={{ transition: 'box-shadow .2s, transform 0.1s', transformStyle: 'preserve-3d' }}
      onMouseMove={move}
      onMouseLeave={leave}
    >
      {children}
    </div>
  );
};

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState({ type: 'image', url: null });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getOne(slug);
        setProduct(res.data);
        setActiveMedia({ type: 'image', url: res.data.image });
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAffiliateClick = async (platform) => {
    try {
      const res = await clickService.track({ 
        product_id: product.id, 
        platform 
      });
      if (res.data.url) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Click tracking error:', error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl shadow-indigo-200"></div>
      <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Details...</p>
    </div>
  );

  if (!product) return (
    <div className="text-center py-40">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search size={32} className="text-slate-400" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Product Not Found</h2>
      <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
        Back to Deals <ChevronRight size={16} />
      </Link>
    </div>
  );

  const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);

  return (
    <div className="pb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-400 mb-10 overflow-hidden whitespace-nowrap">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <ChevronRight size={14} className="text-slate-300" />
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-indigo-600 transition-colors">{product.category_name}</Link>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-slate-800 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left: Images */}
        <div className="lg:col-span-5 space-y-6">
          <TiltWrap className="relative aspect-square rounded-[2rem] overflow-hidden bg-white border border-slate-100/60 shadow-2xl shadow-indigo-500/5 group">
            {/* Soft background gradient behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            {discount > 0 && (
              <div className="absolute top-6 left-6 z-10 bg-rose-500 text-white text-[13px] font-black px-3 py-1 rounded-full shadow-lg shadow-rose-500/30 border border-rose-400">
                -{discount}% OFF
              </div>
            )}
            
            {activeMedia.type === 'video' ? (
              <iframe src={activeMedia.url} className="relative z-10 w-full h-full" frameBorder="0" allowFullScreen></iframe>
            ) : (
              <img src={activeMedia.url} alt={product.name} className="relative z-0 w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-500" />
            )}
          </TiltWrap>
          
          {/* Gallery Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setActiveMedia({ type: 'image', url: product.image })}
              className={`w-20 h-20 shrink-0 rounded-2xl border-2 overflow-hidden bg-white p-2 transition-all ${activeMedia.url === product.image ? 'border-indigo-600 shadow-lg shadow-indigo-200' : 'border-slate-100 hover:border-indigo-300 opacity-70 hover:opacity-100'}`}
            >
              <img src={product.image} alt="Thumbnail" className="w-full h-full object-contain" />
            </button>
            {product.images && Array.isArray(product.images) && product.images.map((img, idx) => (
              <button 
                key={`img-${idx}`}
                onClick={() => setActiveMedia({ type: 'image', url: img })}
                className={`w-20 h-20 shrink-0 rounded-2xl border-2 overflow-hidden bg-white p-2 transition-all ${activeMedia.url === img ? 'border-indigo-600 shadow-lg shadow-indigo-200' : 'border-slate-100 hover:border-indigo-300 opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-contain" />
              </button>
            ))}
            {product.videos && Array.isArray(product.videos) && product.videos.map((vid, idx) => (
              <button 
                key={`vid-${idx}`}
                onClick={() => setActiveMedia({ type: 'video', url: vid })}
                className={`w-20 h-20 shrink-0 rounded-2xl border-2 overflow-hidden bg-slate-100 flex items-center justify-center p-2 transition-all ${activeMedia.url === vid ? 'border-indigo-600 shadow-lg shadow-indigo-200' : 'border-slate-200 hover:border-indigo-300 opacity-70 hover:opacity-100'}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center">
                  <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1"></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{product.brand_name}</span>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                <Star size={13} className="text-amber-500 fill-amber-500" />
                <span className="text-amber-700 text-[12px] font-bold">{product.rating}</span>
                <span className="text-amber-600/60 text-[10px] font-bold ml-0.5">({product.review_count} reviews)</span>
              </div>
              {product.is_trending === 1 && (
                <span className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} /> Trending
                </span>
              )}
            </div>
            
            <h1 className="text-[32px] sm:text-[42px] font-black text-slate-900 mb-4 leading-[1.1] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              {product.name}
            </h1>
            <p className="text-[16px] text-slate-500 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-2xl shadow-rose-500/5 mb-10 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-50 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-[44px] font-black text-slate-900 leading-none tracking-tight">₹{parseFloat(product.price).toLocaleString()}</span>
                </div>
                {product.original_price > product.price && (
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[20px] text-slate-400 line-through font-bold decoration-slate-300 decoration-2">₹{parseFloat(product.original_price).toLocaleString()}</span>
                    <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest">
                      Save {discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* Store Links */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-300"></span> Available Prices <span className="w-full h-px bg-slate-200 flex-1"></span>
                </h3>
                
                {product.affiliate_links?.amazon_link && (
                  <button 
                    onClick={() => handleAffiliateClick('amazon')}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#FF9900] hover:shadow-xl hover:shadow-[#FF9900]/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:bg-[#FF9900]/10 transition-colors">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="w-full object-contain" alt="Amazon" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 text-[15px]">Amazon</span>
                        <span className="block text-[12px] font-semibold text-slate-500">Prime Delivery Available</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[20px] font-black text-slate-900 group-hover:text-[#FF9900] transition-colors">₹{parseFloat(product.price).toLocaleString()}</span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#FF9900] group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </button>
                )}

                {product.affiliate_links?.flipkart_link && (
                  <button 
                    onClick={() => handleAffiliateClick('flipkart')}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#2874F0] hover:shadow-xl hover:shadow-[#2874F0]/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:bg-[#2874F0]/10 transition-colors">
                        <img src="https://rukminim2.flixcart.com/fk-p-flap/92/36/image/31f7e3af490c225f.png?q=60" className="w-full object-contain" alt="Flipkart" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 text-[15px]">Flipkart</span>
                        <span className="block text-[12px] font-semibold text-slate-500">Assured Product</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[20px] font-black text-slate-900 group-hover:text-[#2874F0] transition-colors">₹{parseFloat(product.price).toLocaleString()}</span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#2874F0] group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </button>
                )}

                {product.affiliate_links?.croma_link && (
                  <button 
                    onClick={() => handleAffiliateClick('croma')}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:bg-teal-50 transition-colors">
                        <span className="font-black text-teal-600 text-[10px]">CROMA</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 text-[15px]">Croma</span>
                        <span className="block text-[12px] font-semibold text-slate-500">Store Pickup Available</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[20px] font-black text-slate-900 group-hover:text-teal-600 transition-colors">₹{parseFloat(product.price).toLocaleString()}</span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </button>
                )}

                {product.affiliate_links?.meesho_link && (
                  <button 
                    onClick={() => handleAffiliateClick('meesho')}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-pink-500 hover:shadow-xl hover:shadow-pink-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:bg-pink-50 transition-colors">
                        <span className="font-black text-pink-600 text-[10px]">MEESHO</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 text-[15px]">Meesho</span>
                        <span className="block text-[12px] font-semibold text-slate-500">Lowest Prices</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[20px] font-black text-slate-900 group-hover:text-pink-600 transition-colors">₹{parseFloat(product.price).toLocaleString()}</span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </button>
                )}

                {product.affiliate_links?.myntra_link && (
                  <button 
                    onClick={() => handleAffiliateClick('myntra')}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-fuchsia-500 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:bg-fuchsia-50 transition-colors">
                        <span className="font-black text-fuchsia-600 text-[10px]">MYNTRA</span>
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 text-[15px]">Myntra</span>
                        <span className="block text-[12px] font-semibold text-slate-500">Fashion Deals</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[20px] font-black text-slate-900 group-hover:text-fuchsia-600 transition-colors">₹{parseFloat(product.price).toLocaleString()}</span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Features / Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                 <Truck size={18} />
               </div>
               <h4 className="font-bold text-slate-900 text-[14px]">Free Delivery</h4>
               <p className="text-[12px] text-slate-500 mt-1 font-medium">On eligible orders</p>
            </div>
            <div className="flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-rose-100 hover:shadow-lg transition-all">
               <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-3">
                 <RotateCcw size={18} />
               </div>
               <h4 className="font-bold text-slate-900 text-[14px]">Easy Returns</h4>
               <p className="text-[12px] text-slate-500 mt-1 font-medium">7-day replacement</p>
            </div>
            <div className="flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-lg transition-all">
               <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                 <ShieldCheck size={18} />
               </div>
               <h4 className="font-bold text-slate-900 text-[14px]">Secure Links</h4>
               <p className="text-[12px] text-slate-500 mt-1 font-medium">Verified partners</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
