const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrand);
router.post('/', verifyToken, isAdmin, brandController.createBrand);
router.put('/:id', verifyToken, isAdmin, brandController.updateBrand);
router.delete('/:id', verifyToken, isAdmin, brandController.deleteBrand);

module.exports = router;
