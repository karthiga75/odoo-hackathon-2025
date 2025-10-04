const jwt = require('jsonwebtoken');
require('dotenv').config();

// This function checks if the user has a valid login token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// This function specifically checks if the user's role is 'Admin'
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Requires admin privileges.' });
    }
    next();
};

// --- ADD THIS NEW FUNCTION ---
// This function specifically checks if the user's role is 'Manager'
const managerMiddleware = (req, res, next) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Access denied. Requires manager privileges.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, managerMiddleware };