import React from 'react';

const DeliveryPartnerStats = ({ analytics, partners }) => {
  const statsCards = [
    {
      name: 'Total Partners',
      value: analytics.totalPartners || 0,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue',
      description: 'All registered partners'
    },
    {
      name: 'Verified Partners',
      value: analytics.verifiedPartners || 0,
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      description: 'Approved and active'
    },
    {
      name: 'Pending Verification',
      value: analytics.pendingPartners || 0,
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
      description: 'Awaiting approval'
    },
    {
      name: 'Online Partners',
      value: analytics.onlinePartners || 0,
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'purple',
      description: 'Currently available'
    },
    {
      name: 'Busy Partners',
      value: analytics.busyPartners || 0,
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'orange',
      description: 'On active deliveries'
    },
    {
      name: 'Offline Partners',
      value: analytics.offlinePartners || 0,
      icon: (
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
        </svg>
      ),
      color: 'gray',
      description: 'Not available'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      yellow: 'bg-yellow-50',
      purple: 'bg-purple-50',
      orange: 'bg-orange-50',
      gray: 'bg-gray-50'
    };
    return colors[color] || colors.blue;
  };

  // Calculate partner distribution by pincode
  const pincodeDistribution = partners.reduce((acc, partner) => {
    const pincode = partner.assignedPincode || 'Unknown';
    if (!acc[pincode]) {
      acc[pincode] = {
        total: 0,
        verified: 0,
        online: 0,
        busy: 0,
        offline: 0
      };
    }
    acc[pincode].total++;
    if (partner.verificationStatus === 'VERIFIED') acc[pincode].verified++;
    if (partner.availabilityStatus === 'ONLINE') acc[pincode].online++;
    if (partner.availabilityStatus === 'BUSY') acc[pincode].busy++;
    if (partner.availabilityStatus === 'OFFLINE') acc[pincode].offline++;
    return acc;
  }, {});

  // Calculate vehicle type distribution
  const vehicleDistribution = partners.reduce((acc, partner) => {
    const vehicleType = partner.vehicleType || 'Unknown';
    acc[vehicleType] = (acc[vehicleType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className={`${getColorClasses(stat.color)} rounded-lg p-6`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {stat.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pincode Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Partners by Pincode</h3>
          
          {Object.keys(pincodeDistribution).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No partner data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(pincodeDistribution)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 10)
                .map(([pincode, data]) => (
                <div key={pincode} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Pincode: {pincode}</h4>
                    <span className="text-sm text-gray-600">{data.total} partners</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">{data.verified}</div>
                      <div className="text-gray-500">Verified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-600 font-semibold">{data.online}</div>
                      <div className="text-gray-500">Online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-600 font-semibold">{data.busy}</div>
                      <div className="text-gray-500">Busy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 font-semibold">{data.offline}</div>
                      <div className="text-gray-500">Offline</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Type Distribution</h3>
          
          {Object.keys(vehicleDistribution).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No vehicle data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(vehicleDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([vehicleType, count]) => {
                  const percentage = ((count / partners.length) * 100).toFixed(1);
                  return (
                    <div key={vehicleType} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {vehicleType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.verifiedPartners && analytics.totalPartners 
                ? ((analytics.verifiedPartners / analytics.totalPartners) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Verification Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.verifiedPartners || 0} of {analytics.totalPartners || 0} partners verified
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {analytics.onlinePartners && analytics.verifiedPartners 
                ? ((analytics.onlinePartners / analytics.verifiedPartners) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Online Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.onlinePartners || 0} of {analytics.verifiedPartners || 0} verified partners online
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {analytics.busyPartners && analytics.onlinePartners 
                ? ((analytics.busyPartners / (analytics.onlinePartners + analytics.busyPartners)) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Utilization Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.busyPartners || 0} partners currently busy
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Registrations</h3>
        
        {partners.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent registrations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partners
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((partner) => (
                <div key={partner.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {partner.fullName?.charAt(0) || 'D'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {partner.fullName || 'Unknown Partner'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {partner.assignedPincode} • {partner.vehicleType}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      partner.verificationStatus === 'VERIFIED' 
                        ? 'bg-green-100 text-green-800'
                        : partner.verificationStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {partner.verificationStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartnerStats;