import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Tag, ToggleLeft, ToggleRight, X, Check, AlertTriangle, Globe, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const MODAL_INITIAL = { name: '', logo: '', description: '', website: '', is_active: true };

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(MODAL_INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch (e) {
      setError('Failed to load brands.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(MODAL_INITIAL);
    setError('');
    setModal(true);
  };

  const openEdit = (brand) => {
    setEditing(brand);
    setForm({
      name: brand.name,
      logo: brand.logo || '',
      description: brand.description || '',
      website: brand.website || '',
      is_active: !!brand.is_active,
    });
    setError('');
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Brand name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/brands/${editing.id}`, form);
      } else {
        await api.post('/brands', form);
      }
      setModal(false);
      fetchBrands();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save brand.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/brands/${id}`);
      setDeleteConfirm(null);
      fetchBrands();
    } catch (e) {
      setError('Failed to delete brand.');
    }
  };

  const handleToggle = async (brand) => {
    try {
      await api.put(`/brands/${brand.id}`, { is_active: !brand.is_active });
      fetchBrands();
    } catch (e) { setError('Failed to update status.'); }
  };

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Brands</h2>
          <p className="text-sm text-slate-500 mt-0.5">{brands.length} total brands</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-200 self-start">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Brand Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Tag size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No brands found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(brand => (
            <div key={brand.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-indigo-100 transition-all group relative">
              {/* Status badge */}
              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${brand.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />

              {/* Logo */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {brand.logo
                  ? <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
                  : <Tag size={24} className="text-slate-300" />
                }
              </div>

              <div className="text-center mb-3">
                <div className="font-black text-slate-900 text-sm">{brand.name}</div>
                <code className="text-[9px] text-slate-400 font-mono">/{brand.slug}</code>
              </div>

              {brand.description && (
                <p className="text-[11px] text-slate-500 text-center line-clamp-2 mb-3">{brand.description}</p>
              )}

              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${brand.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {brand.product_count || 0} products
                </span>
                {brand.website && (
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" onClick={e => e.stopPropagation()}>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Actions (show on hover) */}
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(brand)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleToggle(brand)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${brand.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                  {brand.is_active ? <><ToggleLeft size={12} /> Disable</> : <><ToggleRight size={12} /> Enable</>}
                </button>
                <button onClick={() => setDeleteConfirm(brand)} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-black text-slate-900">{editing ? 'Edit Brand' : 'Add Brand'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="text-rose-600 text-sm font-medium bg-rose-50 px-3 py-2 rounded-lg">{error}</div>}

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Brand Name *</label>
                <input
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Apple"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Logo URL</label>
                <input
                  value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                {form.logo && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                    <img src={form.logo} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Website URL</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                    placeholder="https://brand.com"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Description</label>
                <textarea
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`w-12 h-6 rounded-full transition-all ${form.is_active ? 'bg-indigo-600' : 'bg-slate-200'} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
                </div>
                <span className="text-sm font-bold text-slate-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-rose-500" />
            </div>
            <h3 className="font-black text-slate-900 mb-2">Delete Brand?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
