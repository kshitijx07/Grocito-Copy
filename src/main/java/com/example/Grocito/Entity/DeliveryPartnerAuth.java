package com.example.Grocito.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partner_auth")
public class DeliveryPartnerAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Authentication Information
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "password", nullable = false, length = 255)
    private String password;
    
    @Column(name = "phone_number", nullable = false, unique = true, length = 15)
    private String phoneNumber;
    
    // Personal Information
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Column(name = "pincode", nullable = false, length = 10)
    private String pincode;
    
    // Vehicle Information
    @Column(name = "vehicle_type", nullable = false, length = 50)
    private String vehicleType; // BIKE, SCOOTER, BICYCLE, CAR
    
    @Column(name = "vehicle_number", nullable = false, length = 20)
    private String vehicleNumber;
    
    @Column(name = "license_number", nullable = false, length = 50)
    private String licenseNumber;
    
    // Status
    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Password Reset
    @Column(name = "reset_token", length = 255)
    private String resetToken;
    
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;
    
    // Timestamps
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Note: delivery_partner_auth IS the main delivery partner table
    // No separate DeliveryPartner entity needed

    // Constructors
    public DeliveryPartnerAuth() {
        super();
    }

    public DeliveryPartnerAuth(String email, String password, String phoneNumber, String fullName, 
                              String pincode, String vehicleType, String vehicleNumber, String licenseNumber) {
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.fullName = fullName;
        this.pincode = pincode;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.licenseNumber = licenseNumber;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public LocalDateTime getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
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

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    // Removed DeliveryPartner relationship methods since we're using auth table as main table

    // Utility methods
    public void updateLastLogin() {
        this.lastLogin = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isVerified() {
        return "VERIFIED".equals(verificationStatus);
    }

    public boolean isPending() {
        return "PENDING".equals(verificationStatus);
    }

    public boolean isRejected() {
        return "REJECTED".equals(verificationStatus);
    }

    public void generateResetToken() {
        this.resetToken = java.util.UUID.randomUUID().toString();
        this.resetTokenExpiry = LocalDateTime.now().plusHours(24); // Token valid for 24 hours
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isResetTokenValid() {
        return resetToken != null && resetTokenExpiry != null && 
               LocalDateTime.now().isBefore(resetTokenExpiry);
    }

    public void clearResetToken() {
        this.resetToken = null;
        this.resetTokenExpiry = null;
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "DeliveryPartnerAuth{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", pincode='" + pincode + '\'' +
                ", vehicleType='" + vehicleType + '\'' +
                ", verificationStatus='" + verificationStatus + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                '}';
    }
}