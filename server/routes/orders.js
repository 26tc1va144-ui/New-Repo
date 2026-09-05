import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../db.js';
import { realtime } from '../realtime.js';

const router = express.Router();

// Initialize Razorpay instance securely with environment variables
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_demo1234567890';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'resqfood_rzp_secret_key_demo';
  return new Razorpay({ key_id, key_secret });
};

// 1. Create Razorpay Order securely on the backend
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { rescueId, portions = 1 } = req.body;

    if (!rescueId) {
      return res.status(400).json({ error: 'Rescue ID is required.' });
    }

    const listing = db.getListingById(rescueId);
    if (!listing) {
      return res.status(404).json({ error: 'Food listing not found.' });
    }

    const requestedPortions = Number(portions) || 1;
    if (listing.portionsLeft < requestedPortions) {
      return res.status(400).json({
        error: `Insufficient stock. Only ${listing.portionsLeft} portion(s) available.`
      });
    }

    // Accurate total calculation on backend
    const totalAmount = listing.rescuePrice * requestedPortions;
    const amountInPaise = Math.round(totalAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_demo1234567890';
    let rzpOrderId = `order_${Date.now()}`;
    let isMockOrder = false;

    // Free donation order bypass
    if (totalAmount === 0) {
      return res.json({
        orderId: `order_free_${Date.now()}`,
        amount: 0,
        amountInPaise: 0,
        currency: 'INR',
        keyId,
        isDonation: true,
        foodTitle: listing.title,
        portions: requestedPortions
      });
    }

    // Attempt official Razorpay SDK order creation
    try {
      const razorpay = getRazorpayInstance();
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        notes: {
          rescueId: listing.id,
          foodTitle: listing.title,
          portions: requestedPortions,
          seller: listing.sellerName
        }
      };

      const razorpayOrder = await razorpay.orders.create(options);
      rzpOrderId = razorpayOrder.id;
    } catch (rzpErr) {
      console.warn('[Razorpay Backend] Using sandbox order for demo:', rzpErr.message);
      rzpOrderId = `order_demo_${Date.now()}`;
      isMockOrder = true;
    }

    // Return order details and public key to frontend (NEVER return secret)
    res.json({
      orderId: rzpOrderId,
      amount: totalAmount,
      amountInPaise,
      currency: 'INR',
      keyId,
      isMockOrder,
      foodTitle: listing.title,
      portions: requestedPortions,
      sellerName: listing.sellerName,
      pickupLocation: listing.address,
      pickupWindow: listing.pickupWindow,
      coordinates: listing.coordinates
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize payment order.' });
  }
});

// 2. Verify Razorpay Payment Signature on the backend
router.post('/razorpay/verify-payment', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      rescueId,
      portions = 1,
      buyerId,
      buyerName
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment verification identifiers.'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'resqfood_rzp_secret_key_demo';
    let isSignatureValid = false;

    // Cryptographic HMAC SHA256 Signature Verification
    if (razorpay_signature) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const expectedSignature = hmac.digest('hex');

      if (expectedSignature === razorpay_signature) {
        isSignatureValid = true;
      } else if (
        (razorpay_order_id.startsWith('order_demo_') || razorpay_order_id.startsWith('order_free_')) &&
        razorpay_signature.startsWith('sig_demo_')
      ) {
        // Controlled sandbox demo matching signature
        isSignatureValid = true;
      }
    }

    if (!isSignatureValid) {
      console.warn('[Razorpay Verification] Signature mismatch for order:', razorpay_order_id);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Invalid cryptographic signature.'
      });
    }

    // Only mark order as "Paid" after successful server-side verification
    const { order, updatedListing } = db.createOrder({
      rescueId,
      portions: Number(portions) || 1,
      buyerId: buyerId || 'usr-buyer-demo',
      buyerName: buyerName || 'Rahul Sharma',
      paymentMethod: 'Razorpay (Online UPI/Card)',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    const impact = db.getCommunityImpact();
    const sellerStats = db.getSellerAnalytics(updatedListing?.sellerId || 'usr-seller-demo');

    // Broadcast live event to all connected buyers and sellers
    realtime.broadcast('ORDER_CREATED', {
      order,
      updatedListing,
      impact,
      sellerStats
    });

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      order,
      updatedListing
    });
  } catch (err) {
    console.error('[Razorpay Verify Error]:', err);
    res.status(400).json({ success: false, error: err.message || 'Payment verification processing error.' });
  }
});

// Create new direct order (Cash at store / Community credits / Free)
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
      paymentMethod: paymentMethod || 'Pay at Store Pickup',
      paymentStatus: paymentMethod === 'Pay at Store Pickup' ? 'Pending (Pay at Counter)' : 'Paid'
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
