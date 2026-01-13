const Customer = require('../models/Customer');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    successResponse(res, 200, 'Customers retrieved successfully', customers);
  } catch (error) {
    next(error);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found');
    }
    successResponse(res, 200, 'Customer retrieved successfully', customer);
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    successResponse(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found');
    }
    successResponse(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found');
    }
    successResponse(res, 200, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};
