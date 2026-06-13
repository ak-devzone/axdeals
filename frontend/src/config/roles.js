/**
 * Central Role Configuration for AK Deals Hub
 * All role permissions, sidebar menus, and dashboard access are defined here.
 */

import {
  LayoutDashboard, Package, Layers, Tag, Users,
  MessageSquare, BarChart2, MousePointer2, TrendingUp,
  Star, ShieldCheck
} from 'lucide-react';

// ─── Role Definitions ─────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:             'admin',
  CONTENT_MANAGER:   'content_manager',
  MARKETING_MANAGER: 'marketing_manager',
  SUPPORT:           'support',
  USER:              'user',
};

// ─── Role Display Info ────────────────────────────────────────────────────────
export const ROLE_META = {
  admin: {
    label:       'Super Admin',
    color:       'indigo',
    badgeBg:     'bg-indigo-600',
    badgeText:   'text-white',
    icon:        ShieldCheck,
    description: 'Full system access',
  },
  content_manager: {
    label:       'Content Manager',
    color:       'violet',
    badgeBg:     'bg-violet-100',
    badgeText:   'text-violet-700',
    icon:        Package,
    description: 'Manage products, categories & brands',
  },
  marketing_manager: {
    label:       'Marketing Manager',
    color:       'amber',
    badgeBg:     'bg-amber-100',
    badgeText:   'text-amber-700',
    icon:        TrendingUp,
    description: 'View analytics & manage promotions',
  },
  support: {
    label:       'Support Staff',
    color:       'cyan',
    badgeBg:     'bg-cyan-100',
    badgeText:   'text-cyan-700',
    icon:        MessageSquare,
    description: 'Handle reviews & customer queries',
  },
  user: {
    label:       'User',
    color:       'slate',
    badgeBg:     'bg-slate-100',
    badgeText:   'text-slate-600',
    icon:        Users,
    description: 'Standard customer account',
  },
};

// ─── Sidebar Menu Items per Role ──────────────────────────────────────────────
export const ROLE_MENU = {
  admin: [
    { name: 'Dashboard',  path: '/admin',            icon: LayoutDashboard },
    { name: 'Products',   path: '/admin/products',   icon: Package          },
    { name: 'Categories', path: '/admin/categories', icon: Layers           },
    { name: 'Brands',     path: '/admin/brands',     icon: Tag              },
    { name: 'Users',      path: '/admin/users',      icon: Users            },
    { name: 'Reviews',    path: '/admin/reviews',    icon: MessageSquare    },
    { name: 'Analytics',  path: '/admin/analytics',  icon: BarChart2        },
  ],
  content_manager: [
    { name: 'Dashboard',  path: '/admin',            icon: LayoutDashboard },
    { name: 'Products',   path: '/admin/products',   icon: Package          },
    { name: 'Categories', path: '/admin/categories', icon: Layers           },
    { name: 'Brands',     path: '/admin/brands',     icon: Tag              },
  ],
  marketing_manager: [
    { name: 'Dashboard',  path: '/admin',            icon: LayoutDashboard },
    { name: 'Analytics',  path: '/admin/analytics',  icon: BarChart2        },
    { name: 'Products',   path: '/admin/products',   icon: Package          },
  ],
  support: [
    { name: 'Dashboard',  path: '/admin',            icon: LayoutDashboard },
    { name: 'Reviews',    path: '/admin/reviews',    icon: MessageSquare    },
    { name: 'Products',   path: '/admin/products',   icon: Package          },
    { name: 'Users',      path: '/admin/users',      icon: Users            },
  ],
};

// ─── Route-level Permissions ──────────────────────────────────────────────────
// Which roles can access which admin routes?
export const ROUTE_PERMISSIONS = {
  '/admin':            ['admin', 'content_manager', 'marketing_manager', 'support'],
  '/admin/products':   ['admin', 'content_manager', 'marketing_manager', 'support'],
  '/admin/categories': ['admin', 'content_manager'],
  '/admin/brands':     ['admin', 'content_manager'],
  '/admin/users':      ['admin', 'support'],
  '/admin/reviews':    ['admin', 'support'],
  '/admin/analytics':  ['admin', 'marketing_manager'],
};

// ─── Feature Permissions (granular) ──────────────────────────────────────────
export const PERMISSIONS = {
  // Product CRUD
  'products.create':   ['admin', 'content_manager', 'marketing_manager'],
  'products.edit':     ['admin', 'content_manager', 'marketing_manager'],
  'products.delete':   ['admin', 'content_manager'],

  // Categories
  'categories.create': ['admin', 'content_manager'],
  'categories.edit':   ['admin', 'content_manager'],
  'categories.delete': ['admin'],

  // Brands
  'brands.create':     ['admin', 'content_manager'],
  'brands.edit':       ['admin', 'content_manager'],
  'brands.delete':     ['admin'],

  // Users
  'users.view':        ['admin', 'support'],
  'users.edit':        ['admin'],
  'users.delete':      ['admin'],

  // Reviews
  'reviews.view':      ['admin', 'support'],
  'reviews.approve':   ['admin', 'support'],
  'reviews.delete':    ['admin'],

  // Analytics
  'analytics.view':    ['admin', 'marketing_manager'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check if a role has a specific permission */
export const can = (role, permission) => {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
};

/** Get menu items for a given role */
export const getMenu = (role) => ROLE_MENU[role] || ROLE_MENU.support;

/** Check if role can access a route */
export const canAccessRoute = (role, path) => {
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed) return false;
  return allowed.includes(role);
};

/** All staff roles (can access admin panel) */
export const STAFF_ROLES = ['admin', 'content_manager', 'marketing_manager', 'support'];
export const isStaff = (role) => STAFF_ROLES.includes(role);
