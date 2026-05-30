import React, { useState } from 'react';
import './BookingWithUPI.css';
import { useAuth } from '../context/AuthContext';

const BookingWithUPI = ({ bookingDetails, onSuccess, onCancel }) => {
  const { API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for Sandbox UPI Simulator
  const [showMockCheckout, setShowMockCheckout] = useState(false);
  const [mockOrderData, setMockOrderData] = useState(null);
  const [mockLoading, setMockLoading] = useState(false);

  // Load Razorpay script dynamically
  const loadRazorpayScript = async () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUPIPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('coastal_token') || localStorage.getItem('token');

      // Step 1: Create payment order
      const orderResponse = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingDetails)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Sandbox Fallback Detection
      if (orderData.key === 'test_key' || orderData.key.includes('your_')) {
        setMockOrderData(orderData);
        setShowMockCheckout(true);
        return;
      }

      // Step 2: Load Razorpay script
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Step 3: Initialize Razorpay checkout
      const options = {
        key: orderData.key,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Coastal Tourism Kerala',
        description: orderData.description,
        image: '/logo.png',
        prefill: orderData.prefill,
        notes: orderData.notes,
        theme: {
          color: '#0d9488' // matches our teal theme
        },
        method: {
          upi: true,
          card: true,
          wallet: true,
          netbanking: true
        },
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                ...bookingDetails
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              onSuccess(verifyData.booking);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed: ' + err.message);
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled by user');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // UPI Simulation Handler
  const handleMockCheckoutVerify = async (shouldSucceed) => {
    setMockLoading(true);
    setError(null);

    // Simulate 1.5s network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!shouldSucceed) {
      setError('Payment simulation: Transaction failed or rejected by user.');
      setMockLoading(false);
      setShowMockCheckout(false);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('coastal_token') || localStorage.getItem('token');

      const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: mockOrderData.orderId,
          paymentId: `pay_mock_${Date.now()}`,
          signature: 'mock_signature',
          ...bookingDetails
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok) {
        onSuccess(verifyData.booking);
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (err) {
      setError('Payment verification failed: ' + err.message);
      setLoading(false);
    } finally {
      setMockLoading(false);
      setShowMockCheckout(false);
    }
  };

  const handleMockCancel = () => {
    setShowMockCheckout(false);
    setError('Payment cancelled by user');
    setLoading(false);
  };

  return (
    <div className="booking-upi-container">
      <div className="booking-card">
        {/* Sandbox Simulator Overlay */}
        {showMockCheckout && (
          <div className="mock-checkout-overlay">
            <div className="mock-checkout-card">
              {mockLoading ? (
                <>
                  <div className="spinner-glow"></div>
                  <h4>Connecting to UPI Sandbox...</h4>
                  <p className="text-slate-400">Please authorize the request on your UPI mobile app simulation.</p>
                </>
              ) : (
                <>
                  <span className="mock-checkout-icon">📱</span>
                  <h4>UPI Payment Sandbox</h4>
                  <p>
                    Since you are running in developer test mode, you can simulate a successful or failed UPI payment.
                  </p>
                  <div className="mock-checkout-buttons">
                    <button 
                      className="btn btn-mock-success" 
                      onClick={() => handleMockCheckoutVerify(true)}
                    >
                      Simulate Success
                    </button>
                    <button 
                      className="btn btn-mock-fail" 
                      onClick={() => handleMockCheckoutVerify(false)}
                    >
                      Simulate Failure
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={handleMockCancel}
                    >
                      Cancel Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <h2>Complete Your Booking with UPI</h2>

        {/* Booking Details Summary */}
        <div className="booking-summary">
          <h3>Order Details</h3>
          <div className="summary-item">
            <span className="label">Type:</span>
            <span className="value capitalize">{bookingDetails.type === 'hotel' ? 'Stay' : 'Activity'}</span>
          </div>
          <div className="summary-item">
            <span className="label">Item:</span>
            <span className="value">{bookingDetails.itemName}</span>
          </div>
          <div className="summary-item">
            <span className="label">Date:</span>
            <span className="value">{bookingDetails.date}</span>
          </div>
          <div className="summary-item">
            <span className="label">Quantity:</span>
            <span className="value">{bookingDetails.quantity}</span>
          </div>
          <div className="summary-item total">
            <span className="label">Total Amount:</span>
            <span className="value">₹{bookingDetails.price} INR</span>
          </div>
        </div>

        {/* Contact Details */}
        <div className="contact-section">
          <h3>Contact Details</h3>
          <div className="contact-item">
            <span className="label">Name:</span>
            <span className="value">{bookingDetails.contactDetails.name}</span>
          </div>
          <div className="contact-item">
            <span className="label">Email:</span>
            <span className="value">{bookingDetails.contactDetails.email}</span>
          </div>
          <div className="contact-item">
            <span className="label">Phone:</span>
            <span className="value">{bookingDetails.contactDetails.phone}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Payment Methods */}
        <div className="payment-methods">
          <p className="methods-info">We accept secure direct UPI payments and digital wallets</p>
          <div className="method-icons">
            <div className="method-icon">📱 UPI / GPAY</div>
            <div className="method-icon">💳 Cards</div>
            <div className="method-icon">🏦 Netbanking</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleUPIPayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : '💳 Pay with UPI'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {/* Security Note */}
        <div className="security-note">
          <span className="security-icon">🔒</span>
          <span>Secured by Razorpay. We do not store sensitive details.</span>
        </div>
      </div>
    </div>
  );
};

export default BookingWithUPI;
