# Razorpay Integration Setup Guide

This guide explains how to properly configure Razorpay credentials for both the main frontend and admin frontend applications.

## 🔐 Security Best Practices

- **Never commit API keys to version control**
- **Use environment variables for all credentials**
- **Keep test and production keys separate**
- **Regularly rotate your API keys**

## 📋 Prerequisites

1. Razorpay account (Sign up at https://razorpay.com/)
2. Access to Razorpay Dashboard (https://dashboard.razorpay.com/)

## 🔑 Getting Your Razorpay Credentials

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com/
   - Login with your credentials

2. **Navigate to API Keys**
   - Go to Settings → API Keys
   - Or directly visit: https://dashboard.razorpay.com/app/keys

3. **Generate/Copy Keys**
   - **Key ID**: This is your public key (safe to use in frontend)
   - **Key Secret**: This is your private key (use only in backend)

## ⚙️ Configuration Steps

### 1. Main Frontend Configuration

**File**: `grocito-frontend/frontend/.env`

```env
# Razorpay Configuration
REACT_APP_RAZORPAY_KEY_ID=rzp_test_JhQ3fuFClaPubE
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 2. Admin Frontend Configuration

**File**: `grocito-frontend-admin/.env`

```env
# Razorpay Configuration (Same as main frontend)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_JhQ3fuFClaPubE
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 3. Delivery Partner Frontend Configuration

**File**: `grocito-frontend-delivery-partner/.env`

```env
# Razorpay Configuration (Same as main frontend)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_JhQ3fuFClaPubE
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 3. Environment Files Setup

1. **Copy example files**:
   ```bash
   # Main frontend
   cp grocito-frontend/frontend/.env.example grocito-frontend/frontend/.env
   
   # Admin frontend
   cp grocito-frontend-admin/.env.example grocito-frontend-admin/.env
   
   # Delivery partner frontend
   cp grocito-frontend-delivery-partner/.env.example grocito-frontend-delivery-partner/.env
   ```

2. **Update with your credentials**:
   - Replace `your_razorpay_key_id_here` with your actual Key ID
   - Replace `your_razorpay_key_secret_here` with your actual Key Secret

## 🏗️ Implementation Details

### Main Frontend (`grocito-frontend/frontend/`)

- **Service**: `src/api/razorpayService.js`
- **Component**: `src/components/RazorpayPayment.js`
- **Features**:
  - Secure credential loading from environment
  - Payment processing
  - Error handling
  - Payment verification

### Admin Frontend (`grocito-frontend-admin/`)

- **Service**: `src/api/razorpayService.js`
- **Component**: `src/components/common/RazorpayPayment.js`
- **Features**:
  - Same secure credential loading
  - Admin-specific payment processing
  - Refund processing capabilities
  - Payment details retrieval

### Delivery Partner Frontend (`grocito-frontend-delivery-partner/`)

- **Service**: `src/services/razorpayService.js`
- **Component**: `src/components/payment/PaymentManagement.js`
- **Configuration**: `src/config/razorpayConfig.js`
- **Features**:
  - Same secure credential loading
  - COD collection via digital payment
  - Cash payment confirmation
  - Payment validation for delivery
  - Delivery partner specific UI

## 🔒 Security Features

1. **Environment Variable Validation**:
   ```javascript
   getRazorpayKey: () => {
     const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
     if (!key) {
       throw new Error('Razorpay configuration missing');
     }
     return key;
   }
   ```

2. **Error Handling**:
   - Graceful fallback for missing credentials
   - User-friendly error messages
   - Console logging for debugging

3. **Secure Payment Flow**:
   - SDK loading validation
   - Payment success/failure callbacks
   - Modal dismissal handling

## 🧪 Testing

### Test Mode
- Use test credentials (starting with `rzp_test_`)
- Test payments won't charge real money
- Use test card numbers from Razorpay documentation

### Test Card Numbers
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

## 🚀 Production Deployment

1. **Switch to Live Keys**:
   - Replace test keys with live keys (starting with `rzp_live_`)
   - Update both frontend applications

2. **Environment Variables**:
   ```env
   # Production
   REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_live_key_here
   REACT_APP_RAZORPAY_KEY_SECRET=your_live_secret_here
   ```

3. **Verification**:
   - Test payment flow in production
   - Verify webhook endpoints (if implemented)
   - Monitor payment success rates

## 📱 Usage Examples

### Main Frontend
```javascript
import RazorpayPayment from './components/RazorpayPayment';

<RazorpayPayment
  amount={1000} // Amount in rupees
  orderId="order_123"
  customerInfo={{
    name: "John Doe",
    email: "john@example.com",
    phone: "9999999999"
  }}
  onPaymentSuccess={(response) => {
    console.log('Payment successful:', response);
  }}
  onPaymentFailure={(error) => {
    console.error('Payment failed:', error);
  }}
/>
```

### Admin Frontend
```javascript
import RazorpayPayment from './components/common/RazorpayPayment';

<RazorpayPayment
  amount={1000}
  orderId="order_123"
  customerInfo={{
    name: "Admin User",
    email: "admin@grocito.com"
  }}
  onPaymentSuccess={(response) => {
    // Handle admin payment success
  }}
  onPaymentFailure={(error) => {
    // Handle admin payment failure
  }}
  isRefund={false} // Set to true for refund processing
/>
```

## 🔧 Troubleshooting

### Common Issues

1. **"Razorpay configuration missing" Error**:
   - Check if `.env` file exists
   - Verify environment variable names
   - Restart development server after adding variables

2. **"Razorpay SDK failed to load" Error**:
   - Check internet connection
   - Verify Razorpay CDN accessibility
   - Check browser console for network errors

3. **Payment Modal Not Opening**:
   - Verify Razorpay key is correct
   - Check browser popup blockers
   - Ensure amount is greater than 0

### Debug Steps

1. **Check Environment Variables**:
   ```javascript
   console.log('Razorpay Key:', process.env.REACT_APP_RAZORPAY_KEY_ID);
   ```

2. **Verify SDK Loading**:
   ```javascript
   console.log('Razorpay SDK loaded:', !!window.Razorpay);
   ```

3. **Test Payment Options**:
   ```javascript
   console.log('Payment options:', options);
   ```

## 📞 Support

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Razorpay Support**: https://razorpay.com/support/
- **Integration Guide**: https://razorpay.com/docs/payments/payment-gateway/web-integration/

## ⚠️ Important Notes

1. **Key Security**: Never expose your Key Secret in frontend code
2. **HTTPS Required**: Razorpay requires HTTPS in production
3. **Webhook Verification**: Implement webhook verification for production
4. **PCI Compliance**: Follow PCI DSS guidelines for payment processing
5. **Regular Updates**: Keep Razorpay SDK updated to latest version

---

**Last Updated**: December 2024
**Version**: 1.0.0