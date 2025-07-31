package com.example.Grocito.Repository;

import com.example.Grocito.Entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    // Find by pincode
    Optional<Location> findByPincodeAndIsActiveTrue(String pincode);
    
    // Find all locations by pincode (in case of multiple areas with same pincode)
    List<Location> findByPincodeAndIsActiveTrueOrderByAreaName(String pincode);
    
    // Search by area name (case insensitive)
    @Query("SELECT l FROM Location l WHERE LOWER(l.areaName) LIKE LOWER(CONCAT('%', :areaName, '%')) AND l.isActive = true ORDER BY l.areaName")
    List<Location> findByAreaNameContainingIgnoreCaseAndIsActiveTrue(@Param("areaName") String areaName);
    
    // Search by city
    List<Location> findByCityIgnoreCaseAndIsActiveTrueOrderByAreaName(String city);
    
    // Search by state
    List<Location> findByStateIgnoreCaseAndIsActiveTrueOrderByCityAscAreaNameAsc(String state);
    
    // Combined search for area name or pincode
    @Query("SELECT l FROM Location l WHERE " +
           "(LOWER(l.areaName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "l.pincode LIKE CONCAT('%', :query, '%')) AND " +
           "l.isActive = true " +
           "ORDER BY " +
           "CASE WHEN l.pincode = :query THEN 1 " +
           "     WHEN l.pincode LIKE CONCAT(:query, '%') THEN 2 " +
           "     WHEN LOWER(l.areaName) = LOWER(:query) THEN 3 " +
           "     WHEN LOWER(l.areaName) LIKE LOWER(CONCAT(:query, '%')) THEN 4 " +
           "     ELSE 5 END, " +
           "l.areaName")
    List<Location> searchByAreaNameOrPincode(@Param("query") String query);
    
    // Get serviceable locations
    List<Location> findByServiceAvailableTrueAndIsActiveTrueOrderByCityAscAreaNameAsc();
    
    // Get locations by service availability
    List<Location> findByServiceAvailableAndIsActiveTrueOrderByCityAscAreaNameAsc(Boolean serviceAvailable);
    
    // Check if service is available for a pincode
    @Query("SELECT COUNT(l) > 0 FROM Location l WHERE l.pincode = :pincode AND l.serviceAvailable = true AND l.isActive = true")
    boolean isServiceAvailableForPincode(@Param("pincode") String pincode);
    
    // Get suggestions with limit
    @Query("SELECT l FROM Location l WHERE " +
           "(LOWER(l.areaName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "l.pincode LIKE CONCAT('%', :query, '%')) AND " +
           "l.isActive = true " +
           "ORDER BY " +
           "CASE WHEN l.pincode = :query THEN 1 " +
           "     WHEN l.pincode LIKE CONCAT(:query, '%') THEN 2 " +
           "     WHEN LOWER(l.areaName) = LOWER(:query) THEN 3 " +
           "     WHEN LOWER(l.areaName) LIKE LOWER(CONCAT(:query, '%')) THEN 4 " +
           "     ELSE 5 END, " +
           "l.areaName")
    List<Location> findSuggestions(@Param("query") String query);
    
    // Get all unique cities
    @Query("SELECT DISTINCT l.city FROM Location l WHERE l.isActive = true ORDER BY l.city")
    List<String> findAllUniqueCities();
    
    // Get all unique states
    @Query("SELECT DISTINCT l.state FROM Location l WHERE l.isActive = true ORDER BY l.state")
    List<String> findAllUniqueStates();
    
    // Check if pincode exists
    boolean existsByPincodeAndIsActiveTrue(String pincode);
}