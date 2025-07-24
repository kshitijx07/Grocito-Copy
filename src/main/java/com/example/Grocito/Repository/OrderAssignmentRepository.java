package com.example.Grocito.Repository;

import com.example.Grocito.Entity.OrderAssignment;
import com.example.Grocito.Entity.DeliveryPartner;
import com.example.Grocito.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderAssignmentRepository extends JpaRepository<OrderAssignment, Long> {
    
    // Find assignment by order
    Optional<OrderAssignment> findByOrder(Order order);
    
    // Find assignment by order ID
    Optional<OrderAssignment> findByOrder_Id(Long orderId);
    
    // Find assignments by delivery partner
    List<OrderAssignment> findByDeliveryPartner(DeliveryPartner deliveryPartner);
    
    // Find assignments by delivery partner ID
    List<OrderAssignment> findByDeliveryPartnerId(Long partnerId);
    
    // Find active assignments for a partner
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.status IN ('ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY')")
    List<OrderAssignment> findActiveAssignmentsByPartnerId(@Param("partnerId") Long partnerId);
    
    // Find assignments by status
    List<OrderAssignment> findByStatus(String status);
    
    // Find assignments by status and partner
    List<OrderAssignment> findByStatusAndDeliveryPartnerId(String status, Long partnerId);
    
    // Find pending assignments (assigned but not accepted/rejected)
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.status = 'ASSIGNED' AND oa.assignedAt > :cutoffTime")
    List<OrderAssignment> findPendingAssignments(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find expired assignments (assigned more than 30 seconds ago and not responded)
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.status = 'ASSIGNED' AND oa.assignedAt < :cutoffTime")
    List<OrderAssignment> findExpiredAssignments(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find assignments by pincode
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.deliveryPartner.assignedPincode = :pincode")
    List<OrderAssignment> findByPincode(@Param("pincode") String pincode);
    
    // Find assignments by pincode and status
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.deliveryPartner.assignedPincode = :pincode AND oa.status = :status")
    List<OrderAssignment> findByPincodeAndStatus(@Param("pincode") String pincode, @Param("status") String status);
    
    // Find assignments by date range
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.assignedAt BETWEEN :startDate AND :endDate")
    List<OrderAssignment> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find assignments by partner and date range
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.assignedAt BETWEEN :startDate AND :endDate")
    List<OrderAssignment> findByPartnerAndDateRange(@Param("partnerId") Long partnerId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Count assignments by status
    long countByStatus(String status);
    
    // Count assignments by partner and status
    long countByDeliveryPartnerIdAndStatus(Long partnerId, String status);
    
    // Count active assignments for a partner
    @Query("SELECT COUNT(oa) FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.status IN ('ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY')")
    long countActiveAssignmentsByPartnerId(@Param("partnerId") Long partnerId);
    
    // Find completed assignments for performance analysis
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.status = 'DELIVERED' AND oa.deliveryTime IS NOT NULL ORDER BY oa.deliveryTime DESC")
    List<OrderAssignment> findCompletedAssignments();
    
    // Find completed assignments by partner
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.status = 'DELIVERED' AND oa.deliveryTime IS NOT NULL ORDER BY oa.deliveryTime DESC")
    List<OrderAssignment> findCompletedAssignmentsByPartnerId(@Param("partnerId") Long partnerId);
    
    // Find assignments with customer ratings
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.customerRating IS NOT NULL AND oa.deliveryPartner.id = :partnerId")
    List<OrderAssignment> findRatedAssignmentsByPartnerId(@Param("partnerId") Long partnerId);
    
    // Calculate average delivery time for a partner
    @Query("SELECT AVG(oa.deliveryDuration) FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.status = 'DELIVERED' AND oa.deliveryDuration IS NOT NULL")
    Double getAverageDeliveryTimeByPartnerId(@Param("partnerId") Long partnerId);
    
    // Calculate average rating for a partner
    @Query("SELECT AVG(oa.customerRating) FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.customerRating IS NOT NULL")
    Double getAverageRatingByPartnerId(@Param("partnerId") Long partnerId);
    
    // Find top performing partners by completion rate
    @Query("SELECT oa.deliveryPartner, COUNT(oa) as totalAssignments, " +
           "SUM(CASE WHEN oa.status = 'DELIVERED' THEN 1 ELSE 0 END) as completedAssignments " +
           "FROM OrderAssignment oa " +
           "WHERE oa.deliveryPartner.assignedPincode = :pincode " +
           "GROUP BY oa.deliveryPartner " +
           "HAVING COUNT(oa) >= :minAssignments " +
           "ORDER BY (SUM(CASE WHEN oa.status = 'DELIVERED' THEN 1 ELSE 0 END) * 1.0 / COUNT(oa)) DESC")
    List<Object[]> findTopPerformingPartnersByPincode(@Param("pincode") String pincode, @Param("minAssignments") int minAssignments);
    
    // Find assignments that need attention (stuck in a status for too long)
    @Query("SELECT oa FROM OrderAssignment oa WHERE " +
           "(oa.status = 'ACCEPTED' AND oa.acceptedAt < :acceptedCutoff) OR " +
           "(oa.status = 'PICKED_UP' AND oa.pickupTime < :pickupCutoff) OR " +
           "(oa.status = 'OUT_FOR_DELIVERY' AND oa.updatedAt < :deliveryCutoff)")
    List<OrderAssignment> findStuckAssignments(
        @Param("acceptedCutoff") LocalDateTime acceptedCutoff,
        @Param("pickupCutoff") LocalDateTime pickupCutoff,
        @Param("deliveryCutoff") LocalDateTime deliveryCutoff
    );
    
    // Find recent assignments for a partner (for dashboard)
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId ORDER BY oa.assignedAt DESC")
    List<OrderAssignment> findRecentAssignmentsByPartnerId(@Param("partnerId") Long partnerId);
    
    // Find assignments by multiple statuses
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.status IN :statuses")
    List<OrderAssignment> findByStatusIn(@Param("statuses") List<String> statuses);
    
    // Find assignments by partner and multiple statuses
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.status IN :statuses")
    List<OrderAssignment> findByPartnerIdAndStatusIn(@Param("partnerId") Long partnerId, @Param("statuses") List<String> statuses);
    
    // Get earnings summary for a partner
    @Query("SELECT SUM(oa.totalEarnings) FROM OrderAssignment oa WHERE oa.deliveryPartner.id = :partnerId AND oa.status = 'DELIVERED' AND oa.assignedAt BETWEEN :startDate AND :endDate")
    Double getTotalEarningsByPartnerAndDateRange(@Param("partnerId") Long partnerId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find assignments that were rejected with reasons
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.status = 'REJECTED' AND oa.rejectionReason IS NOT NULL")
    List<OrderAssignment> findRejectedAssignmentsWithReasons();
    
    // Find assignments by order status (to sync with main order status)
    @Query("SELECT oa FROM OrderAssignment oa WHERE oa.order.status = :orderStatus")
    List<OrderAssignment> findByOrderStatus(@Param("orderStatus") String orderStatus);
}