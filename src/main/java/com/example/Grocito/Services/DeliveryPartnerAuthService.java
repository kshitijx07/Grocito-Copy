package com.example.Grocito.Services;

import com.example.Grocito.Entity.DeliveryPartnerAuth;
import com.example.Grocito.Repository.DeliveryPartnerAuthRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeliveryPartnerAuthService {
    private final Logger logger = LoggerFactory.getLogger(DeliveryPartnerAuthService.class);
    
    @Autowired
    private DeliveryPartnerAuthRepository authRepository;
    
    // Removed DeliveryPartnerRepository since we're using auth table as main table
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Register a new delivery partner
     */
    @Transactional
    public DeliveryPartnerAuth registerPartner(DeliveryPartnerAuth authRecord) {
        logger.info("Registering new delivery partner: {}", authRecord.getEmail());
        
        // Validate required fields
        validateRegistrationData(authRecord);
        
        // Check for duplicates
        checkForDuplicates(authRecord);
        
        // Set default values
        authRecord.setVerificationStatus("PENDING");
        authRecord.setIsActive(true);
        authRecord.setCreatedAt(LocalDateTime.now());
        authRecord.setUpdatedAt(LocalDateTime.now());
        
        // Save auth record
        DeliveryPartnerAuth savedAuth = authRepository.save(authRecord);
        
        logger.info("Delivery partner registered successfully with ID: {}", savedAuth.getId());
        
        // Send notification to admin about new registration
        try {
            sendRegistrationNotificationToAdmin(savedAuth);
        } catch (Exception e) {
            logger.warn("Failed to send registration notification: {}", e.getMessage());
        }
        
        return savedAuth;
    }
    
    /**
     * Authenticate delivery partner login
     */
    public Optional<DeliveryPartnerAuth> authenticatePartner(String emailOrPhone, String password) {
        logger.debug("Authenticating delivery partner: {}", emailOrPhone);
        
        Optional<DeliveryPartnerAuth> authOpt;
        
        // Try email first, then phone
        if (emailOrPhone.contains("@")) {
            authOpt = authRepository.findByEmailAndPassword(emailOrPhone, password);
        } else {
            authOpt = authRepository.findByPhoneNumberAndPassword(emailOrPhone, password);
        }
        
        if (authOpt.isPresent()) {
            DeliveryPartnerAuth auth = authOpt.get();
            
            // Check if account is active
            if (!auth.getIsActive()) {
                logger.warn("Login attempt for inactive account: {}", emailOrPhone);
                return Optional.empty();
            }
            
            // Update last login
            auth.updateLastLogin();
            authRepository.save(auth);
            
            logger.info("Delivery partner authenticated successfully: {}", emailOrPhone);
            return Optional.of(auth);
        } else {
            logger.warn("Authentication failed for: {}", emailOrPhone);
            return Optional.empty();
        }
    }
    
    /**
     * Get pending verification requests
     */
    public List<DeliveryPartnerAuth> getPendingVerificationRequests(String userRole, String userPincode) {
        logger.debug("Fetching pending verification requests for role: {}, pincode: {}", userRole, userPincode);
        
        if ("ADMIN".equals(userRole) && userPincode != null) {
            return authRepository.findPendingVerificationRequestsByPincode(userPincode);
        } else {
            return authRepository.findPendingVerificationRequests();
        }
    }
    
    /**
     * Verify or reject delivery partner
     */
    @Transactional
    public DeliveryPartnerAuth updateVerificationStatus(Long authId, String status, String userRole, String userPincode) {
        logger.info("Updating verification status for auth ID: {} to {}", authId, status);
        
        Optional<DeliveryPartnerAuth> authOpt = authRepository.findById(authId);
        if (!authOpt.isPresent()) {
            throw new RuntimeException("Delivery partner auth record not found with ID: " + authId);
        }
        
        DeliveryPartnerAuth auth = authOpt.get();
        
        // Check if admin has access to this partner
        if ("ADMIN".equals(userRole) && userPincode != null && !userPincode.equals(auth.getPincode())) {
            throw new RuntimeException("Access denied: Partner is not in your assigned pincode");
        }
        
        String oldStatus = auth.getVerificationStatus();
        auth.setVerificationStatus(status);
        auth.setUpdatedAt(LocalDateTime.now());
        
        DeliveryPartnerAuth updatedAuth = authRepository.save(auth);
        
        // No need to create separate delivery partner record
        // The delivery_partner_auth table IS the main delivery partner table
        
        // Send notification email to partner
        try {
            sendVerificationStatusEmail(auth, status);
        } catch (Exception e) {
            logger.warn("Failed to send verification status email: {}", e.getMessage());
        }
        
        logger.info("Verification status updated successfully");
        return updatedAuth;
    }
    
    /**
     * Generate password reset token
     */
    public void generatePasswordResetToken(String email) {
        logger.info("Generating password reset token for: {}", email);
        
        Optional<DeliveryPartnerAuth> authOpt = authRepository.findByEmail(email);
        if (!authOpt.isPresent()) {
            throw new RuntimeException("No account found with email: " + email);
        }
        
        DeliveryPartnerAuth auth = authOpt.get();
        auth.generateResetToken();
        authRepository.save(auth);
        
        // Send reset email
        try {
            sendPasswordResetEmail(auth);
        } catch (Exception e) {
            logger.error("Failed to send password reset email: {}", e.getMessage());
            throw new RuntimeException("Failed to send password reset email");
        }
        
        logger.info("Password reset token generated and email sent");
    }
    
    /**
     * Reset password using token
     */
    public void resetPassword(String token, String newPassword) {
        logger.info("Resetting password using token");
        
        Optional<DeliveryPartnerAuth> authOpt = authRepository.findByValidResetToken(token, LocalDateTime.now());
        if (!authOpt.isPresent()) {
            throw new RuntimeException("Invalid or expired reset token");
        }
        
        DeliveryPartnerAuth auth = authOpt.get();
        auth.setPassword(newPassword);
        auth.clearResetToken();
        authRepository.save(auth);
        
        logger.info("Password reset successfully for: {}", auth.getEmail());
    }
    
    /**
     * Change password for delivery partner
     */
    @Transactional
    public DeliveryPartnerAuth changePassword(Long partnerId, String currentPassword, String newPassword) {
        logger.info("Changing password for delivery partner ID: {}", partnerId);
        
        Optional<DeliveryPartnerAuth> authOpt = authRepository.findById(partnerId);
        if (!authOpt.isPresent()) {
            throw new RuntimeException("Delivery partner not found with ID: " + partnerId);
        }
        
        DeliveryPartnerAuth auth = authOpt.get();
        
        // Verify current password (plain text comparison like in authentication)
        if (!currentPassword.equals(auth.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long");
        }
        
        // Check if new password is different from current
        if (newPassword.equals(auth.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }
        
        // Update password (plain text storage like in resetPassword method)
        auth.setPassword(newPassword);
        auth.setUpdatedAt(LocalDateTime.now());
        
        DeliveryPartnerAuth updatedAuth = authRepository.save(auth);
        logger.info("Password changed successfully for delivery partner ID: {}", partnerId);
        
        return updatedAuth;
    }

    /**
     * Get all auth records with filtering
     */
    public List<DeliveryPartnerAuth> getAllAuthRecords(String userRole, String userPincode, String status) {
        logger.info("Fetching auth records for role: {}, pincode: {}, status: {}", userRole, userPincode, status);
        
        List<DeliveryPartnerAuth> records;
        
        if ("ADMIN".equals(userRole) && userPincode != null) {
            logger.info("Admin access detected - filtering by pincode: {}", userPincode);
            if (status != null && !status.isEmpty()) {
                records = authRepository.findByVerificationStatusAndPincode(status, userPincode);
                logger.info("Found {} records with status {} and pincode {}", records.size(), status, userPincode);
            } else {
                records = authRepository.findByIsActiveTrueAndPincode(userPincode);
                logger.info("Found {} active records with pincode {}", records.size(), userPincode);
            }
        } else {
            logger.info("Super admin access detected - no pincode filtering");
            if (status != null && !status.isEmpty()) {
                records = authRepository.findByVerificationStatus(status);
                logger.info("Found {} records with status {}", records.size(), status);
            } else {
                records = authRepository.findAll();
                logger.info("Found {} total records", records.size());
            }
        }
        
        return records;
    }
    
    /**
     * Search auth records
     */
    public List<DeliveryPartnerAuth> searchAuthRecords(String keyword, String userRole, String userPincode) {
        logger.debug("Searching auth records with keyword: {}", keyword);
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllAuthRecords(userRole, userPincode, null);
        }
        
        if ("ADMIN".equals(userRole) && userPincode != null) {
            return authRepository.searchPartnersByPincode(keyword, userPincode);
        } else {
            return authRepository.searchPartners(keyword);
        }
    }
    
    /**
     * Get auth record by ID
     */
    public Optional<DeliveryPartnerAuth> getAuthRecordById(Long id, String userRole, String userPincode) {
        Optional<DeliveryPartnerAuth> authOpt = authRepository.findById(id);
        
        if (authOpt.isPresent() && "ADMIN".equals(userRole) && userPincode != null) {
            DeliveryPartnerAuth auth = authOpt.get();
            if (!userPincode.equals(auth.getPincode())) {
                return Optional.empty();
            }
        }
        
        return authOpt;
    }
    
    /**
     * Update auth record
     */
    public DeliveryPartnerAuth updateAuthRecord(Long id, DeliveryPartnerAuth updatedAuth) {
        logger.info("Updating auth record: {}", id);
        
        Optional<DeliveryPartnerAuth> existingOpt = authRepository.findById(id);
        if (!existingOpt.isPresent()) {
            throw new RuntimeException("Auth record not found with ID: " + id);
        }
        
        DeliveryPartnerAuth existing = existingOpt.get();
        
        // Update allowed fields
        if (updatedAuth.getFullName() != null) existing.setFullName(updatedAuth.getFullName());
        if (updatedAuth.getPhoneNumber() != null) existing.setPhoneNumber(updatedAuth.getPhoneNumber());
        if (updatedAuth.getVehicleType() != null) existing.setVehicleType(updatedAuth.getVehicleType());
        if (updatedAuth.getVehicleNumber() != null) existing.setVehicleNumber(updatedAuth.getVehicleNumber());
        if (updatedAuth.getLicenseNumber() != null) existing.setLicenseNumber(updatedAuth.getLicenseNumber());
        
        existing.setUpdatedAt(LocalDateTime.now());
        
        return authRepository.save(existing);
    }
    
    /**
     * Deactivate auth record
     */
    public void deactivateAuthRecord(Long id) {
        logger.info("Deactivating auth record: {}", id);
        
        Optional<DeliveryPartnerAuth> authOpt = authRepository.findById(id);
        if (!authOpt.isPresent()) {
            throw new RuntimeException("Auth record not found with ID: " + id);
        }
        
        DeliveryPartnerAuth auth = authOpt.get();
        auth.setIsActive(false);
        auth.setUpdatedAt(LocalDateTime.now());
        
        authRepository.save(auth);
        
        // No separate delivery partner record to deactivate
        // The auth record IS the main delivery partner record
    }
    
    // Private helper methods
    
    private void validateRegistrationData(DeliveryPartnerAuth auth) {
        if (auth.getEmail() == null || auth.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (auth.getPassword() == null || auth.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        if (auth.getPhoneNumber() == null || auth.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }
        if (auth.getFullName() == null || auth.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }
        if (auth.getPincode() == null || auth.getPincode().trim().isEmpty()) {
            throw new RuntimeException("Pincode is required");
        }
        if (auth.getVehicleType() == null || auth.getVehicleType().trim().isEmpty()) {
            throw new RuntimeException("Vehicle type is required");
        }
        if (auth.getVehicleNumber() == null || auth.getVehicleNumber().trim().isEmpty()) {
            throw new RuntimeException("Vehicle number is required");
        }
        if (auth.getLicenseNumber() == null || auth.getLicenseNumber().trim().isEmpty()) {
            throw new RuntimeException("License number is required");
        }
        
        // Validate email format
        if (!auth.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("Invalid email format");
        }
        
        // Validate phone number format (basic validation)
        if (!auth.getPhoneNumber().matches("^[0-9]{10}$")) {
            throw new RuntimeException("Phone number must be 10 digits");
        }
        
        // Validate pincode format
        if (!auth.getPincode().matches("^[0-9]{6}$")) {
            throw new RuntimeException("Pincode must be 6 digits");
        }
    }
    
    private void checkForDuplicates(DeliveryPartnerAuth auth) {
        if (authRepository.existsByEmail(auth.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (authRepository.existsByPhoneNumber(auth.getPhoneNumber())) {
            throw new RuntimeException("Phone number already registered");
        }
        if (authRepository.existsByVehicleNumber(auth.getVehicleNumber())) {
            throw new RuntimeException("Vehicle number already registered");
        }
        if (authRepository.existsByLicenseNumber(auth.getLicenseNumber())) {
            throw new RuntimeException("License number already registered");
        }
    }
    
    // Method removed - no separate delivery partner record needed
    // The delivery_partner_auth table IS the main delivery partner table
    
    private void sendRegistrationNotificationToAdmin(DeliveryPartnerAuth auth) {
        // This would send an email to admin about new registration
        // For now, just log it
        logger.info("New delivery partner registration notification: {} in pincode {}", 
                   auth.getFullName(), auth.getPincode());
    }
    
    private void sendVerificationStatusEmail(DeliveryPartnerAuth auth, String status) {
        String subject = "Delivery Partner Application Status Update";
        String message;
        
        if ("VERIFIED".equals(status)) {
            message = String.format("Dear %s,\n\nCongratulations! Your delivery partner application has been approved. You can now log in to your dashboard and start accepting delivery orders.\n\nBest regards,\nGrocito Team", auth.getFullName());
        } else if ("REJECTED".equals(status)) {
            message = String.format("Dear %s,\n\nWe regret to inform you that your delivery partner application has been rejected. Please contact our support team for more information.\n\nBest regards,\nGrocito Team", auth.getFullName());
        } else {
            return; // Don't send email for other statuses
        }
        
        try {
            emailService.sendSimpleMessage(auth.getEmail(), subject, message);
        } catch (Exception e) {
            logger.error("Failed to send verification status email: {}", e.getMessage());
        }
    }
    
    private void sendPasswordResetEmail(DeliveryPartnerAuth auth) {
        String subject = "Password Reset Request - Delivery Partner";
        String resetLink = "http://localhost:3002/auth/reset-password?token=" + auth.getResetToken();
        String message = String.format(
            "Dear %s,\n\nYou have requested to reset your password. Please click the link below to reset your password:\n\n%s\n\nThis link will expire in 24 hours.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nGrocito Team",
            auth.getFullName(), resetLink
        );
        
        emailService.sendSimpleMessage(auth.getEmail(), subject, message);
    }
}