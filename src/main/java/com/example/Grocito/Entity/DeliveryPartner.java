package com.example.Grocito.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "delivery_partners")
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Information
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Column(name = "phone_number", nullable = false, unique = true, length = 15)
    private String phoneNumber;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    // Vehicle Information
    @Column(name = "vehicle_type", nullable = false, length = 50)
    private String vehicleType; // BIKE, SCOOTER, BICYCLE
    
    @Column(name = "vehicle_number", nullable = false, length = 20)
    private String vehicleNumber;
    
    @Column(name = "driving_license", nullable = false, length = 50)
    private String drivingLicense;

    // Location and Availability
    @Column(name = "assigned_pincode", nullable = false, length = 10)
    private String assignedPincode;
    
    @Column(name = "current_latitude", precision = 10, scale = 8)
    private BigDecimal currentLatitude;
    
    @Column(name = "current_longitude", precision = 11, scale = 8)
    private BigDecimal currentLongitude;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = false;
    
    @Column(name = "availability_status", length = 20)
    private String availabilityStatus = "OFFLINE"; // ONLINE, BUSY, OFFLINE

    // Performance Metrics
    @Column(name = "total_deliveries")
    private Integer totalDeliveries = 0;
    
    @Column(name = "successful_deliveries")
    private Integer successfulDeliveries = 0;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Column(name = "total_earnings", precision = 10, scale = 2)
    private BigDecimal totalEarnings = BigDecimal.ZERO;

    // Account Status
    @Column(name = "verification_status", length = 20)
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED
    
    @Column(name = "account_status", length = 20)
    private String accountStatus = "ACTIVE"; // ACTIVE, SUSPENDED, DEACTIVATED

    // Bank Details for Payments
    @Column(name = "bank_account_number", length = 20)
    private String bankAccountNumber;
    
    @Column(name = "bank_ifsc_code", length = 15)
    private String bankIfscCode;
    
    @Column(name = "bank_account_holder_name", length = 100)
    private String bankAccountHolderName;

    // Link to authentication record
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auth_id")
    private DeliveryPartnerAuth authRecord;

    // Timestamps
    @Column(name = "created_at", nullable = true)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", nullable = true)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    // Constructors
    public DeliveryPartner() {
        super();
    }

    public DeliveryPartner(String fullName, String phoneNumber, String vehicleType, 
                          String vehicleNumber, String drivingLicense, String assignedPincode) {
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.drivingLicense = drivingLicense;
        this.assignedPincode = assignedPincode;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
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

    public String getDrivingLicense() {
        return drivingLicense;
    }

    public void setDrivingLicense(String drivingLicense) {
        this.drivingLicense = drivingLicense;
    }

    public String getAssignedPincode() {
        return assignedPincode;
    }

    public void setAssignedPincode(String assignedPincode) {
        this.assignedPincode = assignedPincode;
    }

    public BigDecimal getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(BigDecimal currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public BigDecimal getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(BigDecimal currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public Integer getTotalDeliveries() {
        return totalDeliveries;
    }

    public void setTotalDeliveries(Integer totalDeliveries) {
        this.totalDeliveries = totalDeliveries;
    }

    public Integer getSuccessfulDeliveries() {
        return successfulDeliveries;
    }

    public void setSuccessfulDeliveries(Integer successfulDeliveries) {
        this.successfulDeliveries = successfulDeliveries;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public BigDecimal getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(BigDecimal totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getBankIfscCode() {
        return bankIfscCode;
    }

    public void setBankIfscCode(String bankIfscCode) {
        this.bankIfscCode = bankIfscCode;
    }

    public String getBankAccountHolderName() {
        return bankAccountHolderName;
    }

    public void setBankAccountHolderName(String bankAccountHolderName) {
        this.bankAccountHolderName = bankAccountHolderName;
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

    public LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(LocalDateTime lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    public DeliveryPartnerAuth getAuthRecord() {
        return authRecord;
    }

    public void setAuthRecord(DeliveryPartnerAuth authRecord) {
        this.authRecord = authRecord;
    }

    // Utility methods
    public void updateLastActive() {
        this.lastActiveAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public double getSuccessRate() {
        if (totalDeliveries == null || totalDeliveries == 0) {
            return 0.0;
        }
        return (double) (successfulDeliveries != null ? successfulDeliveries : 0) / totalDeliveries * 100;
    }

    public boolean isOnline() {
        return "ONLINE".equals(availabilityStatus) && Boolean.TRUE.equals(isAvailable);
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "DeliveryPartner{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", vehicleType='" + vehicleType + '\'' +
                ", assignedPincode='" + assignedPincode + '\'' +
                ", availabilityStatus='" + availabilityStatus + '\'' +
                ", totalDeliveries=" + totalDeliveries +
                ", verificationStatus='" + verificationStatus + '\'' +
                '}';
    }
}
