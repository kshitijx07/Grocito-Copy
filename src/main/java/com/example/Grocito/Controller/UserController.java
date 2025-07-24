package com.example.Grocito.Controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.User;
import com.example.Grocito.Services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerConfig.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        logger.info("Received registration request for email: {}", user.getEmail());
        try {
            // Validate required fields
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                logger.warn("Registration failed: Email is required");
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                logger.warn("Registration failed: Password is required");
                return ResponseEntity.badRequest().body("Password is required");
            }
            
            if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
                logger.warn("Registration failed: Full name is required");
                return ResponseEntity.badRequest().body("Full name is required");
            }
            
            // Trim input fields
            user.setEmail(user.getEmail().trim());
            user.setFullName(user.getFullName().trim());
            if (user.getAddress() != null) user.setAddress(user.getAddress().trim());
            if (user.getPincode() != null) user.setPincode(user.getPincode().trim());
            if (user.getContactNumber() != null) user.setContactNumber(user.getContactNumber().trim());
            
            logger.debug("Attempting to register user with email: {}", user.getEmail());
            User registeredUser = userService.register(user);
            
            // Send welcome email
            userService.sendWelcomeEmail(registeredUser);
            
            logger.info("User registered successfully with ID: {}", registeredUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (RuntimeException e) {
            logger.error("Registration failed for email: {}, error: {}", user.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        logger.info("Login attempt for user: {}", email);
        String password = data.get("password");
        
        return userService.login(email, password)
                .<ResponseEntity<?>>map(user -> {
                    logger.info("User logged in successfully: {}", email);
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    logger.warn("Failed login attempt for user: {}", email);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
                });
    }
    
    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        logger.info("Fetching user with ID: {}", id);
        return userService.getUserById(id)
                .map(user -> {
                    logger.debug("Found user: {}", user.getEmail());
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    logger.warn("User not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    // Update user profile
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User user) {
        try {
            // Validate that at least one field is being updated
            if ((user.getFullName() == null || user.getFullName().trim().isEmpty()) && 
                (user.getAddress() == null || user.getAddress().trim().isEmpty()) && 
                (user.getPincode() == null || user.getPincode().trim().isEmpty()) && 
                (user.getContactNumber() == null || user.getContactNumber().trim().isEmpty())) {
                return ResponseEntity.badRequest().body("At least one field (fullName, address, pincode, or contactNumber) must be provided for update");
            }
            
            // Trim input fields if they are not null
            if (user.getFullName() != null) user.setFullName(user.getFullName().trim());
            if (user.getAddress() != null) user.setAddress(user.getAddress().trim());
            if (user.getPincode() != null) user.setPincode(user.getPincode().trim());
            if (user.getContactNumber() != null) user.setContactNumber(user.getContactNumber().trim());
            
            User updatedUser = userService.updateProfile(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    // Change password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwords) {
        try {
            String oldPassword = passwords.get("oldPassword");
            String newPassword = passwords.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Both old and new passwords are required");
            }
            
            User user = userService.changePassword(id, oldPassword, newPassword);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // Admin: Get all users with pagination and filtering
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String pincode) {
        try {
            logger.info("Fetching users with pagination - page: {}, limit: {}, search: {}, role: {}, status: {}, pincode: {}", 
                       page, limit, search, role, status, pincode);
            
            Map<String, Object> result = userService.getAllUsersWithFilters(page, limit, search, role, status, pincode);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Admin: Update user role
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> roleData) {
        try {
            String newRole = roleData.get("role");
            if (newRole == null) {
                return ResponseEntity.badRequest().body("Role is required");
            }
            
            User user = userService.updateUserRole(id, newRole);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // Force delete user (for super admin)
    @DeleteMapping("/{id}/force")
    public ResponseEntity<?> forceDeleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id, true);
            return ResponseEntity.ok().body("User force deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // Forgot password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        logger.info("Received forgot password request for email: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            logger.warn("Forgot password failed: Email is required");
            return ResponseEntity.badRequest().body("Email is required");
        }
        
        try {
            userService.resetPassword(email.trim());
            logger.info("Password reset email sent to: {}", email);
            return ResponseEntity.ok().body("Password reset email sent successfully");
        } catch (RuntimeException e) {
            logger.error("Forgot password failed for email: {}, error: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

