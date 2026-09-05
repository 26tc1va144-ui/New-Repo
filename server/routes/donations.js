import express from 'express';
import { db } from '../db.js';
import { realtime } from '../realtime.js';

const router = express.Router();

// Get all eligible donation & emergency surplus batches
router.get('/available', (req, res) => {
  try {
    const donations = db.getAvailableDonations();
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NGO claims surplus donation batch
router.post('/claim', (req, res) => {
  try {
    const { rescueId, ngoId, ngoName, vehicleId } = req.body;

    if (!rescueId) {
      return res.status(400).json({ error: 'Rescue ID is required.' });
    }

    const { claim, updatedListing } = db.claimDonation({
      rescueId,
      ngoId,
      ngoName,
      vehicleId
    });

    const impact = db.getCommunityImpact();
    const sellerStats = db.getSellerAnalytics(updatedListing?.sellerId || 'usr-seller-demo');

    // Broadcast claim in real-time
    realtime.broadcast('DONATION_CLAIMED', {
      claim,
      updatedListing,
      impact,
      sellerStats
    });

    res.status(201).json({ claim, updatedListing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get claims for specific NGO
router.get('/claims/:ngoId', (req, res) => {
  try {
    const claims = db.getClaimsByNgo(req.params.ngoId);
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all claims
router.get('/claims', (req, res) => {
  try {
    const claims = db.getAllClaims();
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
