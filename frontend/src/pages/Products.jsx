import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest',
    trending: searchParams.get('trending') || '',
    deal: searchParams.get('deal') || ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await categoryService.getAll();
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = Object.fromEntries([...searchParams]);
        const res = await productService.getAll(queryParams);
        setProducts(res.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    setSearchParams(params);
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 space-y-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Filter size={16} /> Filters
            </h3>
            
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Category</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleFilterChange('category', '')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!filters.category ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => handleFilterChange('category', cat.slug)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.category === cat.slug ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Price Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  />
                  <span className="text-slate-300">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  />
                </div>
              </div>

              {/* Special Filters */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filters.trending === '1'}
                    onChange={(e) => handleFilterChange('trending', e.target.checked ? '1' : '')}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-rose-600 transition-colors">Trending Deals</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filters.deal === '1'}
                    onChange={(e) => handleFilterChange('deal', e.target.checked ? '1' : '')}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-rose-600 transition-colors">Flash Sales</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 mb-8 gap-4 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search for deals, brands, or products..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <select 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Relevant</option>
              </select>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2.5 bg-rose-50 text-rose-600 rounded-xl"
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(filters.category || filters.search || filters.min_price || filters.max_price) && (
            <div className="flex flex-wrap gap-2 mb-8">
              {filters.category && (
                <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  Category: {filters.category}
                  <button onClick={() => handleFilterChange('category', '')} className="hover:text-rose-900">×</button>
                </div>
              )}
              {filters.search && (
                <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  Search: {filters.search}
                  <button onClick={() => handleFilterChange('search', '')} className="hover:text-slate-900">×</button>
                </div>
              )}
              <button 
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  setFilters({ category: '', search: '', min_price: '', max_price: '', sort: 'newest', trending: '', deal: '' });
                }}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-96"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No deals found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any products matching your current filters. Try adjusting your search term or category.</p>
              <button 
                onClick={() => setSearchParams(new URLSearchParams())}
                className="mt-8 text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-rose-500/20"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
