import React, { useState, useEffect } from 'react';
import { 
  PhoneIcon, 
  MapPinIcon, 
  TruckIcon, 
  StarIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { 
  PhoneIcon as PhoneIconSolid,
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../api/config';

const DeliveryPartnerCard = ({ orderId, orderStatus, onRefresh }) => {
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    fetchDeliveryPartnerInfo();
  }, [orderId]);

  const fetchDeliveryPartnerInfo = async () => {
    try {
      setLoading(true);
      console.log('Fetching delivery partner info for order:', orderId);
      
      // Fetch delivery partner assignment for this order
      const response = await fetch(`${API_BASE_URL}/api/order-assignments/order/${orderId}`);
      
      console.log('Assignment API response status:', response.status);
      
      if (response.ok) {
        const assignment = await response.json();
        console.log('Assignment data received:', assignment);
        
        if (assignment && assignment.deliveryPartner) {
          const partnerData = {
            id: assignment.deliveryPartner.id,
            name: assignment.deliveryPartner.fullName || assignment.deliveryPartner.name || 'Delivery Partner',
            phone: assignment.deliveryPartner.phoneNumber || assignment.deliveryPartner.phone,
            rating: assignment.deliveryPartner.rating || 4.5,
            totalDeliveries: assignment.deliveryPartner.totalDeliveries || 150,
            vehicleType: assignment.deliveryPartner.vehicleType || 'Bike',
            vehicleNumber: assignment.deliveryPartner.vehicleNumber || 'N/A',
            estimatedTime: assignment.estimatedDeliveryTime || '15-20 mins',
            status: assignment.status,
            assignedAt: assignment.assignedAt,
            acceptedAt: assignment.acceptedAt,
            pickupTime: assignment.pickupTime,
            profileImage: assignment.deliveryPartner.profileImageUrl || assignment.deliveryPartner.profileImage || null
          };
          
          console.log('Setting partner info:', partnerData);
          setPartnerInfo(partnerData);
        } else {
          console.log('Assignment found but no delivery partner data');
          setPartnerInfo(null);
        }
      } else if (response.status === 404) {
        console.log('No delivery partner assigned yet for order:', orderId);
        setPartnerInfo(null);
      } else {
        console.error('Unexpected response status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setPartnerInfo(null);
      }
    } catch (error) {
      console.error('Error fetching delivery partner info:', error);
      toast.error('Unable to fetch delivery partner information');
      setPartnerInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (phoneNumber) => {
    if (!phoneNumber) {
      toast.error('Phone number not available');
      return;
    }

    setCalling(true);
    
    try {
      // Log the call attempt (you can add analytics here)
      console.log('Initiating call to delivery partner:', phoneNumber);
      
      // Show confirmation dialog first
      const confirmCall = window.confirm(
        `Call your delivery partner at ${phoneNumber}?\n\nThis will open your phone's dialer.`
      );
      
      if (!confirmCall) {
        setCalling(false);
        return;
      }
      
      // Create a tel: link to initiate the call
      const telLink = `tel:${phoneNumber}`;
      window.open(telLink, '_self');
      
      // Show success message
      toast.success(
        <div>
          <div className="font-bold">📞 Calling Delivery Partner</div>
          <div className="text-sm">Connecting to {phoneNumber}</div>
        </div>, 
        {
          position: "top-center",
          autoClose: 4000,
        }
      );
      
      // Track call in backend
      try {
        await fetch(`${API_BASE_URL}/api/order-assignments/${orderId}/call-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString(),
            orderId: orderId
          })
        });
        console.log('Call logged successfully');
      } catch (logError) {
        console.log('Call logging failed (non-critical):', logError);
      }
      
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Unable to initiate call. Please try again.');
    } finally {
      setTimeout(() => setCalling(false), 2000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return <UserIcon className="w-5 h-5 text-blue-600" />;
      case 'ACCEPTED':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'PICKED_UP':
        return <TruckIcon className="w-5 h-5 text-purple-600" />;
      case 'OUT_FOR_DELIVERY':
        return <MapPinIcon className="w-5 h-5 text-orange-600" />;
      case 'DELIVERED':
        return <StarIcon className="w-5 h-5 text-green-600" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACCEPTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PICKED_UP':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return 'Partner Assigned';
      case 'ACCEPTED':
        return 'Order Accepted';
      case 'PICKED_UP':
        return 'Order Picked Up';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-xl">
        <div className="animate-pulse">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 rounded-lg w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-200 rounded-xl"></div>
                <div className="h-16 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="flex space-x-3">
                <div className="h-12 bg-gray-200 rounded-xl w-24"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-20"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-20"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 font-medium">Loading delivery partner information...</p>
        </div>
      </div>
    );
  }

  if (!partnerInfo) {
    // Show when no delivery partner is assigned yet
    if (orderStatus === 'PLACED' || orderStatus === 'CONFIRMED' || orderStatus === 'PREPARING') {
      return (
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 rounded-2xl p-6 border border-yellow-200 shadow-xl">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <ClockIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl text-gray-900 mb-2 flex items-center space-x-2">
                <span>🔍 Finding Your Delivery Partner</span>
              </h4>
              <p className="text-gray-700 mb-4 font-medium">
                We're matching you with the best available delivery partner in your area...
              </p>
              
              {/* Enhanced Loading Animation */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce shadow-sm"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600 font-medium">Searching nearby partners...</span>
              </div>

              {/* Progress Steps */}
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">✅ Order placed</span>
                  </div>
                  {orderStatus === 'CONFIRMED' || orderStatus === 'PREPARING' ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">✅ Order confirmed</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">🔄 Confirming order...</span>
                    </div>
                  )}
                  {orderStatus === 'PREPARING' ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">👨‍🍳 Preparing your order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">🔄 Finding delivery partner...</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">⏳ Partner assignment</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 bg-yellow-100 rounded-lg px-3 py-2 border border-yellow-200">
                ⏱️ This usually takes 2-3 minutes. We'll notify you once a partner is assigned!
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-xl text-gray-900 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <TruckIcon className="w-5 h-5 text-white" />
          </div>
          <span>Your Delivery Partner</span>
        </h4>
        <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-sm ${getStatusColor(partnerInfo.status)}`}>
          {formatStatus(partnerInfo.status)}
        </span>
      </div>

      <div className="flex items-start space-x-6">
        {/* Partner Avatar */}
        <div className="relative">
          {partnerInfo.profileImage ? (
            <img
              src={partnerInfo.profileImage}
              alt={partnerInfo.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
            {getStatusIcon(partnerInfo.status)}
          </div>
        </div>

        {/* Partner Details */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            <h5 className="font-bold text-2xl text-gray-900">{partnerInfo.name}</h5>
            <div className="flex items-center space-x-1 bg-white rounded-lg px-3 py-1 border shadow-sm">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(partnerInfo.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm font-bold text-gray-700 ml-2">
                {partnerInfo.rating}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 font-medium">
            🏆 {partnerInfo.totalDeliveries}+ successful deliveries
          </p>

          {/* Vehicle & ETA Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 border shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Vehicle</p>
                <p className="text-sm font-bold text-gray-900">
                  {partnerInfo.vehicleType}
                  {partnerInfo.vehicleNumber && (
                    <span className="text-gray-600"> • {partnerInfo.vehicleNumber}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 border shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Estimated Time</p>
                <p className="text-sm font-bold text-gray-900">{partnerInfo.estimatedTime}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {partnerInfo.phone && (
              <button
                onClick={() => handleCall(partnerInfo.phone)}
                disabled={calling}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                  calling
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-xl transform hover:scale-105 active:scale-95'
                }`}
              >
                {calling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Calling...</span>
                  </>
                ) : (
                  <>
                    <PhoneIconSolid className="w-5 h-5" />
                    <span>Call Now</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => toast.info(
                <div>
                  <div className="font-bold">💬 Chat Feature</div>
                  <div className="text-sm">Coming soon! You'll be able to chat with your delivery partner.</div>
                </div>
              )}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Chat</span>
            </button>
            
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <MapPinIcon className="w-5 h-5" />
              <span>Track</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Timeline */}
      {partnerInfo.status !== 'ASSIGNED' && (
        <div className="mt-6 pt-6 border-t border-blue-200">
          <h6 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <ClockIcon className="w-4 h-4" />
            <span>Delivery Timeline</span>
          </h6>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              <div className="flex-1 bg-white rounded-lg px-3 py-2 border shadow-sm">
                <p className="text-sm font-medium text-gray-900">Order Assigned</p>
                <p className="text-xs text-gray-600">{new Date(partnerInfo.assignedAt).toLocaleString()}</p>
              </div>
            </div>
            
            {partnerInfo.acceptedAt && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                <div className="flex-1 bg-white rounded-lg px-3 py-2 border shadow-sm">
                  <p className="text-sm font-medium text-gray-900">Order Accepted</p>
                  <p className="text-xs text-gray-600">{new Date(partnerInfo.acceptedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
            
            {partnerInfo.pickupTime && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                <div className="flex-1 bg-white rounded-lg px-3 py-2 border shadow-sm">
                  <p className="text-sm font-medium text-gray-900">Order Picked Up</p>
                  <p className="text-xs text-gray-600">{new Date(partnerInfo.pickupTime).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {partnerInfo.phone && (
        <div className="mt-6 pt-6 border-t border-blue-200">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <PhoneIconSolid className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Direct Contact</p>
                <p className="text-lg font-bold text-green-900">{partnerInfo.phone}</p>
                <p className="text-xs text-green-600">Tap "Call Now" to connect instantly</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerCard;