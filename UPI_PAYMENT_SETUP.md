# UPI Payment Integration - Coastal Tourism Kerala

This document explains how to set up and use UPI payments for activities and accommodation bookings.

## Overview

The UPI payment system is built using **Razorpay**, which is the largest payment gateway in India supporting UPI, cards, wallets, and net banking.

## Features

✅ **UPI Payments** - Direct UPI transfers
✅ **Card Payments** - Credit/Debit cards
✅ **Digital Wallets** - PayTM, Google Pay, etc.
✅ **Net Banking** - All major Indian banks
✅ **Payment Verification** - Secure signature verification
✅ **Refund Support** - Easy refund processing

---

## Backend Setup

### 1. Install Dependencies

```bash
cd coastal-tourism/backend
npm install razorpay
```

### 2. Get Razorpay Credentials

1. Create an account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up and verify your email
3. Go to Settings → API Keys
4. Copy your **Key ID** and **Key Secret**

### 3. Update .env File

Edit `coastal-tourism/backend/.env` and add:

```env
RAZORPAY_KEY_ID=your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

Replace with your actual Razorpay credentials.

### 4. Verify Installation

Restart your backend server:

```bash
npm start
```

You should see:
```
💳 Razorpay initialized for UPI payments
```

---

## API Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/payments/create-order`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "activity",
  "itemName": "Surfing Lesson",
  "date": "2025-06-15",
  "time": "10:00",
  "quantity": 2,
  "price": 1500,
  "contactDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_1234567890",
  "amount": 150000,
  "currency": "INR",
  "key": "rzp_test_xxxxx",
  "prefill": {
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "9876543210"
  }
}
```

### 2. Verify Payment

**Endpoint:** `POST /api/payments/verify-payment`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "order_1234567890",
  "paymentId": "pay_1234567890",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a",
  "type": "activity",
  "itemName": "Surfing Lesson",
  "date": "2025-06-15",
  "time": "10:00",
  "quantity": 2,
  "price": 1500,
  "contactDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmed! Payment received.",
  "booking": {
    "_id": "booking_id",
    "userId": "user_id",
    "type": "activity",
    "itemName": "Surfing Lesson",
    "paymentStatus": "completed",
    "status": "Confirmed"
  },
  "paymentDetails": {
    "orderId": "order_1234567890",
    "paymentId": "pay_1234567890",
    "amount": 1500,
    "currency": "INR",
    "method": "upi"
  }
}
```

### 3. Get Payment Status

**Endpoint:** `GET /api/payments/payment-status/:paymentId`

**Headers:**
```
Authorization: Bearer <token>
```

### 4. Refund Payment

**Endpoint:** `POST /api/payments/refund`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentId": "pay_1234567890",
  "amount": 1500
}
```

---

## Frontend Integration

### 1. Import the Component

```jsx
import BookingWithUPI from './components/BookingWithUPI';
```

### 2. Use in Your Component

```jsx
import { useState } from 'react';
import BookingWithUPI from './components/BookingWithUPI';

function ActivityBooking() {
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleBookingSuccess = (booking) => {
    console.log('Booking successful:', booking);
    setBookingComplete(true);
    // Redirect to dashboard or show success message
  };

  const handleCancel = () => {
    // Handle cancellation
  };

  const bookingDetails = {
    type: 'activity',
    itemName: 'Surfing Lesson at Varkala',
    date: '2025-06-15',
    time: '10:00',
    quantity: 2,
    price: 1500,
    contactDetails: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210'
    }
  };

  return (
    <BookingWithUPI
      bookingDetails={bookingDetails}
      onSuccess={handleBookingSuccess}
      onCancel={handleCancel}
    />
  );
}

export default ActivityBooking;
```

### 3. Load Razorpay Script

Add this to your `public/index.html`:

```html
<!-- Razorpay Checkout JS -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Or it will be loaded dynamically by the component.

---

## Testing

### 1. Test Mode Setup

By default, Razorpay provides test keys. Use these for development:

- **Test UPI:** `success@okhdfcbank` or any UPI ID with `@okhdfcbank`
- **Test Cards:** 
  - Visa: `4111111111111111`
  - MasterCard: `5555555555554444`
  - Expiry: Any future date
  - CVV: Any 3 digits

### 2. Test Payment Flow

1. Click "Pay Now with UPI" button
2. Razorpay popup will appear
3. Enter test UPI ID or card details
4. Complete payment
5. Booking will be confirmed

### 3. Failed Payment Testing

- Use invalid card details
- Close the payment popup
- Use incomplete payment info

---

## Production Deployment

### 1. Activate Live Keys

1. Go to Razorpay Dashboard → Settings → API Keys
2. Switch to "Live" mode
3. Copy live Key ID and Key Secret

### 2. Update Production .env

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

### 3. Enable Payment Methods

In Razorpay Dashboard:
- Enable UPI
- Enable Cards
- Enable Wallets
- Configure bank settings

### 4. SSL Certificate

Ensure your website has an SSL certificate (HTTPS) for production.

---

## Database Schema

The booking now includes payment information:

```javascript
{
  userId: String,
  type: String,          // 'hotel' or 'activity'
  itemName: String,
  date: String,
  time: String,
  quantity: Number,
  price: Number,
  contactDetails: {
    name: String,
    phone: String,
    email: String
  },
  // Payment fields
  paymentMethod: String,    // 'upi', 'card', 'cash'
  paymentStatus: String,    // 'pending', 'completed', 'failed', 'refunded'
  orderId: String,          // Razorpay order ID
  paymentId: String,        // Razorpay payment ID
  paymentAmount: Number,
  paymentCurrency: String,  // Default 'INR'
  status: String,           // 'Confirmed', 'Pending', 'Cancelled'
  bookingDate: Date
}
```

---

## Error Handling

### Common Errors

1. **"Razorpay not initialized"**
   - Check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in .env
   - Restart the server

2. **"Payment order creation error"**
   - Verify all required fields are sent
   - Check Razorpay account balance

3. **"Invalid payment signature"**
   - Ensure Key Secret is correct
   - Check request body structure

4. **"Payment not captured"**
   - Payment may still be processing
   - Wait a few seconds before checking status

---

## Security Best Practices

✅ Never share Razorpay keys in public code
✅ Always verify payment signatures on backend
✅ Use HTTPS in production
✅ Store payment IDs securely
✅ Implement rate limiting on payment endpoints
✅ Log all payment transactions
✅ Keep dependencies updated

---

## Support

For issues with:
- **Razorpay Integration:** [Razorpay Docs](https://razorpay.com/docs/)
- **API Issues:** Check `/api/payments` endpoints logs
- **Frontend Issues:** Check browser console for errors

---

## Troubleshooting

### Payment window not opening?
- Check if Razorpay script is loaded
- Verify in browser console: `typeof Razorpay`
- Should return `"function"`

### Signature verification failing?
- Ensure correct Key Secret in .env
- Check order ID and payment ID are correct
- Verify request body structure

### Test payments not working?
- Verify Razorpay account is in test mode
- Use correct test UPI IDs
- Check network tab for API calls

---

## Next Steps

1. ✅ Set up Razorpay account
2. ✅ Add credentials to .env
3. ✅ Import BookingWithUPI component
4. ✅ Test payment flow in dev
5. ✅ Deploy to production with live keys
6. ✅ Monitor transactions in Razorpay dashboard

