package com.example.Grocito.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.Grocito.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByPincode(String pincode);
    
    List<Product> findByCategory(String category);
    
    List<Product> findByCategoryAndPincode(String category, String pincode);
    
    Page<Product> findByPincode(String pincode, Pageable pageable);
    
    Page<Product> findByCategory(String category, Pageable pageable);
    
    Page<Product> findByCategoryAndPincode(String category, String pincode, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<Product> searchProducts(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Product p WHERE (p.name LIKE %:keyword% OR p.description LIKE %:keyword%) AND p.pincode = :pincode")
    List<Product> searchProductsByPincode(@Param("keyword") String keyword, @Param("pincode") String pincode);
    
    // Additional paginated search methods for enhanced filtering
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:search% OR p.description LIKE %:search%")
    Page<Product> findBySearch(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.category = :category AND (p.name LIKE %:search% OR p.description LIKE %:search%)")
    Page<Product> findByCategoryAndSearch(@Param("category") String category, @Param("search") String search, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.pincode = :pincode AND (p.name LIKE %:search% OR p.description LIKE %:search%)")
    Page<Product> findByPincodeAndSearch(@Param("pincode") String pincode, @Param("search") String search, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.pincode = :pincode AND (p.name LIKE %:search% OR p.description LIKE %:search%)")
    Page<Product> findByCategoryAndPincodeAndSearch(@Param("category") String category, @Param("pincode") String pincode, @Param("search") String search, Pageable pageable);
    
    // Additional methods for stock-based queries
    List<Product> findByStockLessThanEqual(int stock);
    List<Product> findByStock(int stock);
    
    // Count methods for admin dashboard
    long countByPincode(String pincode);
}

