import express from 'express';
import { db } from '../db.js';
import { realtime } from '../realtime.js';

const router = express.Router();

/**
 * Submit feedback for a completed order
 * POST /api/feedbacks
 */
router.post('/', (req, res) => {
  try {
    const {
      orderId,
      ratings,
      comment,
      userId,
      userName,
      userAvatar
    } = req.body;

    // Basic request validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required to submit feedback.'
      });
    }

    if (!ratings || typeof ratings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Please provide ratings for Food Quality, Pickup Experience, and Value for Money.'
      });
    }

    const { foodQuality, pickupExperience, valueForMoney } = ratings;
    if (
      !foodQuality || foodQuality < 1 || foodQuality > 5 ||
      !pickupExperience || pickupExperience < 1 || pickupExperience > 5 ||
      !valueForMoney || valueForMoney < 1 || valueForMoney > 5
    ) {
      return res.status(400).json({
        success: false,
        error: 'All ratings (Food Quality, Pickup Experience, Value for Money) must be between 1 and 5 stars.'
      });
    }

    const result = db.createFeedback({
      orderId,
      ratings,
      comment: typeof comment === 'string' ? comment.trim() : '',
      userId,
      userName,
      userAvatar
    });

    // Broadcast live event to update open buyer/seller dashboards
    realtime.broadcast('FEEDBACK_SUBMITTED', {
      feedback: result.feedback,
      providerStats: result.providerStats
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('[Feedback Submission Error]:', err.message);
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to submit feedback.'
    });
  }
});

/**
 * Get feedback for a specific order
 * GET /api/feedbacks/order/:orderId
 */
router.get('/order/:orderId', (req, res) => {
  try {
    const feedback = db.getFeedbackByOrderId(req.params.orderId);
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all feedbacks and rating breakdown for a food provider (seller)
 * GET /api/feedbacks/seller/:sellerId
 */
router.get('/seller/:sellerId', (req, res) => {
  try {
    const stats = db.getFeedbacksBySeller(req.params.sellerId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all feedbacks and rating breakdown for a specific food listing
 * GET /api/feedbacks/listing/:rescueId
 */
router.get('/listing/:rescueId', (req, res) => {
  try {
    const stats = db.getFeedbacksByListing(req.params.rescueId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all latest feedbacks across the platform
 * GET /api/feedbacks
 */
router.get('/', (req, res) => {
  try {
    const feedbacks = db.getFeedbacks();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
