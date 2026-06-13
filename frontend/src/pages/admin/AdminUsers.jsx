import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, UserX, UserCheck, Trash2, AlertTriangle, ChevronDown, Filter } from 'lucide-react';
import api from '../../services/api';

const ROLES = ['user', 'admin', 'content_manager', 'marketing_manager', 'support'];
const ROLE_COLORS = {
  admin: 'bg-indigo-100 text-indigo-700',
  user: 'bg-slate-100 text-slate-600',
  content_manager: 'bg-violet-100 text-violet-700',
  marketing_manager: 'bg-amber-100 text-amber-700',
  support: 'bg-cyan-100 text-cyan-700',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [roleModal, setRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    setActionLoading(user.id);
    try {
      await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (e) { setError('Failed to update status.'); }
    finally { setActionLoading(null); }
  };

  const handleChangeRole = async () => {
    if (!selectedRole || !roleModal) return;
    setActionLoading(roleModal.id);
    try {
      await api.put(`/admin/users/${roleModal.id}/role`, { role: selectedRole });
      setUsers(prev => prev.map(u => u.id === roleModal.id ? { ...u, role: selectedRole } : u));
      setRoleModal(null);
    } catch (e) { setError('Failed to change role.'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteConfirm(null);
    } catch (e) { setError('Failed to delete user.'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'indigo', icon: Users },
          { label: 'Active', value: stats.active, color: 'emerald', icon: UserCheck },
          { label: 'Blocked', value: stats.blocked, color: 'rose', icon: UserX },
          { label: 'Admins', value: stats.admins, color: 'violet', icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center text-${color}-600`}>
              <Icon size={18} />
            </div>
            <div>
              <div className={`text-2xl font-black text-${color}-700`}>{value}</div>
              <div className={`text-[10px] font-bold text-${color}-500 uppercase tracking-widest`}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
        <select
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all min-w-[160px]"
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
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
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors group ${user.status === 'blocked' ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500 font-medium">{user.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setRoleModal(user); setSelectedRole(user.role); }}
                        className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600'} hover:opacity-80 transition-opacity`}
                      >
                        {user.role.replace('_', ' ')}
                        <ChevronDown size={10} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={actionLoading === user.id || user.role === 'admin'}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-rose-50 text-rose-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {actionLoading === user.id
                          ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          : user.status === 'active' ? <UserCheck size={11} /> : <UserX size={11} />
                        }
                        {user.status}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Change Role</h3>
                <p className="text-xs text-slate-400">{roleModal.name}</p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border-2 ${selectedRole === role ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectedRole === role ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                  {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRoleModal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleChangeRole} disabled={actionLoading === roleModal.id} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {actionLoading === roleModal.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Apply Role
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
            <h3 className="font-black text-slate-900 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})? This is permanent.
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

export default AdminUsers;
