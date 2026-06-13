import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  MoreVertical, Filter, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import api from '../../services/api';
import ProductForm from './ProductForm';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../config/roles';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const canEdit   = can(user?.role, 'products.edit');
  const canDelete = can(user?.role, 'products.delete');
  const canCreate = can(user?.role, 'products.create');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const fetchInitialData = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands')
      ]);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (error) {
      console.error('Error fetching categories/brands:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search, limit: 100 } });
      setProducts(res.data.products);
    } catch (error) {
      console.error('Error fetching admin products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert('Delete failed.');
      }
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    setIsFormOpen(false);
    fetchProducts();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
      {/* Table Header */}
      <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white flex-grow transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAdd}
          disabled={!canCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm 
          product={currentProduct} 
          categories={categories} 
          brands={brands}
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSave} 
        />
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Price</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Featured</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-8 py-6"><div className="h-10 bg-slate-50 rounded-xl"></div></td>
                </tr>
              ))
            ) : products.map((p) => (
              <tr key={p.id} className="group hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border border-slate-100 p-1 shrink-0 bg-white">
                      <img src={p.image} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{p.brand_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {p.category_name}
                  </span>
                </td>
                <td className="px-8 py-5 text-right font-black text-slate-800 text-sm">
                  ₹{parseFloat(p.price).toLocaleString()}
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center">
                    <div className={`w-3 h-3 rounded-full ${p.is_featured ? 'bg-indigo-500 shadow-md shadow-indigo-500/30' : 'bg-slate-200'}`}></div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center justify-end gap-2">
                     {canEdit && (
                       <button 
                         onClick={() => handleEdit(p)}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                       >
                         <Edit2 size={16} />
                       </button>
                     )}
                     {canDelete && (
                       <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100">
                         <Trash2 size={16} />
                       </button>
                     )}
                     {!canEdit && !canDelete && (
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Read Only</span>
                     )}
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="p-8 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {products.length} Products</span>
        <div className="flex items-center gap-2">
           <button className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30" disabled>
             <ChevronLeft size={20} />
           </button>
           <div className="flex items-center gap-1">
             <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold">1</button>
             <button className="w-8 h-8 rounded-lg hover:bg-slate-50 text-slate-600 text-xs font-bold">2</button>
           </div>
           <button className="p-2 text-slate-400 hover:text-indigo-600">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
