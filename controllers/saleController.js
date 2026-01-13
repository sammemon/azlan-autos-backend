const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Generate invoice number
const generateInvoiceNumber = async () => {
  const lastSale = await Sale.findOne().sort({ createdAt: -1 });
  const lastNumber = lastSale ? parseInt(lastSale.invoiceNumber.split('-')[1]) : 0;
  return `INV-${String(lastNumber + 1).padStart(6, '0')}`;
};

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  try {
    const { customer, items, discount, tax, paymentMethod, amountPaid, notes } = req.body;

    // Calculate totals
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return errorResponse(res, 404, `Product not found: ${item.product}`);
      }

      if (product.quantity < item.quantity) {
        return errorResponse(res, 400, `Insufficient stock for ${product.name}`);
      }

      const itemSubtotal = (item.sellingPrice || product.sellingPrice) * item.quantity - (item.discount || 0);
      subtotal += itemSubtotal;

      saleItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: item.sellingPrice || product.sellingPrice,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
      });

      // Update product stock
      product.quantity -= item.quantity;
      await product.save();
    }

    const total = subtotal - (discount || 0) + (tax || 0);
    const pendingAmount = total - (amountPaid || total);
    const paymentStatus = pendingAmount > 0 ? (amountPaid > 0 ? 'partial' : 'pending') : 'paid';

    const invoiceNumber = await generateInvoiceNumber();

    const sale = await Sale.create({
      invoiceNumber,
      customer,
      items: saleItems,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      total,
      amountPaid: amountPaid || total,
      pendingAmount,
      paymentMethod,
      paymentStatus,
      cashier: req.user._id,
      notes,
      isSynced: true,
    });

    // Update customer if provided
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalPurchases: total, totalPayments: amountPaid || total, pendingBalance: pendingAmount }
      });
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('customer')
      .populate('items.product')
      .populate('cashier', 'name email');

    successResponse(res, 201, 'Sale created successfully', populatedSale);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getAllSales = async (req, res, next) => {
  try {
    const { startDate, endDate, customer, paymentStatus } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (customer) query.customer = customer;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const sales = await Sale.find(query)
      .populate('customer')
      .populate('cashier', 'name')
      .sort({ saleDate: -1 });

    successResponse(res, 200, 'Sales retrieved successfully', sales);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('items.product')
      .populate('cashier', 'name email');

    if (!sale) {
      return errorResponse(res, 404, 'Sale not found');
    }

    successResponse(res, 200, 'Sale retrieved successfully', sale);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sale by invoice number
// @route   GET /api/sales/invoice/:invoiceNumber
// @access  Private
exports.getSaleByInvoice = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({ invoiceNumber: req.params.invoiceNumber })
      .populate('customer')
      .populate('items.product')
      .populate('cashier', 'name email');

    if (!sale) {
      return errorResponse(res, 404, 'Sale not found');
    }

    successResponse(res, 200, 'Sale retrieved successfully', sale);
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment to sale
// @route   POST /api/sales/:id/payment
// @access  Private
exports.addPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return errorResponse(res, 404, 'Sale not found');
    }

    if (amount > sale.pendingAmount) {
      return errorResponse(res, 400, 'Payment amount exceeds pending balance');
    }

    sale.amountPaid += amount;
    sale.pendingAmount -= amount;
    sale.paymentStatus = sale.pendingAmount === 0 ? 'paid' : 'partial';
    sale.paymentMethod = paymentMethod;

    await sale.save();

    // Update customer
    if (sale.customer) {
      await Customer.findByIdAndUpdate(sale.customer, {
        $inc: { totalPayments: amount, pendingBalance: -amount }
      });
    }

    successResponse(res, 200, 'Payment added successfully', sale);
  } catch (error) {
    next(error);
  }
};
