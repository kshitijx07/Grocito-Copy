/**
 * Grocito Delivery Fee Service
 * 
 * Final Policy:
 * - Order Amount >= ₹199: FREE delivery (Partner gets ₹25 from Grocito)
 * - Order Amount < ₹199: ₹40 delivery fee (Partner gets ₹30, Grocito keeps ₹10)
 */

export const DELIVERY_POLICY = {
  FREE_DELIVERY_THRESHOLD: 199,
  DELIVERY_FEE: 40,
  PARTNER_SHARE_PERCENTAGE: 75, // 75% of delivery fee
  PARTNER_EARNINGS: {
    PAID_DELIVERY: 30, // 75% of ₹40
    FREE_DELIVERY: 25  // Paid by Grocito
  }
};

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class DeliveryFeeService {
  /**
   * Calculate delivery fee based on order amount
   * @param {number} orderAmount - Total order amount
   * @returns {object} - Delivery fee details
   */
  async calculateDeliveryFee(orderAmount) {
    try {
      // Try to use backend API first
      const response = await fetch(`${API_BASE_URL}/api/delivery-fee/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderAmount })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          orderAmount: parseFloat(data.orderAmount),
          deliveryFee: parseFloat(data.deliveryFee),
          isFreeDelivery: data.isFreeDelivery,
          totalAmount: parseFloat(data.totalAmount),
          savings: parseFloat(data.savings),
          amountNeededForFreeDelivery: parseFloat(data.amountNeededForFreeDelivery)
        };
      }
    } catch (error) {
      console.warn('Backend API not available, using local calculation:', error.message);
    }

    // Fallback to local calculation
    const isFreeDelivery = orderAmount >= DELIVERY_POLICY.FREE_DELIVERY_THRESHOLD;
    
    return {
      orderAmount: parseFloat(orderAmount.toFixed(2)),
      deliveryFee: isFreeDelivery ? 0 : DELIVERY_POLICY.DELIVERY_FEE,
      isFreeDelivery,
      totalAmount: parseFloat((orderAmount + (isFreeDelivery ? 0 : DELIVERY_POLICY.DELIVERY_FEE)).toFixed(2)),
      savings: isFreeDelivery ? DELIVERY_POLICY.DELIVERY_FEE : 0,
      amountNeededForFreeDelivery: isFreeDelivery ? 0 : Math.max(0, DELIVERY_POLICY.FREE_DELIVERY_THRESHOLD - orderAmount)
    };
  }

  /**
   * Calculate delivery partner earnings for an order
   * @param {number} orderAmount - Total order amount
   * @param {object} bonuses - Additional bonuses (optional)
   * @returns {object} - Partner earnings breakdown
   */
  calculatePartnerEarnings(orderAmount, bonuses = {}) {
    const isFreeDelivery = orderAmount >= DELIVERY_POLICY.FREE_DELIVERY_THRESHOLD;
    
    // Base earnings - CORRECT POLICY IMPLEMENTATION
    const baseEarnings = isFreeDelivery 
      ? DELIVERY_POLICY.PARTNER_EARNINGS.FREE_DELIVERY  // ₹25 for free delivery orders
      : DELIVERY_POLICY.PARTNER_EARNINGS.PAID_DELIVERY; // ₹30 for paid delivery orders

    // Calculate bonuses
    const totalBonuses = Object.values(bonuses).reduce((sum, bonus) => sum + (bonus || 0), 0);
    
    const totalEarnings = baseEarnings + totalBonuses;

    // Customer payment
    const customerPaid = isFreeDelivery ? 0 : DELIVERY_POLICY.DELIVERY_FEE;
    
    // Grocito payment to partner (for free delivery orders)
    const grocitoPaid = isFreeDelivery ? DELIVERY_POLICY.PARTNER_EARNINGS.FREE_DELIVERY : 0;
    
    // Grocito revenue/cost
    const grocitoRevenue = isFreeDelivery 
      ? -DELIVERY_POLICY.PARTNER_EARNINGS.FREE_DELIVERY  // Grocito pays ₹25 (cost)
      : (DELIVERY_POLICY.DELIVERY_FEE - DELIVERY_POLICY.PARTNER_EARNINGS.PAID_DELIVERY); // Grocito keeps ₹10 (profit)

    return {
      orderAmount: parseFloat(orderAmount.toFixed(2)),
      deliveryType: isFreeDelivery ? 'FREE_DELIVERY' : 'PAID_DELIVERY',
      baseEarnings,
      bonuses,
      totalBonuses,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      customerPaid,
      grocitoPaid,
      grocitoRevenue
    };
  }

  /**
   * Get delivery fee display information for UI
   * @param {number} orderAmount - Total order amount
   * @returns {object} - Display information
   */
  async getDeliveryFeeDisplay(orderAmount) {
    const deliveryInfo = await this.calculateDeliveryFee(orderAmount);
    
    return {
      ...deliveryInfo,
      displayText: deliveryInfo.isFreeDelivery ? 'FREE' : `₹${deliveryInfo.deliveryFee}`,
      savingsText: deliveryInfo.isFreeDelivery ? `You saved ₹${deliveryInfo.savings} on delivery!` : null,
      promotionText: deliveryInfo.amountNeededForFreeDelivery > 0 
        ? `Add ₹${deliveryInfo.amountNeededForFreeDelivery.toFixed(2)} more for FREE delivery!` 
        : null
    };
  }

  /**
   * Synchronous version for immediate UI updates
   * @param {number} orderAmount - Total order amount
   * @returns {object} - Display information
   */
  getDeliveryFeeDisplaySync(orderAmount) {
    // BULLETPROOF IMPLEMENTATION - SIMPLE AND CLEAR
    console.log('🔍 DELIVERY FEE CALCULATION:', {
      orderAmount,
      threshold: DELIVERY_POLICY.FREE_DELIVERY_THRESHOLD,
      comparison: `${orderAmount} >= ${DELIVERY_POLICY.FREE_DELIVERY_THRESHOLD}`
    });
    
    // Simple, clear logic
    const isFreeDelivery = orderAmount >= 199; // Hardcoded to be absolutely sure
    const deliveryFee = isFreeDelivery ? 0 : 40; // Hardcoded to be absolutely sure
    const totalAmount = orderAmount + deliveryFee;
    const savings = isFreeDelivery ? 40 : 0;
    const amountNeededForFreeDelivery = isFreeDelivery ? 0 : Math.max(0, 199 - orderAmount);
    
    const result = {
      orderAmount: parseFloat(orderAmount.toFixed(2)),
      deliveryFee,
      isFreeDelivery,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      savings,
      amountNeededForFreeDelivery,
      displayText: isFreeDelivery ? 'FREE' : `₹${deliveryFee}`,
      savingsText: isFreeDelivery ? `You saved ₹${savings} on delivery!` : null,
      promotionText: amountNeededForFreeDelivery > 0 
        ? `Add ₹${amountNeededForFreeDelivery.toFixed(2)} more for FREE delivery!` 
        : null
    };
    
    console.log('✅ DELIVERY FEE RESULT:', result);
    return result;
  }

  /**
   * Calculate daily/weekly/monthly earnings for delivery partner
   * @param {Array} deliveries - Array of delivery records
   * @returns {object} - Earnings summary
   */
  calculateEarningsSummary(deliveries) {
    let totalEarnings = 0;
    let totalDeliveries = deliveries.length;
    let freeDeliveries = 0;
    let paidDeliveries = 0;
    let totalBonuses = 0;
    let totalBaseEarnings = 0;

    deliveries.forEach(delivery => {
      const earnings = this.calculatePartnerEarnings(delivery.orderAmount, delivery.bonuses || {});
      totalEarnings += earnings.totalEarnings;
      totalBonuses += earnings.totalBonuses;
      totalBaseEarnings += earnings.baseEarnings;
      
      if (earnings.deliveryType === 'FREE_DELIVERY') {
        freeDeliveries++;
      } else {
        paidDeliveries++;
      }
    });

    return {
      totalDeliveries,
      freeDeliveries,
      paidDeliveries,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalBaseEarnings: parseFloat(totalBaseEarnings.toFixed(2)),
      totalBonuses: parseFloat(totalBonuses.toFixed(2)),
      averageEarningsPerDelivery: totalDeliveries > 0 ? parseFloat((totalEarnings / totalDeliveries).toFixed(2)) : 0
    };
  }

  /**
   * Get policy information for display
   * @returns {object} - Policy details
   */
  getPolicyInfo() {
    return {
      freeDeliveryThreshold: DELIVERY_POLICY.FREE_DELIVERY_THRESHOLD,
      deliveryFee: DELIVERY_POLICY.DELIVERY_FEE,
      partnerEarnings: DELIVERY_POLICY.PARTNER_EARNINGS,
      partnerSharePercentage: DELIVERY_POLICY.PARTNER_SHARE_PERCENTAGE
    };
  }
}

// Export singleton instance
export const deliveryFeeService = new DeliveryFeeService();
export default deliveryFeeService;