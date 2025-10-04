-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS Expenses;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Companies;

-- Create the Companies table
CREATE TABLE Companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the Users table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES Companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Employee')),
    manager_id INTEGER REFERENCES Users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the Expenses table
CREATE TABLE Expenses (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES Users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    expense_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);