// Frontend Email Service - Communicates with backend to send emails
import api from '../api/config';

export const emailService = {
  // Send order confirmation email
  sendOrderConfirmationEmail: async (orderData, paymentInfo = null) => {
    try {
      console.log('Sending order confirmation email for order:', orderData.id);
      
      const emailRequest = {
        orderId: orderData.id,
        userEmail: orderData.user?.email || orderData.customerEmail,
        paymentMethod: paymentInfo?.paymentMethod || 'COD',
        paymentId: paymentInfo?.paymentId || null,
        emailType: 'ORDER_CONFIRMATION'
      };
      
      const response = await api.post('/emails/send-order-confirmation', emailRequest);
      console.log('Order confirmation email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't throw error - email failure shouldn't break the order flow
      return { success: false, error: error.message };
    }
  },

  // Send payment receipt email
  sendPaymentReceiptEmail: async (orderData, paymentInfo) => {
    try {
      console.log('Sending payment receipt email for order:', orderData.id);
      
      const emailRequest = {
        orderId: orderData.id,
        userEmail: orderData.user?.email || orderData.customerEmail,
        paymentMethod: paymentInfo.paymentMethod || 'ONLINE',
        paymentId: paymentInfo.paymentId,
        razorpayOrderId: paymentInfo.razorpayOrderId,
        paidAmount: orderData.totalAmount,
        emailType: 'PAYMENT_RECEIPT'
      };
      
      const response = await api.post('/emails/send-payment-receipt', emailRequest);
      console.log('Payment receipt email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send payment receipt email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send order status update email
  sendOrderStatusUpdateEmail: async (orderId, oldStatus, newStatus) => {
    try {
      console.log(`Sending order status update email for order ${orderId}: ${oldStatus} -> ${newStatus}`);
      
      const emailRequest = {
        orderId: orderId,
        oldStatus: oldStatus,
        newStatus: newStatus,
        emailType: 'STATUS_UPDATE'
      };
      
      const response = await api.post('/emails/send-status-update', emailRequest);
      console.log('Order status update email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send order status update email:', error);
      return { success: false, error: error.message };
    }
  },

  // Test email functionality
  sendTestEmail: async (userEmail) => {
    try {
      console.log('Sending test email to:', userEmail);
      
      const emailRequest = {
        userEmail: userEmail,
        emailType: 'TEST'
      };
      
      const response = await api.post('/emails/send-test', emailRequest);
      console.log('Test email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send test email:', error);
      return { success: false, error: error.message };
    }
  }
};