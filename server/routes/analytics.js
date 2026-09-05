import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Seller analytics
router.get('/seller/:sellerId', (req, res) => {
  try {
    const analytics = db.getSellerAnalytics(req.params.sellerId);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Community impact
router.get('/impact', (req, res) => {
  try {
    const impact = db.getCommunityImpact();
    res.json(impact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin analytics
router.get('/admin', (req, res) => {
  try {
    const adminData = db.getAdminAnalytics();
    res.json(adminData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset demo environment
router.post('/reset', (req, res) => {
  try {
    db.resetDatabase();
    res.json({ success: true, message: 'Database reset to baseline state' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
