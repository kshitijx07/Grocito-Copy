package com.example.Grocito.Services;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.Grocito.config.LoggerConfig;

@Service
public class EmailService {

    private static final Logger logger = LoggerConfig.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender emailSender;

    /**
     * Send a simple email message
     * 
     * @param to      Recipient email address
     * @param subject Email subject
     * @param text    Email body text
     */
    public void sendSimpleMessage(String to, String subject, String text) {
        logger.info("Sending email to: {}", to);
        logger.debug("Email subject: {}", subject);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("codercompete@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            emailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}, error: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Send welcome email to newly registered user
     * 
     * @param to       User's email address
     * @param fullName User's full name
     */
    public void sendWelcomeEmail(String to, String fullName) {
        String subject = "Welcome to Grocito!";
        String text = "Dear " + fullName + ",\n\n"
                + "Welcome to Grocito! We're excited to have you on board.\n\n"
                + "With Grocito, you can:\n"
                + "- Browse and order groceries based on your location\n"
                + "- Track your orders in real-time\n"
                + "- Enjoy fast delivery to your doorstep\n\n"
                + "If you have any questions or need assistance, please don't hesitate to contact our support team.\n\n"
                + "Happy shopping!\n\n"
                + "The Grocito Team";
        
        sendSimpleMessage(to, subject, text);
    }

    /**
     * Send password reset email with temporary password
     * 
     * @param to              User's email address
     * @param fullName        User's full name
     * @param temporaryPassword Temporary password
     */
    public void sendPasswordResetEmail(String to, String fullName, String temporaryPassword) {
        String subject = "Grocito - Password Reset";
        String text = "Dear " + fullName + ",\n\n"
                + "We received a request to reset your password for your Grocito account.\n\n"
                + "Your temporary password is: " + temporaryPassword + "\n\n"
                + "Please use this temporary password to log in, and then change your password immediately for security reasons.\n\n"
                + "If you did not request a password reset, please contact our support team immediately.\n\n"
                + "Thank you,\n"
                + "The Grocito Team";
        
        sendSimpleMessage(to, subject, text);
    }
}