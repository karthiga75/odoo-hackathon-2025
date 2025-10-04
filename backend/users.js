const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { authMiddleware, adminMiddleware } = require('./middleware');

const router = express.Router();

// --- CREATE USER ENDPOINT (Admin Only) ---
// POST /api/users
// The middleware functions run in order: first, check for a valid token, then check if the user is an admin.
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { name, email, password, role, manager_id } = req.body;

        // Get the company ID from the logged-in admin's token
        const companyId = req.user.companyId;

        // Hash the new user's password for security
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create the new user in the database
        const newUser = await db.query(
            'INSERT INTO Users (company_id, name, email, password_hash, role, manager_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
            [companyId, name, email, passwordHash, role, manager_id]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        // This handles the error if the email is already in use
        if (error.code === '23505') { // PostgreSQL's unique violation error code
            return res.status(400).json({ error: 'Email already in use.' });
        }
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'Server error while creating user.' });
    }
});


// --- GET ALL USERS ENDPOINT (Admin Only) ---
// GET /api/users
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // Fetch all users that belong to the admin's company
        const users = await db.query(
            'SELECT id, name, email, role, manager_id FROM Users WHERE company_id = $1 ORDER BY id',
            [companyId]
        );

        res.status(200).json(users.rows);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Server error while fetching users.' });
    }
});

module.exports = router;