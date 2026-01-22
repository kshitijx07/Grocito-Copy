import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  CurrencyRupeeIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const BecomeSellerPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: '',
    location: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Seller application:', formData);
    alert('Thank you for your interest! We will contact you within 24 hours.');
  };

  const benefits = [
    {
      icon: CurrencyRupeeIcon,
      title: "Increase Revenue",
      description: "Reach thousands of customers and boost your sales by up to 300%"
    },
    {
      icon: UserGroupIcon,
      title: "Wider Customer Base",
      description: "Access to our growing customer base across multiple cities"
    },
    {
      icon: TruckIcon,
      title: "Logistics Support",
      description: "We handle delivery, so you can focus on your products"
    },
    {
      icon: ChartBarIcon,
      title: "Analytics & Insights",
      description: "Detailed sales reports and customer insights to grow your business"
    }
  ];

  const requirements = [
    "Valid business registration/license",
    "FSSAI license (for food items)",
    "GST registration",
    "Quality products with proper packaging",
    "Ability to maintain inventory",
    "Commitment to customer satisfaction"
  ];

  const businessTypes = [
    {
      icon: "🥬",
      title: "Fresh Produce",
      description: "Fruits, vegetables, and organic products"
    },
    {
      icon: "🥛",
      title: "Dairy & Beverages",
      description: "Milk, yogurt, juices, and beverages"
    },
    {
      icon: "🍞",
      title: "Bakery & Snacks",
      description: "Bread, cakes, chips, and packaged snacks"
    },
    {
      icon: "🧴",
      title: "Personal Care",
      description: "Toiletries, cosmetics, and hygiene products"
    },
    {
      icon: "🏠",
      title: "Household Items",
      description: "Cleaning supplies, kitchenware, and home essentials"
    },
    {
      icon: "💊",
      title: "Health & Wellness",
      description: "Supplements, health foods, and wellness products"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Apply Online",
      description: "Fill out our seller application form with your business details"
    },
    {
      step: "2",
      title: "Document Verification",
      description: "Submit required business documents for verification"
    },
    {
      step: "3",
      title: "Product Catalog Setup",
      description: "Upload your products with images, descriptions, and pricing"
    },
    {
      step: "4",
      title: "Go Live",
      description: "Start selling and receiving orders from customers"
    }
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Grocito</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Become a <span className="text-green-600">Seller</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Partner with Grocito and reach thousands of customers looking for quality products. 
            Grow your business with our platform and logistics support.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span>No Setup Fee</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span>Quick Onboarding</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Sell on Grocito?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Can You Sell?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 text-center">
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Apply to Become a Seller
            </h2>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter owner name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="fresh-produce">Fresh Produce</option>
                    <option value="dairy-beverages">Dairy & Beverages</option>
                    <option value="bakery-snacks">Bakery & Snacks</option>
                    <option value="personal-care">Personal Care</option>
                    <option value="household">Household Items</option>
                    <option value="health-wellness">Health & Wellness</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your city/location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tell us about your business
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Describe your products, experience, and why you want to sell on Grocito..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 font-semibold text-lg transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-xl text-green-100 mb-6">
            Our seller support team is here to help you get started
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 font-semibold transition-colors"
            >
              Contact Seller Support
            </button>
            <a
              href="mailto:codercompete@gmail.com"
              className="bg-green-600 text-white border border-green-400 px-8 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
            >
              Email: codercompete@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerPage;