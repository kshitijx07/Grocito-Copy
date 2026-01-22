// CartService.java
package com.example.Grocito.Services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.Cart;
import com.example.Grocito.Entity.CartItem;
import com.example.Grocito.Entity.Product;
import com.example.Grocito.Entity.User;
import com.example.Grocito.Repository.CartItemRepository;
import com.example.Grocito.Repository.CartRepository;
import com.example.Grocito.Repository.ProductRepository;
import com.example.Grocito.Repository.UserRepository;

@Service
public class CartService {

    private static final Logger logger = LoggerConfig.getLogger(CartService.class);

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // Add item to cart with stock validation
    public Cart addToCart(Long userId, Long productId, int quantity) {
        logger.info("Adding product ID: {} to cart for user ID: {}, quantity: {}", productId, userId, quantity);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Failed to add to cart: User not found with ID: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
        logger.debug("User found: {} (ID: {})", user.getEmail(), userId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    logger.error("Failed to add to cart: Product not found with ID: {}", productId);
                    return new RuntimeException("Product not found with id: " + productId);
                });
        logger.debug("Product found: {} (ID: {}), available stock: {}", product.getName(), productId, product.getStock());
        
        // Check if product is in stock
        if (product.getStock() < quantity) {
            logger.warn("Insufficient stock for product: {} (ID: {}). Available: {}, Requested: {}", 
                    product.getName(), productId, product.getStock(), quantity);
            throw new RuntimeException("Not enough stock available for product: " + product.getName() + 
                    ". Available: " + product.getStock());
        }

        logger.debug("Checking if cart exists for user ID: {}", userId);
        Cart cart = cartRepository.findByUserId(userId).orElse(null);

        if (cart == null) {
            logger.debug("Creating new cart for user ID: {}", userId);
            cart = new Cart();
            cart.setUser(user);
            cart = cartRepository.save(cart);
            logger.debug("New cart created with ID: {} for user ID: {}", cart.getId(), userId);
        } else {
            logger.debug("Existing cart found with ID: {} for user ID: {}", cart.getId(), userId);
        }

        logger.debug("Checking if product already exists in cart");
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                logger.debug("Product already in cart, updating quantity. Current quantity: {}", item.getQuantity());
                // Check if the updated quantity exceeds stock
                int newQuantity = item.getQuantity() + quantity;
                if (product.getStock() < newQuantity) {
                    logger.warn("Insufficient stock for product: {} (ID: {}). Available: {}, Requested: {}", 
                            product.getName(), productId, product.getStock(), newQuantity);
                    throw new RuntimeException("Not enough stock available for product: " + product.getName() + 
                            ". Available: " + product.getStock() + ", Requested: " + newQuantity);
                }
                
                logger.debug("Updating quantity from {} to {} for product ID: {} in cart", 
                        item.getQuantity(), newQuantity, productId);
                item.setQuantity(newQuantity);
                cart = cartRepository.save(cart);
                logger.info("Successfully updated product quantity in cart for user ID: {}, product ID: {}, new quantity: {}", 
                        userId, productId, newQuantity);
                return cart;
            }
        }

        logger.debug("Product not in cart, adding as new item");
        CartItem newItem = new CartItem();
        newItem.setProduct(product);
        newItem.setQuantity(quantity);
        newItem.setCart(cart);

        cart.getItems().add(newItem);

        cart = cartRepository.save(cart);
        logger.info("Successfully added new product to cart for user ID: {}, product ID: {}, quantity: {}", 
                userId, productId, quantity);
        return cart;
    }

    // Get cart by user
    public Cart getCartByUser(Long userId) {
        logger.info("Retrieving cart for user ID: {}", userId);
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            logger.warn("Cart not found for user ID: {}", userId);
            throw new RuntimeException("Cart not found for user: " + userId);
        }
        logger.debug("Cart found for user ID: {}, contains {} items", userId, cart.getItems().size());
        return cart;
    }

    // Remove item from cart
    public void removeItem(Long itemId) {
        logger.info("Removing item ID: {} from cart", itemId);
        try {
            cartItemRepository.deleteById(itemId);
            logger.debug("Successfully removed item ID: {} from cart", itemId);
        } catch (Exception e) {
            logger.error("Failed to remove item ID: {} from cart: {}", itemId, e.getMessage());
            throw e;
        }
    }

    // Clear all items in user's cart
    public void clearCart(Long userId) {
        logger.info("Clearing all items from cart for user ID: {}", userId);
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            logger.warn("Cannot clear cart: Cart not found for user ID: {}", userId);
            throw new RuntimeException("Cart not found for user: " + userId);
        }
        logger.debug("Removing {} items from cart for user ID: {}", cart.getItems().size(), userId);
        cart.getItems().clear();
        cartRepository.save(cart);
        logger.info("Successfully cleared cart for user ID: {}", userId);
    }

    // Get all cart items of user
    public List<CartItem> getAllItems(Long userId) {
        logger.info("Retrieving all cart items for user ID: {}", userId);
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            logger.warn("Cannot retrieve items: Cart not found for user ID: {}", userId);
            throw new RuntimeException("Cart not found for user: " + userId);
        }
        logger.debug("Found {} items in cart for user ID: {}", cart.getItems().size(), userId);
        return cart.getItems();
    }

    // Update quantity of a specific cart item with stock validation
    public CartItem updateQuantity(Long itemId, int quantity) {
        logger.info("Updating quantity for cart item ID: {} to {}", itemId, quantity);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> {
                    logger.error("Failed to update quantity: CartItem not found with ID: {}", itemId);
                    return new RuntimeException("CartItem not found with id: " + itemId);
                });
        
        Product product = item.getProduct();
        logger.debug("Found cart item for product: {} (ID: {}), current quantity: {}, requested quantity: {}", 
                product.getName(), product.getId(), item.getQuantity(), quantity);
        
        // Check if the requested quantity exceeds stock
        if (product.getStock() < quantity) {
            logger.warn("Insufficient stock for product: {} (ID: {}). Available: {}, Requested: {}", 
                    product.getName(), product.getId(), product.getStock(), quantity);
            throw new RuntimeException("Not enough stock available for product: " + product.getName() + 
                    ". Available: " + product.getStock() + ", Requested: " + quantity);
        }
        
        logger.debug("Updating quantity from {} to {} for product: {} (ID: {})", 
                item.getQuantity(), quantity, product.getName(), product.getId());
        item.setQuantity(quantity);
        CartItem updatedItem = cartItemRepository.save(item);
        logger.info("Successfully updated quantity for cart item ID: {} to {}", itemId, quantity);
        return updatedItem;
    }
    
    // Update quantity by userId and productId
    public CartItem updateCartItemQuantity(Long userId, Long productId, int quantity) {
        logger.info("Updating quantity for product ID: {} in cart for user ID: {} to {}", productId, userId, quantity);
        
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    logger.error("Failed to update quantity: Cart not found for user ID: {}", userId);
                    return new RuntimeException("Cart not found for user: " + userId);
                });
        logger.debug("Found cart for user ID: {}", userId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    logger.error("Failed to update quantity: Product not found with ID: {}", productId);
                    return new RuntimeException("Product not found with id: " + productId);
                });
        logger.debug("Found product: {} (ID: {}), available stock: {}", product.getName(), productId, product.getStock());
        
        // Check if the requested quantity exceeds stock
        if (product.getStock() < quantity) {
            logger.warn("Insufficient stock for product: {} (ID: {}). Available: {}, Requested: {}", 
                    product.getName(), productId, product.getStock(), quantity);
            throw new RuntimeException("Not enough stock available for product: " + product.getName() + 
                    ". Available: " + product.getStock() + ", Requested: " + quantity);
        }
        
        logger.debug("Searching for product ID: {} in user's cart", productId);
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                logger.debug("Found product in cart, updating quantity from {} to {}", item.getQuantity(), quantity);
                item.setQuantity(quantity);
                CartItem updatedItem = cartItemRepository.save(item);
                logger.info("Successfully updated quantity for product ID: {} in cart for user ID: {} to {}", 
                        productId, userId, quantity);
                return updatedItem;
            }
        }
        
        logger.warn("Product ID: {} not found in cart for user ID: {}", productId, userId);
        throw new RuntimeException("Product not found in user's cart");
    }
    
    // Get cart items by userId
    public List<CartItem> getCartItems(Long userId) {
        logger.info("Retrieving cart items for user ID: {}", userId);
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            logger.warn("Cannot retrieve items: Cart not found for user ID: {}", userId);
            throw new RuntimeException("Cart not found for user: " + userId);
        }
        logger.debug("Found {} items in cart for user ID: {}", cart.getItems().size(), userId);
        return cart.getItems();
    }

    // Remove a cart item by userId and productId
    public void removeFromCart(Long userId, Long productId) {
        logger.info("Removing product ID: {} from cart for user ID: {}", productId, userId);
        
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            logger.warn("Cannot remove item: Cart not found for user ID: {}", userId);
            throw new RuntimeException("Cart not found for user: " + userId);
        }
        logger.debug("Found cart for user ID: {}, searching for product ID: {}", userId, productId);

        CartItem itemToRemove = null;
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                itemToRemove = item;
                break;
            }
        }

        if (itemToRemove != null) {
            logger.debug("Found product ID: {} in cart, removing item ID: {}", 
                    productId, itemToRemove.getId());
            cart.getItems().remove(itemToRemove); // remove from cart's list
            cartItemRepository.delete(itemToRemove); // delete from DB
            cartRepository.save(cart); // save updated cart
            logger.info("Successfully removed product ID: {} from cart for user ID: {}", productId, userId);
        } else {
            logger.warn("Product ID: {} not found in cart for user ID: {}", productId, userId);
            throw new RuntimeException("Cart item with productId " + productId + " not found in user's cart");
        }
    }
    
    // Calculate cart total
    public double calculateCartTotal(Long userId) {
        logger.info("Calculating cart total for user ID: {}", userId);
        List<CartItem> items = getCartItems(userId);
        double total = 0.0;
        
        logger.debug("Processing {} items to calculate total", items.size());
        for (CartItem item : items) {
            double itemTotal = item.getProduct().getPrice() * item.getQuantity();
            logger.debug("Item: {} (ID: {}), price: ${}, quantity: {}, subtotal: ${}", 
                    item.getProduct().getName(), item.getProduct().getId(), 
                    item.getProduct().getPrice(), item.getQuantity(), itemTotal);
            total += itemTotal;
        }
        
        logger.info("Cart total for user ID: {} is ${}", userId, total);
        return total;
    }
    
    // Get cart summary with product details
    public Map<String, Object> getCartSummary(Long userId) {
        logger.info("Generating cart summary for user ID: {}", userId);
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    logger.error("Failed to generate cart summary: Cart not found for user ID: {}", userId);
                    return new RuntimeException("Cart not found for user: " + userId);
                });
        
        List<CartItem> items = cart.getItems();
        List<Map<String, Object>> itemDetails = new ArrayList<>();
        double total = 0.0;
        int itemCount = 0;
        
        logger.debug("Processing {} items for cart summary", items.size());
        for (CartItem item : items) {
            Map<String, Object> detail = new HashMap<>();
            Product product = item.getProduct();
            double subtotal = product.getPrice() * item.getQuantity();
            boolean inStock = product.getStock() >= item.getQuantity();
            
            detail.put("itemId", item.getId());
            detail.put("productId", product.getId());
            detail.put("productName", product.getName());
            detail.put("price", product.getPrice());
            detail.put("quantity", item.getQuantity());
            detail.put("subtotal", subtotal);
            detail.put("inStock", inStock);
            
            itemDetails.add(detail);
            total += subtotal;
            itemCount += item.getQuantity();
            
            logger.debug("Added to summary: {} (ID: {}), price: ${}, quantity: {}, subtotal: ${}, in stock: {}", 
                    product.getName(), product.getId(), product.getPrice(), item.getQuantity(), subtotal, inStock);
            
            if (!inStock) {
                logger.warn("Insufficient stock for product in cart: {} (ID: {}). Available: {}, In cart: {}", 
                        product.getName(), product.getId(), product.getStock(), item.getQuantity());
            }
        }
        
        logger.debug("Creating summary map with total amount: ${} and total items: {}", total, itemCount);
        Map<String, Object> summary = new HashMap<>();
        summary.put("userId", userId);
        summary.put("items", itemDetails);
        summary.put("totalItems", itemCount);
        summary.put("totalAmount", total);
        
        logger.info("Successfully generated cart summary for user ID: {}, total items: {}, total amount: ${}", 
                userId, itemCount, total);
        return summary;
    }
    
    // Validate cart items against current stock
    public List<Map<String, Object>> validateCartItems(Long userId) {
        logger.info("Validating cart items against current stock for user ID: {}", userId);
        List<CartItem> items = getCartItems(userId);
        List<Map<String, Object>> validationResults = new ArrayList<>();
        
        logger.debug("Validating {} items in cart", items.size());
        int invalidItemsCount = 0;
        
        for (CartItem item : items) {
            Product product = item.getProduct();
            boolean isValid = product.getStock() >= item.getQuantity();
            Map<String, Object> result = new HashMap<>();
            
            result.put("itemId", item.getId());
            result.put("productId", product.getId());
            result.put("productName", product.getName());
            result.put("requestedQuantity", item.getQuantity());
            result.put("availableStock", product.getStock());
            result.put("valid", isValid);
            
            validationResults.add(result);
            
            if (!isValid) {
                invalidItemsCount++;
                logger.warn("Invalid item in cart: {} (ID: {}). Available stock: {}, Requested: {}", 
                        product.getName(), product.getId(), product.getStock(), item.getQuantity());
            } else {
                logger.debug("Valid item in cart: {} (ID: {}). Available stock: {}, Requested: {}", 
                        product.getName(), product.getId(), product.getStock(), item.getQuantity());
            }
        }
        
        logger.info("Cart validation complete for user ID: {}. Valid items: {}, Invalid items: {}", 
                userId, (items.size() - invalidItemsCount), invalidItemsCount);
        return validationResults;
    }
}
