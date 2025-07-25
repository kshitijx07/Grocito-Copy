package com.example.Grocito.Services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.Cart;
import com.example.Grocito.Entity.CartItem;
import com.example.Grocito.Entity.Order;
import com.example.Grocito.Entity.OrderItem;
import com.example.Grocito.Entity.Product;
import com.example.Grocito.Entity.User;
import com.example.Grocito.Repository.OrderItemRepository;
import com.example.Grocito.Repository.OrderRepository;
import com.example.Grocito.Repository.ProductRepository;
import com.example.Grocito.Repository.UserRepository;

@Service
public class OrderService {

    private static final Logger logger = LoggerConfig.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CartService cartService;

    /**
     * Place an order with the provided order details
     */
    @Transactional
    public Order placeOrder(Order order) {
        logger.info("Processing new order for user ID: {}", order.getUser().getId());
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("PLACED");
        
        // Validate user exists
        logger.debug("Validating user exists with ID: {}", order.getUser().getId());
        User user = userRepository.findById(order.getUser().getId())
                .orElseThrow(() -> {
                    logger.error("Order placement failed: User not found with ID: {}", order.getUser().getId());
                    return new RuntimeException("User not found with id: " + order.getUser().getId());
                });
        order.setUser(user);
        logger.debug("User validated: {} (ID: {})", user.getEmail(), user.getId());
        
        double orderTotal = 0.0;
        logger.debug("Processing {} items in order", order.getItems().size());
        
        for (OrderItem item : order.getItems()) {
            logger.debug("Processing order item for product ID: {}, quantity: {}", item.getProduct().getId(), item.getQuantity());
            Product product = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> {
                    logger.error("Order placement failed: Product not found with ID: {}", item.getProduct().getId());
                    return new RuntimeException("Product not found with id: " + item.getProduct().getId());
                });
            
            // Check if product is in stock
            if (product.getStock() < item.getQuantity()) {
                logger.warn("Insufficient stock for product: {} (ID: {}). Available: {}, Requested: {}", 
                        product.getName(), product.getId(), product.getStock(), item.getQuantity());
                throw new RuntimeException("Not enough stock available for product: " + product.getName() + 
                        ". Available: " + product.getStock() + ", Requested: " + item.getQuantity());
            }
            
            // Update product stock
            logger.debug("Updating stock for product: {} (ID: {}). Old stock: {}, New stock: {}", 
                    product.getName(), product.getId(), product.getStock(), (product.getStock() - item.getQuantity()));
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
            
            // Set product and order reference
            item.setProduct(product);
            item.setOrder(order);
            
            // Calculate item price and add to order total
            item.setPrice(product.getPrice());
            double itemTotal = product.getPrice() * item.getQuantity();
            item.setTotalPrice(itemTotal);
            orderTotal += itemTotal;
            logger.debug("Item total for product {}: {} (price: {} x quantity: {})", 
                    product.getName(), itemTotal, product.getPrice(), item.getQuantity());
        }
        
        order.setTotalAmount(orderTotal);
        return orderRepository.save(order);
    }
    
    /**
     * Place an order from user's cart
     */
    @Transactional
    public Order placeOrderFromCart(Long userId, String deliveryAddress, String paymentMethod, String paymentId, String landingPagePincode) {
        logger.info("Processing order from cart for user ID: {} with landing page pincode: {}", userId, landingPagePincode);
        
        // Get user's cart
        logger.debug("Retrieving cart items for user ID: {}", userId);
        List<CartItem> cartItems = cartService.getCartItems(userId);
        if (cartItems.isEmpty()) {
            logger.warn("Order placement failed: Cart is empty for user ID: {}", userId);
            throw new RuntimeException("Cart is empty");
        }
        logger.debug("Found {} items in cart for user ID: {}", cartItems.size(), userId);
        
        // Validate user exists
        logger.debug("Validating user exists with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Order placement failed: User not found with ID: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
        logger.debug("User validated: {} (ID: {})", user.getEmail(), user.getId());
        
        // Create new order
        logger.debug("Creating new order for user ID: {}", userId);
        Order order = new Order();
        order.setUser(user);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("PLACED");
        order.setDeliveryAddress(deliveryAddress);
        
        // Set payment information
        logger.debug("Setting payment method: {} for order", paymentMethod);
        order.setPaymentMethod(paymentMethod != null ? paymentMethod : "COD");
        
        if ("ONLINE".equals(paymentMethod) && paymentId != null) {
            order.setPaymentStatus("PAID");
            order.setPaymentId(paymentId);
            order.setActualPaymentMethod("ONLINE");
            order.setPaymentCompletedAt(LocalDateTime.now());
            logger.debug("Online payment configured with ID: {}", paymentId);
        } else {
            // COD orders start as PENDING payment
            order.setPaymentStatus("PENDING");
            order.setActualPaymentMethod(null); // Will be set by delivery partner
            logger.debug("COD payment configured - payment pending until delivery");
        }
        
        // CRITICAL FIX: Use landing page pincode for delivery partner assignment
        logger.debug("Setting pincode for delivery - prioritizing landing page pincode");
        if (landingPagePincode != null && !landingPagePincode.trim().isEmpty()) {
            order.setPincode(landingPagePincode.trim());
            logger.info("Using landing page pincode for delivery: {}", landingPagePincode);
        } else if (user.getPincode() != null && !user.getPincode().isEmpty()) {
            order.setPincode(user.getPincode());
            logger.debug("Fallback to user profile pincode: {}", user.getPincode());
        } else {
            logger.warn("Order placement failed: No valid pincode available for user ID: {}", userId);
            throw new RuntimeException("Pincode is required for delivery. Please ensure a valid pincode is selected.");
        }
        
        List<OrderItem> orderItems = new ArrayList<>();
        double orderTotal = 0.0;
        
        // Convert cart items to order items
        logger.debug("Converting {} cart items to order items", cartItems.size());
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            logger.debug("Processing cart item for product: {} (ID: {}), quantity: {}", 
                    product.getName(), product.getId(), cartItem.getQuantity());
            
            // Check if product is in stock
            if (product.getStock() < cartItem.getQuantity()) {
                logger.warn("Insufficient stock for product: {} (ID: {}). Available: {}, Requested: {}", 
                        product.getName(), product.getId(), product.getStock(), cartItem.getQuantity());
                throw new RuntimeException("Not enough stock available for product: " + product.getName() + 
                        ". Available: " + product.getStock() + ", Requested: " + cartItem.getQuantity());
            }
            
            // Update product stock
            logger.debug("Updating stock for product: {} (ID: {}). Old stock: {}, New stock: {}", 
                    product.getName(), product.getId(), product.getStock(), (product.getStock() - cartItem.getQuantity()));
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            double itemTotal = product.getPrice() * cartItem.getQuantity();
            orderItem.setTotalPrice(itemTotal);
            orderItem.setOrder(order);
            
            orderItems.add(orderItem);
            orderTotal += itemTotal;
            logger.debug("Item total for product {}: {} (price: {} x quantity: {})", 
                    product.getName(), itemTotal, product.getPrice(), cartItem.getQuantity());
        }
        
        order.setItems(orderItems);
        order.setTotalAmount(orderTotal);
        logger.debug("Order total calculated: ${}", orderTotal);
        
        // Save order
        logger.debug("Saving order to database");
        Order savedOrder = orderRepository.save(order);
        logger.info("Order successfully placed with ID: {} for user ID: {}, total amount: ${}", 
                savedOrder.getId(), userId, orderTotal);
        
        // Clear the cart after successful order
        logger.debug("Clearing cart for user ID: {}", userId);
        cartService.clearCart(userId);
        
        return savedOrder;
    }

    /**
     * Get all orders for a user
     */
    public List<Order> getOrdersByUser(Long userId) {
        logger.info("Retrieving all orders for user ID: {}", userId);
        List<Order> orders = orderRepository.findByUserId(userId);
        logger.debug("Found {} orders for user ID: {}", orders.size(), userId);
        return orders;
    }
    
    /**
     * Get order by ID
     */
    public Optional<Order> getOrderById(Long orderId) {
        logger.info("Retrieving order with ID: {}", orderId);
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isPresent()) {
            logger.debug("Order found with ID: {}", orderId);
        } else {
            logger.debug("Order not found with ID: {}", orderId);
        }
        return order;
    }
    
    /**
     * Update order status with COD payment validation
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        logger.info("Updating status to '{}' for order ID: {}", status, orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    logger.error("Status update failed: Order not found with ID: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        
        // CRITICAL SECURITY CHECK: Prevent marking COD orders as delivered without payment collection
        if ("DELIVERED".equals(status)) {
            logger.debug("Validating delivery completion for order ID: {}", orderId);
            
            // Check if this is a COD order
            boolean isCODOrder = "COD".equals(order.getPaymentMethod()) || order.getPaymentMethod() == null;
            boolean isPaymentPending = "PENDING".equals(order.getPaymentStatus()) || order.getPaymentStatus() == null;
            
            logger.debug("Order {} - PaymentMethod: {}, PaymentStatus: {}, isCOD: {}, isPending: {}", 
                        orderId, order.getPaymentMethod(), order.getPaymentStatus(), isCODOrder, isPaymentPending);
            
            if (isCODOrder && isPaymentPending) {
                logger.warn("SECURITY VIOLATION: Attempt to mark COD order {} as delivered without payment collection", orderId);
                throw new RuntimeException("Cannot mark COD order as delivered without collecting payment. Please collect payment first using the payment collection interface.");
            }
            
            // Set delivery timestamp for successful deliveries
            order.setDeliveredAt(LocalDateTime.now());
            logger.info("Setting delivery timestamp for order ID: {}", orderId);
        }
        
        logger.debug("Changing order status from '{}' to '{}' for order ID: {}", 
                order.getStatus(), status, orderId);
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        logger.info("Order status successfully updated to '{}' for order ID: {}", status, orderId);
        return updatedOrder;
    }
    
    /**
     * Cancel an order
     */
    @Transactional
    public Order cancelOrder(Long orderId) {
        logger.info("Processing cancellation request for order ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    logger.error("Cancellation failed: Order not found with ID: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        
        // Only allow cancellation if order is not delivered
        if ("DELIVERED".equals(order.getStatus())) {
            logger.warn("Cancellation rejected: Order ID: {} is already delivered", orderId);
            throw new RuntimeException("Cannot cancel an order that has been delivered");
        }
        
        // Restore product stock
        logger.debug("Restoring stock for {} items in cancelled order ID: {}", order.getItems().size(), orderId);
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            logger.debug("Restoring stock for product: {} (ID: {}). Old stock: {}, New stock: {}", 
                    product.getName(), product.getId(), product.getStock(), (product.getStock() + item.getQuantity()));
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        
        logger.debug("Setting order status to 'CANCELLED' for order ID: {}", orderId);
        order.setStatus("CANCELLED");
        Order cancelledOrder = orderRepository.save(order);
        logger.info("Order successfully cancelled for order ID: {}", orderId);
        return cancelledOrder;
    }
    
    /**
     * Update payment status for COD orders (called by delivery partner)
     */
    @Transactional
    public Order updatePaymentStatus(Long orderId, String actualPaymentMethod, String paymentId, String paymentNotes) {
        logger.info("Updating payment status for order ID: {} with method: {}", orderId, actualPaymentMethod);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    logger.error("Payment update failed: Order not found with ID: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        
        // Validate that this is a COD order
        if (!"COD".equals(order.getPaymentMethod())) {
            logger.warn("Payment update rejected: Order ID: {} is not a COD order", orderId);
            throw new RuntimeException("Payment status can only be updated for COD orders");
        }
        
        // Validate payment method
        if (!isValidPaymentMethod(actualPaymentMethod)) {
            logger.warn("Payment update rejected: Invalid payment method: {}", actualPaymentMethod);
            throw new RuntimeException("Invalid payment method. Allowed values: CASH, UPI, CARD");
        }
        
        // Update payment information
        logger.debug("Updating payment details for order ID: {}", orderId);
        order.setActualPaymentMethod(actualPaymentMethod);
        order.setPaymentStatus("PAID");
        order.setPaymentCompletedAt(LocalDateTime.now());
        
        if (paymentId != null && !paymentId.trim().isEmpty()) {
            order.setPaymentId(paymentId.trim());
        }
        
        if (paymentNotes != null && !paymentNotes.trim().isEmpty()) {
            order.setPaymentNotes(paymentNotes.trim());
        }
        
        Order updatedOrder = orderRepository.save(order);
        logger.info("Payment status updated successfully for order ID: {} - Method: {}, Status: PAID", 
                   orderId, actualPaymentMethod);
        
        return updatedOrder;
    }
    
    /**
     * Get payment history for a user
     */
    public List<Map<String, Object>> getPaymentHistory(Long userId) {
        logger.info("Fetching payment history for user ID: {}", userId);
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Payment history fetch failed: User not found with ID: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
        
        // Get all orders for the user
        List<Order> orders = orderRepository.findByUserIdOrderByOrderTimeDesc(userId);
        logger.debug("Found {} orders for user ID: {}", orders.size(), userId);
        
        // Convert to payment history format
        List<Map<String, Object>> paymentHistory = new ArrayList<>();
        
        for (Order order : orders) {
            Map<String, Object> paymentRecord = new HashMap<>();
            paymentRecord.put("orderId", order.getId());
            paymentRecord.put("orderTime", order.getOrderTime());
            paymentRecord.put("totalAmount", order.getTotalAmount());
            paymentRecord.put("paymentMethod", order.getPaymentMethod());
            paymentRecord.put("paymentStatus", order.getPaymentStatus());
            paymentRecord.put("actualPaymentMethod", order.getActualPaymentMethod());
            paymentRecord.put("paymentId", order.getPaymentId());
            paymentRecord.put("paymentCompletedAt", order.getPaymentCompletedAt());
            paymentRecord.put("paymentNotes", order.getPaymentNotes());
            paymentRecord.put("orderStatus", order.getStatus());
            
            // Add user-friendly payment description
            String paymentDescription = getPaymentDescription(order);
            paymentRecord.put("paymentDescription", paymentDescription);
            
            paymentHistory.add(paymentRecord);
        }
        
        logger.info("Payment history retrieved successfully for user ID: {} - {} records", userId, paymentHistory.size());
        return paymentHistory;
    }
    
    /**
     * Helper method to validate payment methods
     */
    private boolean isValidPaymentMethod(String paymentMethod) {
        return paymentMethod != null && 
               (paymentMethod.equals("CASH") || paymentMethod.equals("UPI") || paymentMethod.equals("CARD"));
    }
    
    /**
     * Helper method to generate user-friendly payment descriptions
     */
    private String getPaymentDescription(Order order) {
        if ("ONLINE".equals(order.getPaymentMethod())) {
            return "Paid Online";
        } else if ("COD".equals(order.getPaymentMethod())) {
            if ("PAID".equals(order.getPaymentStatus())) {
                String method = order.getActualPaymentMethod();
                if ("CASH".equals(method)) {
                    return "Paid by Cash on Delivery";
                } else if ("UPI".equals(method)) {
                    return "Paid by UPI on Delivery";
                } else if ("CARD".equals(method)) {
                    return "Paid by Card on Delivery";
                } else {
                    return "Paid on Delivery";
                }
            } else {
                return "Cash on Delivery - Payment Pending";
            }
        }
        return "Unknown Payment Method";
    }
    
    /**
     * Create Razorpay order for digital payment collection
     */
    public Map<String, Object> createRazorpayOrder(Long orderId, Map<String, Object> request) {
        logger.info("Creating Razorpay order for order ID: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    logger.error("Razorpay order creation failed: Order not found with ID: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        
        // Validate that this is a COD order
        if (!"COD".equals(order.getPaymentMethod())) {
            logger.warn("Razorpay order creation rejected: Order ID: {} is not a COD order", orderId);
            throw new RuntimeException("Razorpay orders can only be created for COD orders");
        }
        
        try {
            // For now, create a mock Razorpay order response
            // In production, you would integrate with actual Razorpay API
            Map<String, Object> razorpayOrder = new HashMap<>();
            razorpayOrder.put("id", "order_" + orderId + "_" + System.currentTimeMillis());
            razorpayOrder.put("amount", ((Number) request.get("amount")).intValue());
            razorpayOrder.put("currency", request.get("currency"));
            razorpayOrder.put("status", "created");
            
            logger.info("Razorpay order created successfully for order ID: {}", orderId);
            return razorpayOrder;
            
        } catch (Exception e) {
            logger.error("Error creating Razorpay order for order ID {}: {}", orderId, e.getMessage());
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }
    
    /**
     * Verify Razorpay payment and update order status
     */
    @Transactional
    public Order verifyRazorpayPayment(Long orderId, Map<String, Object> request) {
        logger.info("Verifying Razorpay payment for order ID: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    logger.error("Payment verification failed: Order not found with ID: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        
        // Validate that this is a COD order
        if (!"COD".equals(order.getPaymentMethod())) {
            logger.warn("Payment verification rejected: Order ID: {} is not a COD order", orderId);
            throw new RuntimeException("Payment verification can only be done for COD orders");
        }
        
        try {
            // Extract payment details from request
            String razorpayOrderId = (String) request.get("razorpay_order_id");
            String razorpayPaymentId = (String) request.get("razorpay_payment_id");
            String razorpaySignature = (String) request.get("razorpay_signature");
            String paymentNotes = (String) request.get("paymentNotes");
            
            // In production, you would verify the signature with Razorpay
            // For now, we'll assume the payment is valid if all required fields are present
            if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
                throw new RuntimeException("Invalid payment response from Razorpay");
            }
            
            // Update payment information
            logger.debug("Updating payment details for order ID: {}", orderId);
            order.setActualPaymentMethod("UPI"); // Default to UPI for digital payments
            order.setPaymentStatus("PAID");
            order.setPaymentId(razorpayPaymentId);
            order.setPaymentCompletedAt(LocalDateTime.now());
            
            if (paymentNotes != null && !paymentNotes.trim().isEmpty()) {
                order.setPaymentNotes(paymentNotes.trim());
            } else {
                order.setPaymentNotes("Digital payment via Razorpay - Payment ID: " + razorpayPaymentId);
            }
            
            Order updatedOrder = orderRepository.save(order);
            logger.info("Razorpay payment verified and updated successfully for order ID: {} - Payment ID: {}", 
                       orderId, razorpayPaymentId);
            
            return updatedOrder;
            
        } catch (Exception e) {
            logger.error("Error verifying Razorpay payment for order ID {}: {}", orderId, e.getMessage());
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }
    
    /**
     * Get order summary
     */
    public Map<String, Object> getOrderSummary(Long orderId) {
        logger.info("Generating order summary for order ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    logger.error("Summary generation failed: Order not found with ID: {}", orderId);
                    return new RuntimeException("Order not found with id: " + orderId);
                });
        
        logger.debug("Creating summary map for order ID: {}", orderId);
        Map<String, Object> summary = new HashMap<>();
        summary.put("orderId", order.getId());
        summary.put("userId", order.getUser().getId());
        summary.put("orderTime", order.getOrderTime());
        summary.put("status", order.getStatus());
        summary.put("deliveryAddress", order.getDeliveryAddress());
        summary.put("totalAmount", order.getTotalAmount());
        
        logger.debug("Adding item details to summary for order ID: {}", orderId);
        List<Map<String, Object>> itemDetails = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            Map<String, Object> detail = new HashMap<>();
            detail.put("productId", item.getProduct().getId());
            detail.put("productName", item.getProduct().getName());
            detail.put("quantity", item.getQuantity());
            detail.put("price", item.getPrice());
            detail.put("subtotal", item.getPrice() * item.getQuantity());
            
            itemDetails.add(detail);
            logger.debug("Added item to summary: {} (ID: {}), quantity: {}, price: ${}", 
                    item.getProduct().getName(), item.getProduct().getId(), item.getQuantity(), item.getPrice());
        }
        
        summary.put("items", itemDetails);
        logger.debug("Order summary generated successfully for order ID: {}", orderId);
        return summary;
    }
    
    /**
     * Get all orders (admin function)
     */
    public List<Order> getAllOrders() {
        logger.info("Retrieving all orders (admin function)");
        List<Order> orders = orderRepository.findAll();
        logger.debug("Found {} total orders in the system", orders.size());
        return orders;
    }
    
    /**
     * Get orders by pincode
     */
    public List<Order> getOrdersByPincode(String pincode) {
        logger.info("Retrieving orders for pincode: {}", pincode);
        List<Order> orders = orderRepository.findByPincode(pincode);
        logger.debug("Found {} orders for pincode: {}", orders.size(), pincode);
        return orders;
    }
    
    /**
     * Get filtered orders with pagination
     */
    public org.springframework.data.domain.Page<Order> getFilteredOrders(
            int page, int size, String sortBy, String status, String pincode, 
            String search, String dateFrom, String dateTo) {
        
        logger.debug("Fetching filtered orders - page: {}, size: {}, sortBy: {}, status: {}, pincode: {}, search: {}", 
                page, size, sortBy, status, pincode, search);
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by(sortBy).descending());
        
        // For now, return all orders with basic filtering
        // In a real implementation, you would create custom repository methods
        List<Order> allOrders = orderRepository.findAll();
        
        // Apply filters
        java.util.stream.Stream<Order> orderStream = allOrders.stream();
        
        if (status != null && !status.isEmpty()) {
            orderStream = orderStream.filter(order -> status.equals(order.getStatus()));
        }
        
        if (pincode != null && !pincode.isEmpty()) {
            orderStream = orderStream.filter(order -> pincode.equals(order.getPincode()));
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            orderStream = orderStream.filter(order -> 
                order.getId().toString().contains(searchLower) ||
                (order.getUser() != null && order.getUser().getFullName() != null && 
                 order.getUser().getFullName().toLowerCase().contains(searchLower)) ||
                (order.getUser() != null && order.getUser().getEmail() != null && 
                 order.getUser().getEmail().toLowerCase().contains(searchLower)) ||
                (order.getDeliveryAddress() != null && 
                 order.getDeliveryAddress().toLowerCase().contains(searchLower))
            );
        }
        
        if (dateFrom != null && !dateFrom.isEmpty()) {
            try {
                java.time.LocalDate fromDate = java.time.LocalDate.parse(dateFrom);
                orderStream = orderStream.filter(order -> 
                    order.getOrderTime().toLocalDate().isAfter(fromDate.minusDays(1)));
            } catch (Exception e) {
                logger.warn("Invalid dateFrom format: {}", dateFrom);
            }
        }
        
        if (dateTo != null && !dateTo.isEmpty()) {
            try {
                java.time.LocalDate toDate = java.time.LocalDate.parse(dateTo);
                orderStream = orderStream.filter(order -> 
                    order.getOrderTime().toLocalDate().isBefore(toDate.plusDays(1)));
            } catch (Exception e) {
                logger.warn("Invalid dateTo format: {}", dateTo);
            }
        }
        
        List<Order> filteredOrders = orderStream.collect(java.util.stream.Collectors.toList());
        
        // Sort orders
        if ("orderTime".equals(sortBy)) {
            filteredOrders.sort((a, b) -> b.getOrderTime().compareTo(a.getOrderTime()));
        } else if ("totalAmount".equals(sortBy)) {
            filteredOrders.sort((a, b) -> Double.compare(b.getTotalAmount(), a.getTotalAmount()));
        }
        
        // Create page
        int start = page * size;
        int end = Math.min(start + size, filteredOrders.size());
        List<Order> pageContent = start < filteredOrders.size() ? 
                filteredOrders.subList(start, end) : new ArrayList<>();
        
        return new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, filteredOrders.size());
    }
    
    /**
     * Get order analytics
     */
    public Map<String, Object> getOrderAnalytics(String pincode, String dateFrom, String dateTo) {
        logger.debug("Calculating order analytics for pincode: {}", pincode);
        
        List<Order> orders = pincode != null ? getOrdersByPincode(pincode) : getAllOrders();
        
        // Apply date filtering
        if (dateFrom != null || dateTo != null) {
            orders = orders.stream().filter(order -> {
                java.time.LocalDate orderDate = order.getOrderTime().toLocalDate();
                
                if (dateFrom != null) {
                    try {
                        java.time.LocalDate fromDate = java.time.LocalDate.parse(dateFrom);
                        if (orderDate.isBefore(fromDate)) return false;
                    } catch (Exception e) {
                        logger.warn("Invalid dateFrom format: {}", dateFrom);
                    }
                }
                
                if (dateTo != null) {
                    try {
                        java.time.LocalDate toDate = java.time.LocalDate.parse(dateTo);
                        if (orderDate.isAfter(toDate)) return false;
                    } catch (Exception e) {
                        logger.warn("Invalid dateTo format: {}", dateTo);
                    }
                }
                
                return true;
            }).collect(java.util.stream.Collectors.toList());
        }
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Basic metrics
        analytics.put("totalOrders", orders.size());
        analytics.put("totalRevenue", orders.stream().mapToDouble(Order::getTotalAmount).sum());
        analytics.put("averageOrderValue", orders.isEmpty() ? 0 : 
                orders.stream().mapToDouble(Order::getTotalAmount).average().orElse(0));
        
        // Status distribution
        Map<String, Long> statusDistribution = orders.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    Order::getStatus, 
                    java.util.stream.Collectors.counting()
                ));
        analytics.put("statusDistribution", statusDistribution);
        
        // Time-based metrics
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate weekAgo = today.minusDays(7);
        java.time.LocalDate monthAgo = today.minusMonths(1);
        
        analytics.put("todayOrders", orders.stream()
                .filter(order -> order.getOrderTime().toLocalDate().equals(today))
                .count());
        
        analytics.put("weekOrders", orders.stream()
                .filter(order -> order.getOrderTime().toLocalDate().isAfter(weekAgo))
                .count());
        
        analytics.put("monthOrders", orders.stream()
                .filter(order -> order.getOrderTime().toLocalDate().isAfter(monthAgo))
                .count());
        
        // Revenue metrics
        analytics.put("todayRevenue", orders.stream()
                .filter(order -> order.getOrderTime().toLocalDate().equals(today))
                .mapToDouble(Order::getTotalAmount).sum());
        
        analytics.put("weekRevenue", orders.stream()
                .filter(order -> order.getOrderTime().toLocalDate().isAfter(weekAgo))
                .mapToDouble(Order::getTotalAmount).sum());
        
        analytics.put("monthRevenue", orders.stream()
                .filter(order -> order.getOrderTime().toLocalDate().isAfter(monthAgo))
                .mapToDouble(Order::getTotalAmount).sum());
        
        analytics.put("pincode", pincode != null ? pincode : "All Regions");
        
        // Daily trends (last 7 days)
        List<Map<String, Object>> dailyTrends = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = today.minusDays(i);
            List<Order> dayOrders = orders.stream()
                    .filter(order -> order.getOrderTime().toLocalDate().equals(date))
                    .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("orders", dayOrders.size());
            dayData.put("revenue", dayOrders.stream().mapToDouble(Order::getTotalAmount).sum());
            dailyTrends.add(dayData);
        }
        analytics.put("dailyTrends", dailyTrends);
        
        logger.debug("Analytics calculated for {} orders", orders.size());
        return analytics;
    }
    
    /**
     * Bulk update order status with role-based access control
     */
    @Transactional
    public List<Order> bulkUpdateStatus(List<Long> orderIds, String status, String userRole, String userPincode) {
        logger.info("Processing bulk status update for {} orders to status: {} by {} admin", 
                   orderIds.size(), status, userRole);
        
        List<Order> updatedOrders = new ArrayList<>();
        
        for (Long orderId : orderIds) {
            try {
                Order order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
                
                // Check access permissions
                if ("ADMIN".equals(userRole) && !userPincode.equals(order.getPincode())) {
                    logger.warn("Regional admin {} attempted to update unauthorized order ID: {} (pincode: {})", 
                               userPincode, orderId, order.getPincode());
                    throw new RuntimeException("Access denied for order ID " + orderId + 
                            ". You can only update orders from your assigned region.");
                }
                
                order.setStatus(status);
                Order updatedOrder = orderRepository.save(order);
                updatedOrders.add(updatedOrder);
                
                logger.debug("Updated order {} to status: {}", orderId, status);
            } catch (Exception e) {
                logger.error("Error updating order ID {}: {}", orderId, e.getMessage());
                throw new RuntimeException("Failed to update order ID " + orderId + ": " + e.getMessage());
            }
        }
        
        logger.info("Successfully updated {} orders to status: {}", updatedOrders.size(), status);
        return updatedOrders;
    }    
 
   /**
     * Get dashboard analytics with role-based filtering
     */
    public Map<String, Object> getDashboardAnalytics(String userRole, String userPincode) {
        logger.info("Calculating dashboard analytics for role: {}, pincode: {}", userRole, userPincode);
        
        // Get orders based on role
        List<Order> orders = "SUPER_ADMIN".equals(userRole) ? 
                getAllOrders() : 
                (userPincode != null ? getOrdersByPincode(userPincode) : getAllOrders());
        
        // Get all users count (this would need UserService in real implementation)
        // For now, we'll use a placeholder or get from UserRepository
        int totalUsers = 0;
        try {
            totalUsers = (int) userRepository.count();
        } catch (Exception e) {
            logger.warn("Could not get user count: {}", e.getMessage());
            totalUsers = 0;
        }
        
        // Get all products count (this would need ProductService in real implementation)
        int totalProducts = 0;
        try {
            totalProducts = (int) productRepository.count();
        } catch (Exception e) {
            logger.warn("Could not get product count: {}", e.getMessage());
            totalProducts = 0;
        }
        
        // Calculate metrics
        java.time.LocalDate today = java.time.LocalDate.now();
        
        // Active orders (not delivered or cancelled)
        long activeOrders = orders.stream()
                .filter(order -> !"DELIVERED".equals(order.getStatus()) && !"CANCELLED".equals(order.getStatus()))
                .count();
        
        // Today's revenue
        double todayRevenue = orders.stream()
                .filter(order -> order.getOrderTime().toLocalDate().equals(today))
                .mapToDouble(Order::getTotalAmount)
                .sum();
        
        // Total revenue
        double totalRevenue = orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalUsers", totalUsers);
        analytics.put("activeOrders", activeOrders);
        analytics.put("totalProducts", totalProducts);
        analytics.put("todayRevenue", todayRevenue);
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("totalOrders", orders.size());
        
        // Additional metrics
        analytics.put("averageOrderValue", orders.isEmpty() ? 0 : totalRevenue / orders.size());
        
        // Orders by status
        Map<String, Long> ordersByStatus = orders.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    Order::getStatus, 
                    java.util.stream.Collectors.counting()
                ));
        analytics.put("ordersByStatus", ordersByStatus);
        
        // Recent orders count (last 24 hours)
        java.time.LocalDateTime yesterday = java.time.LocalDateTime.now().minusDays(1);
        long recentOrdersCount = orders.stream()
                .filter(order -> order.getOrderTime().isAfter(yesterday))
                .count();
        analytics.put("recentOrdersCount", recentOrdersCount);
        
        logger.info("Dashboard analytics calculated - Total orders: {}, Active orders: {}, Today's revenue: {}", 
                   orders.size(), activeOrders, todayRevenue);
        
        return analytics;
    }
    
    /**
     * Get recent activity for dashboard
     */
    public List<Map<String, Object>> getRecentActivity(String userRole, String userPincode, int limit) {
        logger.info("Fetching recent activity for role: {}, pincode: {}, limit: {}", userRole, userPincode, limit);
        
        // Get orders based on role
        List<Order> orders = "SUPER_ADMIN".equals(userRole) ? 
                getAllOrders() : 
                (userPincode != null ? getOrdersByPincode(userPincode) : getAllOrders());
        
        // Sort by most recent first and limit
        List<Order> recentOrders = orders.stream()
                .sorted((a, b) -> b.getOrderTime().compareTo(a.getOrderTime()))
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
        
        List<Map<String, Object>> activities = new ArrayList<>();
        
        for (Order order : recentOrders) {
            Map<String, Object> activity = new HashMap<>();
            
            // Determine activity type and message based on order status and time
            String activityType = getActivityType(order);
            String message = getActivityMessage(order);
            String timeAgo = getTimeAgo(order.getOrderTime());
            
            activity.put("type", activityType);
            activity.put("message", message);
            activity.put("timeAgo", timeAgo);
            activity.put("orderId", order.getId());
            activity.put("orderStatus", order.getStatus());
            activity.put("customerName", order.getUser() != null ? order.getUser().getFullName() : "Unknown");
            activity.put("amount", order.getTotalAmount());
            activity.put("pincode", order.getPincode());
            
            activities.add(activity);
        }
        
        // Add some product-related activities (low stock alerts)
        try {
            List<Product> lowStockProducts = productRepository.findAll().stream()
                    .filter(product -> product.getStock() <= 5)
                    .limit(3)
                    .collect(java.util.stream.Collectors.toList());
            
            for (Product product : lowStockProducts) {
                // Only add if it's relevant to the admin's region or if super admin
                if ("SUPER_ADMIN".equals(userRole) || 
                    (userPincode != null && userPincode.equals(product.getPincode()))) {
                    
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "warning");
                    activity.put("message", "Product \"" + product.getName() + "\" is low in stock (" + product.getStock() + " remaining)");
                    activity.put("timeAgo", "Recently");
                    activity.put("productId", product.getId());
                    activity.put("productName", product.getName());
                    activity.put("stock", product.getStock());
                    activity.put("pincode", product.getPincode());
                    
                    activities.add(activity);
                }
            }
        } catch (Exception e) {
            logger.warn("Could not fetch low stock products for recent activity: {}", e.getMessage());
        }
        
        // Sort all activities by relevance and recency
        activities = activities.stream()
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
        
        logger.info("Generated {} recent activities", activities.size());
        return activities;
    }
    
    private String getActivityType(Order order) {
        switch (order.getStatus()) {
            case "PLACED":
                return "success";
            case "PACKED":
                return "info";
            case "OUT_FOR_DELIVERY":
                return "warning";
            case "DELIVERED":
                return "success";
            case "CANCELLED":
                return "error";
            default:
                return "info";
        }
    }
    
    private String getActivityMessage(Order order) {
        String customerName = order.getUser() != null ? order.getUser().getFullName() : "Customer";
        
        switch (order.getStatus()) {
            case "PLACED":
                return "New order #" + order.getId() + " received from " + customerName;
            case "PACKED":
                return "Order #" + order.getId() + " has been packed";
            case "OUT_FOR_DELIVERY":
                return "Order #" + order.getId() + " is out for delivery";
            case "DELIVERED":
                return "Order #" + order.getId() + " delivered successfully";
            case "CANCELLED":
                return "Order #" + order.getId() + " was cancelled";
            default:
                return "Order #" + order.getId() + " status updated";
        }
    }
    
    private String getTimeAgo(java.time.LocalDateTime orderTime) {
        java.time.Duration duration = java.time.Duration.between(orderTime, java.time.LocalDateTime.now());
        
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();
        
        if (minutes < 1) {
            return "Just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        } else if (hours < 24) {
            return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
        } else {
            return days + " day" + (days == 1 ? "" : "s") + " ago";
        }
    }}
