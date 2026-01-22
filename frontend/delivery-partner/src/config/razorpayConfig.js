// Razorpay Configuration
// Replace these with your actual Razorpay keys

// Razorpay Configuration using Environment Variables
// Keys are loaded from .env file for security

// Get Razorpay key from environment variables
export const getRazorpayKey = () => {
  const envKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
  
  if (!envKey) {
    console.error('❌ REACT_APP_RAZORPAY_KEY_ID not found in environment variables');
    throw new Error('Razorpay Key ID not configured. Please check your .env file.');
  }
  
  console.log('✅ Using Razorpay Key from environment:', envKey);
  return envKey;
};

// Get Razorpay secret from environment variables (for backend use)
export const getRazorpaySecret = () => {
  const envSecret = process.env.REACT_APP_RAZORPAY_KEY_SECRET;
  
  if (!envSecret) {
    console.error('❌ REACT_APP_RAZORPAY_KEY_SECRET not found in environment variables');
    throw new Error('Razorpay Key Secret not configured. Please check your .env file.');
  }
  
  console.log('✅ Using Razorpay Secret from environment (hidden for security)');
  return envSecret;
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

// Validate if keys are properly configured
export const validateRazorpayConfig = () => {
  const keyId = getRazorpayKey();
  const keySecret = getRazorpaySecret();
  
  // Debug: Log what we're actually getting
  console.log('🔍 Debug Razorpay Configuration:');
  console.log('REACT_APP_RAZORPAY_KEY_ID:', process.env.REACT_APP_RAZORPAY_KEY_ID);
  console.log('REACT_APP_RAZORPAY_KEY_SECRET:', process.env.REACT_APP_RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');
  console.log('Final Key ID:', keyId);
  console.log('Final Key Secret:', keySecret ? 'Present' : 'Missing');
  
  // Check if we have valid Razorpay keys (either from env or hardcoded)
  if (!keyId || keyId === 'rzp_test_default') {
    console.error('❌ Razorpay Key ID is missing or invalid');
    return false;
  }
  
  if (!keySecret || keySecret === 'default_secret') {
    console.error('❌ Razorpay Key Secret is missing or invalid');
    return false;
  }
  
  // Validate key format
  if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
    console.error('❌ Invalid Razorpay key format. Key should start with rzp_test_ or rzp_live_');
    return false;
  }
  
  // If we reach here, configuration is valid
  console.log(`✅ Razorpay configured successfully in ${getRazorpayEnvironment()} mode`);
  console.log(`✅ Using Key ID: ${keyId}`);
  return true;
};

export default {
  getRazorpayKey,
  getRazorpaySecret,
  isTestMode,
  getRazorpayEnvironment,
  validateRazorpayConfig
};