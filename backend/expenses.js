const express = require('express');
const db = require('./db');
const { authMiddleware, managerMiddleware } = require('./middleware');

const router = express.Router();

// --- SUBMIT AN EXPENSE (Employee Only) ---
// POST /api/expenses
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { amount, currency, category, description, expense_date } = req.body;
        const employeeId = req.user.userId;

        // Find the employee's manager to assign as the approver
        const managerResult = await db.query('SELECT manager_id FROM Users WHERE id = $1', [employeeId]);
        if (!managerResult.rows[0]?.manager_id) {
            return res.status(400).json({ error: 'You do not have a manager assigned. Please contact your administrator.' });
        }
        const approverId = managerResult.rows[0].manager_id;

        // Insert the new expense into the database
        const newExpense = await db.query(
            'INSERT INTO Expenses (employee_id, approver_id, amount, currency, category, description, expense_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [employeeId, approverId, amount, currency, category, description, expense_date]
        );

        res.status(201).json(newExpense.rows[0]);
    } catch (error) {
        console.error('Submit Expense Error:', error);
        res.status(500).json({ error: 'Server error while submitting expense.' });
    }
});

// --- GET MY EXPENSES (Employee Only) ---
// GET /api/expenses/my-expenses
router.get('/my-expenses', authMiddleware, async (req, res) => {
    try {
        const employeeId = req.user.userId;
        const expenses = await db.query('SELECT * FROM Expenses WHERE employee_id = $1 ORDER BY expense_date DESC', [employeeId]);
        res.status(200).json(expenses.rows);
    } catch (error) {
        console.error('Get My Expenses Error:', error);
        res.status(500).json({ error: 'Server error while fetching expenses.' });
    }
});

// --- GET PENDING APPROVALS (Manager Only) ---
// GET /api/expenses/approvals
router.get('/approvals', [authMiddleware, managerMiddleware], async (req, res) => {
    try {
        const managerId = req.user.userId;

        // Fetch all expenses that are 'Pending' and assigned to this manager
        const expensesToApprove = await db.query(
            `SELECT e.id, e.amount, e.currency, e.category, e.description, e.expense_date, u.name as employee_name
             FROM Expenses e
             JOIN Users u ON e.employee_id = u.id
             WHERE e.approver_id = $1 AND e.status = 'Pending'`,
            [managerId]
        );

        res.status(200).json(expensesToApprove.rows);
    } catch (error) {
        console.error('Get Approvals Error:', error);
        res.status(500).json({ error: 'Server error while fetching approvals.' });
    }
});

// --- APPROVE/REJECT EXPENSE (Manager Only) ---
// PUT /api/expenses/approvals/:id
router.put('/approvals/:id', [authMiddleware, managerMiddleware], async (req, res) => {
    try {
        const { id } = req.params; // The ID of the expense to update
        const { status } = req.body; // The new status ('Approved' or 'Rejected')
        const managerId = req.user.userId;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided.' });
        }

        // Update the expense status in the database
        // We also verify that the expense belongs to this manager to prevent unauthorized approvals
        const updatedExpense = await db.query(
            "UPDATE Expenses SET status = $1 WHERE id = $2 AND approver_id = $3 RETURNING *",
            [status, id, managerId]
        );

        if (updatedExpense.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or you are not authorized to approve it.' });
        }

        res.status(200).json(updatedExpense.rows[0]);
    } catch (error) {
        console.error('Update Expense Status Error:', error);
        res.status(500).json({ error: 'Server error while updating expense status.' });
    }
});
module.exports = router;