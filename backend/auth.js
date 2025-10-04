const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Import our database connection
require('dotenv').config();

const router = express.Router();

// --- SIGNUP ENDPOINT ---
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, companyName, country } = req.body;

    // Step 1: Check if a company already exists. Per the rules, only the first user can create one.
    const companyCheck = await db.query('SELECT * FROM Companies');
    if (companyCheck.rows.length > 0) {
      return res.status(400).json({ error: 'A company has already been registered on this instance.' });
    }

    // Step 2: Get the currency from the RestCountries API, as required by the problem statement.
    const apiResponse = await fetch(`https://restcountries.com/v3.1/name/${country}?fields=currencies`);
    const countryData = await apiResponse.json();
    const currencyCode = Object.keys(countryData[0].currencies)[0];

    // Step 3: Create the new company in the database.
    const newCompany = await db.query(
      'INSERT INTO Companies (name, default_currency) VALUES ($1, $2) RETURNING id',
      [companyName, currencyCode]
    );

    // Step 4: Hash the admin's password for secure storage.
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Step 5: Create the new Admin user, linking them to the new company.
    const newUser = await db.query(
      'INSERT INTO Users (company_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [newCompany.rows[0].id, email, passwordHash, name, 'Admin']
    );

    res.status(201).json({ message: 'Company and Admin user created successfully!', user: newUser.rows[0] });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// --- LOGIN ENDPOINT ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step 1: Find the user by their email address.
        const userResult = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' }); // Use a generic error
        }
        const user = userResult.rows[0];

        // Step 2: Securely compare the submitted password with the stored hash.
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Step 3: If credentials are valid, create a JSON Web Token (JWT).
        const token = jwt.sign(
            { userId: user.id, role: user.role, companyId: user.company_id },
            process.env.JWT_SECRET, // Use a strong secret from your .env file
            { expiresIn: '1h' } // The token will be valid for 1 hour
        );

        // Step 4: Send the token and user info back to the client.
        res.status(200).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;