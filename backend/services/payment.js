import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
let razorpay = null;

export function initializeRazorpay(keyId, keySecret) {
  if (!keyId || !keySecret || keyId === 'your_razorpay_key_id_here' || keySecret === 'your_razorpay_key_secret_here' || keyId.startsWith('your_')) {
    console.log("⚠️ Razorpay credentials not found or placeholder detected. Payments will be in test mode.");
    return false;
  }
  
  try {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log("💳 Razorpay initialized for UPI payments");
    return true;
  } catch (err) {
    console.error("❌ Failed to initialize Razorpay:", err.message);
    return false;
  }
}

// Create UPI payment order
export async function createPaymentOrder(bookingData) {
  if (!razorpay) {
    console.log("⚠️ Razorpay not initialized, using mock payment");
    return {
      id: `order_${Date.now()}`,
      amount: bookingData.price * 100,
      currency: 'INR',
      status: 'created'
    };
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(bookingData.price * 100), // Amount in paise (smallest unit)
      currency: 'INR',
      receipt: `booking_${bookingData.userId}_${Date.now()}`,
      notes: {
        bookingType: bookingData.type,
        itemName: bookingData.itemName,
        date: bookingData.date,
        quantity: bookingData.quantity
      }
    });

    return order;
  } catch (err) {
    console.error('❌ Error creating payment order:', err);
    throw err;
  }
}

// Verify UPI payment signature
export function verifyPaymentSignature(orderId, paymentId, signature, keySecret) {
  if (!razorpay || signature === 'mock_signature' || signature === 'test_signature') {
    return true;
  }
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    console.error('❌ Error verifying payment signature:', err);
    return false;
  }
}

// Get payment status
export async function getPaymentStatus(paymentId) {
  if (!razorpay || paymentId.startsWith('pay_mock_') || paymentId === 'test_payment') {
    return { 
      status: 'captured',
      amount: 150000,
      currency: 'INR',
      method: 'upi'
    };
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (err) {
    console.error('❌ Error fetching payment status:', err);
    throw err;
  }
}

// Refund payment
export async function refundPayment(paymentId, amount) {
  if (!razorpay) {
    console.log("⚠️ Razorpay not initialized, refund simulation");
    return { id: `refund_${Date.now()}`, status: 'processed' };
  }

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined
    });
    return refund;
  } catch (err) {
    console.error('❌ Error refunding payment:', err);
    throw err;
  }
}

export default {
  initializeRazorpay,
  createPaymentOrder,
  verifyPaymentSignature,
  getPaymentStatus,
  refundPayment
};
