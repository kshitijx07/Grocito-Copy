package com.example.Grocito.Controller;

import com.example.Grocito.Services.OrderAssignmentService;
import com.example.Grocito.Services.DeliveryPartnerAuthService;
import com.example.Grocito.Entity.Order;
import com.example.Grocito.Entity.DeliveryPartnerAuth;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/delivery-partner-dashboard")
@CrossOrigin(origins = "*")
public class DeliveryPartnerDashboardController {
    private final Logger logger = LoggerFactory.getLogger(DeliveryPartnerDashboardController.class);

    @Autowired
    private OrderAssignmentService orderAssignmentService;
    
    @Autowired
    private DeliveryPartnerAuthService authService;

    /**
     * Get dashboard data for delivery partner
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            logger.info("Fetching dashboard data for partner: {}", partnerId);
            
            Map<String, Object> dashboardData = orderAssignmentService.getDashboardData(partnerId);
            
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            logger.error("Error fetching dashboard data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch dashboard data: " + e.getMessage()));
        }
    }

    /**
     * Toggle delivery partner availability
     */
    @PostMapping("/toggle-availability")
    public ResponseEntity<?> toggleAvailability(@RequestBody Map<String, Boolean> request, 
                                              HttpServletRequest httpRequest) {
        try {
            Long partnerId = getPartnerIdFromToken(httpRequest);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            Boolean isAvailable = request.get("isAvailable");
            if (isAvailable == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "isAvailable field is required"));
            }

            logger.info("Partner {} toggling availability to: {}", partnerId, isAvailable);
            
            DeliveryPartnerAuth updatedPartner = orderAssignmentService.updateAvailability(partnerId, isAvailable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Availability updated successfully");
            response.put("isAvailable", isAvailable);
            response.put("partner", updatedPartner);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error toggling availability: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update availability: " + e.getMessage()));
        }
    }

    /**
     * Accept an available order
     */
    @PostMapping("/accept-order/{orderId}")
    public ResponseEntity<?> acceptOrder(@PathVariable Long orderId, HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            logger.info("Partner {} attempting to accept order {}", partnerId, orderId);
            
            boolean assigned = orderAssignmentService.assignOrderToPartner(orderId, partnerId);
            
            if (assigned) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Order accepted successfully");
                response.put("orderId", orderId);
                response.put("partnerId", partnerId);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Order is no longer available or you're not eligible to accept it"));
            }
        } catch (Exception e) {
            logger.error("Error accepting order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to accept order: " + e.getMessage()));
        }
    }

    /**
     * Update order status (pickup, out for delivery, delivered)
     */
    @PutMapping("/update-order-status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, 
                                             @RequestBody Map<String, String> request,
                                             HttpServletRequest httpRequest) {
        try {
            Long partnerId = getPartnerIdFromToken(httpRequest);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            // Validate status
            List<String> validStatuses = List.of("PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED");
            if (!validStatuses.contains(newStatus)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid status. Valid statuses: " + validStatuses));
            }

            logger.info("Partner {} updating order {} status to {}", partnerId, orderId, newStatus);
            
            Order updatedOrder = orderAssignmentService.updateOrderStatus(orderId, newStatus, partnerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order status updated successfully");
            response.put("order", updatedOrder);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update order status: " + e.getMessage()));
        }
    }

    /**
     * Get available orders for partner's pincode
     */
    @GetMapping("/available-orders")
    public ResponseEntity<?> getAvailableOrders(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            // Get partner's pincode
            Optional<DeliveryPartnerAuth> partnerOpt = authService.getAuthRecordById(partnerId, null, null);
            if (!partnerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Partner not found"));
            }

            String pincode = partnerOpt.get().getPincode();
            List<Order> availableOrders = orderAssignmentService.getPendingOrdersForPincode(pincode);
            
            logger.info("Found {} available orders for partner {} in pincode {}", 
                       availableOrders.size(), partnerId, pincode);
            
            return ResponseEntity.ok(availableOrders);
        } catch (Exception e) {
            logger.error("Error fetching available orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch available orders: " + e.getMessage()));
        }
    }

    /**
     * Get partner's assigned orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            List<Order> myOrders = orderAssignmentService.getAssignedOrdersForPartner(partnerId);
            
            logger.info("Found {} assigned orders for partner {}", myOrders.size(), partnerId);
            
            return ResponseEntity.ok(myOrders);
        } catch (Exception e) {
            logger.error("Error fetching partner orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    /**
     * Get partner statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            Map<String, Object> stats = orderAssignmentService.getPartnerStats(partnerId);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching partner stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch stats: " + e.getMessage()));
        }
    }

    /**
     * Get completed orders (delivered/cancelled)
     */
    @GetMapping("/completed-orders")
    public ResponseEntity<?> getCompletedOrders(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            List<Order> completedOrders = orderAssignmentService.getCompletedOrdersForPartner(partnerId);
            
            logger.info("Found {} completed orders for partner {}", completedOrders.size(), partnerId);
            
            return ResponseEntity.ok(completedOrders);
        } catch (Exception e) {
            logger.error("Error fetching completed orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch completed orders: " + e.getMessage()));
        }
    }

    /**
     * Migrate existing orders to add earnings data
     */
    @PostMapping("/migrate-earnings")
    public ResponseEntity<?> migrateEarnings(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            int updatedOrders = orderAssignmentService.migrateExistingOrdersEarnings();
            
            return ResponseEntity.ok(Map.of(
                "message", "Earnings migration completed", 
                "updatedOrders", updatedOrders
            ));
        } catch (Exception e) {
            logger.error("Error migrating earnings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to migrate earnings: " + e.getMessage()));
        }
    }

    /**
     * Sync delivery partner data between tables
     */
    @PostMapping("/sync-partners")
    public ResponseEntity<?> syncPartners(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            int syncedPartners = orderAssignmentService.syncDeliveryPartnerTables();
            
            return ResponseEntity.ok(Map.of(
                "message", "Partner sync completed", 
                "syncedPartners", syncedPartners
            ));
        } catch (Exception e) {
            logger.error("Error syncing partners: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to sync partners: " + e.getMessage()));
        }
    }

    /**
     * Keep partner alive (heartbeat)
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(HttpServletRequest request) {
        try {
            Long partnerId = getPartnerIdFromToken(request);
            if (partnerId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing authentication token"));
            }

            orderAssignmentService.keepPartnerAlive(partnerId);
            
            return ResponseEntity.ok(Map.of("message", "Heartbeat received", "timestamp", System.currentTimeMillis()));
        } catch (Exception e) {
            logger.error("Error processing heartbeat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process heartbeat: " + e.getMessage()));
        }
    }

    /**
     * Extract partner ID from delivery partner token
     */
    private Long getPartnerIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // Parse delivery partner token format: dp-token-{partnerId}-{timestamp}
            if (token.startsWith("dp-token-")) {
                try {
                    String[] parts = token.split("-");
                    if (parts.length >= 3) {
                        return Long.parseLong(parts[2]);
                    }
                } catch (NumberFormatException e) {
                    logger.warn("Invalid partner token format: {}", token);
                }
            }
        }
        
        return null;
    }
}