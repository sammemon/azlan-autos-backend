const Supplier = require('../models/Supplier');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    successResponse(res, 200, 'Suppliers retrieved successfully', suppliers);
  } catch (error) {
    next(error);
  }
};

exports.getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    successResponse(res, 200, 'Supplier retrieved successfully', supplier);
  } catch (error) {
    next(error);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    successResponse(res, 201, 'Supplier created successfully', supplier);
  } catch (error) {
    next(error);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    successResponse(res, 200, 'Supplier updated successfully', supplier);
  } catch (error) {
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    successResponse(res, 200, 'Supplier deleted successfully');
  } catch (error) {
    next(error);
  }
};
