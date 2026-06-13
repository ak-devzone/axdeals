const jwt = require('jsonwebtoken');

// All staff roles that can access the admin panel
const STAFF_ROLES = ['admin', 'content_manager', 'marketing_manager', 'support'];

// Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Check if user is admin (full access)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Check if user is any staff member (any admin panel role)
const isStaff = (req, res, next) => {
  if (!STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Staff only.' });
  }
  next();
};

// Role-based access — pass allowed roles array
// Usage: hasRole(['admin', 'content_manager'])
const hasRole = (...allowedRoles) => (req, res, next) => {
  const flat = allowedRoles.flat();
  if (!flat.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Requires one of: ${flat.join(', ')}.`
    });
  }
  next();
};

// Optional auth — attach user if token exists, but don't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid — continue without user
    }
  }
  next();
};

module.exports = { verifyToken, isAdmin, isStaff, hasRole, optionalAuth, STAFF_ROLES };
