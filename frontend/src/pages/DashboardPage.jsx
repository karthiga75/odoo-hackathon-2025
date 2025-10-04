import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Employee components
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

// Manager components
import ApprovalDashboard from '../components/ApprovalDashboard';

// Admin components
import CreateUserForm from '../components/CreateUserForm';
import UserList from '../components/UserList';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  // A single state key to trigger refreshes in any child component
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // This function can be called by any child component (e.g., after an approval) to trigger a refresh
  const handleDataChange = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name}! <span className="user-role">({user?.role})</span></h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <main className="dashboard-content">
        {user?.role === 'Employee' && (
          <>
            <ExpenseForm onExpenseAdded={handleDataChange} />
            <ExpenseList refreshKey={refreshKey} />
          </>
        )}

        {user?.role === 'Manager' && (
          // Use the new ApprovalDashboard component for managers
          <ApprovalDashboard refreshKey={refreshKey} onAction={handleDataChange} />
        )}

        {user?.role === 'Admin' && (
          <>
            <CreateUserForm onUserAdded={handleDataChange} />
            <UserList refreshKey={refreshKey} />
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;