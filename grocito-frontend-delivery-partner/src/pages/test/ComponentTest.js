import React, { useState } from 'react';
import AvailabilityToggle from '../../components/common/AvailabilityToggle';
import StatsCards from '../../components/dashboard/StatsCards';
import AvailableOrders from '../../components/dashboard/AvailableOrders';
import ActiveOrders from '../../components/dashboard/ActiveOrders';

const ComponentTest = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = (newAvailability) => {
    console.log('Toggle called with:', newAvailability);
    setLoading(true);
    setTimeout(() => {
      setIsAvailable(newAvailability);
      setLoading(false);
    }, 1000);
  };

  const mockStats = {
    todayDeliveries: 5,
    activeOrders: 2,
    completedDeliveries: 25,
    todayEarnings: 250,
    totalEarnings: 1250
  };

  const mockAvailableOrders = [
    {
      id: 1,
      orderTime: new Date().toISOString(),
      deliveryAddress: '123 Test Street, Test City',
      totalAmount: 450.50,
      user: { fullName: 'John Doe' },
      items: [
        { product: { name: 'Test Product 1' }, quantity: 2 },
        { product: { name: 'Test Product 2' }, quantity: 1 }
      ]
    },
    {
      id: 2,
      orderTime: new Date(Date.now() - 300000).toISOString(),
      deliveryAddress: '456 Another Street, Test City',
      totalAmount: 320.75,
      user: { fullName: 'Jane Smith' },
      items: [
        { product: { name: 'Test Product 3' }, quantity: 3 }
      ]
    }
  ];

  const mockActiveOrders = [
    {
      id: 3,
      status: 'ASSIGNED',
      orderTime: new Date(Date.now() - 600000).toISOString(),
      assignedAt: new Date(Date.now() - 300000).toISOString(),
      deliveryAddress: '789 Active Street, Test City',
      totalAmount: 275.25,
      user: { fullName: 'Bob Johnson', contactNumber: '9876543210' },
      items: [
        { product: { name: 'Active Product 1' }, quantity: 1 },
        { product: { name: 'Active Product 2' }, quantity: 2 }
      ]
    }
  ];

  const handleAcceptOrder = (orderId) => {
    console.log('Accept order:', orderId);
    alert(`Order ${orderId} accepted!`);
  };

  const handleUpdateStatus = (orderId, status) => {
    console.log('Update order status:', orderId, status);
    alert(`Order ${orderId} status updated to ${status}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Component Test Page</h1>
        
        {/* Availability Toggle Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Availability Toggle Test</h2>
          <AvailabilityToggle
            isAvailable={isAvailable}
            onToggle={handleToggle}
            loading={loading}
          />
        </div>

        {/* Stats Cards Test */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Stats Cards Test</h2>
          <StatsCards stats={mockStats} />
        </div>

        {/* Orders Components Test */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Orders Test</h2>
            <AvailableOrders
              orders={mockAvailableOrders}
              onAcceptOrder={handleAcceptOrder}
              isAvailable={isAvailable}
              loading={loading}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Active Orders Test</h2>
            <ActiveOrders
              orders={mockActiveOrders}
              onUpdateStatus={handleUpdateStatus}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentTest;