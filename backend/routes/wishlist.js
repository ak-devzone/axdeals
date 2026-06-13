const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(verifyToken);

router.get('/',              wishlistController.getWishlist);
router.get('/ids',           wishlistController.getWishlistIds);
router.post('/:productId',   wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
