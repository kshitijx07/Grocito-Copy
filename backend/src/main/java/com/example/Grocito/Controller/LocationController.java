package com.example.Grocito.Controller;

import com.example.Grocito.Entity.Location;
import com.example.Grocito.Services.LocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class LocationController {
    
    private static final Logger logger = LoggerFactory.getLogger(LocationController.class);
    
    @Autowired
    private LocationService locationService;
    
    // Health check endpoint for debugging
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        try {
            // Test database connection by counting locations
            long locationCount = locationService.getTotalLocationCount();
            health.put("status", "UP");
            health.put("database", "Connected");
            health.put("locationCount", locationCount);
            health.put("timestamp", java.time.LocalDateTime.now());
            
            logger.info("Health check: {} locations in database", locationCount);
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("timestamp", java.time.LocalDateTime.now());
            logger.error("Health check failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(health);
        }
    }
    
    // Get location suggestions based on query (area name or pincode) - Enhanced for autocomplete
    @GetMapping("/suggestions")
    public ResponseEntity<Map<String, Object>> getLocationSuggestions(@RequestParam String query) {
        logger.info("Getting location suggestions for query: {}", query);
        
        if (query == null || query.trim().length() < 2) {
            Map<String, Object> response = new HashMap<>();
            response.put("suggestions", new ArrayList<>());
            response.put("message", "Please enter at least 2 characters");
            response.put("count", 0);
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            List<Location> suggestions = locationService.getLocationSuggestions(query.trim());
            logger.debug("Found {} location suggestions", suggestions.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("suggestions", suggestions);
            response.put("count", suggestions.size());
            
            if (suggestions.isEmpty()) {
                response.put("message", "No locations found matching '" + query + "'. Please try a different search term.");
            } else {
                response.put("message", "Found " + suggestions.size() + " location(s) matching '" + query + "'");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting location suggestions for query: {}", query, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("suggestions", new ArrayList<>());
            errorResponse.put("message", "Error searching locations. Please try again.");
            errorResponse.put("count", 0);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Get location suggestions for autocomplete (simplified response)
    @GetMapping("/autocomplete")
    public ResponseEntity<List<Map<String, Object>>> getAutocompleteData(@RequestParam String query) {
        logger.info("Getting autocomplete data for query: {}", query);
        
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        try {
            List<Location> suggestions = locationService.getLocationSuggestions(query.trim());
            List<Map<String, Object>> autocompleteData = new ArrayList<>();
            
            for (Location location : suggestions) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", location.getId());
                item.put("label", location.getAreaName() + ", " + location.getCity() + ", " + location.getState());
                item.put("value", location.getAreaName());
                item.put("pincode", location.getPincode());
                item.put("city", location.getCity());
                item.put("state", location.getState());
                item.put("district", location.getDistrict());
                item.put("serviceAvailable", location.getServiceAvailable());
                item.put("fullAddress", location.getAreaName() + ", " + location.getCity() + ", " + location.getState() + " - " + location.getPincode());
                autocompleteData.add(item);
            }
            
            logger.debug("Returning {} autocomplete suggestions", autocompleteData.size());
            return ResponseEntity.ok(autocompleteData);
        } catch (Exception e) {
            logger.error("Error getting autocomplete data for query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }
    
    // Get location by pincode
    @GetMapping("/pincode/{pincode}")
    public ResponseEntity<Location> getLocationByPincode(@PathVariable String pincode) {
        logger.info("Getting location for pincode: {}", pincode);
        
        if (!locationService.isValidPincode(pincode)) {
            logger.warn("Invalid pincode format: {}", pincode);
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Optional<Location> location = locationService.getLocationByPincode(pincode);
            
            if (location.isPresent()) {
                logger.debug("Found location for pincode: {} - {}", pincode, location.get().getAreaName());
                return ResponseEntity.ok(location.get());
            } else {
                logger.info("Location not found for pincode: {}", pincode);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting location for pincode: {}", pincode, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Check service availability for pincode
    @GetMapping("/service-check/{pincode}")
    public ResponseEntity<Map<String, Object>> checkServiceAvailability(@PathVariable String pincode) {
        logger.info("Checking service availability for pincode: {}", pincode);
        
        if (!locationService.isValidPincode(pincode)) {
            logger.warn("Invalid pincode format: {}", pincode);
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Optional<Location> location = locationService.getLocationByPincode(pincode);
            Map<String, Object> response = new HashMap<>();
            
            if (location.isPresent()) {
                Location loc = location.get();
                response.put("available", loc.getServiceAvailable());
                response.put("pincode", pincode);
                response.put("areaName", loc.getAreaName());
                response.put("city", loc.getCity());
                response.put("state", loc.getState());
                response.put("message", loc.getServiceAvailable() ? 
                    "Service is available in your area!" : 
                    "Service is not yet available in your area. We'll notify you when we expand!");
                
                logger.info("Service availability check for {}: {}", pincode, loc.getServiceAvailable());
            } else {
                response.put("available", false);
                response.put("pincode", pincode);
                response.put("message", "Unable to verify service availability for this pincode.");
                logger.info("Location not found for service check: {}", pincode);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error checking service availability for pincode: {}", pincode, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("available", false);
            errorResponse.put("pincode", pincode);
            errorResponse.put("message", "Error checking service availability. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Search locations by area name
    @GetMapping("/search/area")
    public ResponseEntity<List<Location>> searchByAreaName(@RequestParam String areaName) {
        logger.info("Searching locations by area name: {}", areaName);
        
        if (areaName == null || areaName.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            List<Location> locations = locationService.searchByAreaName(areaName.trim());
            logger.debug("Found {} locations for area name: {}", locations.size(), areaName);
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            logger.error("Error searching locations by area name: {}", areaName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all serviceable locations
    @GetMapping("/serviceable")
    public ResponseEntity<List<Location>> getServiceableLocations() {
        logger.info("Getting all serviceable locations");
        
        try {
            List<Location> locations = locationService.getServiceableLocations();
            logger.debug("Found {} serviceable locations", locations.size());
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            logger.error("Error getting serviceable locations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all unique cities
    @GetMapping("/cities")
    public ResponseEntity<List<String>> getAllCities() {
        logger.info("Getting all unique cities");
        
        try {
            List<String> cities = locationService.getAllCities();
            logger.debug("Found {} unique cities", cities.size());
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            logger.error("Error getting cities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all unique states
    @GetMapping("/states")
    public ResponseEntity<List<String>> getAllStates() {
        logger.info("Getting all unique states");
        
        try {
            List<String> states = locationService.getAllStates();
            logger.debug("Found {} unique states", states.size());
            return ResponseEntity.ok(states);
        } catch (Exception e) {
            logger.error("Error getting states", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get locations by city
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Location>> getLocationsByCity(@PathVariable String city) {
        logger.info("Getting locations for city: {}", city);
        
        try {
            List<Location> locations = locationService.getLocationsByCity(city);
            logger.debug("Found {} locations for city: {}", locations.size(), city);
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            logger.error("Error getting locations for city: {}", city, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get locations by state
    @GetMapping("/state/{state}")
    public ResponseEntity<List<Location>> getLocationsByState(@PathVariable String state) {
        logger.info("Getting locations for state: {}", state);
        
        try {
            List<Location> locations = locationService.getLocationsByState(state);
            logger.debug("Found {} locations for state: {}", locations.size(), state);
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            logger.error("Error getting locations for state: {}", state, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Update service availability
    @PutMapping("/admin/service-availability/{pincode}")
    public ResponseEntity<Location> updateServiceAvailability(
            @PathVariable String pincode, 
            @RequestParam boolean available) {
        logger.info("Admin updating service availability for pincode: {} to {}", pincode, available);
        
        if (!locationService.isValidPincode(pincode)) {
            logger.warn("Invalid pincode format: {}", pincode);
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Location updatedLocation = locationService.updateServiceAvailability(pincode, available);
            logger.info("Successfully updated service availability for pincode: {}", pincode);
            return ResponseEntity.ok(updatedLocation);
        } catch (RuntimeException e) {
            logger.error("Error updating service availability for pincode: {}", pincode, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Unexpected error updating service availability for pincode: {}", pincode, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Bulk update service availability
    @PutMapping("/admin/bulk-service-availability")
    public ResponseEntity<Map<String, Object>> bulkUpdateServiceAvailability(
            @RequestBody Map<String, Object> request) {
        logger.info("Admin bulk updating service availability");
        
        try {
            @SuppressWarnings("unchecked")
            List<String> pincodes = (List<String>) request.get("pincodes");
            Boolean available = (Boolean) request.get("available");
            
            if (pincodes == null || available == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<Location> updatedLocations = locationService.bulkUpdateServiceAvailability(pincodes, available);
            
            Map<String, Object> response = new HashMap<>();
            response.put("updated", updatedLocations.size());
            response.put("total", pincodes.size());
            response.put("locations", updatedLocations);
            
            logger.info("Successfully bulk updated {} out of {} locations", updatedLocations.size(), pincodes.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in bulk update service availability", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Get all locations with pagination and filters
    @GetMapping("/admin/manage")
    public ResponseEntity<Map<String, Object>> getLocationsForManagement(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "city") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Boolean serviceAvailable,
            @RequestParam(required = false) String search) {
        
        logger.info("Admin fetching locations for management - page: {}, size: {}, filters: city={}, state={}, serviceAvailable={}, search={}", 
                page, size, city, state, serviceAvailable, search);
        
        try {
            Map<String, Object> result = locationService.getLocationsForManagement(
                page, size, sortBy, sortDir, city, state, serviceAvailable, search);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error fetching locations for management", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Add new location
    @PostMapping("/admin/add")
    public ResponseEntity<Location> addLocation(@RequestBody Location location) {
        logger.info("Admin adding new location: {} - {}", location.getPincode(), location.getAreaName());
        
        try {
            Location savedLocation = locationService.addLocation(location);
            logger.info("Successfully added new location: {}", savedLocation.getId());
            return ResponseEntity.ok(savedLocation);
        } catch (Exception e) {
            logger.error("Error adding new location", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Update location
    @PutMapping("/admin/update/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable Long id, @RequestBody Location location) {
        logger.info("Admin updating location: {}", id);
        
        try {
            location.setId(id);
            Location updatedLocation = locationService.updateLocation(location);
            logger.info("Successfully updated location: {}", id);
            return ResponseEntity.ok(updatedLocation);
        } catch (RuntimeException e) {
            logger.error("Location not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating location: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Delete location (soft delete)
    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteLocation(@PathVariable Long id) {
        logger.info("Admin deleting location: {}", id);
        
        try {
            locationService.deleteLocation(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Location deleted successfully");
            logger.info("Successfully deleted location: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Location not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting location: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Get location statistics
    @GetMapping("/admin/statistics")
    public ResponseEntity<Map<String, Object>> getLocationStatistics() {
        logger.info("Admin fetching location statistics");
        
        try {
            Map<String, Object> statistics = locationService.getLocationStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error fetching location statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Bulk enable service for city
    @PutMapping("/admin/bulk-enable-city")
    public ResponseEntity<Map<String, Object>> bulkEnableServiceForCity(@RequestParam String city) {
        logger.info("Admin bulk enabling service for city: {}", city);
        
        try {
            List<Location> updatedLocations = locationService.bulkEnableServiceForCity(city);
            
            Map<String, Object> response = new HashMap<>();
            response.put("updated", updatedLocations.size());
            response.put("city", city);
            response.put("message", "Service enabled for all locations in " + city);
            
            logger.info("Successfully enabled service for {} locations in {}", updatedLocations.size(), city);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error bulk enabling service for city: {}", city, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin endpoint: Bulk disable service for city
    @PutMapping("/admin/bulk-disable-city")
    public ResponseEntity<Map<String, Object>> bulkDisableServiceForCity(@RequestParam String city) {
        logger.info("Admin bulk disabling service for city: {}", city);
        
        try {
            List<Location> updatedLocations = locationService.bulkDisableServiceForCity(city);
            
            Map<String, Object> response = new HashMap<>();
            response.put("updated", updatedLocations.size());
            response.put("city", city);
            response.put("message", "Service disabled for all locations in " + city);
            
            logger.info("Successfully disabled service for {} locations in {}", updatedLocations.size(), city);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error bulk disabling service for city: {}", city, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}