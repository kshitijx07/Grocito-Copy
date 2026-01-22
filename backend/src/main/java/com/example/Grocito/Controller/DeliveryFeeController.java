package com.example.Grocito.Controller;

import com.example.Grocito.service.DeliveryFeeService;
import com.example.Grocito.service.DeliveryFeeService.DeliveryFeeCalculation;
import com.example.Grocito.service.DeliveryFeeService.PartnerEarnings;
import com.example.Grocito.service.DeliveryFeeService.DeliveryPolicy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-fee")
@CrossOrigin(origins = "*")
public class DeliveryFeeController {

    @Autowired
    private DeliveryFeeService deliveryFeeService;

    /**
     * Calculate delivery fee for an order
     */
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateDeliveryFee(@RequestBody Map<String, Object> request) {
        try {
            BigDecimal orderAmount = new BigDecimal(request.get("orderAmount").toString());
            DeliveryFeeCalculation calculation = deliveryFeeService.calculateDeliveryFee(orderAmount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderAmount", calculation.getOrderAmount());
            response.put("deliveryFee", calculation.getDeliveryFee());
            response.put("totalAmount", calculation.getTotalAmount());
            response.put("isFreeDelivery", calculation.isFreeDelivery());
            response.put("savings", calculation.getSavings());
            response.put("amountNeededForFreeDelivery", calculation.getAmountNeededForFreeDelivery());
            response.put("displayText", calculation.isFreeDelivery() ? "FREE" : "₹" + calculation.getDeliveryFee());
            response.put("savingsText", calculation.isFreeDelivery() ? 
                "You saved ₹" + calculation.getSavings() + " on delivery!" : null);
            response.put("promotionText", calculation.getAmountNeededForFreeDelivery().compareTo(BigDecimal.ZERO) > 0 ? 
                "Add ₹" + calculation.getAmountNeededForFreeDelivery() + " more for FREE delivery!" : null);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid order amount");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Calculate partner earnings for a delivery
     */
    @PostMapping("/partner-earnings")
    public ResponseEntity<Map<String, Object>> calculatePartnerEarnings(@RequestBody Map<String, Object> request) {
        try {
            BigDecimal orderAmount = new BigDecimal(request.get("orderAmount").toString());
            BigDecimal bonuses = request.containsKey("bonuses") ? 
                new BigDecimal(request.get("bonuses").toString()) : BigDecimal.ZERO;
            
            PartnerEarnings earnings = deliveryFeeService.calculatePartnerEarnings(orderAmount, bonuses);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderAmount", earnings.getOrderAmount());
            response.put("deliveryType", earnings.getDeliveryType());
            response.put("baseEarnings", earnings.getBaseEarnings());
            response.put("totalBonuses", earnings.getTotalBonuses());
            response.put("totalEarnings", earnings.getTotalEarnings());
            response.put("customerPaid", earnings.getCustomerPaid());
            response.put("grocitoPaid", earnings.getGrocitoPaid());
            response.put("grocitoRevenue", earnings.getGrocitoRevenue());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get delivery policy information
     */
    @GetMapping("/policy")
    public ResponseEntity<Map<String, Object>> getDeliveryPolicy() {
        DeliveryPolicy policy = deliveryFeeService.getPolicyInfo();
        
        Map<String, Object> response = new HashMap<>();
        response.put("freeDeliveryThreshold", policy.getFreeDeliveryThreshold());
        response.put("deliveryFee", policy.getDeliveryFee());
        response.put("partnerEarnings", Map.of(
            "paidDelivery", policy.getPartnerEarningsPaid(),
            "freeDelivery", policy.getPartnerEarningsFree()
        ));
        response.put("partnerSharePercentage", 75);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Calculate bulk earnings for multiple deliveries (for partner dashboard)
     */
    @PostMapping("/bulk-earnings")
    public ResponseEntity<Map<String, Object>> calculateBulkEarnings(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> deliveries = 
                (java.util.List<Map<String, Object>>) request.get("deliveries");
            
            BigDecimal totalEarnings = BigDecimal.ZERO;
            int totalDeliveries = deliveries.size();
            int freeDeliveries = 0;
            int paidDeliveries = 0;
            BigDecimal totalBonuses = BigDecimal.ZERO;
            BigDecimal totalBaseEarnings = BigDecimal.ZERO;
            
            java.util.List<Map<String, Object>> earningsBreakdown = new java.util.ArrayList<>();
            
            for (Map<String, Object> delivery : deliveries) {
                BigDecimal orderAmount = new BigDecimal(delivery.get("orderAmount").toString());
                BigDecimal bonuses = delivery.containsKey("bonuses") ? 
                    new BigDecimal(delivery.get("bonuses").toString()) : BigDecimal.ZERO;
                
                PartnerEarnings earnings = deliveryFeeService.calculatePartnerEarnings(orderAmount, bonuses);
                
                totalEarnings = totalEarnings.add(earnings.getTotalEarnings());
                totalBonuses = totalBonuses.add(earnings.getTotalBonuses());
                totalBaseEarnings = totalBaseEarnings.add(earnings.getBaseEarnings());
                
                if ("FREE_DELIVERY".equals(earnings.getDeliveryType())) {
                    freeDeliveries++;
                } else {
                    paidDeliveries++;
                }
                
                Map<String, Object> earningDetail = new HashMap<>();
                earningDetail.put("orderId", delivery.get("orderId"));
                earningDetail.put("orderAmount", earnings.getOrderAmount());
                earningDetail.put("deliveryType", earnings.getDeliveryType());
                earningDetail.put("baseEarnings", earnings.getBaseEarnings());
                earningDetail.put("totalBonuses", earnings.getTotalBonuses());
                earningDetail.put("totalEarnings", earnings.getTotalEarnings());
                earningsBreakdown.add(earningDetail);
            }
            
            // Check for daily target bonus (12+ deliveries)
            BigDecimal dailyTargetBonus = totalDeliveries >= 12 ? new BigDecimal("80.00") : BigDecimal.ZERO;
            totalEarnings = totalEarnings.add(dailyTargetBonus);
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalDeliveries", totalDeliveries);
            response.put("freeDeliveries", freeDeliveries);
            response.put("paidDeliveries", paidDeliveries);
            response.put("totalEarnings", totalEarnings);
            response.put("totalBaseEarnings", totalBaseEarnings);
            response.put("totalBonuses", totalBonuses.add(dailyTargetBonus));
            response.put("dailyTargetBonus", dailyTargetBonus);
            response.put("averageEarningsPerDelivery", 
                totalDeliveries > 0 ? totalEarnings.divide(new BigDecimal(totalDeliveries), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
            response.put("earningsBreakdown", earningsBreakdown);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid deliveries data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}