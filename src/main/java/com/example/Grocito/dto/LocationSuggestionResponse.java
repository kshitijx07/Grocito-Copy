package com.example.Grocito.dto;

public class LocationSuggestionResponse {
    private String pincode;
    private String areaName;
    private String city;
    private String state;
    private String displayText;
    private Boolean serviceAvailable;
    
    public LocationSuggestionResponse() {}
    
    public LocationSuggestionResponse(String pincode, String areaName, String city, String state, Boolean serviceAvailable) {
        this.pincode = pincode;
        this.areaName = areaName;
        this.city = city;
        this.state = state;
        this.serviceAvailable = serviceAvailable;
        this.displayText = String.format("%s, %s - %s", areaName, city, pincode);
    }
    
    // Getters and Setters
    public String getPincode() {
        return pincode;
    }
    
    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
    
    public String getAreaName() {
        return areaName;
    }
    
    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getDisplayText() {
        return displayText;
    }
    
    public void setDisplayText(String displayText) {
        this.displayText = displayText;
    }
    
    public Boolean getServiceAvailable() {
        return serviceAvailable;
    }
    
    public void setServiceAvailable(Boolean serviceAvailable) {
        this.serviceAvailable = serviceAvailable;
    }
}