import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ExternalLink, ShoppingBag, Star, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { wishlistService, clickService } from '../services/api';

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="h-52 bg-slate-100" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-slate-100 rounded-full w-1/3" />
      <div className="h-4 bg-slate-100 rounded-full w-3/4" />
      <div className="h-4 bg-slate-100 rounded-full w-1/2" />
      <div className="h-9 bg-slate-100 rounded-xl mt-4" />
    </div>
  </div>
);

// ── Single wishlist card ───────────────────────────────────────────────────────
const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);
  const discount =
    product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(product.id);
  };

  const handleDealClick = async () => {
    try {
      await clickService.track({ product_id: product.id, platform: product.affiliate_platform || 'unknown' });
    } catch (_) {}
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col group ${removing ? 'opacity-40 scale-95 pointer-events-none' : ''}`}>
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={handleRemove}
          title="Remove from wishlist"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 border border-slate-100 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-400 shadow-md transition-all duration-200"
        >
          <Trash2 size={15} />
        </button>
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1.5">
          <Link to={`/products?category=${product.category_slug}`} className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-600">
            {product.category_name}
          </Link>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={12} className="fill-current" />
            <span className="text-[11px] font-bold text-slate-600">{product.rating}</span>
          </div>
        </div>

        <Link to={`/product/${product.slug}`} className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-indigo-600 transition-colors leading-snug mb-3">
          {product.name}
        </Link>

        <div className="mt-auto">
          {/* Price row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-indigo-600">
              ₹{parseFloat(product.price).toLocaleString()}
            </span>
            {product.original_price > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{parseFloat(product.original_price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={product.affiliate_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDealClick}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all"
            >
              <ExternalLink size={12} /> View Deal
            </a>
            <Link
              to={`/product/${product.slug}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 active:scale-95 transition-all"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Wishlist Page ────────────────────────────────────────────────────────
const Wishlist = () => {
  const { user } = useAuth();
  const { toggleWishlist, reload: reloadIds } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect guests
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const res = await wishlistService.getAll();
      setProducts(res.data);
    } catch (e) {
      console.error('Wishlist fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const handleRemove = async (productId) => {
    // Optimistic remove from UI
    setProducts(prev => prev.filter(p => p.id !== productId));
    await toggleWishlist(productId);
    await reloadIds();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  if (!user) return null;

  return (
    <div className="pb-20">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Heart size={20} className="text-rose-500 fill-rose-500" />
              <h1 className="text-2xl font-black text-slate-900">My Wishlist</h1>
              {!loading && (
                <span className="text-sm font-black text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {loading ? 'Loading your saved products...' : products.length > 0
                ? 'Your saved deals — always here when you come back'
                : 'No products saved yet'}
            </p>
          </div>
        </div>

        {products.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <Heart size={40} className="text-rose-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Your wishlist is empty</h2>
          <p className="text-slate-400 text-sm max-w-xs mb-8 leading-relaxed">
            Browse products and click the ❤️ heart icon on any card to save deals for later.
          </p>
          <div className="flex gap-3">
            <Link
              to="/products"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <ShoppingBag size={18} /> Browse Deals
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-slate-300 transition-all active:scale-95"
            >
              Go Home
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Summary banner */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
              <Heart size={20} className="text-rose-500 fill-rose-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-black text-slate-800">
                {products.length} saved {products.length === 1 ? 'deal' : 'deals'}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                Total potential savings: ₹{products
                  .reduce((acc, p) => acc + Math.max(0, (parseFloat(p.original_price) || 0) - parseFloat(p.price)), 0)
                  .toLocaleString('en-IN')}
              </div>
            </div>
            <Link
              to="/products"
              className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-all shrink-0"
            >
              Find More
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <WishlistCard
                key={product.id}
                product={product}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
