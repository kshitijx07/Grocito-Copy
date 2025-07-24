package com.example.Grocito.Services;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.Grocito.config.LoggerConfig;
import com.example.Grocito.Entity.Product;
import com.example.Grocito.Repository.ProductRepository;

@Service
public class ProductService {

    private static final Logger logger = LoggerConfig.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepo;

    // Get products by pincode
    public List<Product> getProductsByPincode(String pincode) {
        logger.debug("Fetching products for pincode: {}", pincode);
        List<Product> products = productRepo.findByPincode(pincode);
        logger.debug("Found {} products for pincode: {}", products.size(), pincode);
        return products;
    }
    
    // Get all products
    public List<Product> getAllProducts() {
        logger.debug("Fetching all products");
        List<Product> products = productRepo.findAll();
        logger.debug("Found {} total products", products.size());
        return products;
    }
    
    // Get product by ID
    public Optional<Product> getProductById(Long id) {
        logger.debug("Fetching product with ID: {}", id);
        Optional<Product> product = productRepo.findById(id);
        if (product.isPresent()) {
            logger.debug("Found product: {} (ID: {})", product.get().getName(), id);
        } else {
            logger.debug("Product not found with ID: {}", id);
        }
        return product;
    }
    
    // Create new product
    public Product createProduct(Product product) {
        logger.info("Creating new product: {}", product.getName());
        Product savedProduct = productRepo.save(product);
        logger.info("Product created successfully with ID: {}", savedProduct.getId());
        return savedProduct;
    }
    
    // Update existing product
    public Product updateProduct(Product product) {
        logger.info("Updating product with ID: {}", product.getId());
        Product updatedProduct = productRepo.save(product);
        logger.info("Product updated successfully: {} (ID: {})", updatedProduct.getName(), updatedProduct.getId());
        return updatedProduct;
    }
    
    // Delete product
    public void deleteProduct(Long id) {
        logger.info("Deleting product with ID: {}", id);
        productRepo.deleteById(id);
        logger.info("Product deleted successfully: ID {}", id);
    }
    
    // Get products by category
    public List<Product> getProductsByCategory(String category) {
        logger.debug("Fetching products for category: {}", category);
        List<Product> products = productRepo.findByCategory(category);
        logger.debug("Found {} products for category: {}", products.size(), category);
        return products;
    }
    
    // Get products by category and pincode
    public List<Product> getProductsByCategoryAndPincode(String category, String pincode) {
        logger.debug("Fetching products for category: {} and pincode: {}", category, pincode);
        List<Product> products = productRepo.findByCategoryAndPincode(category, pincode);
        logger.debug("Found {} products for category: {} and pincode: {}", products.size(), category, pincode);
        return products;
    }
    
    // Get paginated products by pincode
    public Page<Product> getProductsByPincode(String pincode, int page, int size, String sortBy) {
        logger.debug("Fetching paginated products for pincode: {}, page: {}, size: {}, sortBy: {}", pincode, page, size, sortBy);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Product> productPage = productRepo.findByPincode(pincode, pageable);
        logger.debug("Found {} products (page {} of {}) for pincode: {}", 
                productPage.getNumberOfElements(), 
                productPage.getNumber() + 1, 
                productPage.getTotalPages(), 
                pincode);
        return productPage;
    }
    
    // Get paginated products by category
    public Page<Product> getProductsByCategory(String category, int page, int size, String sortBy) {
        logger.debug("Fetching paginated products for category: {}, page: {}, size: {}, sortBy: {}", category, page, size, sortBy);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return productRepo.findByCategory(category, pageable);
    }
    
    // Get paginated products by category and pincode
    public Page<Product> getProductsByCategoryAndPincode(String category, String pincode, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return productRepo.findByCategoryAndPincode(category, pincode, pageable);
    }
    
    // Search products by keyword
    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }
    
    // Search products by keyword and pincode
    public List<Product> searchProductsByPincode(String keyword, String pincode) {
        return productRepo.searchProductsByPincode(keyword, pincode);
    }
    
    // Update product stock
    public Product updateProductStock(Long productId, int newStock) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        product.setStock(newStock);
        return productRepo.save(product);
    }
    
    // Get filtered products with pagination
    public Page<Product> getFilteredProducts(int page, int size, String sortBy, String category, String pincode, String search) {
        logger.debug("Fetching filtered products - page: {}, size: {}, sortBy: {}, category: {}, pincode: {}, search: {}", 
                page, size, sortBy, category, pincode, search);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        
        // If we have both category and pincode filters
        if (category != null && !category.isEmpty() && pincode != null && !pincode.isEmpty()) {
            if (search != null && !search.isEmpty()) {
                return productRepo.findByCategoryAndPincodeAndSearch(category, pincode, search, pageable);
            } else {
                return productRepo.findByCategoryAndPincode(category, pincode, pageable);
            }
        }
        // If we have only category filter
        else if (category != null && !category.isEmpty()) {
            if (search != null && !search.isEmpty()) {
                return productRepo.findByCategoryAndSearch(category, search, pageable);
            } else {
                return productRepo.findByCategory(category, pageable);
            }
        }
        // If we have only pincode filter
        else if (pincode != null && !pincode.isEmpty()) {
            if (search != null && !search.isEmpty()) {
                return productRepo.findByPincodeAndSearch(pincode, search, pageable);
            } else {
                return productRepo.findByPincode(pincode, pageable);
            }
        }
        // If we have only search filter
        else if (search != null && !search.isEmpty()) {
            return productRepo.findBySearch(search, pageable);
        }
        // No filters, return all products
        else {
            return productRepo.findAll(pageable);
        }
    }
    
    // Get low stock products
    public List<Product> getLowStockProducts(int threshold) {
        logger.debug("Fetching products with stock <= {}", threshold);
        List<Product> products = productRepo.findByStockLessThanEqual(threshold);
        logger.debug("Found {} products with low stock", products.size());
        return products;
    }
    
    // Get out of stock products
    public List<Product> getOutOfStockProducts() {
        logger.debug("Fetching out of stock products");
        List<Product> products = productRepo.findByStock(0);
        logger.debug("Found {} out of stock products", products.size());
        return products;
    }
    
    // Get product analytics
    public java.util.Map<String, Object> getProductAnalytics() {
        logger.debug("Calculating product analytics");
        List<Product> allProducts = productRepo.findAll();
        
        java.util.Map<String, Object> analytics = new java.util.HashMap<>();
        
        // Basic counts
        analytics.put("totalProducts", allProducts.size());
        analytics.put("lowStockCount", allProducts.stream().mapToInt(p -> p.getStock() <= 10 && p.getStock() > 0 ? 1 : 0).sum());
        analytics.put("outOfStockCount", allProducts.stream().mapToInt(p -> p.getStock() == 0 ? 1 : 0).sum());
        
        // Category distribution
        java.util.Map<String, Long> categoryDistribution = allProducts.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    Product::getCategory, 
                    java.util.stream.Collectors.counting()
                ));
        analytics.put("categoryDistribution", categoryDistribution);
        analytics.put("totalCategories", categoryDistribution.size());
        
        // Average price
        double averagePrice = allProducts.stream()
                .mapToDouble(Product::getPrice)
                .average()
                .orElse(0.0);
        analytics.put("averagePrice", averagePrice);
        
        // Stock distribution
        java.util.Map<String, Long> stockDistribution = new java.util.HashMap<>();
        stockDistribution.put("inStock", allProducts.stream().filter(p -> p.getStock() > 10).count());
        stockDistribution.put("lowStock", allProducts.stream().filter(p -> p.getStock() > 0 && p.getStock() <= 10).count());
        stockDistribution.put("outOfStock", allProducts.stream().filter(p -> p.getStock() == 0).count());
        analytics.put("stockDistribution", stockDistribution);
        
        logger.debug("Analytics calculated for {} products", allProducts.size());
        return analytics;
    }
    
    // Bulk update stock
    public List<Product> bulkUpdateStock(List<com.example.Grocito.Controller.ProductController.StockUpdateRequest> updates) {
        logger.info("Processing bulk stock update for {} products", updates.size());
        List<Product> updatedProducts = new java.util.ArrayList<>();
        
        for (com.example.Grocito.Controller.ProductController.StockUpdateRequest update : updates) {
            try {
                Product product = productRepo.findById(update.getId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + update.getId()));
                product.setStock(update.getStock());
                Product savedProduct = productRepo.save(product);
                updatedProducts.add(savedProduct);
                logger.debug("Updated stock for product {} to {}", product.getName(), update.getStock());
            } catch (Exception e) {
                logger.error("Error updating stock for product ID {}: {}", update.getId(), e.getMessage());
                throw new RuntimeException("Failed to update stock for product ID " + update.getId() + ": " + e.getMessage());
            }
        }
        
        logger.info("Successfully updated stock for {} products", updatedProducts.size());
        return updatedProducts;
    }
}

