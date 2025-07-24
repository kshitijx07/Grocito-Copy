package com.example.Grocito.Controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.Product;
import com.example.Grocito.Services.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerConfig.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    // Get all products with pagination support (role-based access)
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        
        logger.info("Fetching products with filters - page: {}, size: {}, sortBy: {}, category: {}, pincode: {}, search: {}", 
                page, size, sortBy, category, pincode, search);
        
        // Get user role and pincode from token/session (simplified for demo)
        String userRole = getUserRoleFromRequest(request);
        String userPincode = getUserPincodeFromRequest(request);
        
        logger.debug("User role: {}, User pincode: {}", userRole, userPincode);
        
        // Apply role-based filtering
        if ("ADMIN".equals(userRole) && userPincode != null) {
            // Regional admin can only see products from their pincode
            pincode = userPincode;
            logger.info("Regional admin access - filtering by pincode: {}", pincode);
        }
        // SUPER_ADMIN can see all products (no additional filtering)
        
        if (page == 0 && size == 10 && category == null && pincode == null && search == null) {
            // Return simple list for backward compatibility
            List<Product> products = productService.getAllProducts();
            
            // Apply role-based filtering for regional admins
            if ("ADMIN".equals(userRole) && userPincode != null) {
                products = products.stream()
                        .filter(product -> userPincode.equals(product.getPincode()))
                        .collect(java.util.stream.Collectors.toList());
            }
            
            logger.debug("Retrieved {} products", products.size());
            return ResponseEntity.ok(products);
        } else {
            // Return paginated results
            Page<Product> productPage = productService.getFilteredProducts(page, size, sortBy, category, pincode, search);
            logger.debug("Retrieved {} products (page {} of {})", 
                    productPage.getNumberOfElements(), 
                    productPage.getNumber() + 1, 
                    productPage.getTotalPages());
            return ResponseEntity.ok(productPage);
        }
    }
    
    // Get products by pincode
    @GetMapping("/pincode/{pincode}")
    public ResponseEntity<List<Product>> getProductsByPincode(@PathVariable String pincode) {
        logger.info("Fetching products for pincode: {}", pincode);
        List<Product> products = productService.getProductsByPincode(pincode);
        logger.debug("Retrieved {} products for pincode: {}", products.size(), pincode);
        return ResponseEntity.ok(products);
    }
    
    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        logger.info("Fetching product with ID: {}", id);
        return productService.getProductById(id)
                .map(product -> {
                    logger.debug("Found product: {}", product.getName());
                    return ResponseEntity.ok(product);
                })
                .orElseGet(() -> {
                    logger.warn("Product not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    // Create new product (role-based access)
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product, HttpServletRequest request) {
        logger.info("Creating new product: {}", product.getName());
        
        // Get user role and pincode from token/session
        String userRole = getUserRoleFromRequest(request);
        String userPincode = getUserPincodeFromRequest(request);
        
        // Role-based validation
        if ("ADMIN".equals(userRole)) {
            // Regional admin can only create products for their assigned pincode
            if (userPincode == null || !userPincode.equals(product.getPincode())) {
                logger.warn("Regional admin {} attempted to create product for unauthorized pincode: {}", 
                           userPincode, product.getPincode());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied. You can only create products for pincode: " + userPincode);
            }
        }
        // SUPER_ADMIN can create products for any pincode
        
        Product createdProduct = productService.createProduct(product);
        logger.info("Product created successfully with ID: {} by {} admin", 
                   createdProduct.getId(), userRole);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }
    
    // Update existing product (role-based access)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product, HttpServletRequest request) {
        logger.info("Updating product with ID: {}", id);
        
        // Get user role and pincode from token/session
        String userRole = getUserRoleFromRequest(request);
        String userPincode = getUserPincodeFromRequest(request);
        
        return productService.getProductById(id)
                .map(existingProduct -> {
                    // Check if user has access to this product
                    if (!hasProductAccess(userRole, userPincode, existingProduct)) {
                        logger.warn("{} admin {} attempted to update unauthorized product ID: {} (pincode: {})", 
                                   userRole, userPincode, id, existingProduct.getPincode());
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Access denied. You can only update products from your assigned region.");
                    }
                    
                    // Additional validation for regional admins
                    if ("ADMIN".equals(userRole) && !userPincode.equals(product.getPincode())) {
                        logger.warn("Regional admin {} attempted to change product pincode from {} to {}", 
                                   userPincode, existingProduct.getPincode(), product.getPincode());
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Access denied. You cannot change product pincode.");
                    }
                    
                    product.setId(id);
                    logger.debug("Updating product: {} (ID: {}) by {} admin", product.getName(), id, userRole);
                    Product updatedProduct = productService.updateProduct(product);
                    logger.info("Product updated successfully: {} by {} admin", updatedProduct.getName(), userRole);
                    return ResponseEntity.ok(updatedProduct);
                })
                .orElseGet(() -> {
                    logger.warn("Cannot update - product not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    // Delete product (role-based access)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        logger.info("Deleting product with ID: {}", id);
        
        // Get user role and pincode from token/session
        String userRole = getUserRoleFromRequest(request);
        String userPincode = getUserPincodeFromRequest(request);
        
        return productService.getProductById(id)
                .map(product -> {
                    // Check if user has access to this product
                    if (!hasProductAccess(userRole, userPincode, product)) {
                        logger.warn("{} admin {} attempted to delete unauthorized product ID: {} (pincode: {})", 
                                   userRole, userPincode, id, product.getPincode());
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Access denied. You can only delete products from your assigned region.");
                    }
                    
                    logger.debug("Found product to delete: {} (ID: {}) by {} admin", product.getName(), id, userRole);
                    productService.deleteProduct(id);
                    logger.info("Product deleted successfully: ID {} by {} admin", id, userRole);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> {
                    logger.warn("Cannot delete - product not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    // Get products by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }
    
    // Get products by category and pincode
    @GetMapping("/category/{category}/pincode/{pincode}")
    public ResponseEntity<List<Product>> getProductsByCategoryAndPincode(
            @PathVariable String category, 
            @PathVariable String pincode) {
        return ResponseEntity.ok(productService.getProductsByCategoryAndPincode(category, pincode));
    }
    
    // Get paginated products by pincode
    @GetMapping("/paginated/pincode/{pincode}")
    public ResponseEntity<Page<Product>> getPaginatedProductsByPincode(
            @PathVariable String pincode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        return ResponseEntity.ok(productService.getProductsByPincode(pincode, page, size, sortBy));
    }
    
    // Get paginated products by category
    @GetMapping("/paginated/category/{category}")
    public ResponseEntity<Page<Product>> getPaginatedProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        return ResponseEntity.ok(productService.getProductsByCategory(category, page, size, sortBy));
    }
    
    // Search products by keyword
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }
    
    // Search products by keyword and pincode
    @GetMapping("/search/pincode/{pincode}")
    public ResponseEntity<List<Product>> searchProductsByPincode(
            @RequestParam String keyword,
            @PathVariable String pincode) {
        return ResponseEntity.ok(productService.searchProductsByPincode(keyword, pincode));
    }
    
    // Update product stock (role-based access)
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateProductStock(
            @PathVariable Long id,
            @RequestParam int stock,
            HttpServletRequest request) {
        logger.info("Updating stock for product ID: {} to {}", id, stock);
        
        // Get user role and pincode from token/session
        String userRole = getUserRoleFromRequest(request);
        String userPincode = getUserPincodeFromRequest(request);
        
        try {
            // First check if product exists and user has access
            return productService.getProductById(id)
                    .map(product -> {
                        // Check if user has access to this product
                        if (!hasProductAccess(userRole, userPincode, product)) {
                            logger.warn("{} admin {} attempted to update stock for unauthorized product ID: {} (pincode: {})", 
                                       userRole, userPincode, id, product.getPincode());
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body("Access denied. You can only update stock for products from your assigned region.");
                        }
                        
                        Product updatedProduct = productService.updateProductStock(id, stock);
                        logger.info("Stock updated successfully for product ID: {} to {} by {} admin", 
                                   id, stock, userRole);
                        return ResponseEntity.ok(updatedProduct);
                    })
                    .orElseGet(() -> {
                        logger.warn("Cannot update stock - product not found with ID: {}", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (RuntimeException e) {
            logger.error("Error updating stock for product ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating stock: " + e.getMessage());
        }
    }
    
    // Get low stock products
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {
        logger.info("Fetching products with stock <= {}", threshold);
        List<Product> lowStockProducts = productService.getLowStockProducts(threshold);
        logger.debug("Found {} low stock products", lowStockProducts.size());
        return ResponseEntity.ok(lowStockProducts);
    }
    
    // Get out of stock products
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Product>> getOutOfStockProducts() {
        logger.info("Fetching out of stock products");
        List<Product> outOfStockProducts = productService.getOutOfStockProducts();
        logger.debug("Found {} out of stock products", outOfStockProducts.size());
        return ResponseEntity.ok(outOfStockProducts);
    }
    
    // Get product analytics/statistics
    @GetMapping("/analytics")
    public ResponseEntity<?> getProductAnalytics() {
        logger.info("Fetching product analytics");
        try {
            var analytics = productService.getProductAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            logger.error("Error fetching product analytics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching analytics");
        }
    }
    
    // Bulk update stock
    @PatchMapping("/bulk-stock-update")
    public ResponseEntity<?> bulkUpdateStock(@RequestBody List<StockUpdateRequest> updates) {
        logger.info("Bulk updating stock for {} products", updates.size());
        try {
            List<Product> updatedProducts = productService.bulkUpdateStock(updates);
            logger.info("Successfully updated stock for {} products", updatedProducts.size());
            return ResponseEntity.ok(updatedProducts);
        } catch (Exception e) {
            logger.error("Error in bulk stock update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating stock: " + e.getMessage());
        }
    }
    
    // Helper methods for role-based access control
    private String getUserRoleFromRequest(HttpServletRequest request) {
        // In a real implementation, this would extract role from JWT token
        // For demo purposes, we'll use a simplified approach
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // In production, decode JWT token to get user role
            // For demo, we'll simulate based on token patterns
            String token = authHeader.substring(7);
            if (token.contains("super-admin") || token.contains("SUPER_ADMIN")) {
                return "SUPER_ADMIN";
            } else if (token.contains("admin") || token.contains("ADMIN")) {
                return "ADMIN";
            }
        }
        
        // Fallback: assume ADMIN role for demo
        return "ADMIN";
    }
    
    private String getUserPincodeFromRequest(HttpServletRequest request) {
        // In a real implementation, this would extract pincode from JWT token or user session
        // For demo purposes, we'll use a simplified approach
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // Demo logic: extract pincode based on token patterns
            if (token.contains("110001")) return "110001";
            if (token.contains("110002")) return "110002";
            if (token.contains("110003")) return "110003";
            if (token.contains("412105")) return "412105";
            if (token.contains("441904")) return "441904";
        }
        
        // Fallback: return default pincode for demo
        return "110001";
    }
    
    // Role-based access control for product operations
    private boolean hasProductAccess(String userRole, String userPincode, Product product) {
        if ("SUPER_ADMIN".equals(userRole)) {
            return true; // Super admin has access to all products
        } else if ("ADMIN".equals(userRole)) {
            return userPincode != null && userPincode.equals(product.getPincode());
        }
        return false;
    }
    
    // DTO for bulk stock update
    public static class StockUpdateRequest {
        private Long id;
        private int stock;
        
        public StockUpdateRequest() {}
        
        public StockUpdateRequest(Long id, int stock) {
            this.id = id;
            this.stock = stock;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public int getStock() { return stock; }
        public void setStock(int stock) { this.stock = stock; }
    }
}


