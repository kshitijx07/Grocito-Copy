// Razorpay Configuration
// Only the Key ID is used on frontend - Secret Key is handled by backend only

// Get Razorpay key from environment variables
export const getRazorpayKey = () => {
  const envKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
  
  if (!envKey) {
    throw new Error('Razorpay Key ID not configured. Please check your environment variables.');
  }
  
  return envKey;
};

// Check if we're in test mode (based on key prefix)
export const isTestMode = () => {
  const keyId = getRazorpayKey();
  return keyId.startsWith('rzp_test_');
};

// Get environment info
export const getRazorpayEnvironment = () => {
  return isTestMode() ? 'TEST' : 'LIVE';
};

// Validate if Razorpay Key ID is properly configured
// Note: Secret key validation is done on backend only for security
export const validateRazorpayConfig = () => {
  try {
    const keyId = getRazorpayKey();
    
    // Check if we have a valid Razorpay key
    if (!keyId) {
      return false;
    }
    
    // Validate key format
    if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  getRazorpayKey,
  isTestMode,
  getRazorpayEnvironment,
  validateRazorpayConfig
};