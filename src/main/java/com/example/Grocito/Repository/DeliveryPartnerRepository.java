package com.example.Grocito.Repository;

import com.example.Grocito.Entity.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    
    // Find by phone number for authentication
    Optional<DeliveryPartner> findByPhoneNumber(String phoneNumber);
    
    // Find by email
    Optional<DeliveryPartner> findByEmail(String email);
    
    // Find delivery partners by pincode
    List<DeliveryPartner> findByAssignedPincode(String pincode);
    
    // Find available delivery partners by pincode
    List<DeliveryPartner> findByAssignedPincodeAndIsAvailableTrueAndAvailabilityStatus(String pincode, String status);
    
    // Find online delivery partners by pincode
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.assignedPincode = :pincode AND dp.isAvailable = true AND dp.availabilityStatus = 'ONLINE' AND dp.accountStatus = 'ACTIVE' AND dp.verificationStatus = 'VERIFIED'")
    List<DeliveryPartner> findOnlinePartnersByPincode(@Param("pincode") String pincode);
    
    // Find delivery partners by status
    List<DeliveryPartner> findByAvailabilityStatus(String status);
    
    // Find delivery partners by verification status
    List<DeliveryPartner> findByVerificationStatus(String verificationStatus);
    
    // Find delivery partners by account status
    List<DeliveryPartner> findByAccountStatus(String accountStatus);
    
    // Search delivery partners by name or phone number
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.fullName LIKE %:keyword% OR dp.phoneNumber LIKE %:keyword% OR dp.email LIKE %:keyword%")
    List<DeliveryPartner> searchDeliveryPartners(@Param("keyword") String keyword);
    
    // Search delivery partners by name or phone number within a pincode
    @Query("SELECT dp FROM DeliveryPartner dp WHERE (dp.fullName LIKE %:keyword% OR dp.phoneNumber LIKE %:keyword% OR dp.email LIKE %:keyword%) AND dp.assignedPincode = :pincode")
    List<DeliveryPartner> searchDeliveryPartnersByPincode(@Param("keyword") String keyword, @Param("pincode") String pincode);
    
    // Count delivery partners by status
    long countByAvailabilityStatus(String status);
    
    // Count delivery partners by pincode
    long countByAssignedPincode(String pincode);
    
    // Count delivery partners by pincode and status
    long countByAssignedPincodeAndAvailabilityStatus(String pincode, String status);
    
    // Count verified partners by pincode
    long countByAssignedPincodeAndVerificationStatus(String pincode, String verificationStatus);
    
    // Find partners with high ratings
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.averageRating >= :minRating AND dp.totalDeliveries >= :minDeliveries ORDER BY dp.averageRating DESC")
    List<DeliveryPartner> findTopRatedPartners(@Param("minRating") double minRating, @Param("minDeliveries") int minDeliveries);
    
    // Find partners by location range (for nearby assignment)
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.assignedPincode = :pincode AND dp.currentLatitude BETWEEN :minLat AND :maxLat AND dp.currentLongitude BETWEEN :minLng AND :maxLng AND dp.isAvailable = true AND dp.availabilityStatus = 'ONLINE'")
    List<DeliveryPartner> findPartnersInLocationRange(
        @Param("pincode") String pincode,
        @Param("minLat") double minLatitude,
        @Param("maxLat") double maxLatitude,
        @Param("minLng") double minLongitude,
        @Param("maxLng") double maxLongitude
    );
    
    // Find partners who haven't been active recently
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.lastActiveAt < :cutoffTime OR dp.lastActiveAt IS NULL")
    List<DeliveryPartner> findInactivePartners(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find partners with pending verification
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.verificationStatus = 'PENDING' ORDER BY dp.createdAt ASC")
    List<DeliveryPartner> findPendingVerificationPartners();
    
    // Get partner performance statistics
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.assignedPincode = :pincode AND dp.totalDeliveries > 0 ORDER BY dp.totalEarnings DESC")
    List<DeliveryPartner> findPartnersByEarnings(@Param("pincode") String pincode);
    
    // Find partners available for assignment (not busy, online, verified)
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.assignedPincode = :pincode AND dp.isAvailable = true AND dp.availabilityStatus = 'ONLINE' AND dp.accountStatus = 'ACTIVE' AND dp.verificationStatus = 'VERIFIED' ORDER BY dp.totalDeliveries ASC")
    List<DeliveryPartner> findAvailablePartnersForAssignment(@Param("pincode") String pincode);
    
    // Count active partners by pincode
    @Query("SELECT COUNT(dp) FROM DeliveryPartner dp WHERE dp.assignedPincode = :pincode AND dp.accountStatus = 'ACTIVE' AND dp.verificationStatus = 'VERIFIED'")
    long countActivePartnersByPincode(@Param("pincode") String pincode);
    
    // Find partners by vehicle type
    List<DeliveryPartner> findByVehicleTypeAndAssignedPincode(String vehicleType, String pincode);
    
    // Update partner availability status
    @Query("UPDATE DeliveryPartner dp SET dp.availabilityStatus = :status, dp.isAvailable = :isAvailable, dp.updatedAt = CURRENT_TIMESTAMP WHERE dp.id = :partnerId")
    void updatePartnerAvailability(@Param("partnerId") Long partnerId, @Param("status") String status, @Param("isAvailable") boolean isAvailable);
    
    // Update partner location
    @Query("UPDATE DeliveryPartner dp SET dp.currentLatitude = :latitude, dp.currentLongitude = :longitude, dp.lastActiveAt = CURRENT_TIMESTAMP, dp.updatedAt = CURRENT_TIMESTAMP WHERE dp.id = :partnerId")
    void updatePartnerLocation(@Param("partnerId") Long partnerId, @Param("latitude") double latitude, @Param("longitude") double longitude);
}