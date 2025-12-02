# Razorpay Payment Integration Guide

## Setup Instructions

### 1. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign in or create an account
3. Navigate to **Settings** → **API Keys**
4. Generate API Keys (Test Mode for development)
5. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- Use **Test Mode** keys for development
- Use **Live Mode** keys only in production
- Never commit `.env.local` to version control

### 3. Test Payment Flow

1. **Test Cards** (Razorpay Test Mode):
   - Success: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

2. **Test Payment Scenarios**:
   - Card Payment Success
   - Payment Failure
   - Payment Modal Dismiss

### 4. Payment Flow

1. User clicks **"Buy Now"** on a package
2. Frontend calls `/api/payment/create-order` to create Razorpay order
3. Razorpay checkout modal opens
4. User completes payment
5. Frontend calls `/api/payment/verify` to verify payment signature
6. Backend updates user package and stores payment details
7. User redirected to profile with success message

### 5. Payment Status Tracking

All payments are tracked with:
- `paymentId`: Razorpay payment ID
- `orderId`: Razorpay order ID
- `packageHistory`: Complete history of all purchases

### 6. Security Features

✅ Payment signature verification using HMAC-SHA256
✅ Server-side payment validation
✅ User authentication required
✅ Secure API key storage
✅ Order-to-payment mapping

### 7. Going Live

Before production:

1. **Switch to Live Mode** in Razorpay Dashboard
2. Update environment variables with **Live Mode** keys
3. Test with real cards (small amounts)
4. Configure webhooks for payment updates
5. Set up proper error monitoring

### 8. Webhook Configuration (Optional but Recommended)

1. Go to Razorpay Dashboard → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`

### 9. Currency & Pricing

- Default currency: **INR (Indian Rupees)**
- All prices are in whole rupees (Razorpay converts to paise internally)
- To change currency, update in `/api/payment/create-order/route.js`

### 10. Support & Documentation

- [Razorpay Docs](https://razorpay.com/docs/)
- [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## Troubleshooting

### Payment Modal Not Opening
- Check if Razorpay script is loaded
- Verify `RAZORPAY_KEY_ID` in environment variables
- Check browser console for errors

### Payment Verification Failed
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check order ID matches
- Review server logs

### Package Not Activated
- Check payment verification API response
- Verify MongoDB connection
- Check user authentication

---

## Package Structure

```
src/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── create-order/route.js  # Creates Razorpay order
│   │       └── verify/route.js        # Verifies payment
│   ├── packages/page.js               # Package selection & purchase
│   └── utils/
│       └── razorpay.js               # Razorpay utility functions
```
