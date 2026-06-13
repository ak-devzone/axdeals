import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Layers, ToggleLeft, ToggleRight, X, Check, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const MODAL_INITIAL = { name: '', image: '', description: '', parent_id: '', sort_order: 0, is_active: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(MODAL_INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch all (including inactive) for admin
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(MODAL_INITIAL);
    setError('');
    setModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      image: cat.image || '',
      description: cat.description || '',
      parent_id: cat.parent_id || '',
      sort_order: cat.sort_order || 0,
      is_active: !!cat.is_active,
    });
    setError('');
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Category name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, parent_id: form.parent_id || null };
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setModal(false);
      fetchCategories();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setDeleteConfirm(null);
      fetchCategories();
    } catch (e) {
      setError('Failed to delete category.');
    }
  };

  const handleToggle = async (cat) => {
    try {
      await api.put(`/categories/${cat.id}`, { is_active: !cat.is_active });
      fetchCategories();
    } catch (e) { setError('Failed to update status.'); }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const parentOptions = categories.filter(c => !editing || c.id !== editing.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} total categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-200 self-start">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading categories...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Layers size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Image', 'Name', 'Slug', 'Products', 'Sort', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                        {cat.image
                          ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-slate-400"><Layers size={16} /></div>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-slate-800">{cat.name}</div>
                      {cat.description && <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]">{cat.description}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono">{cat.slug}</code>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-slate-700">{cat.product_count || 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500 font-medium">{cat.sort_order}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(cat)} className="flex items-center gap-1.5 transition-colors">
                        {cat.is_active
                          ? <><ToggleRight size={20} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-600">Active</span></>
                          : <><ToggleLeft size={20} className="text-slate-400" /><span className="text-xs font-bold text-slate-400">Inactive</span></>
                        }
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(cat)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(cat)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-black text-slate-900">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="text-rose-600 text-sm font-medium bg-rose-50 px-3 py-2 rounded-lg">{error}</div>}

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Category Name *</label>
                <input
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mobiles"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Image URL</label>
                <input
                  value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                {form.image && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Parent Category</label>
                  <select
                    value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white"
                  >
                    <option value="">None</option>
                    {parentOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Sort Order</label>
                  <input
                    type="number" min="0"
                    value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
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
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-rose-500" />
            </div>
            <h3 className="font-black text-slate-900 mb-2">Delete Category?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
