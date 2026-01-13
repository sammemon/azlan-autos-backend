
# Invoice & POS System - Backend API

Professional-grade Node.js + Express + MongoDB backend for Invoice and POS billing software.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: Full CRUD operations with barcode support, stock tracking, and low-stock alerts
- **Sales & Billing**: Complete POS system with invoice generation, partial payments
- **Customer & Supplier Management**: Track relationships, balances, and payment histories
- **Purchase Orders**: Manage inventory purchases with automatic stock updates
- **Expense Tracking**: Categorize and track business expenses
- **Reports & Analytics**: Dashboard stats, sales reports, profit analysis, inventory reports
- **Auto-Update System**: API endpoints for app version management
- **Offline Sync**: Support for offline operations with sync flags

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_secure_random_secret_key
     PORT=5000
     ```

3. **Seed the database** (optional - creates admin user and default categories):
   ```bash
   npm run seed
   ```

## 🚀 Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password
- `GET /api/auth/users` - Get all users (Admin only)

### Products
- `GET /api/products` - Get all products (with filters: search, category, lowStock)
- `GET /api/products/:id` - Get single product
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `PUT /api/products/:id/stock` - Update stock
- `DELETE /api/products/:id` - Delete product

### Sales
- `POST /api/sales` - Create new sale
- `GET /api/sales` - Get all sales (with filters)
- `GET /api/sales/:id` - Get single sale
- `GET /api/sales/invoice/:invoiceNumber` - Get sale by invoice
- `POST /api/sales/:id/payment` - Add payment

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Purchases
- `POST /api/purchases` - Create purchase order
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/:id` - Get single purchase

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/profit` - Get profit report
- `GET /api/reports/expenses` - Get expense report
- `GET /api/reports/inventory` - Get inventory report

### App Version
- `GET /api/app-version/:platform` - Get latest version
- `POST /api/app-version/check` - Check for updates
- `POST /api/app-version` - Create new version (Admin only)

## 🔒 Default Credentials

After running seed script:

**Admin Account:**
- Email: admin@invoicepos.com
- Password: admin123

**Cashier Account:**
- Email: cashier@invoicepos.com
- Password: cashier123

⚠️ **Change these in production!**

## 📦 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/              # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── saleController.js
│   ├── customerController.js
│   ├── supplierController.js
│   ├── purchaseController.js
│   ├── expenseController.js
│   ├── categoryController.js
│   ├── reportController.js
│   └── appVersionController.js
├── middleware/               # Custom middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validateMiddleware.js
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Sale.js
│   ├── Customer.js
│   ├── Supplier.js
│   ├── Purchase.js
│   ├── Expense.js
│   ├── Payment.js
│   ├── Category.js
│   └── AppVersion.js
├── routes/                   # API routes
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── saleRoutes.js
│   ├── customerRoutes.js
│   ├── supplierRoutes.js
│   ├── purchaseRoutes.js
│   ├── expenseRoutes.js
│   ├── categoryRoutes.js
│   ├── reportRoutes.js
│   └── appVersionRoutes.js
├── utils/                    # Utility functions
│   ├── generateToken.js
│   ├── responseHandler.js
│   └── seedData.js
├── .env                      # Environment variables
├── .env.example             # Environment template
├── server.js                # Main application file
└── package.json             # Dependencies
```

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet.js for security headers
- CORS enabled
- Input validation
- Role-based authorization

## 📊 MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create database user with password
4. Whitelist your IP or allow access from anywhere (0.0.0.0/0)
5. Get connection string and update `.env` file

## 🛡️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development/production |
| `MONGODB_URI` | MongoDB connection string | mongodb+srv://... |
| `JWT_SECRET` | Secret key for JWT | random_secure_string |
| `JWT_EXPIRE` | Token expiration | 7d |
| `APP_VERSION` | Current app version | 1.0.0 |

## 🐛 Troubleshooting

### Cannot connect to MongoDB
- Check your internet connection
- Verify MongoDB Atlas IP whitelist
- Confirm connection string in `.env`

### Authentication errors
- Ensure JWT_SECRET is set in `.env`
- Check token format in requests

### Port already in use
- Change PORT in `.env` file
- Or stop the process using that port

## 📝 License

ISC

## 👥 Support

For issues and questions, please create an issue in the repository.
