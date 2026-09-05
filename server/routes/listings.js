import express from 'express';
import { db } from '../db.js';
import { realtime } from '../realtime.js';

const router = express.Router();

// Get listings with filters
router.get('/', (req, res) => {
  try {
    const { activeOnly, sellerId, category, isDonation, search, sortBy } = req.query;
    const listings = db.getListings({
      activeOnly: activeOnly === 'true',
      sellerId,
      category,
      isDonation,
      search,
      sortBy
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get seller-specific listings
router.get('/seller/:sellerId', (req, res) => {
  try {
    const listings = db.getListings({ sellerId: req.params.sellerId });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single listing by ID
router.get('/:id', (req, res) => {
  try {
    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Food listing not found' });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new food listing
router.post('/', (req, res) => {
  try {
    const { title, originalPrice, rescuePrice, portions } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required for surplus listing' });
    }

    const listing = db.createListing(req.body);
    const impact = db.getCommunityImpact();
    const sellerStats = db.getSellerAnalytics(listing.sellerId);

    // Broadcast in real-time to all connected buyers, sellers, NGOs
    realtime.broadcast('LISTING_CREATED', {
      listing,
      impact,
      sellerStats
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update listing
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateListing(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const impact = db.getCommunityImpact();
    const sellerStats = db.getSellerAnalytics(updated.sellerId);

    // Broadcast update
    realtime.broadcast('LISTING_UPDATED', {
      listing: updated,
      impact,
      sellerStats
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel listing
router.delete('/:id', (req, res) => {
  try {
    const success = db.deleteListing(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const impact = db.getCommunityImpact();
    const sellerStats = db.getSellerAnalytics('usr-seller-demo');

    // Broadcast cancellation
    realtime.broadcast('LISTING_CANCELLED', {
      id: req.params.id,
      impact,
      sellerStats
    });

    res.json({ success: true, message: 'Listing cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
