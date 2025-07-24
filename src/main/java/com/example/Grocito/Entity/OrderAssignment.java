package com.example.Grocito.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "order_assignments")
public class OrderAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Order and Partner References
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private DeliveryPartner deliveryPartner;

    // Assignment Details
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason", length = 200)
    private String rejectionReason;

    // Status Tracking
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ASSIGNED"; // ASSIGNED, ACCEPTED, REJECTED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "delivery_time")
    private LocalDateTime deliveryTime;

    // Location Tracking
    @Column(name = "pickup_latitude", precision = 10, scale = 8)
    private BigDecimal pickupLatitude;

    @Column(name = "pickup_longitude", precision = 11, scale = 8)
    private BigDecimal pickupLongitude;

    @Column(name = "delivery_latitude", precision = 10, scale = 8)
    private BigDecimal deliveryLatitude;

    @Column(name = "delivery_longitude", precision = 11, scale = 8)
    private BigDecimal deliveryLongitude;

    // Performance Metrics
    @Column(name = "total_distance", precision = 8, scale = 2)
    private BigDecimal totalDistance; // in kilometers

    @Column(name = "delivery_duration")
    private Integer deliveryDuration; // in minutes

    @Column(name = "pickup_duration")
    private Integer pickupDuration; // time taken to pickup from assignment

    // Earnings for this delivery
    @Column(name = "base_fee", precision = 8, scale = 2)
    private BigDecimal baseFee;

    @Column(name = "distance_bonus", precision = 8, scale = 2)
    private BigDecimal distanceBonus;

    @Column(name = "time_bonus", precision = 8, scale = 2)
    private BigDecimal timeBonus;

    @Column(name = "total_earnings", precision = 8, scale = 2)
    private BigDecimal totalEarnings;

    // Additional Information
    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @Column(name = "customer_rating")
    private Integer customerRating; // 1-5 stars

    @Column(name = "customer_feedback", length = 1000)
    private String customerFeedback;

    // Proof of Delivery
    @Column(name = "proof_of_delivery_url", length = 500)
    private String proofOfDeliveryUrl;

    @Column(name = "delivery_otp", length = 10)
    private String deliveryOtp;

    @Column(name = "signature_url", length = 500)
    private String signatureUrl;

    // Timestamps
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors
    public OrderAssignment() {
        super();
    }

    public OrderAssignment(Order order, DeliveryPartner deliveryPartner) {
        this.order = order;
        this.deliveryPartner = deliveryPartner;
        this.assignedAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public DeliveryPartner getDeliveryPartner() {
        return deliveryPartner;
    }

    public void setDeliveryPartner(DeliveryPartner deliveryPartner) {
        this.deliveryPartner = deliveryPartner;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public LocalDateTime getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(LocalDateTime pickupTime) {
        this.pickupTime = pickupTime;
    }

    public LocalDateTime getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(LocalDateTime deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public BigDecimal getPickupLatitude() {
        return pickupLatitude;
    }

    public void setPickupLatitude(BigDecimal pickupLatitude) {
        this.pickupLatitude = pickupLatitude;
    }

    public BigDecimal getPickupLongitude() {
        return pickupLongitude;
    }

    public void setPickupLongitude(BigDecimal pickupLongitude) {
        this.pickupLongitude = pickupLongitude;
    }

    public BigDecimal getDeliveryLatitude() {
        return deliveryLatitude;
    }

    public void setDeliveryLatitude(BigDecimal deliveryLatitude) {
        this.deliveryLatitude = deliveryLatitude;
    }

    public BigDecimal getDeliveryLongitude() {
        return deliveryLongitude;
    }

    public void setDeliveryLongitude(BigDecimal deliveryLongitude) {
        this.deliveryLongitude = deliveryLongitude;
    }

    public BigDecimal getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(BigDecimal totalDistance) {
        this.totalDistance = totalDistance;
    }

    public Integer getDeliveryDuration() {
        return deliveryDuration;
    }

    public void setDeliveryDuration(Integer deliveryDuration) {
        this.deliveryDuration = deliveryDuration;
    }

    public Integer getPickupDuration() {
        return pickupDuration;
    }

    public void setPickupDuration(Integer pickupDuration) {
        this.pickupDuration = pickupDuration;
    }

    public BigDecimal getBaseFee() {
        return baseFee;
    }

    public void setBaseFee(BigDecimal baseFee) {
        this.baseFee = baseFee;
    }

    public BigDecimal getDistanceBonus() {
        return distanceBonus;
    }

    public void setDistanceBonus(BigDecimal distanceBonus) {
        this.distanceBonus = distanceBonus;
    }

    public BigDecimal getTimeBonus() {
        return timeBonus;
    }

    public void setTimeBonus(BigDecimal timeBonus) {
        this.timeBonus = timeBonus;
    }

    public BigDecimal getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(BigDecimal totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public Integer getCustomerRating() {
        return customerRating;
    }

    public void setCustomerRating(Integer customerRating) {
        this.customerRating = customerRating;
    }

    public String getCustomerFeedback() {
        return customerFeedback;
    }

    public void setCustomerFeedback(String customerFeedback) {
        this.customerFeedback = customerFeedback;
    }

    public String getProofOfDeliveryUrl() {
        return proofOfDeliveryUrl;
    }

    public void setProofOfDeliveryUrl(String proofOfDeliveryUrl) {
        this.proofOfDeliveryUrl = proofOfDeliveryUrl;
    }

    public String getDeliveryOtp() {
        return deliveryOtp;
    }

    public void setDeliveryOtp(String deliveryOtp) {
        this.deliveryOtp = deliveryOtp;
    }

    public String getSignatureUrl() {
        return signatureUrl;
    }

    public void setSignatureUrl(String signatureUrl) {
        this.signatureUrl = signatureUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Utility methods
    public void acceptAssignment() {
        this.status = "ACCEPTED";
        this.acceptedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void rejectAssignment(String reason) {
        this.status = "REJECTED";
        this.rejectedAt = LocalDateTime.now();
        this.rejectionReason = reason;
        this.updatedAt = LocalDateTime.now();
    }

    public void markPickedUp() {
        this.status = "PICKED_UP";
        this.pickupTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // Calculate pickup duration
        if (this.acceptedAt != null) {
            this.pickupDuration = (int) java.time.Duration.between(this.acceptedAt, this.pickupTime).toMinutes();
        }
    }

    public void markOutForDelivery() {
        this.status = "OUT_FOR_DELIVERY";
        this.updatedAt = LocalDateTime.now();
    }

    public void markDelivered() {
        this.status = "DELIVERED";
        this.deliveryTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // Calculate total delivery duration
        if (this.acceptedAt != null) {
            this.deliveryDuration = (int) java.time.Duration.between(this.acceptedAt, this.deliveryTime).toMinutes();
        }
    }

    public boolean isActive() {
        return "ACCEPTED".equals(status) || "PICKED_UP".equals(status) || "OUT_FOR_DELIVERY".equals(status);
    }

    public boolean isCompleted() {
        return "DELIVERED".equals(status);
    }

    public boolean isRejected() {
        return "REJECTED".equals(status);
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Convenience methods for backward compatibility
    public Long getOrderId() {
        return order != null ? order.getId() : null;
    }
    
    public void setOrderId(Long orderId) {
        // This method is for convenience - the actual order should be set via setOrder()
        // In a real implementation, you might want to load the order from repository
        if (this.order == null) {
            this.order = new Order();
        }
        this.order.setId(orderId);
    }
    
    public Long getPartnerId() {
        return deliveryPartner != null ? deliveryPartner.getId() : null;
    }
    
    public void setPartnerId(Long partnerId) {
        // This method is for convenience - the actual partner should be set via setDeliveryPartner()
        // In a real implementation, you might want to load the partner from repository
        if (this.deliveryPartner == null) {
            this.deliveryPartner = new DeliveryPartner();
        }
        this.deliveryPartner.setId(partnerId);
    }

    @Override
    public String toString() {
        return "OrderAssignment{" +
                "id=" + id +
                ", orderId=" + (order != null ? order.getId() : null) +
                ", partnerId=" + (deliveryPartner != null ? deliveryPartner.getId() : null) +
                ", status='" + status + '\'' +
                ", assignedAt=" + assignedAt +
                ", acceptedAt=" + acceptedAt +
                ", deliveryTime=" + deliveryTime +
                '}';
    }
}