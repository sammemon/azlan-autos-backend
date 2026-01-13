const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

router.get('/', protect, getAllCustomers);
router.get('/:id', protect, getCustomer);
router.post('/', protect, createCustomer);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteCustomer);

module.exports = router;
