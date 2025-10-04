import React, { useState, useEffect } from 'react';

const ApprovalDashboard = ({ refreshKey, onAction }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Fetch the list of expenses awaiting approval when the component loads or refreshes
  useEffect(() => {
    const fetchApprovals = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/expenses/approvals', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch approvals.');
        setExpenses(data);
      } catch (err) { // This is the corrected line
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [refreshKey]); // Re-run this effect when the refreshKey changes

  // This function is called when the manager clicks an action button
  const handleDecision = async (expenseId, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/expenses/approvals/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }), // Send the new status
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to ${status.toLowerCase()} expense.`);

      // Notify the parent DashboardPage to trigger a refresh of the list
      onAction();
    } catch (err) {
      // For now, we'll just alert the error. A more robust app might use a toast notification.
      alert(err.message);
    }
  };

  if (loading) return <p>Loading approvals...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="expense-list">
      <h3>Pending Expense Approvals</h3>
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan="5">No expenses awaiting approval.</td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.employee_name}</td>
                <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td>{expense.amount} {expense.currency}</td>
                <td className="actions-cell">
                  <button className="approve-btn" onClick={() => handleDecision(expense.id, 'Approved')}>Approve</button>
                  <button className="reject-btn" onClick={() => handleDecision(expense.id, 'Rejected')}>Reject</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovalDashboard;