// Frontend Email Service - Communicates with backend to send emails
import api from '../api/config';

export const emailService = {
  // Send order confirmation email
  sendOrderConfirmationEmail: async (orderData, paymentInfo = null) => {
    try {
      const emailRequest = {
        orderId: orderData.id,
        userEmail: orderData.user?.email || orderData.customerEmail,
        paymentMethod: paymentInfo?.paymentMethod || 'COD',
        paymentId: paymentInfo?.paymentId || null,
        emailType: 'ORDER_CONFIRMATION'
      };
      
      const response = await api.post('/emails/send-order-confirmation', emailRequest);
      return response.data;
    } catch (error) {
      // Don't throw error - email failure shouldn't break the order flow
      return { success: false, error: error.message };
    }
  },

  // Send payment receipt email
  sendPaymentReceiptEmail: async (orderData, paymentInfo) => {
    try {
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
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send order status update email
  sendOrderStatusUpdateEmail: async (orderId, oldStatus, newStatus) => {
    try {
      const emailRequest = {
        orderId: orderId,
        oldStatus: oldStatus,
        newStatus: newStatus,
        emailType: 'STATUS_UPDATE'
      };
      
      const response = await api.post('/emails/send-status-update', emailRequest);
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Test email functionality
  sendTestEmail: async (userEmail) => {
    try {
      const emailRequest = {
        userEmail: userEmail,
        emailType: 'TEST'
      };
      
      const response = await api.post('/emails/send-test', emailRequest);
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};