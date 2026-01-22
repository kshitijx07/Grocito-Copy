package com.example.Grocito.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Service for calculating delivery fees and partner earnings
 * 
 * Policy:
 * - Order Amount >= ₹199: FREE delivery (Partner gets ₹25 from Grocito)
 * - Order Amount < ₹199: ₹40 delivery fee (Partner gets ₹30, Grocito keeps ₹10)
 */
@Service
public class DeliveryFeeService {
    
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("199.00");
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("40.00");
    private static final BigDecimal PARTNER_EARNINGS_PAID = new BigDecimal("30.00");
    private static final BigDecimal PARTNER_EARNINGS_FREE = new BigDecimal("25.00");
    
    /**
     * Calculate delivery fee for an order
     */
    public DeliveryFeeCalculation calculateDeliveryFee(BigDecimal orderAmount) {
        boolean isFreeDelivery = orderAmount.compareTo(FREE_DELIVERY_THRESHOLD) >= 0;
        BigDecimal deliveryFee = isFreeDelivery ? BigDecimal.ZERO : DELIVERY_FEE;
        BigDecimal totalAmount = orderAmount.add(deliveryFee);
        BigDecimal savings = isFreeDelivery ? DELIVERY_FEE : BigDecimal.ZERO;
        BigDecimal amountNeededForFree = isFreeDelivery ? BigDecimal.ZERO : 
            FREE_DELIVERY_THRESHOLD.subtract(orderAmount).max(BigDecimal.ZERO);
        
        return new DeliveryFeeCalculation(
            orderAmount.setScale(2, RoundingMode.HALF_UP),
            deliveryFee.setScale(2, RoundingMode.HALF_UP),
            totalAmount.setScale(2, RoundingMode.HALF_UP),
            isFreeDelivery,
            savings.setScale(2, RoundingMode.HALF_UP),
            amountNeededForFree.setScale(2, RoundingMode.HALF_UP)
        );
    }
    
    /**
     * Calculate partner earnings for a delivery - CORRECT POLICY IMPLEMENTATION
     */
    public PartnerEarnings calculatePartnerEarnings(BigDecimal orderAmount, BigDecimal bonuses) {
        boolean isFreeDelivery = orderAmount.compareTo(FREE_DELIVERY_THRESHOLD) >= 0;
        
        // Base earnings - ₹25 for free delivery, ₹30 for paid delivery
        BigDecimal baseEarnings = isFreeDelivery ? PARTNER_EARNINGS_FREE : PARTNER_EARNINGS_PAID;
        BigDecimal totalBonuses = bonuses != null ? bonuses : BigDecimal.ZERO;
        BigDecimal totalEarnings = baseEarnings.add(totalBonuses);
        
        // Customer payment - ₹0 for free delivery, ₹40 for paid delivery
        BigDecimal customerPaid = isFreeDelivery ? BigDecimal.ZERO : DELIVERY_FEE;
        
        // Grocito payment to partner - ₹25 for free delivery, ₹0 for paid delivery
        BigDecimal grocitoPaid = isFreeDelivery ? PARTNER_EARNINGS_FREE : BigDecimal.ZERO;
        
        // Grocito revenue/cost - loses ₹25 on free delivery, gains ₹10 on paid delivery
        BigDecimal grocitoRevenue = isFreeDelivery ? 
            PARTNER_EARNINGS_FREE.negate() :  // -₹25 (cost)
            DELIVERY_FEE.subtract(PARTNER_EARNINGS_PAID); // +₹10 (profit)
        
        return new PartnerEarnings(
            orderAmount.setScale(2, RoundingMode.HALF_UP),
            isFreeDelivery ? "FREE_DELIVERY" : "PAID_DELIVERY",
            baseEarnings.setScale(2, RoundingMode.HALF_UP),
            totalBonuses.setScale(2, RoundingMode.HALF_UP),
            totalEarnings.setScale(2, RoundingMode.HALF_UP),
            customerPaid.setScale(2, RoundingMode.HALF_UP),
            grocitoPaid.setScale(2, RoundingMode.HALF_UP),
            grocitoRevenue.setScale(2, RoundingMode.HALF_UP)
        );
    }
    
    /**
     * Get policy information
     */
    public DeliveryPolicy getPolicyInfo() {
        return new DeliveryPolicy(
            FREE_DELIVERY_THRESHOLD,
            DELIVERY_FEE,
            PARTNER_EARNINGS_PAID,
            PARTNER_EARNINGS_FREE
        );
    }
    
    // Inner classes for return types
    public static class DeliveryFeeCalculation {
        private final BigDecimal orderAmount;
        private final BigDecimal deliveryFee;
        private final BigDecimal totalAmount;
        private final boolean isFreeDelivery;
        private final BigDecimal savings;
        private final BigDecimal amountNeededForFreeDelivery;
        
        public DeliveryFeeCalculation(BigDecimal orderAmount, BigDecimal deliveryFee, 
                                    BigDecimal totalAmount, boolean isFreeDelivery, 
                                    BigDecimal savings, BigDecimal amountNeededForFreeDelivery) {
            this.orderAmount = orderAmount;
            this.deliveryFee = deliveryFee;
            this.totalAmount = totalAmount;
            this.isFreeDelivery = isFreeDelivery;
            this.savings = savings;
            this.amountNeededForFreeDelivery = amountNeededForFreeDelivery;
        }
        
        // Getters
        public BigDecimal getOrderAmount() { return orderAmount; }
        public BigDecimal getDeliveryFee() { return deliveryFee; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public boolean isFreeDelivery() { return isFreeDelivery; }
        public BigDecimal getSavings() { return savings; }
        public BigDecimal getAmountNeededForFreeDelivery() { return amountNeededForFreeDelivery; }
    }
    
    public static class PartnerEarnings {
        private final BigDecimal orderAmount;
        private final String deliveryType;
        private final BigDecimal baseEarnings;
        private final BigDecimal totalBonuses;
        private final BigDecimal totalEarnings;
        private final BigDecimal customerPaid;
        private final BigDecimal grocitoPaid;
        private final BigDecimal grocitoRevenue;
        
        public PartnerEarnings(BigDecimal orderAmount, String deliveryType, 
                             BigDecimal baseEarnings, BigDecimal totalBonuses, 
                             BigDecimal totalEarnings, BigDecimal customerPaid, 
                             BigDecimal grocitoPaid, BigDecimal grocitoRevenue) {
            this.orderAmount = orderAmount;
            this.deliveryType = deliveryType;
            this.baseEarnings = baseEarnings;
            this.totalBonuses = totalBonuses;
            this.totalEarnings = totalEarnings;
            this.customerPaid = customerPaid;
            this.grocitoPaid = grocitoPaid;
            this.grocitoRevenue = grocitoRevenue;
        }
        
        // Getters
        public BigDecimal getOrderAmount() { return orderAmount; }
        public String getDeliveryType() { return deliveryType; }
        public BigDecimal getBaseEarnings() { return baseEarnings; }
        public BigDecimal getTotalBonuses() { return totalBonuses; }
        public BigDecimal getTotalEarnings() { return totalEarnings; }
        public BigDecimal getCustomerPaid() { return customerPaid; }
        public BigDecimal getGrocitoPaid() { return grocitoPaid; }
        public BigDecimal getGrocitoRevenue() { return grocitoRevenue; }
    }
    
    public static class DeliveryPolicy {
        private final BigDecimal freeDeliveryThreshold;
        private final BigDecimal deliveryFee;
        private final BigDecimal partnerEarningsPaid;
        private final BigDecimal partnerEarningsFree;
        
        public DeliveryPolicy(BigDecimal freeDeliveryThreshold, BigDecimal deliveryFee, 
                            BigDecimal partnerEarningsPaid, BigDecimal partnerEarningsFree) {
            this.freeDeliveryThreshold = freeDeliveryThreshold;
            this.deliveryFee = deliveryFee;
            this.partnerEarningsPaid = partnerEarningsPaid;
            this.partnerEarningsFree = partnerEarningsFree;
        }
        
        // Getters
        public BigDecimal getFreeDeliveryThreshold() { return freeDeliveryThreshold; }
        public BigDecimal getDeliveryFee() { return deliveryFee; }
        public BigDecimal getPartnerEarningsPaid() { return partnerEarningsPaid; }
        public BigDecimal getPartnerEarningsFree() { return partnerEarningsFree; }
    }
}