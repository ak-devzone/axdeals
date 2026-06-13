const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin, isStaff, hasRole } = require('../middleware/auth');

// All admin routes require a valid token + staff role minimum
router.use(verifyToken, isStaff);

// ── Analytics / Stats ────────────────────────────────────────────────────────
// Full stats: admin + marketing_manager
router.get('/stats', hasRole('admin', 'marketing_manager'), adminController.getStats);
// Role-specific lightweight stats: all staff
router.get('/my-stats', adminController.getMyStats);

// ── Users Management ─────────────────────────────────────────────────────────
// View users: admin + support
router.get('/users', hasRole('admin', 'support'), adminController.getUsers);
// Modify users: admin only
router.put('/users/:id/status', isAdmin, adminController.toggleUserStatus);
router.put('/users/:id/role',   isAdmin, adminController.changeUserRole);
router.delete('/users/:id',     isAdmin, adminController.deleteUser);

module.exports = router;
