import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    sortBy: 'city',
    sortDir: 'asc',
    city: '',
    state: '',
    serviceAvailable: null,
    search: ''
  });
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    hasNext: false,
    hasPrevious: false
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    pincode: '',
    areaName: '',
    city: '',
    state: '',
    district: '',
    subDistrict: '',
    serviceAvailable: false
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchLocations();
    fetchStatistics();
  }, [filters]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/locations/admin/manage?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.content);
      setPagination({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/admin/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleAddLocation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/admin/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLocation)
      });

      if (!response.ok) {
        throw new Error('Failed to add location');
      }

      toast.success('Location added successfully');
      setShowAddModal(false);
      setNewLocation({
        pincode: '',
        areaName: '',
        city: '',
        state: '',
        district: '',
        subDistrict: '',
        serviceAvailable: false
      });
      fetchLocations();
      fetchStatistics();
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    }
  };

  const handleEditLocation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/admin/update/${selectedLocation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedLocation)
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      toast.success('Location updated successfully');
      setShowEditModal(false);
      setSelectedLocation(null);
      fetchLocations();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/admin/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete location');
      }

      toast.success('Location deleted successfully');
      fetchLocations();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const handleToggleService = async (location) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/admin/service-availability/${location.pincode}?available=${!location.serviceAvailable}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update service availability');
      }

      toast.success(`Service ${!location.serviceAvailable ? 'enabled' : 'disabled'} for ${location.areaName}`);
      fetchLocations();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating service availability:', error);
      toast.error('Failed to update service availability');
    }
  };

  const handleBulkCityAction = async (city, enable) => {
    if (!window.confirm(`Are you sure you want to ${enable ? 'enable' : 'disable'} service for all locations in ${city}?`)) {
      return;
    }

    try {
      const endpoint = enable ? 'bulk-enable-city' : 'bulk-disable-city';
      const response = await fetch(`${API_BASE_URL}/api/locations/admin/${endpoint}?city=${encodeURIComponent(city)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${enable ? 'enable' : 'disable'} service for city`);
      }

      const result = await response.json();
      toast.success(`Service ${enable ? 'enabled' : 'disabled'} for ${result.updated} locations in ${city}`);
      fetchLocations();
      fetchStatistics();
    } catch (error) {
      console.error('Error in bulk city action:', error);
      toast.error(`Failed to ${enable ? 'enable' : 'disable'} service for city`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPinIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Location Management</h1>
              <p className="text-gray-600">Manage service areas and availability</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Statistics</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalLocations || 0}</p>
            </div>
            <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Locations</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.activeLocations || 0}</p>
            </div>
            <GlobeAltIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Serviceable</p>
              <p className="text-2xl font-bold text-green-600">{statistics.serviceableLocations || 0}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Serviceable</p>
              <p className="text-2xl font-bold text-red-600">{statistics.nonServiceableLocations || 0}</p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>
          <div>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All States</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>
          <div>
            <select
              value={filters.serviceAvailable === null ? '' : filters.serviceAvailable.toString()}
              onChange={(e) => handleFilterChange('serviceAvailable', e.target.value === '' ? null : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Serviceable</option>
              <option value="false">Non-Serviceable</option>
            </select>
          </div>
          <div>
            <select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortDir', sortDir);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="city-asc">City A-Z</option>
              <option value="city-desc">City Z-A</option>
              <option value="areaname-asc">Area A-Z</option>
              <option value="areaname-desc">Area Z-A</option>
              <option value="pincode-asc">Pincode Low-High</option>
              <option value="pincode-desc">Pincode High-Low</option>
              <option value="serviceavailable-desc">Service Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pincode
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading locations...</span>
                    </div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No locations found
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{location.pincode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{location.areaName}</div>
                      {location.district && (
                        <div className="text-xs text-gray-500">{location.district}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{location.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{location.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleService(location)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          location.serviceAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {location.serviceAvailable ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Serviceable
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Non-Serviceable
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLocation(location);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit Location"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Location"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {pagination.currentPage * filters.size + 1} to{' '}
              {Math.min((pagination.currentPage + 1) * filters.size, pagination.totalElements)} of{' '}
              {pagination.totalElements} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={newLocation.pincode}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 110001"
                  maxLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
                <input
                  type="text"
                  value={newLocation.areaName}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, areaName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Connaught Place"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={newLocation.city}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., New Delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={newLocation.state}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={newLocation.district}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Central Delhi"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="serviceAvailable"
                  checked={newLocation.serviceAvailable}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, serviceAvailable: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="serviceAvailable" className="ml-2 block text-sm text-gray-900">
                  Service Available
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddLocation}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Location
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditModal && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={selectedLocation.pincode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
                <input
                  type="text"
                  value={selectedLocation.areaName}
                  onChange={(e) => setSelectedLocation(prev => ({ ...prev, areaName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={selectedLocation.city}
                  onChange={(e) => setSelectedLocation(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={selectedLocation.state}
                  onChange={(e) => setSelectedLocation(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={selectedLocation.district || ''}
                  onChange={(e) => setSelectedLocation(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editServiceAvailable"
                  checked={selectedLocation.serviceAvailable}
                  onChange={(e) => setSelectedLocation(prev => ({ ...prev, serviceAvailable: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editServiceAvailable" className="ml-2 block text-sm text-gray-900">
                  Service Available
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEditLocation}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Location
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLocation(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Location Statistics</h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* City-wise Statistics */}
            {statistics.cityWiseStats && (
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">City-wise Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(statistics.cityWiseStats).map(([city, stats]) => (
                    <div key={city} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{city}</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBulkCityAction(city, true)}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                            title="Enable all"
                          >
                            Enable All
                          </button>
                          <button
                            onClick={() => handleBulkCityAction(city, false)}
                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                            title="Disable all"
                          >
                            Disable All
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Serviceable:</span>
                          <span className="font-medium text-green-600">{stats.serviceable}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Non-Serviceable:</span>
                          <span className="font-medium text-red-600">{stats.nonServiceable}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* State-wise Statistics */}
            {statistics.stateWiseStats && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">State-wise Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(statistics.stateWiseStats).map(([state, stats]) => (
                    <div key={state} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">{state}</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Locations:</span>
                          <span className="font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Serviceable:</span>
                          <span className="font-medium text-green-600">{stats.serviceable}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Cities:</span>
                          <span className="font-medium text-blue-600">{stats.cities}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;