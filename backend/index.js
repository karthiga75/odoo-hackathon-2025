const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const expenseRoutes = require('./expenses'); // <-- Import the new expense routes

// Middleware
app.use(cors());
app.use(express.json());

// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes); // <-- Tell the app to use the expense routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});