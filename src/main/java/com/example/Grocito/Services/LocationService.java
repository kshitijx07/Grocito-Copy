package com.example.Grocito.Services;

import com.example.Grocito.Entity.Location;
import com.example.Grocito.Repository.LocationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class LocationService {
    
    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);
    private static final String INDIA_POST_API = "https://api.postalpincode.in/pincode/";
    
    @Autowired
    private LocationRepository locationRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Get location suggestions based on query (area name or pincode)
    public List<Location> getLocationSuggestions(String query) {
        logger.info("Getting location suggestions for query: {}", query);
        
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }
        
        query = query.trim();
        
        // First check in database
        List<Location> dbResults = locationRepository.findSuggestions(query);
        
        // If we have results in DB, return them
        if (!dbResults.isEmpty()) {
            logger.debug("Found {} suggestions in database", dbResults.size());
            return dbResults.size() > 10 ? dbResults.subList(0, 10) : dbResults;
        }
        
        // If query looks like a pincode, fetch from API
        if (query.matches("\\d{6}")) {
            logger.info("Query looks like pincode, fetching from API: {}", query);
            Location location = fetchLocationFromAPI(query);
            if (location != null) {
                dbResults.add(location);
            }
        }
        
        return dbResults.size() > 10 ? dbResults.subList(0, 10) : dbResults;
    }
    
    // Fetch location data from India Post API
    public Location fetchLocationFromAPI(String pincode) {
        logger.info("Fetching location data from API for pincode: {}", pincode);
        
        try {
            // Check if already exists in database
            Optional<Location> existingLocation = locationRepository.findByPincodeAndIsActiveTrue(pincode);
            if (existingLocation.isPresent()) {
                logger.debug("Location already exists in database for pincode: {}", pincode);
                return existingLocation.get();
            }
            
            String url = INDIA_POST_API + pincode;
            String response = restTemplate.getForObject(url, String.class);
            
            if (response != null) {
                JsonNode rootNode = objectMapper.readTree(response);
                JsonNode dataArray = rootNode.get(0);
                
                if (dataArray != null && "Success".equals(dataArray.get("Status").asText())) {
                    JsonNode postOffices = dataArray.get("PostOffice");
                    
                    if (postOffices != null && postOffices.isArray() && postOffices.size() > 0) {
                        JsonNode firstOffice = postOffices.get(0);
                        
                        Location location = new Location();
                        location.setPincode(pincode);
                        location.setAreaName(firstOffice.get("Name").asText());
                        location.setCity(firstOffice.get("District").asText());
                        location.setState(firstOffice.get("State").asText());
                        location.setDistrict(firstOffice.get("District").asText());
                        location.setSubDistrict(firstOffice.get("Block").asText());
                        location.setServiceAvailable(false); // Default to false, admin can enable
                        location.setIsActive(true);
                        
                        // Save to database for future use
                        Location savedLocation = locationRepository.save(location);
                        logger.info("Saved new location to database: {} - {}", pincode, location.getAreaName());
                        
                        return savedLocation;
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching location data from API for pincode: {}", pincode, e);
        }
        
        return null;
    }
    
    // Get location by pincode
    public Optional<Location> getLocationByPincode(String pincode) {
        logger.debug("Getting location for pincode: {}", pincode);
        
        // First check database
        Optional<Location> location = locationRepository.findByPincodeAndIsActiveTrue(pincode);
        
        // If not found in database, try to fetch from API
        if (location.isEmpty()) {
            logger.info("Location not found in database, fetching from API for pincode: {}", pincode);
            Location fetchedLocation = fetchLocationFromAPI(pincode);
            if (fetchedLocation != null) {
                location = Optional.of(fetchedLocation);
            }
        }
        
        return location;
    }
    
    // Check if service is available for pincode
    public boolean isServiceAvailable(String pincode) {
        logger.debug("Checking service availability for pincode: {}", pincode);
        
        // First ensure location exists (fetch if needed)
        Optional<Location> location = getLocationByPincode(pincode);
        
        if (location.isPresent()) {
            return location.get().getServiceAvailable();
        }
        
        return false;
    }
    
    // Get all serviceable locations
    public List<Location> getServiceableLocations() {
        return locationRepository.findByServiceAvailableTrueAndIsActiveTrueOrderByCityAscAreaNameAsc();
    }
    
    // Update service availability
    public Location updateServiceAvailability(String pincode, boolean serviceAvailable) {
        logger.info("Updating service availability for pincode: {} to {}", pincode, serviceAvailable);
        
        Optional<Location> locationOpt = getLocationByPincode(pincode);
        
        if (locationOpt.isPresent()) {
            Location location = locationOpt.get();
            location.setServiceAvailable(serviceAvailable);
            return locationRepository.save(location);
        } else {
            throw new RuntimeException("Location not found for pincode: " + pincode);
        }
    }
    
    // Search locations by area name
    public List<Location> searchByAreaName(String areaName) {
        logger.debug("Searching locations by area name: {}", areaName);
        return locationRepository.findByAreaNameContainingIgnoreCaseAndIsActiveTrue(areaName);
    }
    
    // Get all unique cities
    public List<String> getAllCities() {
        return locationRepository.findAllUniqueCities();
    }
    
    // Get all unique states
    public List<String> getAllStates() {
        return locationRepository.findAllUniqueStates();
    }
    
    // Validate pincode format
    public boolean isValidPincode(String pincode) {
        return pincode != null && pincode.matches("^[1-9][0-9]{5}$");
    }
    
    // Get locations by city
    public List<Location> getLocationsByCity(String city) {
        return locationRepository.findByCityIgnoreCaseAndIsActiveTrueOrderByAreaName(city);
    }
    
    // Get locations by state
    public List<Location> getLocationsByState(String state) {
        return locationRepository.findByStateIgnoreCaseAndIsActiveTrueOrderByCityAscAreaNameAsc(state);
    }
    
    // Bulk update service availability
    public List<Location> bulkUpdateServiceAvailability(List<String> pincodes, boolean serviceAvailable) {
        logger.info("Bulk updating service availability for {} pincodes to {}", pincodes.size(), serviceAvailable);
        
        List<Location> updatedLocations = new ArrayList<>();
        
        for (String pincode : pincodes) {
            try {
                Location location = updateServiceAvailability(pincode, serviceAvailable);
                updatedLocations.add(location);
            } catch (Exception e) {
                logger.error("Error updating service availability for pincode: {}", pincode, e);
            }
        }
        
        return updatedLocations;
    }
    
    // Get locations for management with pagination and filters
    public Map<String, Object> getLocationsForManagement(
            int page, int size, String sortBy, String sortDir, 
            String city, String state, Boolean serviceAvailable, String search) {
        
        logger.info("Fetching locations for management with filters");
        
        // Get all locations first
        List<Location> allLocations = locationRepository.findAll();
        
        // Apply filters
        java.util.stream.Stream<Location> stream = allLocations.stream();
        
        if (city != null && !city.trim().isEmpty()) {
            stream = stream.filter(loc -> loc.getCity().toLowerCase().contains(city.toLowerCase()));
        }
        
        if (state != null && !state.trim().isEmpty()) {
            stream = stream.filter(loc -> loc.getState().toLowerCase().contains(state.toLowerCase()));
        }
        
        if (serviceAvailable != null) {
            stream = stream.filter(loc -> loc.getServiceAvailable().equals(serviceAvailable));
        }
        
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            stream = stream.filter(loc -> 
                loc.getAreaName().toLowerCase().contains(searchLower) ||
                loc.getPincode().contains(search) ||
                loc.getCity().toLowerCase().contains(searchLower) ||
                loc.getState().toLowerCase().contains(searchLower)
            );
        }
        
        // Apply sorting
        java.util.Comparator<Location> comparator;
        switch (sortBy.toLowerCase()) {
            case "pincode":
                comparator = java.util.Comparator.comparing(Location::getPincode);
                break;
            case "areaname":
                comparator = java.util.Comparator.comparing(Location::getAreaName);
                break;
            case "state":
                comparator = java.util.Comparator.comparing(Location::getState);
                break;
            case "serviceavailable":
                comparator = java.util.Comparator.comparing(Location::getServiceAvailable);
                break;
            default:
                comparator = java.util.Comparator.comparing(Location::getCity);
        }
        
        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }
        
        List<Location> filteredLocations = stream.sorted(comparator).collect(java.util.stream.Collectors.toList());
        
        // Apply pagination
        int totalElements = filteredLocations.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        
        List<Location> pageContent = start < totalElements ? 
            filteredLocations.subList(start, end) : new java.util.ArrayList<>();
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("content", pageContent);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);
        response.put("currentPage", page);
        response.put("size", size);
        response.put("hasNext", page < totalPages - 1);
        response.put("hasPrevious", page > 0);
        
        return response;
    }
    
    // Add new location
    public Location addLocation(Location location) {
        logger.info("Adding new location: {} - {}", location.getPincode(), location.getAreaName());
        
        // Check if pincode already exists
        if (locationRepository.existsByPincodeAndIsActiveTrue(location.getPincode())) {
            throw new RuntimeException("Location with pincode " + location.getPincode() + " already exists");
        }
        
        // Set default values
        if (location.getServiceAvailable() == null) {
            location.setServiceAvailable(false);
        }
        if (location.getIsActive() == null) {
            location.setIsActive(true);
        }
        
        location.setCreatedAt(LocalDateTime.now());
        location.setUpdatedAt(LocalDateTime.now());
        
        return locationRepository.save(location);
    }
    
    // Update location
    public Location updateLocation(Location location) {
        logger.info("Updating location: {}", location.getId());
        
        Optional<Location> existingOpt = locationRepository.findById(location.getId());
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("Location not found with ID: " + location.getId());
        }
        
        Location existing = existingOpt.get();
        
        // Update fields
        if (location.getAreaName() != null) {
            existing.setAreaName(location.getAreaName());
        }
        if (location.getCity() != null) {
            existing.setCity(location.getCity());
        }
        if (location.getState() != null) {
            existing.setState(location.getState());
        }
        if (location.getDistrict() != null) {
            existing.setDistrict(location.getDistrict());
        }
        if (location.getSubDistrict() != null) {
            existing.setSubDistrict(location.getSubDistrict());
        }
        if (location.getServiceAvailable() != null) {
            existing.setServiceAvailable(location.getServiceAvailable());
        }
        
        existing.setUpdatedAt(LocalDateTime.now());
        
        return locationRepository.save(existing);
    }
    
    // Delete location (soft delete)
    public void deleteLocation(Long id) {
        logger.info("Soft deleting location: {}", id);
        
        Optional<Location> locationOpt = locationRepository.findById(id);
        if (locationOpt.isEmpty()) {
            throw new RuntimeException("Location not found with ID: " + id);
        }
        
        Location location = locationOpt.get();
        location.setIsActive(false);
        location.setUpdatedAt(LocalDateTime.now());
        
        locationRepository.save(location);
    }
    
    // Get location statistics
    public Map<String, Object> getLocationStatistics() {
        logger.info("Calculating location statistics");
        
        List<Location> allLocations = locationRepository.findAll();
        List<Location> activeLocations = allLocations.stream()
            .filter(Location::getIsActive)
            .collect(java.util.stream.Collectors.toList());
        
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        stats.put("totalLocations", allLocations.size());
        stats.put("activeLocations", activeLocations.size());
        stats.put("serviceableLocations", activeLocations.stream()
            .mapToInt(loc -> loc.getServiceAvailable() ? 1 : 0).sum());
        stats.put("nonServiceableLocations", activeLocations.stream()
            .mapToInt(loc -> !loc.getServiceAvailable() ? 1 : 0).sum());
        
        // City-wise breakdown
        Map<String, Map<String, Object>> cityStats = activeLocations.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Location::getCity,
                java.util.stream.Collectors.collectingAndThen(
                    java.util.stream.Collectors.toList(),
                    locations -> {
                        Map<String, Object> cityData = new HashMap<>();
                        cityData.put("total", locations.size());
                        cityData.put("serviceable", locations.stream()
                            .mapToInt(loc -> loc.getServiceAvailable() ? 1 : 0).sum());
                        cityData.put("nonServiceable", locations.stream()
                            .mapToInt(loc -> !loc.getServiceAvailable() ? 1 : 0).sum());
                        return cityData;
                    }
                )
            ));
        stats.put("cityWiseStats", cityStats);
        
        // State-wise breakdown
        Map<String, Map<String, Object>> stateStats = activeLocations.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Location::getState,
                java.util.stream.Collectors.collectingAndThen(
                    java.util.stream.Collectors.toList(),
                    locations -> {
                        Map<String, Object> stateData = new HashMap<>();
                        stateData.put("total", locations.size());
                        stateData.put("serviceable", locations.stream()
                            .mapToInt(loc -> loc.getServiceAvailable() ? 1 : 0).sum());
                        stateData.put("cities", locations.stream()
                            .map(Location::getCity).distinct().count());
                        return stateData;
                    }
                )
            ));
        stats.put("stateWiseStats", stateStats);
        
        return stats;
    }
    
    // Bulk enable service for city
    public List<Location> bulkEnableServiceForCity(String city) {
        logger.info("Bulk enabling service for city: {}", city);
        
        List<Location> cityLocations = locationRepository.findByCityIgnoreCaseAndIsActiveTrueOrderByAreaName(city);
        
        for (Location location : cityLocations) {
            location.setServiceAvailable(true);
            location.setUpdatedAt(LocalDateTime.now());
        }
        
        return locationRepository.saveAll(cityLocations);
    }
    
    // Bulk disable service for city
    public List<Location> bulkDisableServiceForCity(String city) {
        logger.info("Bulk disabling service for city: {}", city);
        
        List<Location> cityLocations = locationRepository.findByCityIgnoreCaseAndIsActiveTrueOrderByAreaName(city);
        
        for (Location location : cityLocations) {
            location.setServiceAvailable(false);
            location.setUpdatedAt(LocalDateTime.now());
        }
        
        return locationRepository.saveAll(cityLocations);
    }
    
    // Health check method
    public long getTotalLocationCount() {
        return locationRepository.count();
    }
}