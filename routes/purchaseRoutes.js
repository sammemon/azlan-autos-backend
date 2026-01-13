const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPurchase,
  getAllPurchases,
  getPurchase,
} = require('../controllers/purchaseController');

router.post('/', protect, createPurchase);
router.get('/', protect, getAllPurchases);
router.get('/:id', protect, getPurchase);

module.exports = router;
