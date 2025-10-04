import React, { useState, useEffect } from 'react';

const CreateUserForm = ({ onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [managerId, setManagerId] = useState('');
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Fetch the list of managers to populate the dropdown
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const users = await response.json();
        // Filter for users who are already managers
        setManagers(users.filter(user => user.role === 'Manager'));
      } catch (err) {
        console.error("Failed to fetch users for manager list");
      }
    };
    fetchManagers();
  }, []); // Runs once on component mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userData = {
      name,
      email,
      password,
      role,
      manager_id: role === 'Employee' ? managerId : null,
    };

    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create user.');

      // Clear form and notify parent
      setName('');
      setEmail('');
      setPassword('');
      setRole('Employee');
      setManagerId('');
      onUserAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h3>Create New User</h3>
      <div className="form-row">
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-row">
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
        </select>
      </div>
      {role === 'Employee' && (
        <div className="form-group">
          <label>Assign Manager</label>
          <select value={managerId} onChange={(e) => setManagerId(e.target.value)} required>
            <option value="">Select a Manager</option>
            {managers.map(manager => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      <button type="submit">Create User</button>
    </form>
  );
};

export default CreateUserForm;