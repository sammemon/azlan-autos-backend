require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Category.deleteMany();

    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@invoicepos.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Creating default cashier...');
    await User.create({
      name: 'Cashier',
      email: 'cashier@invoicepos.com',
      password: 'cashier123',
      role: 'cashier',
    });

    console.log('Creating default categories...');
    const categories = await Category.insertMany([
      { name: 'Engine Parts', description: 'Engine components and accessories' },
      { name: 'Brake System', description: 'Brakes, pads, rotors' },
      { name: 'Electrical', description: 'Batteries, alternators, starters' },
      { name: 'Filters', description: 'Oil, air, fuel filters' },
      { name: 'Tires & Wheels', description: 'Tires, rims, wheel accessories' },
      { name: 'Oils & Fluids', description: 'Engine oil, transmission fluid, coolant' },
      { name: 'Body Parts', description: 'Exterior body components' },
      { name: 'Suspension', description: 'Shocks, struts, springs' },
    ]);

    console.log('\n✓ Database seeded successfully!');
    console.log('\n===========================================');
    console.log('Default Admin Credentials:');
    console.log('Email: admin@invoicepos.com');
    console.log('Password: admin123');
    console.log('===========================================');
    console.log('\nDefault Cashier Credentials:');
    console.log('Email: cashier@invoicepos.com');
    console.log('Password: cashier123');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
