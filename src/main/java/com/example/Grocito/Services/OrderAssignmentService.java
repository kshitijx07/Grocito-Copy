package com.example.Grocito.Services;

import com.example.Grocito.Entity.Order;
import com.example.Grocito.Entity.DeliveryPartnerAuth;
import com.example.Grocito.Entity.DeliveryPartner;
import com.example.Grocito.Entity.OrderAssignment;
import com.example.Grocito.Repository.OrderRepository;
import com.example.Grocito.Repository.DeliveryPartnerAuthRepository;
import com.example.Grocito.Repository.DeliveryPartnerRepository;
import com.example.Grocito.Repository.OrderAssignmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class OrderAssignmentService {
    private final Logger logger = LoggerFactory.getLogger(OrderAssignmentService.class);
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private DeliveryPartnerAuthRepository deliveryPartnerRepository;
    
    // In-memory storage for real-time notifications (in production, use Redis or message queue)
    private final ConcurrentHashMap<String, List<Long>> availablePartnersByPincode = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, LocalDateTime> partnerLastSeen = new ConcurrentHashMap<>();
    
    /**
     * Update delivery partner availability status
     */
    @Transactional
    public DeliveryPartnerAuth updateAvailability(Long partnerId, boolean isAvailable) {
        logger.info("Updating availability for partner ID: {} to {}", partnerId, isAvailable);
        
        Optional<DeliveryPartnerAuth> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }
        
        DeliveryPartnerAuth partner = partnerOpt.get();
        
        // Only verified partners can be available
        if (!"VERIFIED".equals(partner.getVerificationStatus())) {
            throw new RuntimeException("Only verified partners can update availability");
        }
        
        // Update availability in database (we'll add this field to DeliveryPartnerAuth)
        partner.setUpdatedAt(LocalDateTime.now());
        DeliveryPartnerAuth updatedPartner = deliveryPartnerRepository.save(partner);
        
        // Update in-memory availability tracking
        String pincode = partner.getPincode();
        if (isAvailable) {
            availablePartnersByPincode.computeIfAbsent(pincode, k -> new CopyOnWriteArrayList<>()).add(partnerId);
            partnerLastSeen.put(partnerId, LocalDateTime.now());
            logger.info("Partner {} is now AVAILABLE in pincode {}", partnerId, pincode);
        } else {
            List<Long> partners = availablePartnersByPincode.get(pincode);
            if (partners != null) {
                partners.remove(partnerId);
            }
            partnerLastSeen.remove(partnerId);
            logger.info("Partner {} is now OFFLINE in pincode {}", partnerId, pincode);
        }
        
        return updatedPartner;
    }
    
    /**
     * Get available delivery partners for a pincode
     */
    public List<Long> getAvailablePartners(String pincode) {
        List<Long> partners = availablePartnersByPincode.getOrDefault(pincode, new CopyOnWriteArrayList<>());
        
        // Remove partners who haven't been seen in the last 5 minutes
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        partners.removeIf(partnerId -> {
            LocalDateTime lastSeen = partnerLastSeen.get(partnerId);
            return lastSeen == null || lastSeen.isBefore(cutoff);
        });
        
        return partners;
    }
    
    /**
     * Assign order to the first available delivery partner in the same pincode
     */
    @Transactional
    public boolean assignOrderToPartner(Long orderId, Long partnerId) {
        logger.info("Attempting to assign order {} to partner {}", orderId, partnerId);
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (!orderOpt.isPresent()) {
            throw new RuntimeException("Order not found with ID: " + orderId);
        }
        
        Optional<DeliveryPartnerAuth> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }
        
        Order order = orderOpt.get();
        DeliveryPartnerAuth partner = partnerOpt.get();
        
        // Check if order is still available for assignment
        if (!"PLACED".equals(order.getStatus())) {
            logger.warn("Order {} is no longer available for assignment. Current status: {}", orderId, order.getStatus());
            return false;
        }
        
        // Check if partner is in the same pincode
        if (!order.getPincode().equals(partner.getPincode())) {
            logger.warn("Partner {} pincode {} doesn't match order {} pincode {}", 
                       partnerId, partner.getPincode(), orderId, order.getPincode());
            return false;
        }
        
        // Check if partner is verified and available
        if (!"VERIFIED".equals(partner.getVerificationStatus())) {
            logger.warn("Partner {} is not verified", partnerId);
            return false;
        }
        
        // Check if partner already has 2 active orders (MAXIMUM LIMIT)
        long activeOrdersCount = orderRepository.countByDeliveryPartnerIdAndStatusIn(partnerId, 
                List.of("ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"));
        
        if (activeOrdersCount >= 2) {
            logger.warn("Partner {} already has {} active orders. Maximum limit is 2.", partnerId, activeOrdersCount);
            throw new RuntimeException("You already have 2 active orders. Please complete them before accepting new orders.");
        }
        
        // Calculate delivery fee and partner earning
        double deliveryFee = calculateDeliveryFee(order.getTotalAmount());
        double partnerEarning = calculatePartnerEarning(deliveryFee, order.getTotalAmount());
        
        // Assign the order
        order.setDeliveryPartner(partner);
        order.setStatus("ASSIGNED");
        order.setAssignedAt(LocalDateTime.now());
        order.setDeliveryFee(deliveryFee);
        order.setPartnerEarning(partnerEarning);
        orderRepository.save(order);
        
        // If partner now has 2 active orders, remove them from available list
        if (activeOrdersCount + 1 >= 2) {
            List<Long> availablePartners = availablePartnersByPincode.get(partner.getPincode());
            if (availablePartners != null) {
                availablePartners.remove(partnerId);
            }
            logger.info("Partner {} removed from available list (reached 2 active orders limit)", partnerId);
        }
        
        logger.info("Order {} successfully assigned to partner {} with earning ₹{}", orderId, partnerId, partnerEarning);
        return true;
    }
    
    /**
     * Calculate delivery fee based on order amount
     * Policy: Free delivery for orders >= ₹199, otherwise ₹40
     */
    private double calculateDeliveryFee(double orderAmount) {
        final double FREE_DELIVERY_THRESHOLD = 199.0;
        final double DELIVERY_FEE = 40.0;
        
        if (orderAmount >= FREE_DELIVERY_THRESHOLD) {
            logger.debug("Free delivery applied for order amount: ₹{}", orderAmount);
            return 0.0;
        } else {
            logger.debug("Delivery fee of ₹{} applied for order amount: ₹{}", DELIVERY_FEE, orderAmount);
            return DELIVERY_FEE;
        }
    }
    
    /**
     * Calculate partner earning from delivery
     * Policy: ₹25 for free delivery orders, ₹30 for paid delivery orders
     */
    private double calculatePartnerEarning(double deliveryFee, double orderAmount) {
        final double FREE_DELIVERY_PARTNER_EARNING = 25.0;
        final double PAID_DELIVERY_PARTNER_EARNING = 30.0;
        
        if (deliveryFee == 0.0) {
            // Free delivery - partner gets ₹25 from Grocito
            logger.debug("Partner earning for free delivery: ₹{}", FREE_DELIVERY_PARTNER_EARNING);
            return FREE_DELIVERY_PARTNER_EARNING;
        } else {
            // Paid delivery - partner gets ₹30 from ₹40 delivery fee
            logger.debug("Partner earning for paid delivery: ₹{}", PAID_DELIVERY_PARTNER_EARNING);
            return PAID_DELIVERY_PARTNER_EARNING;
        }
    }
    
    /**
     * Get pending orders for a specific pincode
     */
    public List<Order> getPendingOrdersForPincode(String pincode) {
        return orderRepository.findByStatusAndPincodeOrderByOrderTimeAsc("PLACED", pincode);
    }
    
    /**
     * Get assigned orders for a delivery partner
     */
    public List<Order> getAssignedOrdersForPartner(Long partnerId) {
        return orderRepository.findByDeliveryPartnerIdAndStatusIn(partnerId, 
                List.of("ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"));
    }
    
    /**
     * Get completed orders for a delivery partner
     */
    public List<Order> getCompletedOrdersForPartner(Long partnerId) {
        return orderRepository.findByDeliveryPartnerIdAndStatusIn(partnerId, 
                List.of("DELIVERED", "CANCELLED"));
    }
    
    /**
     * Get recent successful deliveries for a delivery partner (last 4 delivered orders)
     */
    public List<Order> getRecentSuccessfulDeliveries(Long partnerId) {
        logger.info("Fetching recent successful deliveries for partner: {}", partnerId);
        
        // Get only delivered orders, ordered by delivery date (most recent first)
        List<Order> deliveredOrders = orderRepository.findByDeliveryPartnerIdAndStatusOrderByDeliveredAtDesc(
                partnerId, "DELIVERED");
        
        // Return only the last 4 successful deliveries
        return deliveredOrders.stream()
                .limit(4)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Update order status by delivery partner
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus, Long partnerId) {
        logger.info("Partner {} updating order {} status to {}", partnerId, orderId, newStatus);
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (!orderOpt.isPresent()) {
            throw new RuntimeException("Order not found with ID: " + orderId);
        }
        
        Order order = orderOpt.get();
        
        // Verify that this partner is assigned to this order
        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            throw new RuntimeException("You are not assigned to this order");
        }
        
        // Update status and timestamps
        String oldStatus = order.getStatus();
        order.setStatus(newStatus);
        
        switch (newStatus) {
            case "PICKED_UP":
                if (!"ASSIGNED".equals(oldStatus)) {
                    throw new RuntimeException("Can only pick up assigned orders");
                }
                order.setPickedUpAt(LocalDateTime.now());
                break;
            case "OUT_FOR_DELIVERY":
                if (!"PICKED_UP".equals(oldStatus)) {
                    throw new RuntimeException("Can only mark as out for delivery after pickup");
                }
                break;
            case "DELIVERED":
                if (!"OUT_FOR_DELIVERY".equals(oldStatus)) {
                    throw new RuntimeException("Can only deliver orders that are out for delivery");
                }
                
                // CRITICAL SECURITY CHECK: Prevent marking COD orders as delivered without payment collection
                boolean isCODOrder = "COD".equals(order.getPaymentMethod()) || order.getPaymentMethod() == null;
                boolean isPaymentPending = "PENDING".equals(order.getPaymentStatus()) || order.getPaymentStatus() == null;
                
                logger.debug("Delivery validation for order {} - PaymentMethod: {}, PaymentStatus: {}, isCOD: {}, isPending: {}", 
                            orderId, order.getPaymentMethod(), order.getPaymentStatus(), isCODOrder, isPaymentPending);
                
                if (isCODOrder && isPaymentPending) {
                    logger.warn("SECURITY VIOLATION: Partner {} attempted to mark COD order {} as delivered without payment collection", partnerId, orderId);
                    throw new RuntimeException("Cannot mark COD order as delivered without collecting payment. Please collect payment first using the payment collection interface.");
                }
                
                order.setDeliveredAt(LocalDateTime.now());
                
                // Check if partner now has less than 2 active orders, make them available again
                DeliveryPartnerAuth partner = order.getDeliveryPartner();
                long remainingActiveOrders = orderRepository.countByDeliveryPartnerIdAndStatusIn(partnerId, 
                        List.of("ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY")) - 1; // -1 because this order is being delivered
                
                if (remainingActiveOrders < 2) {
                    String pincode = partner.getPincode();
                    List<Long> availablePartners = availablePartnersByPincode.computeIfAbsent(pincode, k -> new CopyOnWriteArrayList<>());
                    if (!availablePartners.contains(partnerId)) {
                        availablePartners.add(partnerId);
                        partnerLastSeen.put(partnerId, LocalDateTime.now());
                        logger.info("Partner {} is now available again (has {} active orders)", partnerId, remainingActiveOrders);
                    }
                }
                
                // CRITICAL: Send delivery receipt email after successful delivery
                logger.info("📧 Triggering delivery receipt email for order ID: {} delivered by partner: {}", orderId, partnerId);
                try {
                    emailService.sendDeliveryReceiptEmail(order);
                } catch (Exception e) {
                    logger.error("Failed to send delivery receipt email for order ID: {} - {}", orderId, e.getMessage());
                    // Don't fail the delivery process if email fails
                }
                break;
            case "CANCELLED":
                order.setCancelledAt(LocalDateTime.now());
                
                // Check if partner now has less than 2 active orders, make them available again
                DeliveryPartnerAuth cancelPartner = order.getDeliveryPartner();
                long remainingActiveOrdersCancel = orderRepository.countByDeliveryPartnerIdAndStatusIn(partnerId, 
                        List.of("ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY")) - 1; // -1 because this order is being cancelled
                
                if (remainingActiveOrdersCancel < 2) {
                    String cancelPincode = cancelPartner.getPincode();
                    List<Long> availablePartners = availablePartnersByPincode.computeIfAbsent(cancelPincode, k -> new CopyOnWriteArrayList<>());
                    if (!availablePartners.contains(partnerId)) {
                        availablePartners.add(partnerId);
                        partnerLastSeen.put(partnerId, LocalDateTime.now());
                        logger.info("Partner {} is now available again after cancellation (has {} active orders)", partnerId, remainingActiveOrdersCancel);
                    }
                }
                break;
        }
        
        return orderRepository.save(order);
    }
    
    /**
     * Keep partner alive (heartbeat)
     */
    public void keepPartnerAlive(Long partnerId) {
        partnerLastSeen.put(partnerId, LocalDateTime.now());
    }
    
    /**
     * Get delivery partner statistics with real earnings data
     */
    public java.util.Map<String, Object> getPartnerStats(Long partnerId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        // Get completed deliveries count
        long completedDeliveries = orderRepository.countByDeliveryPartnerIdAndStatus(partnerId, "DELIVERED");
        
        // Get current active orders
        long activeOrders = orderRepository.countByDeliveryPartnerIdAndStatusIn(partnerId, 
                List.of("ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"));
        
        // Calculate real total earnings from delivered orders
        Double totalEarnings = orderRepository.sumPartnerEarningsByDeliveryPartnerIdAndStatus(partnerId, "DELIVERED");
        if (totalEarnings == null) totalEarnings = 0.0;
        
        // Get today's deliveries and earnings
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long todayDeliveries = orderRepository.countByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
                partnerId, "DELIVERED", startOfDay);
        
        Double todayEarnings = orderRepository.sumPartnerEarningsByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
                partnerId, "DELIVERED", startOfDay);
        if (todayEarnings == null) todayEarnings = 0.0;
        
        // Get this week's stats
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        long weekDeliveries = orderRepository.countByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
                partnerId, "DELIVERED", startOfWeek);
        
        Double weekEarnings = orderRepository.sumPartnerEarningsByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
                partnerId, "DELIVERED", startOfWeek);
        if (weekEarnings == null) weekEarnings = 0.0;
        
        // Calculate average earnings per delivery
        double avgEarningsPerDelivery = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0.0;
        
        stats.put("completedDeliveries", completedDeliveries);
        stats.put("activeOrders", activeOrders);
        stats.put("totalEarnings", Math.round(totalEarnings * 100.0) / 100.0);
        stats.put("todayDeliveries", todayDeliveries);
        stats.put("todayEarnings", Math.round(todayEarnings * 100.0) / 100.0);
        stats.put("weekDeliveries", weekDeliveries);
        stats.put("weekEarnings", Math.round(weekEarnings * 100.0) / 100.0);
        stats.put("avgEarningsPerDelivery", Math.round(avgEarningsPerDelivery * 100.0) / 100.0);
        
        return stats;
    }
    
    /**
     * Migrate existing orders to add earnings data
     */
    @Transactional
    public int migrateExistingOrdersEarnings() {
        logger.info("Starting migration of existing orders to add earnings data");
        
        // Find all delivered orders without partner earnings
        List<Order> ordersToUpdate = orderRepository.findByStatusAndPartnerEarningIsNull("DELIVERED");
        
        int updatedCount = 0;
        for (Order order : ordersToUpdate) {
            if (order.getDeliveryPartner() != null && order.getTotalAmount() > 0) {
                // Calculate earnings for existing orders
                double deliveryFee = calculateDeliveryFee(order.getTotalAmount());
                double partnerEarning = calculatePartnerEarning(deliveryFee, order.getTotalAmount());
                
                order.setDeliveryFee(deliveryFee);
                order.setPartnerEarning(partnerEarning);
                
                // Set delivered time if missing
                if (order.getDeliveredAt() == null) {
                    order.setDeliveredAt(order.getOrderTime().plusHours(1)); // Assume delivered 1 hour after order
                }
                
                orderRepository.save(order);
                updatedCount++;
                
                logger.info("Updated order {} with earnings: ₹{}", order.getId(), partnerEarning);
            }
        }
        
        logger.info("Migration completed. Updated {} orders with earnings data", updatedCount);
        return updatedCount;
    }

    /**
     * Sync delivery partner data between tables to fix foreign key issues
     */
    @Transactional
    public int syncDeliveryPartnerTables() {
        logger.info("Starting sync between delivery_partner_auth and delivery_partners tables");
        
        try {
            // Get all verified partners from delivery_partner_auth
            List<DeliveryPartnerAuth> verifiedPartners = deliveryPartnerRepository.findByVerificationStatus("VERIFIED");
            
            int syncedCount = 0;
            for (DeliveryPartnerAuth authPartner : verifiedPartners) {
                try {
                    // Use native SQL to insert/update delivery_partners table
                    // This ensures the foreign key constraint can be satisfied
                    String sql = "INSERT INTO delivery_partners (id, full_name, email, phone_number, pincode, " +
                               "vehicle_type, vehicle_number, driving_license, verification_status, account_status, " +
                               "availability_status, is_available, total_deliveries, successful_deliveries, " +
                               "average_rating, total_earnings, created_at, updated_at) " +
                               "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'OFFLINE', false, 0, 0, 0.0, 0.0, ?, ?) " +
                               "ON DUPLICATE KEY UPDATE " +
                               "full_name = VALUES(full_name), email = VALUES(email), phone_number = VALUES(phone_number), " +
                               "pincode = VALUES(pincode), vehicle_type = VALUES(vehicle_type), " +
                               "vehicle_number = VALUES(vehicle_number), driving_license = VALUES(driving_license), " +
                               "verification_status = VALUES(verification_status), updated_at = VALUES(updated_at)";
                    
                    // Simplified approach - just log for now
                    // TODO: Implement proper entity manager access if needed
                    
                    // For now, just log the sync attempt
                    logger.info("Would sync partner {} (ID: {}) to delivery_partners table", 
                               authPartner.getFullName(), authPartner.getId());
                    syncedCount++;
                    
                } catch (Exception e) {
                    logger.warn("Failed to sync partner {}: {}", authPartner.getId(), e.getMessage());
                }
            }
            
            logger.info("Sync completed. Processed {} verified partners", syncedCount);
            return syncedCount;
            
        } catch (Exception e) {
            logger.error("Error during sync: {}", e.getMessage());
            throw new RuntimeException("Sync failed: " + e.getMessage());
        }
    }

    /**
     * Get real-time dashboard data for delivery partner
     */
    public java.util.Map<String, Object> getDashboardData(Long partnerId) {
        Optional<DeliveryPartnerAuth> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found");
        }
        
        DeliveryPartnerAuth partner = partnerOpt.get();
        java.util.Map<String, Object> dashboardData = new java.util.HashMap<>();
        
        // Partner info
        dashboardData.put("partner", partner);
        
        // Statistics
        dashboardData.put("stats", getPartnerStats(partnerId));
        
        // Current orders
        dashboardData.put("activeOrders", getAssignedOrdersForPartner(partnerId));
        
        // Available orders in partner's pincode
        dashboardData.put("availableOrders", getPendingOrdersForPincode(partner.getPincode()));
        
        // Availability status
        List<Long> availablePartners = availablePartnersByPincode.get(partner.getPincode());
        boolean isAvailable = availablePartners != null && availablePartners.contains(partnerId);
        dashboardData.put("isAvailable", isAvailable);
        
        return dashboardData;
    }

    // Add missing methods required by OrderAssignmentController
    
    @Autowired
    private OrderAssignmentRepository orderAssignmentRepository;
    
    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository2; // Avoid naming conflict
    
    /**
     * Automatically assign order to best available partner
     */
    @Transactional
    public OrderAssignment assignOrderAutomatically(Long orderId) {
        logger.info("Auto-assigning order ID: {}", orderId);
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (!orderOpt.isPresent()) {
            throw new RuntimeException("Order not found with ID: " + orderId);
        }
        
        Order order = orderOpt.get();
        String pincode = order.getPincode();
        
        // Get available partners for this pincode
        List<Long> availablePartners = getAvailablePartners(pincode);
        if (availablePartners.isEmpty()) {
            throw new RuntimeException("No available delivery partners for pincode: " + pincode);
        }
        
        // Select the first available partner (can be enhanced with better logic)
        Long selectedPartnerId = availablePartners.get(0);
        
        // Get the delivery partner
        Optional<DeliveryPartnerAuth> partnerOpt = deliveryPartnerRepository.findById(selectedPartnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + selectedPartnerId);
        }
        
        // Create assignment
        DeliveryPartner deliveryPartner = new DeliveryPartner();
        deliveryPartner.setId(selectedPartnerId);
        
        OrderAssignment assignment = new OrderAssignment(order, deliveryPartner);
        assignment.setStatus("ASSIGNED");
        
        return orderAssignmentRepository.save(assignment);
    }
    
    /**
     * Manually assign order to specific partner - fix return type
     */
    @Transactional
    public OrderAssignment assignOrderToPartnerNew(Long orderId, Long partnerId) {
        logger.info("Manually assigning order {} to partner {}", orderId, partnerId);
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (!orderOpt.isPresent()) {
            throw new RuntimeException("Order not found with ID: " + orderId);
        }
        
        Optional<DeliveryPartnerAuth> partnerOpt = deliveryPartnerRepository.findById(partnerId);
        if (!partnerOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }
        
        Order order = orderOpt.get();
        DeliveryPartner deliveryPartner = new DeliveryPartner();
        deliveryPartner.setId(partnerId);
        
        OrderAssignment assignment = new OrderAssignment(order, deliveryPartner);
        assignment.setStatus("ASSIGNED");
        
        return orderAssignmentRepository.save(assignment);
    }
    
    /**
     * Accept order assignment
     */
    @Transactional
    public OrderAssignment acceptOrder(Long assignmentId, Long partnerId) {
        logger.info("Partner {} accepting assignment {}", partnerId, assignmentId);
        
        Optional<OrderAssignment> assignmentOpt = orderAssignmentRepository.findById(assignmentId);
        if (!assignmentOpt.isPresent()) {
            throw new RuntimeException("Assignment not found with ID: " + assignmentId);
        }
        
        OrderAssignment assignment = assignmentOpt.get();
        
        // Verify the partner owns this assignment
        if (!assignment.getPartnerId().equals(partnerId)) {
            throw new RuntimeException("Assignment does not belong to this partner");
        }
        
        if (!"ASSIGNED".equals(assignment.getStatus())) {
            throw new RuntimeException("Assignment is not in ASSIGNED status");
        }
        
        assignment.acceptAssignment();
        return orderAssignmentRepository.save(assignment);
    }
    
    /**
     * Reject order assignment
     */
    @Transactional
    public void rejectOrder(Long assignmentId, Long partnerId, String rejectionReason) {
        logger.info("Partner {} rejecting assignment {} with reason: {}", partnerId, assignmentId, rejectionReason);
        
        Optional<OrderAssignment> assignmentOpt = orderAssignmentRepository.findById(assignmentId);
        if (!assignmentOpt.isPresent()) {
            throw new RuntimeException("Assignment not found with ID: " + assignmentId);
        }
        
        OrderAssignment assignment = assignmentOpt.get();
        
        // Verify the partner owns this assignment
        if (!assignment.getPartnerId().equals(partnerId)) {
            throw new RuntimeException("Assignment does not belong to this partner");
        }
        
        if (!"ASSIGNED".equals(assignment.getStatus())) {
            throw new RuntimeException("Assignment is not in ASSIGNED status");
        }
        
        assignment.rejectAssignment(rejectionReason);
        orderAssignmentRepository.save(assignment);
    }
    
    /**
     * Update order status during delivery - fix parameter order
     */
    @Transactional
    public OrderAssignment updateOrderStatus(Long assignmentId, Long partnerId, String newStatus) {
        logger.info("Partner {} updating assignment {} to status {}", partnerId, assignmentId, newStatus);
        
        Optional<OrderAssignment> assignmentOpt = orderAssignmentRepository.findById(assignmentId);
        if (!assignmentOpt.isPresent()) {
            throw new RuntimeException("Assignment not found with ID: " + assignmentId);
        }
        
        OrderAssignment assignment = assignmentOpt.get();
        
        // Verify the partner owns this assignment
        if (!assignment.getPartnerId().equals(partnerId)) {
            throw new RuntimeException("Assignment does not belong to this partner");
        }
        
        // Update status based on the new status
        switch (newStatus.toUpperCase()) {
            case "PICKED_UP":
                assignment.markPickedUp();
                break;
            case "OUT_FOR_DELIVERY":
                assignment.markOutForDelivery();
                break;
            case "DELIVERED":
                assignment.markDelivered();
                break;
            default:
                assignment.setStatus(newStatus);
                break;
        }
        
        return orderAssignmentRepository.save(assignment);
    }
    
    /**
     * Get assignments for a delivery partner
     */
    public List<OrderAssignment> getPartnerAssignments(Long partnerId, String status) {
        logger.info("Fetching assignments for partner {} with status {}", partnerId, status);
        
        if (status != null && !status.trim().isEmpty()) {
            return orderAssignmentRepository.findByStatusAndDeliveryPartnerId(status, partnerId);
        } else {
            return orderAssignmentRepository.findByDeliveryPartnerId(partnerId);
        }
    }
    
    /**
     * Get assignment by order ID with delivery partner details
     */
    @Transactional(readOnly = true)
    public Optional<OrderAssignment> getAssignmentByOrderId(Long orderId) {
        logger.info("Fetching assignment for order ID: {}", orderId);
        Optional<OrderAssignment> assignmentOpt = orderAssignmentRepository.findByOrder_Id(orderId);
        
        if (assignmentOpt.isPresent()) {
            OrderAssignment assignment = assignmentOpt.get();
            
            // CRITICAL FIX: Get delivery partner data from delivery_partner_auth table
            if (assignment.getDeliveryPartner() != null) {
                Long partnerId = assignment.getDeliveryPartner().getId();
                logger.info("Loading delivery partner details from auth table for partner ID: {}", partnerId);
                
                // Get the actual partner data from delivery_partner_auth table
                Optional<DeliveryPartnerAuth> authPartnerOpt = deliveryPartnerRepository.findById(partnerId);
                if (authPartnerOpt.isPresent()) {
                    DeliveryPartnerAuth authPartner = authPartnerOpt.get();
                    
                    // Update the delivery partner object with real data
                    DeliveryPartner partner = assignment.getDeliveryPartner();
                    partner.setFullName(authPartner.getFullName());
                    partner.setPhoneNumber(authPartner.getPhoneNumber());
                    partner.setEmail(authPartner.getEmail());
                    partner.setVehicleType(authPartner.getVehicleType());
                    partner.setVehicleNumber(authPartner.getVehicleNumber());
                    partner.setAssignedPincode(authPartner.getPincode());
                    
                    logger.info("Successfully loaded partner data: {} - {}", authPartner.getFullName(), authPartner.getPhoneNumber());
                } else {
                    logger.warn("No auth data found for partner ID: {}", partnerId);
                }
            }
        }
        
        return assignmentOpt;
    }
    
    /**
     * Get all assignments with filtering
     */
    public List<OrderAssignment> getAllAssignments(String status, String pincode) {
        logger.info("Fetching all assignments with status: {} and pincode: {}", status, pincode);
        
        if (status != null && !status.trim().isEmpty() && pincode != null && !pincode.trim().isEmpty()) {
            return orderAssignmentRepository.findByPincodeAndStatus(pincode, status);
        } else if (status != null && !status.trim().isEmpty()) {
            return orderAssignmentRepository.findByStatus(status);
        } else if (pincode != null && !pincode.trim().isEmpty()) {
            return orderAssignmentRepository.findByPincode(pincode);
        } else {
            return orderAssignmentRepository.findAll();
        }
    }
}