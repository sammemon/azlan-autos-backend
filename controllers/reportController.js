const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const { successResponse } = require('../utils/responseHandler');

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Helper function to calculate sales and profit for a date range
    const calculateStats = async (startDate, endDate = null) => {
      const match = { saleDate: { $gte: startDate } };
      if (endDate) {
        match.saleDate.$lt = endDate;
      }
      
      const stats = await Sale.aggregate([
        { $match: match },
        { $group: { 
          _id: null, 
          totalSales: { $sum: '$total' },
          profit: { $sum: { 
            $reduce: {
              input: '$items',
              initialValue: 0,
              in: { $add: ['$$value', { $multiply: [
                { $subtract: ['$$this.sellingPrice', '$$this.purchasePrice'] },
                '$$this.quantity'
              ] }] }
            }
          } }
        } }
      ]);
      return stats[0] || { totalSales: 0, profit: 0 };
    };

    // Today's sales and profit
    const todayStats = await calculateStats(today, tomorrow);

    // Yesterday's sales and profit
    const yesterdayStats = await calculateStats(yesterday, today);

    // Last 7 days sales and profit
    const last7DaysStats = await calculateStats(last7Days, tomorrow);

    // This month's sales and profit
    const monthStats = await calculateStats(startOfMonth, endOfMonth);

    // All sales
    const allSalesStats = await calculateStats(new Date('2000-01-01'));

    // Product counts
    const totalProducts = await Product.countDocuments();
    const inStockProducts = await Product.countDocuments({ quantity: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ quantity: { $eq: 0 } });
    const lowStockProducts = await Product.countDocuments({ 
      $and: [
        { quantity: { $gt: 0 } },
        { $expr: { $lte: ['$quantity', '$minStockLevel'] } }
      ]
    });
    const expireStockProducts = 0; // Placeholder for future expiry tracking

    // Stock values
    const stockValues = await Product.aggregate([
      { $group: { 
        _id: null, 
        stockValueNoProfit: { $sum: { $multiply: ['$purchasePrice', '$quantity'] } },
        stockValueWithProfit: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
        stockValueWholesale: { $sum: { $multiply: [
          { $ifNull: ['$wholesalePrice', '$sellingPrice'] }, 
          '$quantity'
        ] } }
      } }
    ]);

    const stockVal = stockValues[0] || { 
      stockValueNoProfit: 0, 
      stockValueWithProfit: 0, 
      stockValueWholesale: 0 
    };

    successResponse(res, 200, 'Dashboard stats retrieved successfully', {
      totalSales: allSalesStats.totalSales,
      todaySales: todayStats.totalSales,
      todayProfit: todayStats.profit,
      yesterdaySales: yesterdayStats.totalSales,
      yesterdayProfit: yesterdayStats.profit,
      last7DaysSales: last7DaysStats.totalSales,
      last7DaysProfit: last7DaysStats.profit,
      thisMonthSales: monthStats.totalSales,
      thisMonthProfit: monthStats.profit,
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
      expireStockProducts,
      stockValueNoProfit: stockVal.stockValueNoProfit,
      stockValueWithProfit: stockVal.stockValueWithProfit,
      stockValueWholesale: stockVal.stockValueWholesale,
      lowStockCount: lowStockProducts, // For backward compatibility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    let matchStage = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.saleDate = { $gte: start, $lte: end };
    }

    let groupStage = {};
    if (groupBy === 'daily') {
      groupStage = {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
        totalSales: { $sum: '$total' },
        totalProfit: { 
          $sum: { 
            $reduce: {
              input: '$items',
              initialValue: 0,
              in: { $add: ['$$value', { $multiply: [
                { $subtract: ['$$this.sellingPrice', '$$this.purchasePrice'] },
                '$$this.quantity'
              ] }] }
            }
          }
        },
        count: { $sum: 1 },
      };
    } else if (groupBy === 'monthly') {
      groupStage = {
        _id: { $dateToString: { format: '%Y-%m', date: '$saleDate' } },
        totalSales: { $sum: '$total' },
        totalProfit: { 
          $sum: { 
            $reduce: {
              input: '$items',
              initialValue: 0,
              in: { $add: ['$$value', { $multiply: [
                { $subtract: ['$$this.sellingPrice', '$$this.purchasePrice'] },
                '$$this.quantity'
              ] }] }
            }
          }
        },
        count: { $sum: 1 },
      };
    } else {
      groupStage = {
        _id: null,
        totalSales: { $sum: '$total' },
        totalDiscount: { $sum: '$discount' },
        totalProfit: { 
          $sum: { 
            $reduce: {
              input: '$items',
              initialValue: 0,
              in: { $add: ['$$value', { $multiply: [
                { $subtract: ['$$this.sellingPrice', '$$this.purchasePrice'] },
                '$$this.quantity'
              ] }] }
            }
          }
        },
        count: { $sum: 1 },
      };
    }

    const salesReport = await Sale.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: -1 } }
    ]);

    // If no data, return the summary with zeros
    const summary = salesReport[0] || {
      _id: null,
      totalSales: 0,
      totalProfit: 0,
      totalDiscount: 0,
      count: 0
    };

    // Get detailed sales list with items
    const detailedSales = await Sale.find(matchStage)
      .select('invoiceNumber saleDate total items customer')
      .populate('customer', 'name')
      .sort({ saleDate: -1 })
      .lean();

    // Format sales for frontend
    const formattedSales = detailedSales.map(sale => ({
      date: sale.saleDate,
      invoiceNumber: sale.invoiceNumber,
      customer: sale.customer?.name || 'Walk-in',
      items: sale.items?.length || 0,
      total: sale.total || 0
    }));

    successResponse(res, 200, 'Sales report retrieved successfully', formattedSales);
  } catch (error) {
    next(error);
  }
};

// @desc    Get profit report
// @route   GET /api/reports/profit
// @access  Private
exports.getProfitReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.saleDate = { $gte: start, $lte: end };
    }

    // Calculate sales profit
    const salesProfit = await Sale.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { 
        _id: null, 
        totalRevenue: { $sum: '$total' },
        profit: { $sum: { $multiply: [
          { $subtract: ['$items.sellingPrice', '$items.purchasePrice'] },
          '$items.quantity'
        ] } }
      } }
    ]);

    // Get expenses
    const expenseMatch = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      expenseMatch.date = { $gte: start, $lte: end };
    }
    const expenses = await Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ]);

    const grossProfit = salesProfit[0]?.profit || 0;
    const totalExpenses = expenses[0]?.totalExpenses || 0;
    const netProfit = grossProfit - totalExpenses;

    successResponse(res, 200, 'Profit report retrieved successfully', {
      totalRevenue: salesProfit[0]?.totalRevenue || 0,
      grossProfit,
      totalExpenses,
      netProfit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense report
// @route   GET /api/reports/expenses
// @access  Private
exports.getExpenseReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.date = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(matchStage)
      .select('date category amount description')
      .sort({ date: -1 })
      .lean();

    // For summary cards
    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Format expenses for frontend
    const expenseList = expenses.map(e => ({
      date: e.date,
      category: e.category,
      description: e.description,
      amount: e.amount,
    }));

    successResponse(res, 200, 'Expense report retrieved successfully', expenseList);
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer sales report
// @route   GET /api/reports/customers
// @access  Private
exports.getCustomerReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.saleDate = { $gte: start, $lte: end };
    }

    const sales = await Sale.find(matchStage)
      .select('saleDate total items customer')
      .populate('customer', 'name')
      .sort({ saleDate: -1 })
      .lean();

    const formatted = sales.map((s) => ({
      date: s.saleDate,
      customerName: s.customer?.name || 'Walk-in',
      items: s.items?.length || 0,
      total: s.total || 0,
    }));

    const totalSales = formatted.reduce((sum, s) => sum + (s.total || 0), 0);
    const count = formatted.length;

    successResponse(res, 200, 'Customer report retrieved successfully', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private
exports.getInventoryReport = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ $expr: { $lte: ['$quantity', '$minStockLevel'] } });
    const outOfStockCount = await Product.countDocuments({ quantity: 0 });

    const totalValue = await Product.aggregate([
      { $group: { 
        _id: null, 
        totalPurchaseValue: { $sum: { $multiply: ['$purchasePrice', '$quantity'] } },
        totalSellingValue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } }
      } }
    ]);

    const categoryWise = await Product.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      { $group: { 
        _id: '$categoryInfo.name',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$purchasePrice', '$quantity'] } }
      } },
      { $sort: { totalValue: -1 } }
    ]);

    successResponse(res, 200, 'Inventory report retrieved successfully', {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalValue: totalValue[0] || { totalPurchaseValue: 0, totalSellingValue: 0 },
      categoryWise,
    });
  } catch (error) {
    next(error);
  }
};
