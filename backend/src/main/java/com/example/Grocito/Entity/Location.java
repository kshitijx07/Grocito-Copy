package com.example.Grocito.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "locations", indexes = {
    @Index(name = "idx_pincode", columnList = "pincode"),
    @Index(name = "idx_area_name", columnList = "areaName"),
    @Index(name = "idx_city", columnList = "city"),
    @Index(name = "idx_state", columnList = "state")
})
public class Location {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 6)
    private String pincode;
    
    @Column(nullable = false, length = 255)
    private String areaName;
    
    @Column(nullable = false, length = 100)
    private String city;
    
    @Column(nullable = false, length = 100)
    private String state;
    
    @Column(length = 100)
    private String district;
    
    @Column(length = 100)
    private String subDistrict;
    
    @Column(nullable = false)
    private Boolean serviceAvailable = false;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Constructors
    public Location() {}
    
    public Location(String pincode, String areaName, String city, String state) {
        this.pincode = pincode;
        this.areaName = areaName;
        this.city = city;
        this.state = state;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getPincode() {
        return pincode;
    }
    
    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
    
    public String getAreaName() {
        return areaName;
    }
    
    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getDistrict() {
        return district;
    }
    
    public void setDistrict(String district) {
        this.district = district;
    }
    
    public String getSubDistrict() {
        return subDistrict;
    }
    
    public void setSubDistrict(String subDistrict) {
        this.subDistrict = subDistrict;
    }
    
    public Boolean getServiceAvailable() {
        return serviceAvailable;
    }
    
    public void setServiceAvailable(Boolean serviceAvailable) {
        this.serviceAvailable = serviceAvailable;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Location{" +
                "id=" + id +
                ", pincode='" + pincode + '\'' +
                ", areaName='" + areaName + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", serviceAvailable=" + serviceAvailable +
                '}';
    }
}