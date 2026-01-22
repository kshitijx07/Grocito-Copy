/**
 * Unified Earnings Calculator
 * Ensures consistent earnings calculations across Dashboard, Orders, and Earnings pages
 */

export const EARNINGS_POLICY = {
  FREE_DELIVERY_THRESHOLD: 199,
  DELIVERY_FEE: 40,
  PARTNER_EARNINGS: {
    PAID_DELIVERY: 30, // 75% of ₹40
    FREE_DELIVERY: 25, // Paid by Grocito
  },
  BONUSES: {
    PEAK_HOUR: 5,
    WEEKEND: 3,
    DAILY_TARGET: 80,
    DAILY_TARGET_THRESHOLD: 12,
  },
};

/**
 * Calculate earnings for a single order with real-time bonuses
 * @param {object} order - Order details
 * @returns {object} - Earnings breakdown
 */
export const calculateOrderEarnings = (order) => {
  // Calculate subtotal from order items
  const subtotal =
    order.items?.reduce((total, item) => {
      const itemPrice = item.price || item.product?.price || 0;
      return total + itemPrice * item.quantity;
    }, 0) || 0;

  // Determine delivery type and base earnings
  const isFreeDelivery = subtotal >= EARNINGS_POLICY.FREE_DELIVERY_THRESHOLD;
  const baseEarnings = isFreeDelivery
    ? EARNINGS_POLICY.PARTNER_EARNINGS.FREE_DELIVERY // ₹25 for free delivery orders
    : EARNINGS_POLICY.PARTNER_EARNINGS.PAID_DELIVERY; // ₹30 for paid delivery orders

  // Calculate real-time bonuses based on delivery time
  const deliveryTime = new Date(
    order.deliveredAt || order.orderTime || new Date()
  );
  const bonuses = calculateRealTimeBonuses(deliveryTime);
  const totalBonuses = Object.values(bonuses).reduce(
    (sum, bonus) => sum + (bonus || 0),
    0
  );

  const totalEarnings = baseEarnings + totalBonuses;

  return {
    orderId: order.id,
    orderAmount: subtotal,
    deliveryType: isFreeDelivery ? "FREE_DELIVERY" : "PAID_DELIVERY",
    baseEarnings,
    bonuses,
    totalBonuses,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    deliveryTime: deliveryTime.toISOString(),
    bonusBreakdown: formatBonusBreakdown(bonuses),
  };
};

/**
 * Calculate real-time bonuses based on delivery time
 * @param {Date} deliveryTime - When the delivery was completed
 * @returns {object} - Bonus breakdown
 */
export const calculateRealTimeBonuses = (deliveryTime) => {
  const deliveryDate = new Date(deliveryTime);
  const hour = deliveryDate.getHours();
  const day = deliveryDate.getDay(); // 0 = Sunday, 6 = Saturday

  const bonuses = {};

  // Peak hour bonus (7-10 AM, 6-9 PM) - REAL TIME CHECK
  if ((hour >= 7 && hour < 10) || (hour >= 18 && hour < 21)) {
    bonuses.peakHour = EARNINGS_POLICY.BONUSES.PEAK_HOUR;
  }

  // Weekend bonus (Saturday = 6, Sunday = 0) - REAL TIME CHECK
  if (day === 0 || day === 6) {
    bonuses.weekend = EARNINGS_POLICY.BONUSES.WEEKEND;
  }

  return bonuses;
};

/**
 * Format bonus breakdown for display
 * @param {object} bonuses - Bonus amounts
 * @returns {string} - Formatted bonus text
 */
export const formatBonusBreakdown = (bonuses) => {
  const bonusTexts = [];

  if (bonuses.peakHour) {
    bonusTexts.push(`Peak Hour: +₹${bonuses.peakHour}`);
  }

  if (bonuses.weekend) {
    bonusTexts.push(`Weekend: +₹${bonuses.weekend}`);
  }

  return bonusTexts.join(", ") || "No bonuses";
};

/**
 * Calculate daily earnings summary with all bonuses
 * @param {Array} deliveries - Array of completed deliveries
 * @returns {object} - Daily earnings summary
 */
export const calculateDailyEarnings = (deliveries) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log(
    "calculateDailyEarnings - Today:",
    today.toISOString(),
    "Tomorrow:",
    tomorrow.toISOString()
  );
  console.log("Total deliveries to check:", deliveries.length);

  const todayDeliveries = deliveries.filter((delivery) => {
    const deliveryDate = new Date(delivery.deliveredAt || delivery.orderTime);
    const isToday = deliveryDate >= today && deliveryDate < tomorrow;
    console.log(
      "Delivery:",
      delivery.id,
      "Date:",
      deliveryDate.toISOString(),
      "IsToday:",
      isToday
    );
    return isToday;
  });

  console.log("Today deliveries found:", todayDeliveries.length);

  let totalEarnings = 0;
  let totalBonuses = 0;
  let totalBaseEarnings = 0;
  let freeDeliveries = 0;
  let paidDeliveries = 0;
  let peakHourDeliveries = 0;
  let weekendDeliveries = 0;

  const processedDeliveries = todayDeliveries.map((delivery) => {
    const earnings = calculateOrderEarnings(delivery);

    totalEarnings += earnings.totalEarnings;
    totalBonuses += earnings.totalBonuses;
    totalBaseEarnings += earnings.baseEarnings;

    if (earnings.deliveryType === "FREE_DELIVERY") {
      freeDeliveries++;
    } else {
      paidDeliveries++;
    }

    if (earnings.bonuses.peakHour) {
      peakHourDeliveries++;
    }
    if (earnings.bonuses.weekend) {
      weekendDeliveries++;
    }

    return earnings;
  });

  // Check for daily target bonus (12+ deliveries = ₹80 bonus)
  const dailyTargetBonus =
    todayDeliveries.length >= EARNINGS_POLICY.BONUSES.DAILY_TARGET_THRESHOLD
      ? EARNINGS_POLICY.BONUSES.DAILY_TARGET
      : 0;
  const dailyTargetAchieved =
    todayDeliveries.length >= EARNINGS_POLICY.BONUSES.DAILY_TARGET_THRESHOLD;

  // Add daily target bonus to total earnings
  const finalTotalEarnings = totalEarnings + dailyTargetBonus;

  return {
    date: today,
    totalDeliveries: todayDeliveries.length,
    freeDeliveries,
    paidDeliveries,
    peakHourDeliveries,
    weekendDeliveries,
    totalEarnings: parseFloat(finalTotalEarnings.toFixed(2)),
    totalBaseEarnings: parseFloat(totalBaseEarnings.toFixed(2)),
    totalBonuses: parseFloat((totalBonuses + dailyTargetBonus).toFixed(2)),
    dailyTargetBonus,
    dailyTargetAchieved,
    deliveriesNeededForTarget: Math.max(
      0,
      EARNINGS_POLICY.BONUSES.DAILY_TARGET_THRESHOLD - todayDeliveries.length
    ),
    averageEarningsPerDelivery:
      todayDeliveries.length > 0
        ? parseFloat((finalTotalEarnings / todayDeliveries.length).toFixed(2))
        : 0,
    processedDeliveries,
    bonusBreakdown: {
      peakHour: peakHourDeliveries * EARNINGS_POLICY.BONUSES.PEAK_HOUR,
      weekend: weekendDeliveries * EARNINGS_POLICY.BONUSES.WEEKEND,
      dailyTarget: dailyTargetBonus,
    },
  };
};

/**
 * Calculate weekly earnings summary
 * @param {Array} deliveries - Array of completed deliveries
 * @returns {object} - Weekly earnings summary
 */
export const calculateWeeklyEarnings = (deliveries) => {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  console.log(
    "calculateWeeklyEarnings - WeekAgo:",
    weekAgo.toISOString(),
    "Today:",
    today.toISOString()
  );

  const weekDeliveries = deliveries.filter((delivery) => {
    const deliveryDate = new Date(delivery.deliveredAt || delivery.orderTime);
    const isThisWeek = deliveryDate >= weekAgo;
    console.log(
      "Weekly Delivery:",
      delivery.id,
      "Date:",
      deliveryDate.toISOString(),
      "IsThisWeek:",
      isThisWeek
    );
    return isThisWeek;
  });

  console.log("Week deliveries found:", weekDeliveries.length);

  let totalEarnings = 0;
  let totalBonuses = 0;
  let dailyTargetBonuses = 0;

  // Group deliveries by day to calculate daily target bonuses correctly
  const deliveriesByDay = {};

  weekDeliveries.forEach((delivery) => {
    const deliveryDate = new Date(delivery.deliveredAt || delivery.orderTime);
    const dayKey = deliveryDate.toDateString();

    if (!deliveriesByDay[dayKey]) {
      deliveriesByDay[dayKey] = [];
    }
    deliveriesByDay[dayKey].push(delivery);
  });

  // Calculate earnings for each day
  Object.keys(deliveriesByDay).forEach((dayKey) => {
    const dayDeliveries = deliveriesByDay[dayKey];
    let dayEarnings = 0;
    let dayBonuses = 0;

    dayDeliveries.forEach((delivery) => {
      const earnings = calculateOrderEarnings(delivery);
      dayEarnings += earnings.totalEarnings;
      dayBonuses += earnings.totalBonuses;
    });

    // Add daily target bonus if this day had 12+ deliveries
    if (
      dayDeliveries.length >= EARNINGS_POLICY.BONUSES.DAILY_TARGET_THRESHOLD
    ) {
      dailyTargetBonuses += EARNINGS_POLICY.BONUSES.DAILY_TARGET;
    }

    totalEarnings += dayEarnings;
    totalBonuses += dayBonuses;
  });

  // Add daily target bonuses to total
  totalEarnings += dailyTargetBonuses;
  totalBonuses += dailyTargetBonuses;

  console.log("Weekly earnings calculated:", {
    weekDeliveries: weekDeliveries.length,
    totalEarnings,
    dailyTargetBonuses,
  });

  return {
    totalDeliveries: weekDeliveries.length,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    totalBonuses: parseFloat(totalBonuses.toFixed(2)),
    averageEarningsPerDelivery:
      weekDeliveries.length > 0
        ? parseFloat((totalEarnings / weekDeliveries.length).toFixed(2))
        : 0,
  };
};

/**
 * Calculate total earnings from all deliveries
 * @param {Array} deliveries - Array of completed deliveries
 * @returns {object} - Total earnings summary
 */
export const calculateTotalEarnings = (deliveries) => {
  console.log("calculateTotalEarnings - Total deliveries:", deliveries.length);

  let totalEarnings = 0;
  let totalBonuses = 0;
  let dailyTargetBonuses = 0;

  // Group deliveries by day to calculate daily target bonuses correctly
  const deliveriesByDay = {};

  deliveries.forEach((delivery) => {
    const deliveryDate = new Date(delivery.deliveredAt || delivery.orderTime);
    const dayKey = deliveryDate.toDateString();

    if (!deliveriesByDay[dayKey]) {
      deliveriesByDay[dayKey] = [];
    }
    deliveriesByDay[dayKey].push(delivery);
  });

  // Calculate earnings for each day
  Object.keys(deliveriesByDay).forEach((dayKey) => {
    const dayDeliveries = deliveriesByDay[dayKey];
    let dayEarnings = 0;
    let dayBonuses = 0;

    dayDeliveries.forEach((delivery) => {
      const earnings = calculateOrderEarnings(delivery);
      dayEarnings += earnings.totalEarnings;
      dayBonuses += earnings.totalBonuses;
    });

    // Add daily target bonus if this day had 12+ deliveries
    if (
      dayDeliveries.length >= EARNINGS_POLICY.BONUSES.DAILY_TARGET_THRESHOLD
    ) {
      dailyTargetBonuses += EARNINGS_POLICY.BONUSES.DAILY_TARGET;
    }

    totalEarnings += dayEarnings;
    totalBonuses += dayBonuses;
  });

  // Add daily target bonuses to total
  totalEarnings += dailyTargetBonuses;
  totalBonuses += dailyTargetBonuses;

  console.log("Total earnings calculated:", {
    totalDeliveries: deliveries.length,
    totalEarnings,
    dailyTargetBonuses,
  });

  return {
    totalDeliveries: deliveries.length,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    totalBonuses: parseFloat(totalBonuses.toFixed(2)),
    averageEarningsPerDelivery:
      deliveries.length > 0
        ? parseFloat((totalEarnings / deliveries.length).toFixed(2))
        : 0,
  };
};

/**
 * Check if current time is peak hour
 * @returns {boolean} - True if current time is peak hour
 */
export const isCurrentlyPeakHour = () => {
  const now = new Date();
  const hour = now.getHours();
  return (hour >= 7 && hour < 10) || (hour >= 18 && hour < 21);
};

/**
 * Check if current day is weekend
 * @returns {boolean} - True if current day is weekend
 */
export const isCurrentlyWeekend = () => {
  const now = new Date();
  const day = now.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Get current bonus status
 * @returns {object} - Current bonus information
 */
export const getCurrentBonusStatus = () => {
  return {
    isPeakHour: isCurrentlyPeakHour(),
    isWeekend: isCurrentlyWeekend(),
    peakHourBonus: isCurrentlyPeakHour()
      ? EARNINGS_POLICY.BONUSES.PEAK_HOUR
      : 0,
    weekendBonus: isCurrentlyWeekend() ? EARNINGS_POLICY.BONUSES.WEEKEND : 0,
  };
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount
 */
export const formatCurrency = (amount) => {
  return `₹${parseFloat(amount || 0).toFixed(2)}`;
};
