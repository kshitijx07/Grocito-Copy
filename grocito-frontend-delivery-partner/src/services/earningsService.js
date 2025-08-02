/**
 * Delivery Partner Earnings Service
 * 
 * Calculates real-time earnings based on Grocito's delivery fee policy:
 * - Order Amount >= ₹199: FREE delivery (Partner gets ₹25 from Grocito)
 * - Order Amount < ₹199: ₹40 delivery fee (Partner gets ₹30, Grocito keeps ₹10)
 */

export const EARNINGS_POLICY = {
  FREE_DELIVERY_THRESHOLD: 199,
  DELIVERY_FEE: 40,
  PARTNER_EARNINGS: {
    PAID_DELIVERY: 30, // 75% of ₹40
    FREE_DELIVERY: 25  // Paid by Grocito
  },
  BONUSES: {
    PEAK_HOUR: 5,
    WEEKEND: 3,
    BAD_WEATHER: 8,
    DAILY_TARGET: 80,
    WEEKLY_TARGET: 400,
    MONTHLY_TARGET: 1500,
    RATING_BONUS: 100
  }
};

class EarningsService {
  /**
   * Calculate earnings for a single delivery with real-time bonuses
   * @param {object} order - Order details
   * @param {object} deliveryTime - When the delivery was completed (optional)
   * @returns {object} - Earnings breakdown
   */
  calculateDeliveryEarnings(order, deliveryTime = null) {
    // Calculate subtotal from order items (correct way)
    const subtotal = order.items?.reduce((total, item) => {
      const itemPrice = item.price || item.product?.price || 0;
      return total + (itemPrice * item.quantity);
    }, 0) || 0;
    
    // Use subtotal to determine if delivery is free (not totalAmount which includes delivery fee)
    const orderAmount = subtotal;
    const isFreeDelivery = orderAmount >= EARNINGS_POLICY.FREE_DELIVERY_THRESHOLD;
    
    // Base earnings - CORRECT POLICY IMPLEMENTATION
    const baseEarnings = isFreeDelivery 
      ? EARNINGS_POLICY.PARTNER_EARNINGS.FREE_DELIVERY  // ₹25 for free delivery orders
      : EARNINGS_POLICY.PARTNER_EARNINGS.PAID_DELIVERY; // ₹30 for paid delivery orders

    // Calculate real-time bonuses based on delivery time
    const bonuses = this.calculateRealTimeBonuses(deliveryTime || order.deliveredAt || new Date());
    const totalBonuses = Object.values(bonuses).reduce((sum, bonus) => sum + (bonus || 0), 0);
    
    const totalEarnings = baseEarnings + totalBonuses;

    // Customer payment
    const customerPaid = isFreeDelivery ? 0 : EARNINGS_POLICY.DELIVERY_FEE;
    
    // Grocito payment to partner (for free delivery orders)
    const grocitoPaid = isFreeDelivery ? EARNINGS_POLICY.PARTNER_EARNINGS.FREE_DELIVERY : 0;
    
    // Grocito revenue/cost
    const grocitoRevenue = isFreeDelivery 
      ? -EARNINGS_POLICY.PARTNER_EARNINGS.FREE_DELIVERY  // Grocito pays ₹25 (cost)
      : (EARNINGS_POLICY.DELIVERY_FEE - EARNINGS_POLICY.PARTNER_EARNINGS.PAID_DELIVERY); // Grocito keeps ₹10 (profit)

    return {
      orderId: order.id,
      orderAmount,
      deliveryType: isFreeDelivery ? 'FREE_DELIVERY' : 'PAID_DELIVERY',
      baseEarnings,
      bonuses,
      totalBonuses,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      customerPaid,
      grocitoPaid,
      grocitoRevenue,
      timestamp: deliveryTime || order.deliveredAt || new Date().toISOString(),
      bonusBreakdown: this.formatBonusBreakdown(bonuses)
    };
  }

  /**
   * Calculate real-time bonuses based on delivery time
   * @param {string|Date} deliveryTime - When the delivery was completed
   * @returns {object} - Bonus breakdown
   */
  calculateRealTimeBonuses(deliveryTime) {
    const deliveryDate = new Date(deliveryTime);
    const hour = deliveryDate.getHours();
    const day = deliveryDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    const bonuses = {};

    // Peak hour bonus (7-10 AM, 6-9 PM)
    if ((hour >= 7 && hour < 10) || (hour >= 18 && hour < 21)) {
      bonuses.peakHour = EARNINGS_POLICY.BONUSES.PEAK_HOUR;
    }

    // Weekend bonus (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) {
      bonuses.weekend = EARNINGS_POLICY.BONUSES.WEEKEND;
    }

    return bonuses;
  }

  /**
   * Format bonus breakdown for display
   * @param {object} bonuses - Bonus amounts
   * @returns {string} - Formatted bonus text
   */
  formatBonusBreakdown(bonuses) {
    const bonusTexts = [];
    
    if (bonuses.peakHour) {
      bonusTexts.push(`Peak Hour: +₹${bonuses.peakHour}`);
    }
    
    if (bonuses.weekend) {
      bonusTexts.push(`Weekend: +₹${bonuses.weekend}`);
    }
    
    return bonusTexts.join(', ') || 'No bonuses';
  }

  /**
   * Calculate daily earnings summary with real-time bonuses
   * @param {Array} deliveries - Array of completed deliveries
   * @returns {object} - Daily earnings summary
   */
  calculateDailyEarnings(deliveries) {
    let totalEarnings = 0;
    let totalDeliveries = deliveries.length;
    let freeDeliveries = 0;
    let paidDeliveries = 0;
    let totalBonuses = 0;
    let totalBaseEarnings = 0;
    let peakHourDeliveries = 0;
    let weekendDeliveries = 0;

    const earningsBreakdown = deliveries.map(delivery => {
      const earnings = this.calculateDeliveryEarnings(delivery);
      totalEarnings += earnings.totalEarnings;
      totalBonuses += earnings.totalBonuses;
      totalBaseEarnings += earnings.baseEarnings;
      
      if (earnings.deliveryType === 'FREE_DELIVERY') {
        freeDeliveries++;
      } else {
        paidDeliveries++;
      }

      // Count bonus deliveries
      if (earnings.bonuses.peakHour) {
        peakHourDeliveries++;
      }
      if (earnings.bonuses.weekend) {
        weekendDeliveries++;
      }
      
      return earnings;
    });

    // Check for daily target bonus (12+ deliveries = ₹80 bonus)
    const dailyTargetBonus = totalDeliveries >= 12 ? EARNINGS_POLICY.BONUSES.DAILY_TARGET : 0;
    const dailyTargetAchieved = totalDeliveries >= 12;
    
    // Add daily target bonus to total earnings
    const finalTotalEarnings = totalEarnings + dailyTargetBonus;

    return {
      date: new Date().toISOString().split('T')[0],
      totalDeliveries,
      freeDeliveries,
      paidDeliveries,
      peakHourDeliveries,
      weekendDeliveries,
      totalEarnings: parseFloat(finalTotalEarnings.toFixed(2)),
      totalBaseEarnings: parseFloat(totalBaseEarnings.toFixed(2)),
      totalBonuses: parseFloat((totalBonuses + dailyTargetBonus).toFixed(2)),
      dailyTargetBonus,
      dailyTargetAchieved,
      deliveriesNeededForTarget: Math.max(0, 12 - totalDeliveries),
      averageEarningsPerDelivery: totalDeliveries > 0 ? parseFloat((finalTotalEarnings / totalDeliveries).toFixed(2)) : 0,
      earningsBreakdown,
      bonusBreakdown: {
        peakHour: peakHourDeliveries * EARNINGS_POLICY.BONUSES.PEAK_HOUR,
        weekend: weekendDeliveries * EARNINGS_POLICY.BONUSES.WEEKEND,
        dailyTarget: dailyTargetBonus
      }
    };
  }

  /**
   * Calculate weekly earnings summary
   * @param {Array} weeklyDeliveries - Array of daily delivery summaries
   * @returns {object} - Weekly earnings summary
   */
  calculateWeeklyEarnings(weeklyDeliveries) {
    const totalDeliveries = weeklyDeliveries.reduce((sum, day) => sum + day.totalDeliveries, 0);
    const totalEarnings = weeklyDeliveries.reduce((sum, day) => sum + day.totalEarnings, 0);
    
    // Check for weekly target bonus
    const weeklyTargetBonus = totalDeliveries >= 80 ? EARNINGS_POLICY.BONUSES.WEEKLY_TARGET : 0;
    const finalEarnings = totalEarnings + weeklyTargetBonus;

    return {
      weekStart: this.getWeekStart(),
      weekEnd: this.getWeekEnd(),
      totalDeliveries,
      totalEarnings: parseFloat(finalEarnings.toFixed(2)),
      weeklyTargetBonus,
      dailyBreakdown: weeklyDeliveries,
      averagePerDay: parseFloat((finalEarnings / 7).toFixed(2))
    };
  }

  /**
   * Calculate monthly earnings summary
   * @param {Array} monthlyDeliveries - Array of daily delivery summaries
   * @returns {object} - Monthly earnings summary
   */
  calculateMonthlyEarnings(monthlyDeliveries) {
    const totalDeliveries = monthlyDeliveries.reduce((sum, day) => sum + day.totalDeliveries, 0);
    const totalEarnings = monthlyDeliveries.reduce((sum, day) => sum + day.totalEarnings, 0);
    
    // Check for monthly target bonus
    const monthlyTargetBonus = totalDeliveries >= 320 ? EARNINGS_POLICY.BONUSES.MONTHLY_TARGET : 0;
    const finalEarnings = totalEarnings + monthlyTargetBonus;

    return {
      month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      totalDeliveries,
      totalEarnings: parseFloat(finalEarnings.toFixed(2)),
      monthlyTargetBonus,
      dailyBreakdown: monthlyDeliveries,
      averagePerDay: parseFloat((finalEarnings / new Date().getDate()).toFixed(2))
    };
  }

  /**
   * Get real-time earnings projection
   * @param {number} currentDeliveries - Current deliveries today
   * @param {number} currentEarnings - Current earnings today
   * @returns {object} - Earnings projection
   */
  getEarningsProjection(currentDeliveries, currentEarnings) {
    const hoursWorked = this.getHoursWorkedToday();
    const deliveriesPerHour = hoursWorked > 0 ? currentDeliveries / hoursWorked : 0;
    const earningsPerHour = hoursWorked > 0 ? currentEarnings / hoursWorked : 0;

    // Project for 8-hour workday
    const projectedDeliveries = Math.round(deliveriesPerHour * 8);
    const projectedEarnings = parseFloat((earningsPerHour * 8).toFixed(2));

    // Check if daily target will be met
    const willMeetDailyTarget = projectedDeliveries >= 12;
    const projectedWithBonus = willMeetDailyTarget 
      ? projectedEarnings + EARNINGS_POLICY.BONUSES.DAILY_TARGET 
      : projectedEarnings;

    return {
      currentDeliveries,
      currentEarnings,
      hoursWorked,
      deliveriesPerHour: parseFloat(deliveriesPerHour.toFixed(1)),
      earningsPerHour: parseFloat(earningsPerHour.toFixed(2)),
      projectedDeliveries,
      projectedEarnings: parseFloat(projectedWithBonus.toFixed(2)),
      willMeetDailyTarget,
      deliveriesNeededForTarget: Math.max(0, 12 - currentDeliveries)
    };
  }

  /**
   * Get bonus information for current conditions
   * @returns {object} - Available bonuses
   */
  getCurrentBonuses() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    const bonuses = {};

    // Peak hour bonus (7-10 AM, 6-9 PM)
    if ((hour >= 7 && hour < 10) || (hour >= 18 && hour < 21)) {
      bonuses.peakHour = EARNINGS_POLICY.BONUSES.PEAK_HOUR;
    }

    // Weekend bonus (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) {
      bonuses.weekend = EARNINGS_POLICY.BONUSES.WEEKEND;
    }

    // Weather bonus (would need weather API integration)
    // For now, this would be manually triggered by admin
    
    return bonuses;
  }

  /**
   * Helper method to get hours worked today
   * @returns {number} - Hours worked
   */
  getHoursWorkedToday() {
    // This would typically come from login/logout tracking
    // For now, calculate from current time assuming 9 AM start
    const now = new Date();
    const startHour = 9;
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHour < startHour) return 0;
    
    return (currentHour - startHour) + (currentMinutes / 60);
  }

  /**
   * Helper method to get week start date
   * @returns {string} - Week start date
   */
  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  }

  /**
   * Helper method to get week end date
   * @returns {string} - Week end date
   */
  getWeekEnd() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + 6;
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  }

  /**
   * Format earnings for display
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted amount
   */
  formatEarnings(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
  }

  /**
   * Get policy information
   * @returns {object} - Policy details
   */
  getPolicyInfo() {
    return EARNINGS_POLICY;
  }
}

// Export singleton instance
export const earningsService = new EarningsService();
export default earningsService;