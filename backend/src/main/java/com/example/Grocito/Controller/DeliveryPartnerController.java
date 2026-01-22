package com.example.Grocito.Controller;

import com.example.Grocito.Entity.DeliveryPartner;
import com.example.Grocito.Services.DeliveryPartnerService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/delivery-partners")
public class DeliveryPartnerController {
    private final Logger logger;
    
    @Autowired
    private DeliveryPartnerService deliveryPartnerService;
    
    public DeliveryPartnerController() {
        this.logger = LoggerFactory.getLogger(DeliveryPartnerController.class);
    }
    
    /**
     * Register a new delivery partner
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerPartner(@RequestBody DeliveryPartner partner) {
        try {
            logger.info("Registering new delivery partner: {}", partner.getFullName());
            
            // Basic validation
            if (partner.getFullName() == null || partner.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Full name is required");
            }
            if (partner.getPhoneNumber() == null || partner.getPhoneNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone number is required");
            }
            if (partner.getAssignedPincode() == null || partner.getAssignedPincode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Assigned pincode is required");
            }
            
            DeliveryPartner registeredPartner = deliveryPartnerService.registerPartner(partner);
            logger.info("Delivery partner registered successfully with ID: {}", registeredPartner.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredPartner);
        } catch (Exception e) {
            logger.error("Error registering delivery partner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error registering delivery partner: " + e.getMessage());
        }
    }
    
    /**
     * Get all delivery partners with role-based access control
     */
    @GetMapping({"", "/all"})
    public ResponseEntity<?> getAllDeliveryPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(required = false) String verificationStatus,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(required = false) String availabilityStatus,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        
        try {
            logger.info("Fetching delivery partners with filters");
            
            // Get user role and pincode from request
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            logger.debug("User role: {}, User pincode: {}", userRole, userPincode);
            
            if (page == 0 && size == 10 && search == null) {
                // Simple list request
                List<DeliveryPartner> partners = deliveryPartnerService.getAllDeliveryPartners(userRole, userPincode);
                return ResponseEntity.ok(partners);
            } else {
                // Paginated request with filters
                Page<DeliveryPartner> partnerPage = deliveryPartnerService.getFilteredPartners(
                        page, size, sortBy, verificationStatus, accountStatus, 
                        availabilityStatus, pincode, userRole, userPincode);
                return ResponseEntity.ok(partnerPage);
            }
        } catch (Exception e) {
            logger.error("Error fetching delivery partners: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching delivery partners: " + e.getMessage());
        }
    }
    
    /**
     * Get delivery partner by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDeliveryPartnerById(@PathVariable Long id, HttpServletRequest request) {
        try {
            logger.info("Fetching delivery partner with ID: {}", id);
            
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            Optional<DeliveryPartner> partnerOpt = deliveryPartnerService.getDeliveryPartnerById(id, userRole, userPincode);
            
            if (partnerOpt.isPresent()) {
                return ResponseEntity.ok(partnerOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching delivery partner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching delivery partner: " + e.getMessage());
        }
    }
    
    /**
     * Update delivery partner profile
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePartner(@PathVariable Long id, @RequestBody DeliveryPartner partner, 
                                          HttpServletRequest request) {
        try {
            logger.info("Updating delivery partner with ID: {}", id);
            
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            // Check if partner exists and user has access
            Optional<DeliveryPartner> existingPartnerOpt = deliveryPartnerService.getDeliveryPartnerById(id, userRole, userPincode);
            if (!existingPartnerOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            partner.setId(id);
            DeliveryPartner updatedPartner = deliveryPartnerService.updatePartner(partner);
            
            return ResponseEntity.ok(updatedPartner);
        } catch (Exception e) {
            logger.error("Error updating delivery partner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating delivery partner: " + e.getMessage());
        }
    }
    
    /**
     * Update partner availability status
     */
    @PutMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id, 
                                               @RequestBody Map<String, Object> availabilityData,
                                               HttpServletRequest request) {
        try {
            logger.info("Updating availability for partner ID: {}", id);
            
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            // Check if partner exists and user has access
            Optional<DeliveryPartner> partnerOpt = deliveryPartnerService.getDeliveryPartnerById(id, userRole, userPincode);
            if (!partnerOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Boolean isAvailable = (Boolean) availabilityData.get("isAvailable");
            String availabilityStatus = (String) availabilityData.get("availabilityStatus");
            
            if (isAvailable == null || availabilityStatus == null) {
                return ResponseEntity.badRequest().body("Both isAvailable and availabilityStatus are required");
            }
            
            DeliveryPartner updatedPartner = deliveryPartnerService.updateAvailability(id, isAvailable, availabilityStatus);
            
            return ResponseEntity.ok(updatedPartner);
        } catch (Exception e) {
            logger.error("Error updating partner availability: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating availability: " + e.getMessage());
        }
    }
    
    /**
     * Update partner location
     */
    @PutMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(@PathVariable Long id, 
                                           @RequestBody Map<String, Double> locationData) {
        try {
            logger.debug("Updating location for partner ID: {}", id);
            
            Double latitude = locationData.get("latitude");
            Double longitude = locationData.get("longitude");
            
            if (latitude == null || longitude == null) {
                return ResponseEntity.badRequest().body("Both latitude and longitude are required");
            }
            
            DeliveryPartner updatedPartner = deliveryPartnerService.updateLocation(id, latitude, longitude);
            
            return ResponseEntity.ok(updatedPartner);
        } catch (Exception e) {
            logger.error("Error updating partner location: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating location: " + e.getMessage());
        }
    }
    
    /**
     * Update partner verification status (admin only)
     */
    @PutMapping("/{id}/verification")
    public ResponseEntity<?> updateVerificationStatus(@PathVariable Long id, 
                                                     @RequestBody Map<String, String> verificationData,
                                                     HttpServletRequest request) {
        try {
            logger.info("Updating verification status for partner ID: {}", id);
            
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            // Check if partner exists and user has access
            Optional<DeliveryPartner> partnerOpt = deliveryPartnerService.getDeliveryPartnerById(id, userRole, userPincode);
            if (!partnerOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            String verificationStatus = verificationData.get("verificationStatus");
            if (verificationStatus == null || verificationStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Verification status is required");
            }
            
            DeliveryPartner updatedPartner = deliveryPartnerService.updateVerificationStatus(id, verificationStatus);
            
            return ResponseEntity.ok(updatedPartner);
        } catch (Exception e) {
            logger.error("Error updating verification status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating verification status: " + e.getMessage());
        }
    }
    
    /**
     * Get available delivery partners for order assignment
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailablePartners(@RequestParam String pincode) {
        try {
            logger.info("Fetching available delivery partners for pincode: {}", pincode);
            
            List<DeliveryPartner> availablePartners = deliveryPartnerService.getAvailablePartnersForPincode(pincode);
            
            return ResponseEntity.ok(availablePartners);
        } catch (Exception e) {
            logger.error("Error fetching available partners: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching available partners: " + e.getMessage());
        }
    }
    
    /**
     * Get delivery partner analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(HttpServletRequest request) {
        try {
            logger.info("Fetching delivery partner analytics");
            
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            Map<String, Object> analytics = deliveryPartnerService.getDeliveryPartnerAnalytics(userRole, userPincode);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error fetching analytics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching analytics: " + e.getMessage());
        }
    }
    
    /**
     * Search delivery partners
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchPartners(@RequestParam String keyword, HttpServletRequest request) {
        try {
            logger.info("Searching delivery partners with keyword: {}", keyword);
            
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            List<DeliveryPartner> partners = deliveryPartnerService.searchPartners(keyword, userRole, userPincode);
            
            return ResponseEntity.ok(partners);
        } catch (Exception e) {
            logger.error("Error searching partners: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching partners: " + e.getMessage());
        }
    }
    
    /**
     * Delete delivery partner (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePartner(@PathVariable Long id, HttpServletRequest request) {
        try {
            logger.info("Deleting delivery partner with ID: {}", id);
            
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);
            
            // Check if partner exists and user has access
            Optional<DeliveryPartner> partnerOpt = deliveryPartnerService.getDeliveryPartnerById(id, userRole, userPincode);
            if (!partnerOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            deliveryPartnerService.deletePartner(id);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting partner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting partner: " + e.getMessage());
        }
    }
    
    /**
     * Create sample delivery partners for testing
     */
    @PostMapping("/create-sample-data")
    public ResponseEntity<?> createSampleData() {
        try {
            logger.info("Creating sample delivery partners for testing");
            
            String[] pincodes = {"110001", "110002", "110003", "412105", "441904"};
            String[] names = {"Rajesh Kumar", "Amit Singh", "Suresh Patel", "Vikram Sharma", "Ravi Gupta"};
            String[] phones = {"9876543210", "9876543211", "9876543212", "9876543213", "9876543214"};
            String[] emails = {"rajesh@delivery.com", "amit@delivery.com", "suresh@delivery.com", "vikram@delivery.com", "ravi@delivery.com"};
            String[] vehicleTypes = {"BIKE", "SCOOTER", "BIKE", "SCOOTER", "BIKE"};
            String[] vehicleNumbers = {"MH12AB1234", "DL01CD5678", "UP16EF9012", "MH14GH3456", "MH22IJ7890"};
            
            int createdCount = 0;
            
            for (int i = 0; i < pincodes.length; i++) {
                DeliveryPartner partner = new DeliveryPartner();
                partner.setFullName(names[i]);
                partner.setPhoneNumber(phones[i]);
                partner.setEmail(emails[i]);
                partner.setAssignedPincode(pincodes[i]);
                partner.setVehicleType(vehicleTypes[i]);
                partner.setVehicleNumber(vehicleNumbers[i]);
                partner.setDrivingLicense("DL" + (1000 + i));
                
                try {
                    deliveryPartnerService.registerPartner(partner);
                    createdCount++;
                } catch (Exception e) {
                    logger.warn("Failed to create sample partner {}: {}", names[i], e.getMessage());
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Sample delivery partners created successfully");
            result.put("partnersCreated", createdCount);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error creating sample data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating sample data: " + e.getMessage());
        }
    }
    
    // Helper methods for role-based access control
    private String getUserRoleFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            if (token.contains("demo-admin-token")) {
                // Extract user ID from token format: demo-admin-token-{userId}-{timestamp}
                String[] parts = token.split("-");
                if (parts.length >= 4) {
                    String userId = parts[3]; // Get the user ID part
                    if ("1".equals(userId)) {
                        return "SUPER_ADMIN"; // User ID 1 is Super Admin
                    } else {
                        return "ADMIN"; // Other user IDs are regular admins
                    }
                }
                return "ADMIN"; // Default to ADMIN if pattern doesn't match
            }
        }
        
        // Default to SUPER_ADMIN for development
        return "SUPER_ADMIN";
    }
    
    private String getUserPincodeFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            if (token.contains("demo-admin-token")) {
                // Extract user ID from token format: demo-admin-token-{userId}-{timestamp}
                String[] parts = token.split("-");
                if (parts.length >= 4) {
                    String userId = parts[3]; // Get the user ID part
                    switch (userId) {
                        case "1": return null; // Super admin - no pincode restriction
                        case "2": return "110001"; // South Delhi Admin
                        case "3": return "110002"; // North Delhi Admin
                        case "4": return "110003"; // East Delhi Admin
                        case "5": return "412105"; // Pune Admin
                        case "6": return "441904"; // Nagpur Admin
                        case "7": return "441904"; // Default Demo Admin
                        default: return "441904"; // Default pincode for other admins
                    }
                }
            }
        }
        
        return null; // Super admin access (no pincode restriction)
    }
}