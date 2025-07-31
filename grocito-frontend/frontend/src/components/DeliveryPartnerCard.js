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
      const response = await fetch(`http://localhost:8080/api/order-assignments/order/${orderId}`);
      
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
      
      // Create a tel: link to initiate the call
      const telLink = `tel:${phoneNumber}`;
      window.location.href = telLink;
      
      // Show success message
      toast.success('Initiating call to your delivery partner...', {
        position: "top-center",
        autoClose: 3000,
      });
      
      // Optional: Track call in backend
      try {
        await fetch(`http://localhost:8080/api/order-assignments/${orderId}/call-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString()
          })
        });
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!partnerInfo) {
    // Show when no delivery partner is assigned yet
    if (orderStatus === 'PLACED' || orderStatus === 'CONFIRMED') {
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-1">Finding Your Delivery Partner</h4>
              <p className="text-gray-600">We're assigning the best delivery partner for your order...</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-gray-500 ml-2">This usually takes 2-3 minutes</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg text-gray-900 flex items-center space-x-2">
          <TruckIcon className="w-6 h-6 text-blue-600" />
          <span>Your Delivery Partner</span>
        </h4>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(partnerInfo.status)}`}>
          {formatStatus(partnerInfo.status)}
        </span>
      </div>

      <div className="flex items-start space-x-4">
        {/* Partner Avatar */}
        <div className="relative">
          {partnerInfo.profileImage ? (
            <img
              src={partnerInfo.profileImage}
              alt={partnerInfo.name}
              className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            {getStatusIcon(partnerInfo.status)}
          </div>
        </div>

        {/* Partner Details */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h5 className="font-bold text-xl text-gray-900">{partnerInfo.name}</h5>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(partnerInfo.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm font-medium text-gray-600 ml-1">
                {partnerInfo.rating} ({partnerInfo.totalDeliveries}+ deliveries)
              </span>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1 border">
              <TruckIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{partnerInfo.vehicleType}</span>
              {partnerInfo.vehicleNumber && (
                <span className="text-sm text-gray-500">• {partnerInfo.vehicleNumber}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1 border">
              <ClockIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">ETA: {partnerInfo.estimatedTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {partnerInfo.phone && (
              <button
                onClick={() => handleCall(partnerInfo.phone)}
                disabled={calling}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  calling
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {calling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Calling...</span>
                  </>
                ) : (
                  <>
                    <PhoneIconSolid className="w-4 h-4" />
                    <span>Call Partner</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => toast.info('Chat feature coming soon!')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Chat</span>
            </button>
            
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
            >
              <MapPinIcon className="w-4 h-4" />
              <span>Track</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {partnerInfo.status !== 'ASSIGNED' && (
        <div className="mt-6 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Assigned: {new Date(partnerInfo.assignedAt).toLocaleTimeString()}</span>
            </div>
            {partnerInfo.acceptedAt && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Accepted: {new Date(partnerInfo.acceptedAt).toLocaleTimeString()}</span>
              </div>
            )}
            {partnerInfo.pickupTime && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Picked up: {new Date(partnerInfo.pickupTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerCard;