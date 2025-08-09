package com.example.Grocito.Controller;

import com.example.Grocito.Services.AdminDashboardService;
import com.example.Grocito.Entity.User;
import com.example.Grocito.Services.UserService;
import com.example.Grocito.config.LoggerConfig;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {
    
    private static final Logger logger = LoggerConfig.getLogger(AdminDashboardController.class);
    
    @Autowired
    private AdminDashboardService adminDashboardService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Get dashboard statistics based on admin role and pincode
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(@RequestParam Long adminId) {
        try {
            logger.info("Fetching dashboard stats for admin ID: {}", adminId);
            
            // Get admin user details
            Optional<User> adminOpt = userService.getUserById(adminId);
            if (!adminOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Admin user not found"));
            }
            
            User admin = adminOpt.get();
            
            // Validate admin role
            if (!isAdminRole(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied. Admin privileges required."));
            }
            
            // Get dashboard data based on admin role and pincode
            Map<String, Object> dashboardData = adminDashboardService.getDashboardStats(admin);
            
            logger.info("Dashboard stats fetched successfully for admin: {} ({})", 
                       admin.getFullName(), admin.getRole());
            
            return ResponseEntity.ok(dashboardData);
            
        } catch (Exception e) {
            logger.error("Error fetching dashboard stats for admin ID {}: {}", adminId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch dashboard statistics: " + e.getMessage()));
        }
    }
    
    /**
     * Get recent activity based on admin role and pincode
     */
    @GetMapping("/recent-activity")
    public ResponseEntity<?> getRecentActivity(@RequestParam Long adminId, 
                                             @RequestParam(defaultValue = "10") int limit) {
        try {
            logger.info("Fetching recent activity for admin ID: {} with limit: {}", adminId, limit);
            
            // Get admin user details
            Optional<User> adminOpt = userService.getUserById(adminId);
            if (!adminOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Admin user not found"));
            }
            
            User admin = adminOpt.get();
            
            // Validate admin role
            if (!isAdminRole(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied. Admin privileges required."));
            }
            
            // Get recent activity based on admin role and pincode
            Map<String, Object> activityData = adminDashboardService.getRecentActivity(admin, limit);
            
            logger.info("Recent activity fetched successfully for admin: {} ({})", 
                       admin.getFullName(), admin.getRole());
            
            return ResponseEntity.ok(activityData);
            
        } catch (Exception e) {
            logger.error("Error fetching recent activity for admin ID {}: {}", adminId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch recent activity: " + e.getMessage()));
        }
    }
    
    /**
     * Get comprehensive dashboard data (stats + recent activity)
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getDashboardOverview(@RequestParam Long adminId) {
        try {
            logger.info("Fetching dashboard overview for admin ID: {}", adminId);
            
            // Get admin user details
            Optional<User> adminOpt = userService.getUserById(adminId);
            if (!adminOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Admin user not found"));
            }
            
            User admin = adminOpt.get();
            
            // Validate admin role
            if (!isAdminRole(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied. Admin privileges required."));
            }
            
            // Get comprehensive dashboard data
            Map<String, Object> overviewData = new HashMap<>();
            
            // Get stats
            Map<String, Object> stats = adminDashboardService.getDashboardStats(admin);
            overviewData.put("stats", stats);
            
            // Get recent activity
            Map<String, Object> activity = adminDashboardService.getRecentActivity(admin, 10);
            overviewData.put("recentActivity", activity);
            
            // Add admin info
            Map<String, Object> adminInfo = new HashMap<>();
            adminInfo.put("id", admin.getId());
            adminInfo.put("fullName", admin.getFullName());
            adminInfo.put("email", admin.getEmail());
            adminInfo.put("role", admin.getRole());
            adminInfo.put("pincode", admin.getPincode());
            overviewData.put("adminInfo", adminInfo);
            
            logger.info("Dashboard overview fetched successfully for admin: {} ({})", 
                       admin.getFullName(), admin.getRole());
            
            return ResponseEntity.ok(overviewData);
            
        } catch (Exception e) {
            logger.error("Error fetching dashboard overview for admin ID {}: {}", adminId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch dashboard overview: " + e.getMessage()));
        }
    }
    
    /**
     * Check if user has admin role
     */
    private boolean isAdminRole(String role) {
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }
}