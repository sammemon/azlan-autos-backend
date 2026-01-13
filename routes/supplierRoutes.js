const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');

router.get('/', protect, getAllSuppliers);
router.get('/:id', protect, getSupplier);
router.post('/', protect, createSupplier);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteSupplier);

module.exports = router;
