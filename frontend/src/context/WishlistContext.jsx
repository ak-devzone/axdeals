import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load wishlist IDs whenever user logs in
  const loadWishlistIds = useCallback(async () => {
    if (!user) { setWishlistIds(new Set()); return; }
    try {
      setLoading(true);
      const res = await wishlistService.getIds();
      setWishlistIds(new Set(res.data.map(String)));
    } catch (_) {
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWishlistIds();
  }, [loadWishlistIds]);

  // Toggle — optimistic update, then sync to DB
  const toggleWishlist = useCallback(async (productId) => {
    const id = String(productId);
    const isWishlisted = wishlistIds.has(id);

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      isWishlisted ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      if (isWishlisted) {
        await wishlistService.remove(id);
      } else {
        await wishlistService.add(id);
      }
    } catch (err) {
      // Rollback on failure
      setWishlistIds(prev => {
        const next = new Set(prev);
        isWishlisted ? next.add(id) : next.delete(id);
        return next;
      });
      console.error('Wishlist toggle error:', err);
    }
  }, [wishlistIds]);

  const isWishlisted = useCallback((productId) => wishlistIds.has(String(productId)), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, loading, toggleWishlist, isWishlisted, reload: loadWishlistIds }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
