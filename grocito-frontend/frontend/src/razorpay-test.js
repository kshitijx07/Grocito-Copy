// This is a simple test script to verify that Razorpay is working correctly
// You can include this in your HTML file or run it in the browser console

function testRazorpay() {
  // Load Razorpay script
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  document.body.appendChild(script);
  
  script.onload = () => {
    console.log('Razorpay script loaded successfully');
    
    // Create a test order
    const orderData = {
      id: 'order_' + Math.random().toString(36).substring(2, 15),
      amount: 10000, // 100 INR in paise
      currency: 'INR',
    };
    
    // Open Razorpay payment modal
    const options = {
      key: 'rzp_test_cSaPgCCDgkPbkb',
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Grocito Test',
      description: 'Test Payment',
      order_id: orderData.id,
      handler: function (response) {
        console.log('Payment successful:', response);
        alert('Test payment successful!');
      },
      prefill: {
        name: 'Test User',
        email: 'test@example.com',
        contact: '9999999999'
      },
      notes: {
        address: 'Test Address'
      },
      theme: {
        color: '#16a34a'
      }
    };
    
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      console.log('Razorpay modal opened');
    } catch (error) {
      console.error('Error opening Razorpay modal:', error);
      alert('Error opening Razorpay modal: ' + error.message);
    }
  };
  
  script.onerror = () => {
    console.error('Failed to load Razorpay script');
    alert('Failed to load Razorpay script. Please check your internet connection.');
  };
}

// You can call this function to test Razorpay
// testRazorpay();

export default testRazorpay;