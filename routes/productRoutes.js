const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getProductByBarcode,
} = require('../controllers/productController');

router.get('/', protect, getAllProducts);
router.get('/:id', protect, getProduct);
router.get('/barcode/:barcode', protect, getProductByBarcode);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.put('/:id/stock', protect, updateStock);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteProduct);

module.exports = router;
