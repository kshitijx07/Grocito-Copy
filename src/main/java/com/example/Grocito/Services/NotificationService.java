package com.example.Grocito.Services;

import java.util.List;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.Notification;
import com.example.Grocito.Repository.NotificationRepository;

@Service
public class NotificationService {

    private static final Logger logger = LoggerConfig.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Create a new notification
     * 
     * @param notification The notification to create
     * @return The created notification
     */
    public Notification createNotification(Notification notification) {
        logger.info("Creating notification for user ID: {}", notification.getUserId());
        logger.debug("Notification details: type={}, message={}", notification.getType(), notification.getMessage());
        
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Notification created successfully with ID: {}", savedNotification.getId());
        
        return savedNotification;
    }

    /**
     * Get all notifications for a user
     * 
     * @param userId The user ID
     * @return List of notifications
     */
    public List<Notification> getUserNotifications(Long userId) {
        logger.info("Fetching notifications for user ID: {}", userId);
        
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        logger.info("Found {} notifications for user ID: {}", notifications.size(), userId);
        
        return notifications;
    }

    /**
     * Get unread notifications for a user
     * 
     * @param userId The user ID
     * @return List of unread notifications
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        logger.info("Fetching unread notifications for user ID: {}", userId);
        
        List<Notification> notifications = notificationRepository.findByUserIdAndReadStatus(userId, false);
        logger.info("Found {} unread notifications for user ID: {}", notifications.size(), userId);
        
        return notifications;
    }

    /**
     * Mark a notification as read
     * 
     * @param notificationId The notification ID
     * @return The updated notification
     */
    public Notification markAsRead(Long notificationId) {
        logger.info("Marking notification as read: ID={}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    logger.error("Notification not found with ID: {}", notificationId);
                    return new RuntimeException("Notification not found with ID: " + notificationId);
                });
        
        notification.setReadStatus(true);
        Notification updatedNotification = notificationRepository.save(notification);
        logger.info("Notification marked as read: ID={}", notificationId);
        
        return updatedNotification;
    }

    /**
     * Delete a notification
     * 
     * @param notificationId The notification ID
     */
    public void deleteNotification(Long notificationId) {
        logger.info("Deleting notification: ID={}", notificationId);
        
        if (notificationRepository.existsById(notificationId)) {
            notificationRepository.deleteById(notificationId);
            logger.info("Notification deleted: ID={}", notificationId);
        } else {
            logger.warn("Attempted to delete non-existent notification: ID={}", notificationId);
        }
    }
}