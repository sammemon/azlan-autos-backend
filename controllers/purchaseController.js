const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generatePurchaseNumber = async () => {
  const lastPurchase = await Purchase.findOne().sort({ createdAt: -1 });
  const lastNumber = lastPurchase ? parseInt(lastPurchase.purchaseNumber.split('-')[1]) : 0;
  return `PUR-${String(lastNumber + 1).padStart(6, '0')}`;
};

exports.createPurchase = async (req, res, next) => {
  try {
    const { supplier, items, tax, shippingCost, paymentMethod, amountPaid, notes } = req.body;

    let subtotal = 0;
    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return errorResponse(res, 404, `Product not found: ${item.product}`);
      }

      const itemSubtotal = item.purchasePrice * item.quantity;
      subtotal += itemSubtotal;

      purchaseItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        subtotal: itemSubtotal,
      });

      // Update product stock and price
      product.quantity += item.quantity;
      product.purchasePrice = item.purchasePrice;
      product.lastRestocked = Date.now();
      await product.save();
    }

    const total = subtotal + (tax || 0) + (shippingCost || 0);
    const pendingAmount = total - (amountPaid || total);
    const paymentStatus = pendingAmount > 0 ? (amountPaid > 0 ? 'partial' : 'pending') : 'paid';

    const purchaseNumber = await generatePurchaseNumber();

    const purchase = await Purchase.create({
      purchaseNumber,
      supplier,
      items: purchaseItems,
      subtotal,
      tax: tax || 0,
      shippingCost: shippingCost || 0,
      total,
      amountPaid: amountPaid || total,
      pendingAmount,
      paymentMethod,
      paymentStatus,
      createdBy: req.user._id,
      notes,
      isSynced: true,
    });

    await Supplier.findByIdAndUpdate(supplier, {
      $inc: { totalPurchases: total, totalPayments: amountPaid || total, pendingBalance: pendingAmount }
    });

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy', 'name');

    successResponse(res, 201, 'Purchase created successfully', populatedPurchase);
  } catch (error) {
    next(error);
  }
};

exports.getAllPurchases = async (req, res, next) => {
  try {
    const { startDate, endDate, supplier, paymentStatus } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.purchaseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (supplier) query.supplier = supplier;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const purchases = await Purchase.find(query)
      .populate('supplier')
      .populate('createdBy', 'name')
      .sort({ purchaseDate: -1 });

    successResponse(res, 200, 'Purchases retrieved successfully', purchases);
  } catch (error) {
    next(error);
  }
};

exports.getPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy', 'name');

    if (!purchase) {
      return errorResponse(res, 404, 'Purchase not found');
    }

    successResponse(res, 200, 'Purchase retrieved successfully', purchase);
  } catch (error) {
    next(error);
  }
};
