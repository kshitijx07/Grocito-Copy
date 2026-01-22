import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { locationService } from "../api/locationService";
import { productService } from "../api/productService";
import { toast } from "react-toastify";

const LocationChangeModal = ({ isOpen, onClose, onLocationChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Clear state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSuggestions([]);
      setSelectedLocation(null);
      setShowSuggestions(false);
    }
  }, [isOpen]);

  // Handle search input with debouncing
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedLocation(null);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Hide suggestions if input is too short
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await locationService.getAutocompleteData(value);

        if (results && Array.isArray(results) && results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
        toast.error("Unable to fetch location suggestions. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300);

    setSearchTimeout(timeoutId);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.value);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle location change confirmation
  const handleConfirmLocationChange = async () => {
    if (!selectedLocation) {
      toast.warning("Please select a location from the suggestions");
      return;
    }

    try {
      setLoading(true);

      // Check service availability for the new location
      const serviceData = await productService.checkServiceAvailability(
        selectedLocation.pincode
      );

      if (serviceData.available) {
        // Update localStorage with new location data
        localStorage.setItem("pincode", selectedLocation.pincode);
        localStorage.setItem("areaName", selectedLocation.value);
        localStorage.setItem("city", selectedLocation.city);
        localStorage.setItem("state", selectedLocation.state);
        localStorage.setItem("district", selectedLocation.district || "");

        // Show success message
        toast.success(
          <div>
            <div className="font-bold">📍 Location Updated!</div>
            <div>
              {selectedLocation.value}, {selectedLocation.city}
            </div>
            <div className="text-sm">Pincode: {selectedLocation.pincode}</div>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );

        // Call the callback to refresh the page data
        if (onLocationChange) {
          onLocationChange(selectedLocation);
        }

        // Close modal
        onClose();
      } else {
        toast.error(
          <div>
            <div className="font-bold">😔 Service Not Available</div>
            <div className="text-sm">
              {selectedLocation.value}, {selectedLocation.city}
            </div>
            <div className="text-xs">We don't deliver to this area yet.</div>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <MapPinIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Change Location
              </h2>
              <p className="text-sm text-gray-600">
                Update your delivery address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for area, locality, or pincode..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                autoFocus
              />
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Suggestions - Properly visible */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                        selectedLocation?.id === suggestion.id
                          ? "bg-green-50"
                          : ""
                      } ${
                        index !== suggestions.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      } ${index === 0 ? "rounded-t-lg" : ""} ${
                        index === suggestions.length - 1 ? "rounded-b-lg" : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.value}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center flex-wrap">
                        <span>
                          {suggestion.city}, {suggestion.state} -{" "}
                          {suggestion.pincode}
                        </span>
                        {suggestion.serviceAvailable ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            ✗ Not Available
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800">
                      Selected Location
                    </h4>
                    <div className="mt-1 text-sm text-green-700">
                      <div className="font-medium">
                        {selectedLocation.value}
                      </div>
                      <div>
                        {selectedLocation.city}, {selectedLocation.state}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span>
                          Pincode: <strong>{selectedLocation.pincode}</strong>
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            selectedLocation.serviceAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedLocation.serviceAvailable
                            ? "✓ Service Available"
                            : "✗ Service Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {showSuggestions &&
              suggestions.length === 0 &&
              searchQuery.length >= 2 &&
              !loading && (
                <div className="text-center py-8 text-gray-500">
                  <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">
                    No locations found for "{searchQuery}"
                  </p>
                  <p className="text-xs mt-1">
                    Try searching with a different area name or pincode
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLocationChange}
            disabled={!selectedLocation || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              "Update Location"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationChangeModal;
