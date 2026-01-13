const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    successResponse(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    successResponse(res, 200, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    successResponse(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    successResponse(res, 200, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    successResponse(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
