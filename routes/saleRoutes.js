const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createSale,
  getAllSales,
  getSale,
  getSaleByInvoice,
  addPayment,
} = require('../controllers/saleController');

router.post('/', protect, createSale);
router.get('/', protect, getAllSales);
router.get('/:id', protect, getSale);
router.get('/invoice/:invoiceNumber', protect, getSaleByInvoice);
router.post('/:id/payment', protect, addPayment);

module.exports = router;
