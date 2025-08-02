package com.example.Grocito.Controller;

import com.example.Grocito.Entity.DeliveryPartnerAuth;
import com.example.Grocito.Services.DeliveryPartnerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/delivery-partner-auth")
public class DeliveryPartnerAuthController {
    private final Logger logger = LoggerFactory.getLogger(DeliveryPartnerAuthController.class);

    @Autowired
    private DeliveryPartnerAuthService authService;

    /**
     * Register a new delivery partner
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerPartner(@RequestBody DeliveryPartnerAuth authRecord) {
        try {
            logger.info("Registering new delivery partner: {}", authRecord.getEmail());

            DeliveryPartnerAuth registeredAuth = authService.registerPartner(authRecord);

            // Remove password from response
            registeredAuth.setPassword(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful. Your application is pending verification.");
            response.put("partner", registeredAuth);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error registering delivery partner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Login delivery partner
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginPartner(@RequestBody Map<String, String> loginData) {
        try {
            String emailOrPhone = loginData.get("emailOrPhone");
            String password = loginData.get("password");

            if (emailOrPhone == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email/Phone and password are required"));
            }

            logger.info("Login attempt for delivery partner: {}", emailOrPhone);

            Optional<DeliveryPartnerAuth> authOpt = authService.authenticatePartner(emailOrPhone, password);

            if (authOpt.isPresent()) {
                DeliveryPartnerAuth auth = authOpt.get();

                // Check verification status
                if (!"VERIFIED".equals(auth.getVerificationStatus())) {
                    String message = "PENDING".equals(auth.getVerificationStatus())
                            ? "Your account is pending verification"
                            : "Your account has been rejected";
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", message, "status", auth.getVerificationStatus()));
                }

                // Remove password from response
                auth.setPassword(null);

                // Generate a simple token (in production, use JWT)
                String token = "dp-token-" + auth.getId() + "-" + System.currentTimeMillis();

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("partner", auth);

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            logger.error("Error during login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Get pending verification requests (admin only)
     */
    @GetMapping("/pending-verification")
    public ResponseEntity<?> getPendingVerificationRequests(HttpServletRequest request) {
        try {
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);

            logger.info("Fetching pending verification requests for role: {}, pincode: {}", userRole, userPincode);

            List<DeliveryPartnerAuth> pendingRequests = authService.getPendingVerificationRequests(userRole,
                    userPincode);

            // Remove passwords from response
            pendingRequests.forEach(auth -> auth.setPassword(null));

            return ResponseEntity.ok(pendingRequests);
        } catch (Exception e) {
            logger.error("Error fetching pending verification requests: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching requests: " + e.getMessage()));
        }
    }

    /**
     * Update verification status (admin only)
     */
    @PutMapping("/{authId}/verification-status")
    public ResponseEntity<?> updateVerificationStatus(@PathVariable Long authId,
            @RequestBody Map<String, String> requestData,
            HttpServletRequest request) {
        try {
            String status = requestData.get("status");
            if (status == null || (!status.equals("VERIFIED") && !status.equals("REJECTED"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status must be VERIFIED or REJECTED"));
            }

            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);

            logger.info("Updating verification status for auth ID: {} to {}", authId, status);

            DeliveryPartnerAuth updatedAuth = authService.updateVerificationStatus(authId, status, userRole,
                    userPincode);

            // Remove password from response
            updatedAuth.setPassword(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Verification status updated successfully");
            response.put("partner", updatedAuth);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating verification status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Request password reset
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> requestData) {
        try {
            String email = requestData.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            logger.info("Password reset requested for: {}", email);

            authService.generatePasswordResetToken(email);

            return ResponseEntity.ok(Map.of("message", "Password reset link sent to your email"));
        } catch (Exception e) {
            logger.error("Error processing forgot password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reset password using token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> requestData) {
        try {
            String token = requestData.get("token");
            String newPassword = requestData.get("newPassword");

            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Token and new password are required"));
            }

            logger.info("Password reset attempt with token");

            authService.resetPassword(token, newPassword);

            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            logger.error("Error resetting password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Change password for authenticated delivery partner
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, Object> requestData) {
        try {
            Long partnerId = null;
            String currentPassword = (String) requestData.get("currentPassword");
            String newPassword = (String) requestData.get("newPassword");

            // Get partnerId from request data
            if (requestData.get("partnerId") instanceof Integer) {
                partnerId = ((Integer) requestData.get("partnerId")).longValue();
            } else if (requestData.get("partnerId") instanceof Long) {
                partnerId = (Long) requestData.get("partnerId");
            }

            if (partnerId == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Partner ID, current password, and new password are required"));
            }

            logger.info("Change password request for delivery partner ID: {}", partnerId);

            DeliveryPartnerAuth updatedAuth = authService.changePassword(partnerId, currentPassword, newPassword);

            // Remove password from response
            updatedAuth.setPassword(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            response.put("partner", updatedAuth);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error changing password: {}", e.getMessage());
            if (e.getMessage().contains("Invalid current password")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid current password"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error changing password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to change password. Please try again."));
        }
    }

    /**
     * Debug endpoint to check token parsing
     */
    @GetMapping("/debug-token")
    public ResponseEntity<?> debugToken(HttpServletRequest request) {
        String userRole = getUserRoleFromRequest(request);
        String userPincode = getUserPincodeFromRequest(request);
        String authHeader = request.getHeader("Authorization");
        
        Map<String, Object> debug = new HashMap<>();
        debug.put("authHeader", authHeader);
        debug.put("detectedRole", userRole);
        debug.put("detectedPincode", userPincode);
        
        return ResponseEntity.ok(debug);
    }

    /**
     * Get all auth records (admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllAuthRecords(@RequestParam(required = false) String status,
            HttpServletRequest request) {
        try {
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);

            logger.info("Fetching all auth records for role: {}, pincode: {}, status: {}", userRole, userPincode,
                    status);

            List<DeliveryPartnerAuth> authRecords = authService.getAllAuthRecords(userRole, userPincode, status);

            // Remove passwords from response
            authRecords.forEach(auth -> auth.setPassword(null));

            return ResponseEntity.ok(authRecords);
        } catch (Exception e) {
            logger.error("Error fetching auth records: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching records: " + e.getMessage()));
        }
    }

    /**
     * Search auth records (admin only)
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchAuthRecords(@RequestParam String keyword,
            HttpServletRequest request) {
        try {
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);

            logger.info("Searching auth records with keyword: {}", keyword);

            List<DeliveryPartnerAuth> authRecords = authService.searchAuthRecords(keyword, userRole, userPincode);

            // Remove passwords from response
            authRecords.forEach(auth -> auth.setPassword(null));

            return ResponseEntity.ok(authRecords);
        } catch (Exception e) {
            logger.error("Error searching auth records: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error searching records: " + e.getMessage()));
        }
    }

    /**
     * Get auth record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAuthRecordById(@PathVariable Long id, HttpServletRequest request) {
        try {
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);

            logger.info("Fetching auth record with ID: {}", id);

            Optional<DeliveryPartnerAuth> authOpt = authService.getAuthRecordById(id, userRole, userPincode);

            if (authOpt.isPresent()) {
                DeliveryPartnerAuth auth = authOpt.get();
                auth.setPassword(null); // Remove password from response
                return ResponseEntity.ok(auth);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching auth record: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching record: " + e.getMessage()));
        }
    }

    /**
     * Update auth record
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAuthRecord(@PathVariable Long id,
            @RequestBody DeliveryPartnerAuth updatedAuth,
            HttpServletRequest request) {
        try {
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);

            // Check access
            Optional<DeliveryPartnerAuth> existingOpt = authService.getAuthRecordById(id, userRole, userPincode);
            if (!existingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            logger.info("Updating auth record with ID: {}", id);

            DeliveryPartnerAuth updated = authService.updateAuthRecord(id, updatedAuth);
            updated.setPassword(null); // Remove password from response

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating auth record: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error updating record: " + e.getMessage()));
        }
    }

    /**
     * Deactivate auth record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateAuthRecord(@PathVariable Long id, HttpServletRequest request) {
        try {
            String userRole = getUserRoleFromRequest(request);
            String userPincode = getUserPincodeFromRequest(request);

            // Check access
            Optional<DeliveryPartnerAuth> existingOpt = authService.getAuthRecordById(id, userRole, userPincode);
            if (!existingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            logger.info("Deactivating auth record with ID: {}", id);

            authService.deactivateAuthRecord(id);

            return ResponseEntity.ok(Map.of("message", "Auth record deactivated successfully"));
        } catch (Exception e) {
            logger.error("Error deactivating auth record: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error deactivating record: " + e.getMessage()));
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

        // Default to ADMIN for development (more restrictive)
        return "ADMIN";
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

        return "441904"; // Default pincode restriction for development
    }
}