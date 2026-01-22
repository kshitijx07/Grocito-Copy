package com.example.Grocito.Controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Grocito.Entity.Cart;
import com.example.Grocito.Entity.CartItem;
import com.example.Grocito.Services.CartService;
import com.example.Grocito.dto.AddToCartRequest;
import com.example.Grocito.config.LoggerConfig;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger logger = LoggerConfig.getLogger(CartController.class);

    @Autowired
    private CartService cartService;

    // Add item to cart
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        logger.info("Received request to add product ID: {} to cart for user ID: {} with quantity: {}", 
                request.getProductId(), request.getUserId(), request.getQuantity());
        try {
            Cart cart = cartService.addToCart(request.getUserId(), request.getProductId(), request.getQuantity());
            logger.info("Successfully added product ID: {} to cart for user ID: {}", 
                    request.getProductId(), request.getUserId());
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            logger.warn("Failed to add product ID: {} to cart for user ID: {}. Error: {}", 
                    request.getProductId(), request.getUserId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Get all items in user's cart
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCartItems(@PathVariable Long userId) {
        logger.info("Received request to get cart items for user ID: {}", userId);
        try {
            List<CartItem> cartItems = cartService.getCartItems(userId);
            logger.info("Successfully retrieved {} cart items for user ID: {}", cartItems.size(), userId);
            return ResponseEntity.ok(cartItems);
        } catch (RuntimeException e) {
            logger.warn("Failed to retrieve cart items for user ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Remove an item from the cart
    @DeleteMapping("/remove")
    public ResponseEntity<?> removeCartItem(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        logger.info("Received request to remove product ID: {} from cart for user ID: {}", productId, userId);
        try {
            cartService.removeFromCart(userId, productId);
            logger.info("Successfully removed product ID: {} from cart for user ID: {}", productId, userId);
            return ResponseEntity.ok("Item removed from cart");
        } catch (RuntimeException e) {
            logger.warn("Failed to remove product ID: {} from cart for user ID: {}. Error: {}", 
                    productId, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Clear user's cart
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        logger.info("Received request to clear cart for user ID: {}", userId);
        try {
            cartService.clearCart(userId);
            logger.info("Successfully cleared cart for user ID: {}", userId);
            return ResponseEntity.ok("Cart cleared successfully");
        } catch (RuntimeException e) {
            logger.warn("Failed to clear cart for user ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    // Update cart item quantity
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItemQuantity(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam int quantity) {
        logger.info("Received request to update quantity for product ID: {} in cart for user ID: {} to {}", 
                productId, userId, quantity);
        try {
            CartItem updatedItem = cartService.updateCartItemQuantity(userId, productId, quantity);
            logger.info("Successfully updated quantity for product ID: {} in cart for user ID: {} to {}", 
                    productId, userId, quantity);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            logger.warn("Failed to update quantity for product ID: {} in cart for user ID: {}. Error: {}", 
                    productId, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // Get cart summary with product details and total
    @GetMapping("/{userId}/summary")
    public ResponseEntity<?> getCartSummary(@PathVariable Long userId) {
        logger.info("Received request to get cart summary for user ID: {}", userId);
        try {
            Map<String, Object> summary = cartService.getCartSummary(userId);
            logger.info("Successfully retrieved cart summary for user ID: {}", userId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            logger.warn("Failed to retrieve cart summary for user ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    // Calculate cart total
    @GetMapping("/{userId}/total")
    public ResponseEntity<?> getCartTotal(@PathVariable Long userId) {
        logger.info("Received request to calculate cart total for user ID: {}", userId);
        try {
            double total = cartService.calculateCartTotal(userId);
            logger.info("Successfully calculated cart total for user ID: {}, total: ${}", userId, total);
            return ResponseEntity.ok(Map.of("total", total));
        } catch (RuntimeException e) {
            logger.warn("Failed to calculate cart total for user ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    // Validate cart items against current stock
    @GetMapping("/{userId}/validate")
    public ResponseEntity<?> validateCartItems(@PathVariable Long userId) {
        logger.info("Received request to validate cart items for user ID: {}", userId);
        try {
            List<Map<String, Object>> validationResults = cartService.validateCartItems(userId);
            logger.info("Successfully validated cart items for user ID: {}", userId);
            return ResponseEntity.ok(validationResults);
        } catch (RuntimeException e) {
            logger.warn("Failed to validate cart items for user ID: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

