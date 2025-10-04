import React, { useState, useEffect } from 'react';

// This component receives a `refreshKey` prop. Whenever this key changes, it re-fetches the data.
const ExpenseList = ({ refreshKey }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/api/expenses/my-expenses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch expenses.');
        setExpenses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [refreshKey]); // This `useEffect` hook re-runs whenever the refreshKey changes

  if (loading) return <p>Loading expenses...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="expense-list">
      <h3>My Expense History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan="4">No expenses found.</td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td>{expense.amount} {expense.currency}</td>
                <td><span className={`status ${expense.status?.toLowerCase()}`}>{expense.status}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;