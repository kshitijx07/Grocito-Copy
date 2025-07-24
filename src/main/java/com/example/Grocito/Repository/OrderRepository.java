package com.example.Grocito.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Grocito.Entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByPincode(String pincode);
    List<Order> findByStatus(String status);
    List<Order> findByPincodeAndStatus(String pincode, String status);
    
    // Additional query methods for enhanced filtering
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.pincode = :pincode ORDER BY o.orderTime DESC")
    List<Order> findByPincodeOrderByOrderTimeDesc(@org.springframework.data.repository.query.Param("pincode") String pincode);
    
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.orderTime DESC")
    List<Order> findByStatusOrderByOrderTimeDesc(@org.springframework.data.repository.query.Param("status") String status);
    
    // Methods for delivery partner assignment
    List<Order> findByStatusAndPincodeOrderByOrderTimeAsc(String status, String pincode);
    
    List<Order> findByDeliveryPartnerIdAndStatusIn(Long deliveryPartnerId, List<String> statuses);
    
    long countByDeliveryPartnerIdAndStatus(Long deliveryPartnerId, String status);
    
    long countByDeliveryPartnerIdAndStatusIn(Long deliveryPartnerId, List<String> statuses);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.deliveryPartner.id = :partnerId AND o.status = :status AND o.deliveredAt > :afterDate")
    long countByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
        @org.springframework.data.repository.query.Param("partnerId") Long partnerId, 
        @org.springframework.data.repository.query.Param("status") String status, 
        @org.springframework.data.repository.query.Param("afterDate") java.time.LocalDateTime afterDate
    );
    
    // Methods for real earnings calculation
    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.partnerEarning) FROM Order o WHERE o.deliveryPartner.id = :partnerId AND o.status = :status")
    Double sumPartnerEarningsByDeliveryPartnerIdAndStatus(
        @org.springframework.data.repository.query.Param("partnerId") Long partnerId, 
        @org.springframework.data.repository.query.Param("status") String status
    );
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.partnerEarning) FROM Order o WHERE o.deliveryPartner.id = :partnerId AND o.status = :status AND o.deliveredAt > :afterDate")
    Double sumPartnerEarningsByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
        @org.springframework.data.repository.query.Param("partnerId") Long partnerId, 
        @org.springframework.data.repository.query.Param("status") String status, 
        @org.springframework.data.repository.query.Param("afterDate") java.time.LocalDateTime afterDate
    );
    
    // Method to find orders without partner earnings for migration
    List<Order> findByStatusAndPartnerEarningIsNull(String status);
}

