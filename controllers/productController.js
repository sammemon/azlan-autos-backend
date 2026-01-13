const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getAllProducts = async (req, res, next) => {
  try {
    const { search, category, lowStock, isActive } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (lowStock === 'true') {
      const products = await Product.find(query).populate('category supplier');
      const lowStockProducts = products.filter(p => p.quantity <= p.minStockLevel);
      return successResponse(res, 200, 'Low stock products retrieved', lowStockProducts);
    }

    const products = await Product.find(query).populate('category supplier').sort({ createdAt: -1 });
    successResponse(res, 200, 'Products retrieved successfully', products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category supplier');
    
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private
exports.updateStock = async (req, res, next) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    if (operation === 'add') {
      product.quantity += quantity;
      product.lastRestocked = Date.now();
    } else if (operation === 'subtract') {
      if (product.quantity < quantity) {
        return errorResponse(res, 400, 'Insufficient stock');
      }
      product.quantity -= quantity;
    }

    await product.save();
    successResponse(res, 200, 'Stock updated successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode }).populate('category');
    
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};
