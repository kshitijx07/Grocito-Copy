import { apiRequest } from './config';

export const deliveryPartnerService = {
  // Get all delivery partner auth records
  getAllAuthRecords: async (status = null) => {
    const params = status ? `?status=${status}` : '';
    return await apiRequest(`/delivery-partner-auth/all${params}`, 'GET');
  },

  // Get pending verification requests
  getPendingVerificationRequests: async () => {
    return await apiRequest('/delivery-partner-auth/pending-verification', 'GET');
  },

  // Update verification status
  updateVerificationStatus: async (authId, status) => {
    return await apiRequest(`/delivery-partner-auth/${authId}/verification-status`, 'PUT', {
      status
    });
  },

  // Get auth record by ID
  getAuthRecordById: async (id) => {
    return await apiRequest(`/delivery-partner-auth/${id}`, 'GET');
  },

  // Update auth record
  updateAuthRecord: async (id, updateData) => {
    return await apiRequest(`/delivery-partner-auth/${id}`, 'PUT', updateData);
  },

  // Deactivate auth record
  deactivateAuthRecord: async (id) => {
    return await apiRequest(`/delivery-partner-auth/${id}`, 'DELETE');
  },

  // Search auth records
  searchAuthRecords: async (keyword) => {
    return await apiRequest(`/delivery-partner-auth/search?keyword=${encodeURIComponent(keyword)}`, 'GET');
  },

  // Get all delivery partners (using auth records as main records)
  getAllDeliveryPartners: async (filters = {}) => {
    // Use auth records as the main delivery partner data
    return await apiRequest('/delivery-partner-auth/all', 'GET');
  },

  // Get delivery partner by ID
  getDeliveryPartnerById: async (id) => {
    return await apiRequest(`/delivery-partners/${id}`, 'GET');
  },

  // Update delivery partner
  updateDeliveryPartner: async (id, updateData) => {
    return await apiRequest(`/delivery-partners/${id}`, 'PUT', updateData);
  },

  // Update partner availability
  updatePartnerAvailability: async (partnerId, isAvailable, availabilityStatus) => {
    return await apiRequest(`/delivery-partners/${partnerId}/availability`, 'PUT', {
      isAvailable,
      availabilityStatus
    });
  },

  // Update verification status (for main delivery partner record)
  updatePartnerVerificationStatus: async (partnerId, verificationStatus) => {
    return await apiRequest(`/delivery-partners/${partnerId}/verification`, 'PUT', {
      verificationStatus
    });
  },

  // Get available partners for pincode
  getAvailablePartners: async (pincode) => {
    return await apiRequest(`/delivery-partners/available?pincode=${pincode}`, 'GET');
  },

  // Get delivery partner analytics (using auth records)
  getAnalytics: async () => {
    // Calculate analytics from auth records
    const allPartners = await apiRequest('/delivery-partner-auth/all', 'GET');
    
    const analytics = {
      totalPartners: allPartners.length,
      verifiedPartners: allPartners.filter(p => p.verificationStatus === 'VERIFIED').length,
      pendingPartners: allPartners.filter(p => p.verificationStatus === 'PENDING').length,
      rejectedPartners: allPartners.filter(p => p.verificationStatus === 'REJECTED').length,
      onlinePartners: 0, // We don't have availability status in auth records yet
      busyPartners: 0,
      offlinePartners: allPartners.filter(p => p.verificationStatus === 'VERIFIED').length
    };
    
    return analytics;
  },

  // Search delivery partners
  searchDeliveryPartners: async (keyword) => {
    return await apiRequest(`/delivery-partners/search?keyword=${encodeURIComponent(keyword)}`, 'GET');
  },

  // Delete delivery partner (soft delete)
  deleteDeliveryPartner: async (id) => {
    return await apiRequest(`/delivery-partners/${id}`, 'DELETE');
  }
};