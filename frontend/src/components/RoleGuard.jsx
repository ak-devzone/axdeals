import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessRoute, STAFF_ROLES } from '../config/roles';
import { ShieldCheck } from 'lucide-react';

/**
 * RoleGuard — wraps a route/component and blocks access if the user's role
 * is not in the `allowedRoles` list.
 *
 * Usage:
 *   <RoleGuard path="/admin/users" allowedRoles={['admin', 'support']}>
 *     <AdminUsers />
 *   </RoleGuard>
 */
const RoleGuard = ({ children, allowedRoles = [], path = '' }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/admin/portal/login" replace />;
  }

  // Not a staff member at all
  if (!STAFF_ROLES.includes(user.role)) {
    return <Navigate to="/admin/portal/login" replace />;
  }

  // Check specific roles
  const allowed = allowedRoles.length > 0 ? allowedRoles : (path ? [] : null);
  if (allowed && !allowed.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={28} className="text-rose-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Your role (<strong>{user.role.replace(/_/g, ' ')}</strong>) doesn't have permission to view this page.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Allowed roles: {allowed.join(', ')}
        </p>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
