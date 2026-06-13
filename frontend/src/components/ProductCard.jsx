import React, { useState } from 'react';
import { Heart, Star, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { clickService } from '../services/api';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const discount =
    product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  // ── Wishlist toggle ──────────────────────────────────────────────────────────
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setAnimating(true);
    toggleWishlist(product.id);
    setTimeout(() => setAnimating(false), 400);
  };

  // ── Track affiliate click ────────────────────────────────────────────────────
  const handleDealClick = async () => {
    try {
      await clickService.track({
        product_id: product.id,
        platform: product.affiliate_platform || 'unknown',
      });
    } catch (_) { /* silent */ }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full relative">

      {/* ── Discount badge ─────────────────────────────────────────────────── */}
      {product.is_deal === 1 && discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-rose-200">
          {discount}% OFF
        </div>
      )}

      {/* ── Wishlist Button ────────────────────────────────────────────────── */}
      <button
        onClick={handleWishlist}
        title={user ? (wishlisted ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to save'}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`
          absolute top-3 right-3 z-10
          w-9 h-9 rounded-full flex items-center justify-center
          shadow-md border transition-all duration-200
          ${wishlisted
            ? 'bg-rose-500 border-rose-400 text-white shadow-rose-300/60'
            : 'bg-white/95 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-white hover:shadow-lg'}
          ${animating ? 'scale-125' : 'scale-100'}
        `}
      >
        <Heart
          size={16}
          className={`transition-all duration-200 ${wishlisted ? 'fill-white' : ''}`}
        />
      </button>

      {/* ── Product Image ──────────────────────────────────────────────────── */}
      <Link to={`/product/${product.slug}`} className="relative h-56 overflow-hidden block">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
      </Link>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link
            to={`/products?category=${product.category_slug}`}
            className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider hover:text-indigo-600"
          >
            {product.category_name}
          </Link>
          <div className="flex items-center gap-1 text-slate-400 group-hover:text-amber-400 transition-colors">
            <Star size={14} className="fill-current" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="text-base font-bold text-slate-800 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors leading-tight"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-indigo-600">
              ₹{parseFloat(product.price).toLocaleString()}
            </span>
            {product.original_price > product.price && (
              <span className="text-sm text-slate-400 line-through">
                ₹{parseFloat(product.original_price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mt-2">
            <a
              href={product.affiliate_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDealClick}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-white rounded-md text-[13px] font-bold shadow-md hover:shadow-lg hover:opacity-90 active:scale-95 transition-all w-full"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
            >
              <ExternalLink size={14} />
              Buy Now
            </a>
            <Link
              to={`/product/${product.slug}`}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 text-gray-800 rounded-md text-[13px] font-bold hover:bg-gray-200 transition-colors w-full border border-gray-300"
            >
              Details
            </Link>
          </div>

          {/* Login hint for guests */}
          {!user && (
            <p className="text-[10px] text-slate-400 text-center">
              <Link to="/login" className="text-indigo-500 font-bold hover:underline">Login</Link>{' '}
              to save to wishlist
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
