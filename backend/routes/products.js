const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin, hasRole } = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Protected: admin + content_manager can create/edit/delete products
router.post('/',     verifyToken, hasRole('admin', 'content_manager', 'marketing_manager'), productController.createProduct);
router.put('/:id',   verifyToken, hasRole('admin', 'content_manager', 'marketing_manager'), productController.updateProduct);
router.delete('/:id',verifyToken, hasRole('admin', 'content_manager'), productController.deleteProduct);

module.exports = router;
