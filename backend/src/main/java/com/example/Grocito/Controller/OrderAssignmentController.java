package com.example.Grocito.Controller;

import com.example.Grocito.Entity.OrderAssignment;
import com.example.Grocito.Services.OrderAssignmentService;
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
@RequestMapping("/api/order-assignments")
public class OrderAssignmentController {
    private final Logger logger;
    
    @Autowired
    private OrderAssignmentService orderAssignmentService;
    
    public OrderAssignmentController() {
        this.logger = LoggerFactory.getLogger(OrderAssignmentController.class);
    }
    
    /**
     * Automatically assign order to best available partner
     */
    @PostMapping("/assign-auto")
    public ResponseEntity<?> assignOrderAutomatically(@RequestBody Map<String, Long> requestData) {
        try {
            Long orderId = requestData.get("orderId");
            if (orderId == null) {
                return ResponseEntity.badRequest().body("Order ID is required");
            }
            
            logger.info("Auto-assigning order ID: {}", orderId);
            
            OrderAssignment assignment = orderAssignmentService.assignOrderAutomatically(orderId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
        } catch (Exception e) {
            logger.error("Error auto-assigning order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error assigning order: " + e.getMessage());
        }
    }
    
    /**
     * Manually assign order to specific partner
     */
    @PostMapping("/assign-manual")
    public ResponseEntity<?> assignOrderToPartner(@RequestBody Map<String, Long> requestData) {
        try {
            Long orderId = requestData.get("orderId");
            Long partnerId = requestData.get("partnerId");
            
            if (orderId == null || partnerId == null) {
                return ResponseEntity.badRequest().body("Both orderId and partnerId are required");
            }
            
            logger.info("Manually assigning order ID: {} to partner ID: {}", orderId, partnerId);
            
            OrderAssignment assignment = orderAssignmentService.assignOrderToPartnerNew(orderId, partnerId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
        } catch (Exception e) {
            logger.error("Error manually assigning order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error assigning order: " + e.getMessage());
        }
    }
    
    /**
     * Accept order assignment
     */
    @PutMapping("/{assignmentId}/accept")
    public ResponseEntity<?> acceptOrder(@PathVariable Long assignmentId, 
                                        @RequestBody Map<String, Long> requestData) {
        try {
            Long partnerId = requestData.get("partnerId");
            if (partnerId == null) {
                return ResponseEntity.badRequest().body("Partner ID is required");
            }
            
            logger.info("Partner ID: {} accepting assignment ID: {}", partnerId, assignmentId);
            
            OrderAssignment assignment = orderAssignmentService.acceptOrder(assignmentId, partnerId);
            
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            logger.error("Error accepting order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error accepting order: " + e.getMessage());
        }
    }
    
    /**
     * Reject order assignment
     */
    @PutMapping("/{assignmentId}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long assignmentId, 
                                        @RequestBody Map<String, Object> requestData) {
        try {
            Long partnerId = (Long) requestData.get("partnerId");
            String rejectionReason = (String) requestData.get("rejectionReason");
            
            if (partnerId == null) {
                return ResponseEntity.badRequest().body("Partner ID is required");
            }
            
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                rejectionReason = "No reason provided";
            }
            
            logger.info("Partner ID: {} rejecting assignment ID: {} with reason: {}", 
                       partnerId, assignmentId, rejectionReason);
            
            orderAssignmentService.rejectOrder(assignmentId, partnerId, rejectionReason);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error rejecting order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error rejecting order: " + e.getMessage());
        }
    }
    
    /**
     * Update order status during delivery
     */
    @PutMapping("/{assignmentId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long assignmentId, 
                                              @RequestBody Map<String, Object> requestData) {
        try {
            Long partnerId = (Long) requestData.get("partnerId");
            String newStatus = (String) requestData.get("status");
            
            if (partnerId == null || newStatus == null) {
                return ResponseEntity.badRequest().body("Both partnerId and status are required");
            }
            
            logger.info("Partner ID: {} updating assignment ID: {} to status: {}", 
                       partnerId, assignmentId, newStatus);
            
            OrderAssignment assignment = orderAssignmentService.updateOrderStatus(assignmentId, partnerId, newStatus);
            
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            logger.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating order status: " + e.getMessage());
        }
    }
    
    /**
     * Get assignments for a delivery partner
     */
    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<?> getPartnerAssignments(@PathVariable Long partnerId, 
                                                  @RequestParam(required = false) String status) {
        try {
            logger.info("Fetching assignments for partner ID: {} with status: {}", partnerId, status);
            
            List<OrderAssignment> assignments = orderAssignmentService.getPartnerAssignments(partnerId, status);
            
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            logger.error("Error fetching partner assignments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignments: " + e.getMessage());
        }
    }
    
    /**
     * Get assignment by order ID
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getAssignmentByOrderId(@PathVariable Long orderId) {
        try {
            logger.info("Fetching assignment for order ID: {}", orderId);
            
            Optional<OrderAssignment> assignmentOpt = orderAssignmentService.getAssignmentByOrderId(orderId);
            
            if (assignmentOpt.isPresent()) {
                return ResponseEntity.ok(assignmentOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching assignment by order ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignment: " + e.getMessage());
        }
    }
    
    /**
     * Get all assignments with filtering (admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllAssignments(@RequestParam(required = false) String status,
                                              @RequestParam(required = false) String pincode) {
        try {
            logger.info("Fetching all assignments with status: {} and pincode: {}", status, pincode);
            
            List<OrderAssignment> assignments = orderAssignmentService.getAllAssignments(status, pincode);
            
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            logger.error("Error fetching all assignments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignments: " + e.getMessage());
        }
    }
    
    /**
     * Get assignment by ID
     */
    @GetMapping("/{assignmentId}")
    public ResponseEntity<?> getAssignmentById(@PathVariable Long assignmentId) {
        try {
            logger.info("Fetching assignment with ID: {}", assignmentId);
            
            // This would typically use a service method to get by ID
            // For now, we'll use the existing methods
            List<OrderAssignment> allAssignments = orderAssignmentService.getAllAssignments(null, null);
            Optional<OrderAssignment> assignmentOpt = allAssignments.stream()
                    .filter(a -> a.getId().equals(assignmentId))
                    .findFirst();
            
            if (assignmentOpt.isPresent()) {
                return ResponseEntity.ok(assignmentOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching assignment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching assignment: " + e.getMessage());
        }
    }
    
    /**
     * Log customer call to delivery partner
     */
    @PostMapping("/{orderId}/call-log")
    public ResponseEntity<?> logCustomerCall(@PathVariable Long orderId, 
                                           @RequestBody Map<String, Object> callData) {
        try {
            String phoneNumber = (String) callData.get("phoneNumber");
            String timestamp = (String) callData.get("timestamp");
            
            logger.info("Logging customer call for order {} to phone {}", orderId, phoneNumber);
            
            // In a real implementation, you would save this to a call_logs table
            // For now, we'll just log it
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Call logged successfully");
            response.put("orderId", orderId);
            response.put("timestamp", timestamp);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error logging call: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error logging call: " + e.getMessage());
        }
    }
    
    /**
     * Debug endpoint to check all assignments in database
     */
    @GetMapping("/debug/all")
    public ResponseEntity<?> getAllAssignmentsDebug() {
        try {
            logger.info("Debug: Fetching all order assignments");
            
            List<OrderAssignment> allAssignments = orderAssignmentService.getAllAssignments(null, null);
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("totalAssignments", allAssignments.size());
            debugInfo.put("assignments", allAssignments);
            
            // Log each assignment for debugging
            for (OrderAssignment assignment : allAssignments) {
                logger.info("Assignment ID: {}, Order ID: {}, Partner ID: {}, Status: {}", 
                    assignment.getId(), 
                    assignment.getOrderId(), 
                    assignment.getPartnerId(), 
                    assignment.getStatus());
            }
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            logger.error("Error in debug endpoint: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Debug error: " + e.getMessage());
        }
    }
}