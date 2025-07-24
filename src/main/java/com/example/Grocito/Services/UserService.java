package com.example.Grocito.Services;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.User;
import com.example.Grocito.Entity.Cart;
import com.example.Grocito.Entity.Notification;
import com.example.Grocito.Repository.UserRepository;
import com.example.Grocito.Repository.CartRepository;
import com.example.Grocito.Repository.NotificationRepository;

@Service
public class UserService {

    private static final Logger logger = LoggerConfig.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private CartRepository cartRepo;
    
    @Autowired
    private NotificationRepository notificationRepo;
    
    @PersistenceContext
    private EntityManager entityManager;

    // Register a new user
    public User register(User user) {
        logger.debug("Attempting to register new user with email: {}", user.getEmail());
        
        // Check if email already exists
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Registration failed: Email already registered: {}", user.getEmail());
            throw new RuntimeException("Email already registered");
        }
        
        // Set default role if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            logger.debug("Setting default role 'USER' for new user");
            user.setRole("USER");
        }
        
        user.setRegisteredDate(LocalDate.now());
        User savedUser = userRepo.save(user);
        logger.info("User registered successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    // Login user
    public Optional<User> login(String email, String password) {
        logger.debug("Attempting login for user: {}", email);
        Optional<User> user = userRepo.findByEmail(email)
                       .filter(u -> u.getPassword().equals(password));
        
        if (user.isPresent()) {
            logger.info("User logged in successfully: {}", email);
        } else {
            logger.warn("Login failed for user: {}", email);
        }
        
        return user;
    }
    
    // Get user by ID
    public Optional<User> getUserById(Long id) {
        logger.debug("Fetching user with ID: {}", id);
        Optional<User> user = userRepo.findById(id);
        
        if (user.isPresent()) {
            logger.debug("Found user: {}", user.get().getEmail());
        } else {
            logger.debug("User not found with ID: {}", id);
        }
        
        return user;
    }
    
    // Get user by email
    public Optional<User> getUserByEmail(String email) {
        logger.debug("Fetching user with email: {}", email);
        Optional<User> user = userRepo.findByEmail(email);
        
        if (user.isPresent()) {
            logger.debug("Found user with email: {}", email);
        } else {
            logger.debug("User not found with email: {}", email);
        }
        
        return user;
    }
    
    // Update user profile
    public User updateProfile(Long userId, User updatedUser) {
        logger.info("Updating profile for user ID: {}", userId);
        
        User existingUser = userRepo.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Profile update failed: User not found with ID: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
        
        logger.debug("Found user to update: {}", existingUser.getEmail());
        
        // Update fields that are allowed to be updated
        if (updatedUser.getFullName() != null && !updatedUser.getFullName().trim().isEmpty()) {
            logger.debug("Updating full name for user: {}", existingUser.getEmail());
            existingUser.setFullName(updatedUser.getFullName().trim());
        }
        
        if (updatedUser.getAddress() != null) {
            logger.debug("Updating address for user: {}", existingUser.getEmail());
            existingUser.setAddress(updatedUser.getAddress().trim());
        }
        
        if (updatedUser.getPincode() != null) {
            logger.debug("Updating pincode for user: {}", existingUser.getEmail());
            existingUser.setPincode(updatedUser.getPincode().trim());
        }
        
        if (updatedUser.getContactNumber() != null) {
            logger.debug("Updating contact number for user: {}", existingUser.getEmail());
            existingUser.setContactNumber(updatedUser.getContactNumber().trim());
        }
        
        // Don't allow email change through this method for security reasons
        
        return userRepo.save(existingUser);
    }
    
    // Change password
    public User changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Verify old password
        if (!user.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Incorrect password");
        }
        
        user.setPassword(newPassword);
        return userRepo.save(user);
    }
    
    // Update user role (admin function)
    public User updateUserRole(Long userId, String newRole) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Validate role
        if (!newRole.equals("USER") && !newRole.equals("ADMIN") && !newRole.equals("DELIVERY_PARTNER")) {
            throw new RuntimeException("Invalid role: " + newRole);
        }
        
        user.setRole(newRole);
        return userRepo.save(user);
    }
    
    // Get all users (admin function)
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }
    
    // Get all users with pagination and filtering
    public Map<String, Object> getAllUsersWithFilters(int page, int limit, String search, String role, String status, String pincode) {
        logger.info("Fetching users with filters - page: {}, limit: {}, search: {}, role: {}, status: {}, pincode: {}", 
                   page, limit, search, role, status, pincode);
        
        // Get all users first
        List<User> allUsers = userRepo.findAll();
        logger.debug("Total users found: {}", allUsers.size());
        
        // Apply filters
        List<User> filteredUsers = allUsers;
        
        // Filter by search term (name or email)
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = search.trim().toLowerCase();
            filteredUsers = filteredUsers.stream()
                .filter(user -> 
                    (user.getFullName() != null && user.getFullName().toLowerCase().contains(searchTerm)) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchTerm))
                )
                .collect(java.util.stream.Collectors.toList());
            logger.debug("After search filter: {} users", filteredUsers.size());
        }
        
        // Filter by role
        if (role != null && !role.trim().isEmpty()) {
            filteredUsers = filteredUsers.stream()
                .filter(user -> role.equals(user.getRole()))
                .collect(java.util.stream.Collectors.toList());
            logger.debug("After role filter: {} users", filteredUsers.size());
        }
        
        // Filter by status (active/inactive based on last login)
        if (status != null && !status.trim().isEmpty()) {
            boolean isActive = "active".equalsIgnoreCase(status);
            LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
            
            filteredUsers = filteredUsers.stream()
                .filter(user -> {
                    // Consider a user active if they've registered or logged in within the last 3 months
                    LocalDate lastActivity = user.getLastLogin() != null ? 
                        user.getLastLogin() : user.getRegisteredDate();
                    boolean userIsActive = lastActivity.isAfter(threeMonthsAgo);
                    return userIsActive == isActive;
                })
                .collect(java.util.stream.Collectors.toList());
            logger.debug("After status filter: {} users", filteredUsers.size());
        }
        
        // Filter by pincode
        if (pincode != null && !pincode.trim().isEmpty()) {
            filteredUsers = filteredUsers.stream()
                .filter(user -> pincode.equals(user.getPincode()))
                .collect(java.util.stream.Collectors.toList());
            logger.debug("After pincode filter: {} users", filteredUsers.size());
        }
        
        // Calculate total filtered count
        int totalFilteredUsers = filteredUsers.size();
        
        // Apply pagination
        int startIndex = (page - 1) * limit;
        int endIndex = Math.min(startIndex + limit, totalFilteredUsers);
        
        List<User> paginatedUsers;
        if (startIndex < totalFilteredUsers) {
            paginatedUsers = filteredUsers.subList(startIndex, endIndex);
        } else {
            paginatedUsers = new java.util.ArrayList<>();
        }
        
        // Calculate stats
        int totalUsers = allUsers.size();
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        
        long activeUsers = allUsers.stream()
            .filter(user -> {
                LocalDate lastActivity = user.getLastLogin() != null ? 
                    user.getLastLogin() : user.getRegisteredDate();
                return lastActivity.isAfter(threeMonthsAgo);
            })
            .count();
        
        long inactiveUsers = totalUsers - activeUsers;
        
        long adminUsers = allUsers.stream()
            .filter(user -> "ADMIN".equals(user.getRole()) || "SUPER_ADMIN".equals(user.getRole()))
            .count();
        
        long deliveryPartners = allUsers.stream()
            .filter(user -> "DELIVERY_PARTNER".equals(user.getRole()))
            .count();
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("users", paginatedUsers);
        response.put("currentPage", page);
        response.put("totalPages", (int) Math.ceil((double) totalFilteredUsers / limit));
        response.put("totalUsers", totalFilteredUsers);
        
        // Add stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("inactiveUsers", inactiveUsers);
        stats.put("adminUsers", adminUsers);
        stats.put("deliveryPartners", deliveryPartners);
        
        response.put("stats", stats);
        
        return response;
    }
    
    // Delete user (admin function or account deletion)
    public void deleteUser(Long userId) {
        deleteUser(userId, false);
    }
    
    // Delete user with force option (for super admin)
    @Transactional
    public void deleteUser(Long userId, boolean forceDelete) {
        logger.info("Attempting to delete user with ID: {} (force: {})", userId, forceDelete);
        
        User user = userRepo.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Delete failed: User not found with ID: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
        
        logger.debug("Found user to delete: {}", user.getEmail());
        
        // Check if user has orders - prevent deletion if they do (unless force delete)
        if (!forceDelete && user.getOrders() != null && !user.getOrders().isEmpty()) {
            int orderCount = user.getOrders().size();
            logger.warn("Delete failed: User {} has {} existing orders", user.getEmail(), orderCount);
            
            String friendlyMessage = String.format(
                "This user has %d active order%s and cannot be deleted. " +
                "Deleting users with order history would affect business records. " +
                "Please contact the Super Admin if deletion is absolutely necessary.",
                orderCount,
                orderCount == 1 ? "" : "s"
            );
            
            throw new RuntimeException(friendlyMessage);
        }
        
        if (forceDelete && user.getOrders() != null && !user.getOrders().isEmpty()) {
            logger.warn("Force deleting user {} with {} existing orders", user.getEmail(), user.getOrders().size());
        }
        
        // CRITICAL FIX: Use native SQL to delete in exact order to avoid foreign key constraints
        try {
            logger.info("Starting comprehensive user deletion for user: {}", user.getEmail());
            
            // 1. Delete cart items first (child of cart)
            int cartItemsDeleted = entityManager.createNativeQuery(
                "DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM cart WHERE user_id = ?)")
                .setParameter(1, userId)
                .executeUpdate();
            logger.info("Deleted {} cart items for user: {}", cartItemsDeleted, user.getEmail());
            
            // 2. Delete cart
            int cartsDeleted = entityManager.createNativeQuery(
                "DELETE FROM cart WHERE user_id = ?")
                .setParameter(1, userId)
                .executeUpdate();
            logger.info("Deleted {} carts for user: {}", cartsDeleted, user.getEmail());
            
            // 3. Delete notifications
            int notificationsDeleted = entityManager.createNativeQuery(
                "DELETE FROM notifications WHERE user_id = ?")
                .setParameter(1, userId)
                .executeUpdate();
            logger.info("Deleted {} notifications for user: {}", notificationsDeleted, user.getEmail());
            
            // 4. Delete order items (child of orders)
            int orderItemsDeleted = entityManager.createNativeQuery(
                "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)")
                .setParameter(1, userId)
                .executeUpdate();
            logger.info("Deleted {} order items for user: {}", orderItemsDeleted, user.getEmail());
            
            // 5. Delete orders
            int ordersDeleted = entityManager.createNativeQuery(
                "DELETE FROM orders WHERE user_id = ?")
                .setParameter(1, userId)
                .executeUpdate();
            logger.info("Deleted {} orders for user: {}", ordersDeleted, user.getEmail());
            
            // 6. Finally delete the user
            int usersDeleted = entityManager.createNativeQuery(
                "DELETE FROM users WHERE id = ?")
                .setParameter(1, userId)
                .executeUpdate();
            logger.info("Deleted {} users (should be 1): {}", usersDeleted, user.getEmail());
            
            // Flush all changes
            entityManager.flush();
            
            logger.info("User deletion completed successfully for: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("Error during comprehensive user deletion for {}: {}", user.getEmail(), e.getMessage());
            
            // Provide user-friendly error message
            if (e.getMessage().contains("foreign key constraint")) {
                throw new RuntimeException("Unable to delete user due to existing data dependencies. Please contact system administrator.");
            } else {
                throw new RuntimeException("Failed to delete user: " + e.getMessage());
            }
        }
    }
    
    // Send welcome email after registration
    public void sendWelcomeEmail(User user) {
        logger.info("Sending welcome email to: {}", user.getEmail());
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
    }
    
    // Generate a random temporary password
    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        
        // Generate a password of length 10
        for (int i = 0; i < 10; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }
        
        return sb.toString();
    }
    
    // Reset password and send email with temporary password
    public void resetPassword(String email) {
        logger.info("Password reset requested for email: {}", email);
        
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Password reset failed: User not found with email: {}", email);
                    return new RuntimeException("User not found with email: " + email);
                });
        
        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();
        
        // Update user's password
        user.setPassword(temporaryPassword);
        userRepo.save(user);
        
        // Send email with temporary password
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), temporaryPassword);
        
        logger.info("Password reset successful for user: {}", email);
    }
}
