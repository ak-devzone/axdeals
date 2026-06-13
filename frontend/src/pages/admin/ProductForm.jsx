import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

const ProductForm = ({ product, categories, brands, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    image: '',
    images: [],
    videos: [],
    category_id: '',
    brand_id: '',
    is_featured: false,
    is_trending: false,
    is_deal: false,
    amazon_link: '',
    flipkart_link: '',
    croma_link: '',
    meesho_link: '',
    myntra_link: '',
    ...product,
    images: product?.images || [],
    videos: product?.videos || [],
    amazon_link: product?.affiliate_links?.amazon_link || product?.amazon_link || '',
    flipkart_link: product?.affiliate_links?.flipkart_link || product?.flipkart_link || '',
    croma_link: product?.affiliate_links?.croma_link || product?.croma_link || '',
    meesho_link: product?.affiliate_links?.meesho_link || product?.meesho_link || '',
    myntra_link: product?.affiliate_links?.myntra_link || product?.myntra_link || '',
  });

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product?.id) {
        await api.put(`/products/${product.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{product?.id ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-sm text-slate-400 font-medium tracking-tight">Enter product details and affiliate links</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Product Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                  placeholder="iPhone 15 Pro Max..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                    placeholder="124900"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Original Price (₹)</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                    placeholder="139900"
                    value={formData.original_price}
                    onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Primary Image URL</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                    placeholder="https://images..."
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                  />
                </div>

                {/* Multiple Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Additional Images URLs</label>
                    <button type="button" onClick={() => addArrayItem('images')} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1">
                      <Plus size={14} /> Add Image
                    </button>
                  </div>
                  {formData.images.map((img, index) => (
                    <div key={`img-${index}`} className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                        placeholder="https://images..."
                        value={img}
                        onChange={(e) => handleArrayChange('images', index, e.target.value)}
                      />
                      <button type="button" onClick={() => removeArrayItem('images', index)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Multiple Videos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Video URLs (YouTube/MP4)</label>
                    <button type="button" onClick={() => addArrayItem('videos')} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1">
                      <Plus size={14} /> Add Video
                    </button>
                  </div>
                  {formData.videos.map((vid, index) => (
                    <div key={`vid-${index}`} className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                        placeholder="https://youtube.com/embed/..."
                        value={vid}
                        onChange={(e) => handleArrayChange('videos', index, e.target.value)}
                      />
                      <button type="button" onClick={() => removeArrayItem('videos', index)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                  <select 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Brand</label>
                  <select 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                    value={formData.brand_id}
                    onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                  >
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Affiliate Links & Settings */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">Affiliate & Deals</h3>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Amazon Affiliate Link</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                  placeholder="https://amazon.in/dp/..."
                  value={formData.amazon_link}
                  onChange={(e) => setFormData({...formData, amazon_link: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Flipkart Affiliate Link</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                  placeholder="https://flipkart.com/..."
                  value={formData.flipkart_link}
                  onChange={(e) => setFormData({...formData, flipkart_link: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Meesho Affiliate Link</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                  placeholder="https://meesho.com/..."
                  value={formData.meesho_link}
                  onChange={(e) => setFormData({...formData, meesho_link: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Myntra Affiliate Link</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                  placeholder="https://myntra.com/..."
                  value={formData.myntra_link}
                  onChange={(e) => setFormData({...formData, myntra_link: e.target.value})}
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-200"
                     checked={formData.is_featured}
                     onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                   />
                   <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Featured</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-200"
                     checked={formData.is_trending}
                     onChange={(e) => setFormData({...formData, is_trending: e.target.checked})}
                   />
                   <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Trending</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-200"
                     checked={formData.is_deal}
                     onChange={(e) => setFormData({...formData, is_deal: e.target.checked})}
                   />
                   <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Flash Deal</span>
                 </label>
              </div>

              <div className="pt-6">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                <textarea 
                  rows="4"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Detailed product features..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pb-4">
             <button 
               type="button"
               onClick={onClose}
               className="px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
             >
               Discard
             </button>
             <button 
               type="submit"
               disabled={loading}
               className="bg-indigo-600 text-white px-10 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 transition-all"
             >
               {loading ? 'Saving...' : (
                 <>
                   <Save size={18} />
                   Save Product
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
