const express = require('express');
const router = express.Router();
const clickController = require('../controllers/clickController');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');

router.post('/track', optionalAuth, clickController.trackClick);
router.get('/product/:productId', verifyToken, isAdmin, clickController.getProductClicks);

module.exports = router;
