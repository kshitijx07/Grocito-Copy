package com.example.Grocito.Services;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.Order;
import com.example.Grocito.Entity.OrderItem;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerConfig.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Send simple email message
     */
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            logger.info("Sending simple email to: {} with subject: {}", to, subject);

            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                logger.warn("Email configuration not found. Skipping email to: {}", to);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Grocito");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false); // Plain text
            
            mailSender.send(message);
            
            logger.info("✅ Simple email sent successfully to: {}", to);

        } catch (Exception e) {
            logger.error("❌ Failed to send simple email to: {} - Error: {}", to, e.getMessage(), e);
        }
    }

    /**
     * Send welcome email to new user
     */
    public void sendWelcomeEmail(String email, String fullName) {
        try {
            logger.info("Sending welcome email to: {}", email);

            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                logger.warn("Email configuration not found. Skipping welcome email to: {}", email);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Grocito");
            helper.setTo(email);
            helper.setSubject("🎉 Welcome to Grocito - Your Account is Ready!");
            
            String htmlContent = createWelcomeEmailHtml(fullName);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            logger.info("✅ Welcome email sent successfully to: {}", email);

        } catch (Exception e) {
            logger.error("❌ Failed to send welcome email to: {} - Error: {}", email, e.getMessage(), e);
        }
    }

    /**
     * Send password reset email with temporary password
     */
    public void sendPasswordResetEmail(String email, String fullName, String temporaryPassword) {
        try {
            logger.info("Sending password reset email to: {}", email);

            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                logger.warn("Email configuration not found. Skipping password reset email to: {}", email);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Grocito Security");
            helper.setTo(email);
            helper.setSubject("🔐 Password Reset - Grocito Account");
            
            String htmlContent = createPasswordResetEmailHtml(fullName, temporaryPassword);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            logger.info("✅ Password reset email sent successfully to: {}", email);

        } catch (Exception e) {
            logger.error("❌ Failed to send password reset email to: {} - Error: {}", email, e.getMessage(), e);
        }
    }

    /**
     * Send delivery receipt email to customer after successful delivery
     */
    public void sendDeliveryReceiptEmail(Order order) {
        try {
            logger.info("Sending delivery receipt email for order ID: {} to user: {}", 
                       order.getId(), order.getUser().getEmail());

            // Validate email configuration
            if (fromEmail == null || fromEmail.trim().isEmpty()) {
                logger.warn("Email configuration not found. Skipping email for order ID: {}", order.getId());
                return;
            }

            // Create email message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "Grocito Delivery");
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("✅ Order Delivered Successfully - Receipt #" + order.getId());
            
            // Create HTML email content
            String emailContent = createDeliveryReceiptHtml(order);
            helper.setText(emailContent, true);
            
            // Send email
            mailSender.send(message);
            
            logger.info("✅ Delivery receipt email sent successfully for order ID: {} to {}", 
                       order.getId(), order.getUser().getEmail());

        } catch (Exception e) {
            logger.error("❌ Failed to send delivery receipt email for order ID: {} - Error: {}", 
                        order.getId(), e.getMessage(), e);
            // Don't throw exception - email failure shouldn't break delivery process
        }
    }

    /**
     * Create HTML content for delivery receipt email
     */
    private String createDeliveryReceiptHtml(Order order) {
        StringBuilder html = new StringBuilder();
        
        // Format dates
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String orderDate = order.getOrderTime().format(formatter);
        String deliveryDate = order.getDeliveredAt() != null ? 
            order.getDeliveredAt().format(formatter) : 
            LocalDateTime.now().format(formatter);

        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>Delivery Receipt - Grocito</title>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 28px; font-weight: bold; }");
        html.append(".header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }");
        html.append(".content { padding: 30px; }");
        html.append(".success-badge { background-color: #D1FAE5; color: #065F46; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px; border-left: 4px solid #10B981; }");
        html.append(".order-info { background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 25px; }");
        html.append(".info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }");
        html.append(".info-row:last-child { border-bottom: none; margin-bottom: 0; }");
        html.append(".info-label { font-weight: 600; color: #374151; }");
        html.append(".info-value { color: #6B7280; text-align: right; }");
        html.append(".items-section h3 { color: #374151; margin-bottom: 15px; font-size: 18px; }");
        html.append(".item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E5E7EB; }");
        html.append(".item:last-child { border-bottom: none; }");
        html.append(".item-name { font-weight: 500; color: #374151; }");
        html.append(".item-details { color: #6B7280; font-size: 14px; }");
        html.append(".item-price { font-weight: 600; color: #059669; }");
        html.append(".total-section { background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-top: 25px; }");
        html.append(".total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }");
        html.append(".total-final { font-size: 20px; font-weight: bold; color: #059669; border-top: 2px solid #D1D5DB; padding-top: 15px; margin-top: 15px; }");
        html.append(".footer { background-color: #F9FAFB; padding: 25px; text-align: center; color: #6B7280; font-size: 14px; }");
        html.append(".footer a { color: #059669; text-decoration: none; }");
        html.append("@media (max-width: 600px) { .info-row, .item, .total-row { flex-direction: column; text-align: left; } .info-value, .item-price { text-align: left; margin-top: 5px; } }");
        html.append("</style>");
        html.append("</head><body>");

        // Header
        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>🎉 Order Delivered Successfully!</h1>");
        html.append("<p>Thank you for choosing Grocito</p>");
        html.append("</div>");

        // Content
        html.append("<div class='content'>");
        
        // Success message
        html.append("<div class='success-badge'>");
        html.append("<strong>✅ Your order has been delivered successfully!</strong><br>");
        if (order.getDeliveryPartner() != null) {
            html.append("Delivered by ").append(order.getDeliveryPartner().getFullName()).append(". ");
        }
        html.append("We hope you enjoy your fresh groceries.");
        html.append("</div>");

        // Order information
        html.append("<div class='order-info'>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Order ID:</span>");
        html.append("<span class='info-value'>#").append(order.getId()).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Customer:</span>");
        html.append("<span class='info-value'>").append(order.getUser().getFullName()).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Order Date:</span>");
        html.append("<span class='info-value'>").append(orderDate).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Delivery Date:</span>");
        html.append("<span class='info-value'>").append(deliveryDate).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Delivery Address:</span>");
        html.append("<span class='info-value'>").append(order.getDeliveryAddress()).append("</span>");
        html.append("</div>");
        html.append("<div class='info-row'>");
        html.append("<span class='info-label'>Payment Method:</span>");
        html.append("<span class='info-value'>").append(getPaymentMethodDisplay(order)).append("</span>");
        html.append("</div>");
        
        // Add Transaction ID if available
        if (order.getPaymentId() != null && !order.getPaymentId().trim().isEmpty()) {
            html.append("<div class='info-row'>");
            html.append("<span class='info-label'>Transaction ID:</span>");
            html.append("<span class='info-value' style='font-family: monospace; font-size: 14px;'>").append(order.getPaymentId()).append("</span>");
            html.append("</div>");
        }
        
        html.append("</div>");

        // Delivery Partner Information (if available)
        if (order.getDeliveryPartner() != null) {
            html.append("<div class='order-info' style='margin-top: 20px;'>");
            html.append("<h3 style='color: #374151; margin-bottom: 15px; font-size: 18px; display: flex; align-items: center;'>");
            html.append("<span style='margin-right: 8px;'>🚚</span> Delivery Partner Details");
            html.append("</h3>");
            
            html.append("<div class='info-row'>");
            html.append("<span class='info-label'>Delivered By:</span>");
            html.append("<span class='info-value'>").append(order.getDeliveryPartner().getFullName()).append("</span>");
            html.append("</div>");
            
            html.append("<div class='info-row'>");
            html.append("<span class='info-label'>Contact Number:</span>");
            html.append("<span class='info-value'>").append(order.getDeliveryPartner().getPhoneNumber()).append("</span>");
            html.append("</div>");
            
            if (order.getDeliveryPartner().getVehicleType() != null) {
                html.append("<div class='info-row'>");
                html.append("<span class='info-label'>Vehicle Type:</span>");
                html.append("<span class='info-value'>").append(formatVehicleType(order.getDeliveryPartner().getVehicleType())).append("</span>");
                html.append("</div>");
            }
            
            if (order.getDeliveryPartner().getVehicleNumber() != null) {
                html.append("<div class='info-row'>");
                html.append("<span class='info-label'>Vehicle Number:</span>");
                html.append("<span class='info-value' style='font-family: monospace; font-weight: bold;'>").append(order.getDeliveryPartner().getVehicleNumber()).append("</span>");
                html.append("</div>");
            }
            
            html.append("</div>");
        }

        // Order items
        html.append("<div class='items-section'>");
        html.append("<h3>📦 Order Items</h3>");
        
        double subtotal = 0.0;
        for (OrderItem item : order.getItems()) {
            double itemTotal = item.getPrice() * item.getQuantity();
            subtotal += itemTotal;
            
            html.append("<div class='item'>");
            html.append("<div>");
            html.append("<div class='item-name'>").append(item.getProduct().getName()).append("</div>");
            html.append("<div class='item-details'>Qty: ").append(item.getQuantity())
                .append(" × ₹").append(String.format("%.2f", item.getPrice())).append("</div>");
            html.append("</div>");
            html.append("<div class='item-price'>₹").append(String.format("%.2f", itemTotal)).append("</div>");
            html.append("</div>");
        }
        html.append("</div>");

        // Total section
        html.append("<div class='total-section'>");
        html.append("<div class='total-row'>");
        html.append("<span>Subtotal:</span>");
        html.append("<span>₹").append(String.format("%.2f", subtotal)).append("</span>");
        html.append("</div>");
        html.append("<div class='total-row'>");
        html.append("<span>Delivery Fee:</span>");
        // Calculate delivery fee as Total Paid - Subtotal for accuracy
        double calculatedDeliveryFee = order.getTotalAmount() - subtotal;
        html.append("<span>₹").append(String.format("%.2f", calculatedDeliveryFee)).append("</span>");
        html.append("</div>");
        html.append("<div class='total-row total-final'>");
        html.append("<span>Total Paid:</span>");
        html.append("<span>₹").append(String.format("%.2f", order.getTotalAmount())).append("</span>");
        html.append("</div>");
        html.append("</div>");

        html.append("</div>"); // End content

        // Footer
        html.append("<div class='footer'>");
        html.append("<p><strong>Thank you for choosing Grocito!</strong></p>");
        html.append("<p>For any queries, contact us at <a href='mailto:support@grocito.com'>support@grocito.com</a></p>");
        html.append("<p>© 2025 Grocito. All rights reserved.</p>");
        html.append("</div>");

        html.append("</div>"); // End container
        html.append("</body></html>");

        return html.toString();
    }

    /**
     * Create HTML content for welcome email
     */
    private String createWelcomeEmailHtml(String fullName) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>Welcome to Grocito</title>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 28px; font-weight: bold; }");
        html.append(".content { padding: 30px; }");
        html.append(".welcome-message { background-color: #D1FAE5; color: #065F46; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; }");
        html.append(".features { margin: 25px 0; }");
        html.append(".feature { display: flex; align-items: center; margin-bottom: 15px; }");
        html.append(".feature-icon { width: 40px; height: 40px; background-color: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }");
        html.append(".footer { background-color: #F9FAFB; padding: 25px; text-align: center; color: #6B7280; font-size: 14px; }");
        html.append("</style>");
        html.append("</head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>🎉 Welcome to Grocito!</h1>");
        html.append("<p>Your fresh grocery delivery partner</p>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<div class='welcome-message'>");
        html.append("<h2>Hello ").append(fullName).append("!</h2>");
        html.append("<p>Thank you for joining Grocito. Your account has been created successfully and you're ready to start shopping for fresh groceries!</p>");
        html.append("</div>");

        html.append("<div class='features'>");
        html.append("<div class='feature'>");
        html.append("<div class='feature-icon'>🛒</div>");
        html.append("<div><strong>Fresh Groceries</strong><br>Browse through our wide selection of fresh fruits, vegetables, and daily essentials.</div>");
        html.append("</div>");
        html.append("<div class='feature'>");
        html.append("<div class='feature-icon'>🚚</div>");
        html.append("<div><strong>Fast Delivery</strong><br>Get your groceries delivered to your doorstep quickly and safely.</div>");
        html.append("</div>");
        html.append("<div class='feature'>");
        html.append("<div class='feature-icon'>💳</div>");
        html.append("<div><strong>Easy Payment</strong><br>Pay online or choose Cash on Delivery for your convenience.</div>");
        html.append("</div>");
        html.append("</div>");

        html.append("<p style='text-align: center; margin-top: 30px;'>");
        html.append("<strong>Ready to start shopping?</strong><br>");
        html.append("Log in to your account and explore our fresh grocery collection!");
        html.append("</p>");

        html.append("</div>");

        html.append("<div class='footer'>");
        html.append("<p><strong>Welcome to the Grocito family!</strong></p>");
        html.append("<p>For any questions, contact us at <a href='mailto:support@grocito.com'>support@grocito.com</a></p>");
        html.append("<p>© 2025 Grocito. All rights reserved.</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body></html>");

        return html.toString();
    }

    /**
     * Create HTML content for password reset email
     */
    private String createPasswordResetEmailHtml(String fullName, String temporaryPassword) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>Password Reset - Grocito</title>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 28px; font-weight: bold; }");
        html.append(".content { padding: 30px; }");
        html.append(".alert-box { background-color: #FEF2F2; color: #991B1B; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626; margin-bottom: 25px; }");
        html.append(".password-box { background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; }");
        html.append(".password { font-size: 24px; font-weight: bold; color: #1F2937; background-color: white; padding: 15px; border-radius: 8px; border: 2px dashed #6B7280; }");
        html.append(".instructions { background-color: #EFF6FF; color: #1E40AF; padding: 20px; border-radius: 8px; margin: 25px 0; }");
        html.append(".footer { background-color: #F9FAFB; padding: 25px; text-align: center; color: #6B7280; font-size: 14px; }");
        html.append("</style>");
        html.append("</head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>🔐 Password Reset</h1>");
        html.append("<p>Grocito Account Security</p>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<div class='alert-box'>");
        html.append("<strong>⚠️ Password Reset Request</strong><br>");
        html.append("A password reset was requested for your Grocito account. If you didn't request this, please contact our support team immediately.");
        html.append("</div>");

        html.append("<p>Hello <strong>").append(fullName).append("</strong>,</p>");
        html.append("<p>We've generated a temporary password for your Grocito account. Please use this password to log in and then change it to a new password of your choice.</p>");

        html.append("<div class='password-box'>");
        html.append("<p><strong>Your Temporary Password:</strong></p>");
        html.append("<div class='password'>").append(temporaryPassword).append("</div>");
        html.append("</div>");

        html.append("<div class='instructions'>");
        html.append("<h3>📋 Next Steps:</h3>");
        html.append("<ol>");
        html.append("<li>Log in to your Grocito account using this temporary password</li>");
        html.append("<li>Go to your account settings or profile section</li>");
        html.append("<li>Change your password to a new, secure password</li>");
        html.append("<li>Keep your new password safe and secure</li>");
        html.append("</ol>");
        html.append("</div>");

        html.append("<p><strong>Important:</strong> This temporary password will expire in 24 hours for security reasons. Please change it as soon as possible.</p>");

        html.append("</div>");

        html.append("<div class='footer'>");
        html.append("<p><strong>Grocito Security Team</strong></p>");
        html.append("<p>For security concerns, contact us at <a href='mailto:security@grocito.com'>security@grocito.com</a></p>");
        html.append("<p>© 2025 Grocito. All rights reserved.</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body></html>");

        return html.toString();
    }

    /**
     * Format vehicle type for display
     */
    private String formatVehicleType(String vehicleType) {
        if (vehicleType == null) return "Unknown";
        
        switch (vehicleType.toUpperCase()) {
            case "BIKE":
                return "Motorcycle";
            case "SCOOTER":
                return "Scooter";
            case "BICYCLE":
                return "Bicycle";
            case "CAR":
                return "Car";
            default:
                return vehicleType.substring(0, 1).toUpperCase() + vehicleType.substring(1).toLowerCase();
        }
    }

    /**
     * Get user-friendly payment method display
     */
    private String getPaymentMethodDisplay(Order order) {
        if ("ONLINE".equals(order.getPaymentMethod())) {
            return "Online Payment";
        } else if ("COD".equals(order.getPaymentMethod())) {
            if ("PAID".equals(order.getPaymentStatus())) {
                String method = order.getActualPaymentMethod();
                if ("CASH".equals(method)) {
                    return "Cash on Delivery";
                } else if ("UPI".equals(method)) {
                    return "UPI on Delivery";
                } else if ("CARD".equals(method)) {
                    return "Card on Delivery";
                } else {
                    return "Cash on Delivery";
                }
            } else {
                return "Cash on Delivery";
            }
        }
        return "Unknown";
    }
}