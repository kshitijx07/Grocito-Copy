package com.example.Grocito.Controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.Notification;
import com.example.Grocito.Services.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerConfig.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    /**
     * Create a new notification
     * 
     * @param notificationData The notification data
     * @return The created notification
     */
    @PostMapping("/create")
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, Object> notificationData) {
        logger.info("Received request to create a notification");
        
        try {
            Long userId = Long.valueOf(notificationData.get("userId").toString());
            String message = (String) notificationData.get("message");
            String type = (String) notificationData.get("type");
            String link = (String) notificationData.get("link");
            
            logger.debug("Creating notification: userId={}, type={}, message={}", userId, type, message);
            
            Notification notification = new Notification(userId, message, type, link);
            Notification createdNotification = notificationService.createNotification(notification);
            
            logger.info("Notification created successfully with ID: {}", createdNotification.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
        } catch (Exception e) {
            logger.error("Error creating notification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get notifications for a user
     * 
     * @param userId The user ID
     * @return List of notifications
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestParam Long userId) {
        logger.info("Received request to get notifications for user ID: {}", userId);
        
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            logger.info("Retrieved {} notifications for user ID: {}", notifications.size(), userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Error retrieving notifications for user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get unread notifications for a user
     * 
     * @param userId The user ID
     * @return List of unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam Long userId) {
        logger.info("Received request to get unread notifications for user ID: {}", userId);
        
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            logger.info("Retrieved {} unread notifications for user ID: {}", notifications.size(), userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Error retrieving unread notifications for user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mark a notification as read
     * 
     * @param requestData The request data containing notificationId
     * @return The updated notification
     */
    @PostMapping("/mark-read")
    public ResponseEntity<Notification> markNotificationAsRead(@RequestBody Map<String, Object> requestData) {
        try {
            Long notificationId = Long.valueOf(requestData.get("notificationId").toString());
            logger.info("Received request to mark notification as read: ID={}", notificationId);
            
            Notification notification = notificationService.markAsRead(notificationId);
            logger.info("Notification marked as read successfully: ID={}", notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            logger.error("Error marking notification as read: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a notification
     * 
     * @param notificationId The notification ID
     * @return Success message
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long notificationId) {
        logger.info("Received request to delete notification: ID={}", notificationId);
        
        try {
            notificationService.deleteNotification(notificationId);
            logger.info("Notification deleted successfully: ID={}", notificationId);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting notification: ID={}, error={}", notificationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting notification");
        }
    }
}