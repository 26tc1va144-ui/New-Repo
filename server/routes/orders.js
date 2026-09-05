import express from 'express';
import { db } from '../db.js';
import { realtime } from '../realtime.js';

const router = express.Router();

// Create new order (atomic stock reservation)
router.post('/', (req, res) => {
  try {
    const { rescueId, portions, buyerId, buyerName, paymentMethod } = req.body;

    if (!rescueId) {
      return res.status(400).json({ error: 'Rescue ID is required.' });
    }

    const { order, updatedListing } = db.createOrder({
      rescueId,
      portions: portions || 1,
      buyerId,
      buyerName,
      paymentMethod
    });

    const impact = db.getCommunityImpact();
    const sellerStats = db.getSellerAnalytics(updatedListing?.sellerId || 'usr-seller-demo');

    // Broadcast in real-time to all clients
    realtime.broadcast('ORDER_CREATED', {
      order,
      updatedListing,
      impact,
      sellerStats
    });

    res.status(201).json({ order, updatedListing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get order by ID
router.get('/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get buyer orders
router.get('/buyer/:buyerId', (req, res) => {
  try {
    const orders = db.getOrdersByBuyer(req.params.buyerId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get seller orders
router.get('/seller/:sellerId', (req, res) => {
  try {
    const orders = db.getOrdersBySeller(req.params.sellerId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP (Seller pickup verification)
router.post('/verify-otp', (req, res) => {
  try {
    const { otp, sellerId } = req.body;

    if (!otp) {
      return res.status(400).json({ error: 'OTP code is required.' });
    }

    const result = db.verifyOrderOtp(otp, sellerId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const impact = db.getCommunityImpact();
    const sellerStats = db.getSellerAnalytics(result.order?.sellerId || 'usr-seller-demo');

    // Broadcast handover completed
    realtime.broadcast('ORDER_COMPLETED', {
      order: result.order,
      impact,
      sellerStats
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
