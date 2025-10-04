import React, { useState } from 'react';

// This component receives a function `onExpenseAdded` to notify the parent when a new expense is created.
const ExpenseForm = ({ onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR'); // Default currency
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expense_date, setExpenseDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3001/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the login token for authentication
        },
        body: JSON.stringify({ amount, currency, category, description, expense_date }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit expense.');

      // Clear the form fields after successful submission
      setAmount('');
      setCategory('');
      setDescription('');
      setExpenseDate('');

      // Notify the parent component to refresh the expense list
      onExpenseAdded(); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h3>Add New Expense</h3>
      <div className="form-row">
        <input type="date" value={expense_date} onChange={(e) => setExpenseDate(e.target.value)} required />
        <input type="text" placeholder="Category (e.g., Travel)" value={category} onChange={(e) => setCategory(e.target.value)} required />
      </div>
      <div className="form-row">
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
      {error && <p className="error-message">{error}</p>}
      <button type="submit">Submit Expense</button>
    </form>
  );
};

export default ExpenseForm;