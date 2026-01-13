const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getSalesReport,
  getProfitReport,
  getExpenseReport,
  getInventoryReport,
  getCustomerReport,
} = require('../controllers/reportController');

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales', protect, getSalesReport);
router.get('/profit', protect, getProfitReport);
router.get('/expenses', protect, getExpenseReport);
router.get('/inventory', protect, getInventoryReport);
router.get('/customers', protect, getCustomerReport);

module.exports = router;
