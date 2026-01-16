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

// Ensure a single Walk-In customer exists and return it
const getOrCreateWalkInCustomer = async () => {
  const phone = '03213498203';
  const name = 'Walk-In';

  const existing = await Customer.findOne({
    $or: [
      { phone },
      { name: { $regex: /^walk-in$/i } },
    ],
  });
  if (existing) return existing;

  return Customer.create({
    name,
    phone,
  });
};

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  try {
    const { customer, items, discount, tax, paymentMethod, amountPaid, notes } = req.body;

    // Always attach Walk-In customer if none provided
    const walkInCustomer = await getOrCreateWalkInCustomer();
    const customerId = customer || walkInCustomer._id;

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
      customer: customerId,
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
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalPurchases: total, totalPayments: amountPaid || total, pendingBalance: pendingAmount },
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

    // Backfill old sales that missed a customer by linking them to Walk-In
    const orphanedSales = sales.filter((s) => !s.customer);
    if (orphanedSales.length) {
      console.log(`BACKFILL: Found ${orphanedSales.length} orphaned sales without customer`);
      const walkInCustomer = await getOrCreateWalkInCustomer();
      console.log(`BACKFILL: Walk-In customer ID: ${walkInCustomer._id}`);

      // Update all orphaned sales to link to Walk-In
      const updateResult = await Sale.updateMany(
        { _id: { $in: orphanedSales.map((s) => s._id) } },
        { customer: walkInCustomer._id },
      );
      console.log(`BACKFILL: Updated ${updateResult.modifiedCount} sales with Walk-In customer`);

      // Update Walk-In customer totals with orphaned sales amounts
      const orphanedTotals = orphanedSales.reduce(
        (acc, s) => ({
          totalPurchases: acc.totalPurchases + (s.total || 0),
          totalPayments: acc.totalPayments + (s.amountPaid || 0),
          pendingBalance: acc.pendingBalance + (s.pendingAmount || 0),
        }),
        { totalPurchases: 0, totalPayments: 0, pendingBalance: 0 }
      );

      await Customer.findByIdAndUpdate(walkInCustomer._id, {
        $inc: orphanedTotals,
      });
      console.log(`BACKFILL: Updated Walk-In totals: ${JSON.stringify(orphanedTotals)}`);

      // Re-fetch to return populated customers after backfill
      const refreshedSales = await Sale.find(query)
        .populate('customer')
        .populate('cashier', 'name')
        .sort({ saleDate: -1 });
      return successResponse(res, 200, 'Sales retrieved successfully', refreshedSales);
    }

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
