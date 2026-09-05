import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Register new account
router.post('/register', (req, res) => {
  try {
    const { name, email, phone, role, sellerType, address } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = db.createUser({
      name,
      email,
      phone,
      role: role || 'buyer',
      sellerType,
      address
    });

    res.status(201).json({ user: newUser, token: `tok_${newUser.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    let user = db.getUserByEmail(email);

    // If user does not exist yet (demo/sandbox test), create account automatically
    if (!user) {
      user = db.createUser({
        name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email,
        role: role || 'buyer'
      });
    }

    res.json({ user, token: `tok_${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user by ID or token
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = authHeader.replace('Bearer tok_', '').replace('Bearer ', '');
  const user = db.getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

export default router;
