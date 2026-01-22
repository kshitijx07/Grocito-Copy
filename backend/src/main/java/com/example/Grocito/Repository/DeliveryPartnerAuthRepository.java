package com.example.Grocito.Repository;

import com.example.Grocito.Entity.DeliveryPartnerAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerAuthRepository extends JpaRepository<DeliveryPartnerAuth, Long> {
    
    // Find by email for login
    Optional<DeliveryPartnerAuth> findByEmail(String email);
    
    // Find by phone number
    Optional<DeliveryPartnerAuth> findByPhoneNumber(String phoneNumber);
    
    // Find by email and password for authentication
    Optional<DeliveryPartnerAuth> findByEmailAndPassword(String email, String password);
    
    // Find by phone and password for authentication
    Optional<DeliveryPartnerAuth> findByPhoneNumberAndPassword(String phoneNumber, String password);
    
    // Find by verification status
    List<DeliveryPartnerAuth> findByVerificationStatus(String verificationStatus);
    
    // Find by verification status and pincode
    List<DeliveryPartnerAuth> findByVerificationStatusAndPincode(String verificationStatus, String pincode);
    
    // Find pending verification requests ordered by creation date
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.verificationStatus = 'PENDING' ORDER BY dpa.createdAt ASC")
    List<DeliveryPartnerAuth> findPendingVerificationRequests();
    
    // Find pending verification requests by pincode
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.verificationStatus = 'PENDING' AND dpa.pincode = :pincode ORDER BY dpa.createdAt ASC")
    List<DeliveryPartnerAuth> findPendingVerificationRequestsByPincode(@Param("pincode") String pincode);
    
    // Find by reset token
    Optional<DeliveryPartnerAuth> findByResetToken(String resetToken);
    
    // Find by reset token and check if it's valid
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.resetToken = :token AND dpa.resetTokenExpiry > :currentTime")
    Optional<DeliveryPartnerAuth> findByValidResetToken(@Param("token") String token, @Param("currentTime") LocalDateTime currentTime);
    
    // Find active partners by pincode
    List<DeliveryPartnerAuth> findByIsActiveTrueAndPincode(String pincode);
    
    // Find verified partners by pincode
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.verificationStatus = 'VERIFIED' AND dpa.pincode = :pincode AND dpa.isActive = true")
    List<DeliveryPartnerAuth> findVerifiedPartnersByPincode(@Param("pincode") String pincode);
    
    // Search partners by name, email, or phone
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE " +
           "dpa.fullName LIKE %:keyword% OR " +
           "dpa.email LIKE %:keyword% OR " +
           "dpa.phoneNumber LIKE %:keyword% OR " +
           "dpa.vehicleNumber LIKE %:keyword%")
    List<DeliveryPartnerAuth> searchPartners(@Param("keyword") String keyword);
    
    // Search partners by keyword and pincode
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE " +
           "(dpa.fullName LIKE %:keyword% OR " +
           "dpa.email LIKE %:keyword% OR " +
           "dpa.phoneNumber LIKE %:keyword% OR " +
           "dpa.vehicleNumber LIKE %:keyword%) AND " +
           "dpa.pincode = :pincode")
    List<DeliveryPartnerAuth> searchPartnersByPincode(@Param("keyword") String keyword, @Param("pincode") String pincode);
    
    // Count by verification status
    long countByVerificationStatus(String verificationStatus);
    
    // Count by verification status and pincode
    long countByVerificationStatusAndPincode(String verificationStatus, String pincode);
    
    // Count active partners
    long countByIsActiveTrue();
    
    // Count active partners by pincode
    long countByIsActiveTrueAndPincode(String pincode);
    
    // Find partners registered in date range
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.createdAt BETWEEN :startDate AND :endDate")
    List<DeliveryPartnerAuth> findByRegistrationDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find partners by vehicle type
    List<DeliveryPartnerAuth> findByVehicleType(String vehicleType);
    
    // Find partners by vehicle type and pincode
    List<DeliveryPartnerAuth> findByVehicleTypeAndPincode(String vehicleType, String pincode);
    
    // Find recently registered partners (last 7 days)
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.createdAt >= :cutoffDate ORDER BY dpa.createdAt DESC")
    List<DeliveryPartnerAuth> findRecentlyRegistered(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find partners who haven't logged in recently
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.lastLogin < :cutoffDate OR dpa.lastLogin IS NULL")
    List<DeliveryPartnerAuth> findInactivePartners(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find expired reset tokens for cleanup
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.resetToken IS NOT NULL AND dpa.resetTokenExpiry < :currentTime")
    List<DeliveryPartnerAuth> findExpiredResetTokens(@Param("currentTime") LocalDateTime currentTime);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if phone number exists
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Check if vehicle number exists
    boolean existsByVehicleNumber(String vehicleNumber);
    
    // Check if license number exists
    boolean existsByLicenseNumber(String licenseNumber);
    
    // Find partners with duplicate vehicle numbers
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.vehicleNumber = :vehicleNumber AND dpa.id != :excludeId")
    List<DeliveryPartnerAuth> findDuplicateVehicleNumbers(@Param("vehicleNumber") String vehicleNumber, @Param("excludeId") Long excludeId);
    
    // Find partners with duplicate license numbers
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.licenseNumber = :licenseNumber AND dpa.id != :excludeId")
    List<DeliveryPartnerAuth> findDuplicateLicenseNumbers(@Param("licenseNumber") String licenseNumber, @Param("excludeId") Long excludeId);
    
    // Get verification statistics
    @Query("SELECT dpa.verificationStatus, COUNT(dpa) FROM DeliveryPartnerAuth dpa GROUP BY dpa.verificationStatus")
    List<Object[]> getVerificationStatistics();
    
    // Get verification statistics by pincode
    @Query("SELECT dpa.verificationStatus, COUNT(dpa) FROM DeliveryPartnerAuth dpa WHERE dpa.pincode = :pincode GROUP BY dpa.verificationStatus")
    List<Object[]> getVerificationStatisticsByPincode(@Param("pincode") String pincode);
    
    // Get registration statistics by month
    @Query("SELECT YEAR(dpa.createdAt), MONTH(dpa.createdAt), COUNT(dpa) FROM DeliveryPartnerAuth dpa GROUP BY YEAR(dpa.createdAt), MONTH(dpa.createdAt) ORDER BY YEAR(dpa.createdAt) DESC, MONTH(dpa.createdAt) DESC")
    List<Object[]> getRegistrationStatisticsByMonth();
    
    // Find partners by multiple pincodes (for super admin)
    @Query("SELECT dpa FROM DeliveryPartnerAuth dpa WHERE dpa.pincode IN :pincodes")
    List<DeliveryPartnerAuth> findByPincodeIn(@Param("pincodes") List<String> pincodes);
    
    // Update last login time
    @Query("UPDATE DeliveryPartnerAuth dpa SET dpa.lastLogin = :loginTime, dpa.updatedAt = :loginTime WHERE dpa.id = :partnerId")
    void updateLastLogin(@Param("partnerId") Long partnerId, @Param("loginTime") LocalDateTime loginTime);
}