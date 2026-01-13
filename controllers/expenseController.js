const Expense = require('../models/Expense');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAllExpenses = async (req, res, next) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) query.category = category;

    const expenses = await Expense.find(query)
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    successResponse(res, 200, 'Expenses retrieved successfully', expenses);
  } catch (error) {
    next(error);
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('createdBy', 'name');
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    successResponse(res, 200, 'Expense retrieved successfully', expense);
  } catch (error) {
    next(error);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user._id,
      isSynced: true,
    });
    successResponse(res, 201, 'Expense created successfully', expense);
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    successResponse(res, 200, 'Expense updated successfully', expense);
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return errorResponse(res, 404, 'Expense not found');
    }
    successResponse(res, 200, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
};
