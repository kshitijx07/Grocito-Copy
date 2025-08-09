package com.example.Grocito.Services;

import com.example.Grocito.Entity.User;
import com.example.Grocito.Entity.Order;
import com.example.Grocito.Entity.Product;
import com.example.Grocito.Repository.UserRepository;
import com.example.Grocito.Repository.OrderRepository;
import com.example.Grocito.Repository.ProductRepository;
import com.example.Grocito.config.LoggerConfig;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

        private static final Logger logger = LoggerConfig.getLogger(AdminDashboardService.class);

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private ProductRepository productRepository;

        /**
         * Get dashboard statistics based on admin role and pincode restrictions
         */
        public Map<String, Object> getDashboardStats(User admin) {
                logger.info("Calculating dashboard stats for admin: {} (Role: {}, Pincode: {})",
                                admin.getFullName(), admin.getRole(), admin.getPincode());

                Map<String, Object> stats = new HashMap<>();

                try {
                        // Determine data scope based on admin role
                        boolean isSuperAdmin = "SUPER_ADMIN".equals(admin.getRole());
                        String adminPincode = admin.getPincode();

                        if (isSuperAdmin) {
                                logger.info("Fetching global statistics for Super Admin");
                                stats = getGlobalStats();
                        } else {
                                logger.info("Fetching pincode-specific statistics for Regional Admin (Pincode: {})",
                                                adminPincode);
                                stats = getPincodeStats(adminPincode);
                        }

                        // Add metadata
                        stats.put("adminRole", admin.getRole());
                        stats.put("adminPincode", admin.getPincode());
                        stats.put("dataScope", isSuperAdmin ? "GLOBAL" : "PINCODE_SPECIFIC");
                        stats.put("lastUpdated", LocalDateTime.now());

                        logger.info(
                                        "Dashboard stats calculated successfully. Total Users: {}, Active Orders: {}, Today's Revenue: {}",
                                        stats.get("totalUsers"), stats.get("activeOrders"), stats.get("todayRevenue"));

                } catch (Exception e) {
                        logger.error("Error calculating dashboard stats for admin {}: {}", admin.getId(),
                                        e.getMessage(), e);
                        // Return empty stats on error
                        stats = getEmptyStats();
                        stats.put("error", "Failed to calculate statistics");
                }

                return stats;
        }

        /**
         * Get recent activity based on admin role and pincode restrictions
         */
        public Map<String, Object> getRecentActivity(User admin, int limit) {
                logger.info("Fetching recent activity for admin: {} (Role: {}, Pincode: {}, Limit: {})",
                                admin.getFullName(), admin.getRole(), admin.getPincode(), limit);

                Map<String, Object> activityData = new HashMap<>();

                try {
                        boolean isSuperAdmin = "SUPER_ADMIN".equals(admin.getRole());
                        String adminPincode = admin.getPincode();

                        List<Order> recentOrders;

                        if (isSuperAdmin) {
                                // Super Admin sees all recent orders
                                recentOrders = orderRepository.findByStatusOrderByOrderTimeDesc("DELIVERED")
                                                .stream()
                                                .limit(limit)
                                                .collect(Collectors.toList());
                                logger.info("Fetched {} recent orders globally for Super Admin", recentOrders.size());
                        } else {
                                // Regional Admin sees only orders from their pincode
                                recentOrders = orderRepository
                                                .findByPincodeAndStatusOrderByOrderTimeDesc(adminPincode, "DELIVERED")
                                                .stream()
                                                .limit(limit)
                                                .collect(Collectors.toList());
                                logger.info("Fetched {} recent orders for pincode {} for Regional Admin",
                                                recentOrders.size(),
                                                adminPincode);
                        }

                        activityData.put("recentOrders", recentOrders);
                        activityData.put("totalCount", recentOrders.size());
                        activityData.put("dataScope", isSuperAdmin ? "GLOBAL" : "PINCODE_SPECIFIC");
                        activityData.put("adminPincode", admin.getPincode());
                        activityData.put("lastUpdated", LocalDateTime.now());

                } catch (Exception e) {
                        logger.error("Error fetching recent activity for admin {}: {}", admin.getId(), e.getMessage(),
                                        e);
                        activityData.put("recentOrders", List.of());
                        activityData.put("totalCount", 0);
                        activityData.put("error", "Failed to fetch recent activity");
                }

                return activityData;
        }

        /**
         * Get global statistics for Super Admin
         */
        private Map<String, Object> getGlobalStats() {
                Map<String, Object> stats = new HashMap<>();

                // Total users across all pincodes
                long totalUsers = userRepository.count();

                // Active orders across all pincodes
                long activeOrders = orderRepository.countByStatusIn(
                                List.of("PLACED", "ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"));

                // Total products
                long totalProducts = productRepository.count();

                // Today's revenue across all pincodes
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = startOfDay.plusDays(1);

                List<Order> todayOrders = orderRepository.findAll().stream()
                                .filter(order -> "DELIVERED".equals(order.getStatus()))
                                .filter(order -> order.getDeliveredAt() != null)
                                .filter(order -> order.getDeliveredAt().isAfter(startOfDay)
                                                && order.getDeliveredAt().isBefore(endOfDay))
                                .collect(Collectors.toList());

                double todayRevenue = todayOrders.stream()
                                .mapToDouble(Order::getTotalAmount)
                                .sum();

                // Total revenue
                double totalRevenue = orderRepository.findByStatus("DELIVERED").stream()
                                .mapToDouble(Order::getTotalAmount)
                                .sum();

                // Average order value
                long deliveredOrdersCount = orderRepository.countByStatus("DELIVERED");
                double averageOrderValue = deliveredOrdersCount > 0 ? totalRevenue / deliveredOrdersCount : 0;

                stats.put("totalUsers", totalUsers);
                stats.put("activeOrders", activeOrders);
                stats.put("totalProducts", totalProducts);
                stats.put("todayRevenue", todayRevenue);
                stats.put("totalRevenue", totalRevenue);
                stats.put("averageOrderValue", averageOrderValue);
                stats.put("recentOrdersCount", todayOrders.size());

                logger.info("Global stats calculated - Users: {}, Active Orders: {}, Products: {}, Today's Revenue: ₹{}",
                                totalUsers, activeOrders, totalProducts, todayRevenue);

                return stats;
        }

        /**
         * Get pincode-specific statistics for Regional Admin
         */
        private Map<String, Object> getPincodeStats(String pincode) {
                Map<String, Object> stats = new HashMap<>();

                if (pincode == null || pincode.trim().isEmpty()) {
                        logger.warn("No pincode specified for Regional Admin, returning empty stats");
                        return getEmptyStats();
                }

                // Users in this pincode
                long totalUsers = userRepository.countByPincode(pincode);

                // Active orders in this pincode
                long activeOrders = orderRepository.findByPincodeAndStatusIn(pincode,
                                List.of("PLACED", "ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY")).size();

                // Products available in this pincode
                long totalProducts = productRepository.countByPincode(pincode);

                // Today's revenue in this pincode
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = startOfDay.plusDays(1);

                List<Order> todayOrders = orderRepository.findByPincodeAndStatus(pincode, "DELIVERED").stream()
                                .filter(order -> order.getDeliveredAt() != null)
                                .filter(order -> order.getDeliveredAt().isAfter(startOfDay)
                                                && order.getDeliveredAt().isBefore(endOfDay))
                                .collect(Collectors.toList());

                double todayRevenue = todayOrders.stream()
                                .mapToDouble(Order::getTotalAmount)
                                .sum();

                // Total revenue in this pincode
                double totalRevenue = orderRepository.findByPincodeAndStatus(pincode, "DELIVERED").stream()
                                .mapToDouble(Order::getTotalAmount)
                                .sum();

                // Average order value in this pincode
                long deliveredOrdersCount = orderRepository.findByPincodeAndStatus(pincode, "DELIVERED").size();
                double averageOrderValue = deliveredOrdersCount > 0 ? totalRevenue / deliveredOrdersCount : 0;

                stats.put("totalUsers", totalUsers);
                stats.put("activeOrders", activeOrders);
                stats.put("totalProducts", totalProducts);
                stats.put("todayRevenue", todayRevenue);
                stats.put("totalRevenue", totalRevenue);
                stats.put("averageOrderValue", averageOrderValue);
                stats.put("recentOrdersCount", todayOrders.size());

                logger.info("Pincode {} stats calculated - Users: {}, Active Orders: {}, Products: {}, Today's Revenue: ₹{}",
                                pincode, totalUsers, activeOrders, totalProducts, todayRevenue);

                return stats;
        }

        /**
         * Get empty stats structure
         */
        private Map<String, Object> getEmptyStats() {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalUsers", 0L);
                stats.put("activeOrders", 0L);
                stats.put("totalProducts", 0L);
                stats.put("todayRevenue", 0.0);
                stats.put("totalRevenue", 0.0);
                stats.put("averageOrderValue", 0.0);
                stats.put("recentOrdersCount", 0);
                return stats;
        }
}