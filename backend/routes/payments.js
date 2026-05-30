import express from 'express';
import { authenticateToken } from './auth.js';
import paymentService from '../services/payment.js';
import { db } from '../config/db.js';

const router = express.Router();

// Create payment order (protected)
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const bookingData = req.body || {};
    bookingData.userId = req.user.id;

    const order = await paymentService.createPaymentOrder(bookingData);

    const keyId = process.env.RAZORPAY_KEY_ID || 'test_key';

    res.json({
      key: keyId,
      orderId: order.id || order.order_id || order.orderId || null,
      amount: order.amount || bookingData.price * 100 || 0,
      currency: order.currency || 'INR',
      description: bookingData.itemName || 'Coastal Tourism Booking',
      prefill: {
        name: bookingData.contactDetails?.name,
        email: bookingData.contactDetails?.email,
        contact: bookingData.contactDetails?.phone
      },
      notes: order.notes || {}
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment and create booking record
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature, type, itemName, date, time, quantity, contactDetails, price } = req.body;

    if (!orderId || !paymentId) return res.status(400).json({ error: 'orderId and paymentId are required' });

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const valid = paymentService.verifyPaymentSignature(orderId, paymentId, signature, keySecret);

    if (!valid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Create booking record now that payment is valid
    const booking = await db.createBooking({
      userId: req.user.id,
      type,
      itemName,
      date,
      time,
      quantity,
      contactDetails,
      price,
      status: 'Confirmed',
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      orderId,
      paymentId,
      paymentAmount: price,
      paymentCurrency: 'INR'
    });

    res.json({ message: 'Payment verified and booking confirmed', booking });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;
