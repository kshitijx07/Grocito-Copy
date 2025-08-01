import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  BookOpenIcon,
  UserGroupIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const helpCategories = [
    {
      id: 'orders',
      icon: TruckIcon,
      title: 'Orders & Delivery',
      description: 'Track orders, delivery issues, and order management',
      articles: 12
    },
    {
      id: 'payments',
      icon: CreditCardIcon,
      title: 'Payments & Billing',
      description: 'Payment methods, refunds, and billing questions',
      articles: 8
    },
    {
      id: 'account',
      icon: UserGroupIcon,
      title: 'Account & Profile',
      description: 'Account settings, profile management, and security',
      articles: 6
    },
    {
      id: 'products',
      icon: BookOpenIcon,
      title: 'Products & Quality',
      description: 'Product information, quality issues, and returns',
      articles: 10
    },
    {
      id: 'technical',
      icon: ShieldCheckIcon,
      title: 'Technical Support',
      description: 'App issues, technical problems, and troubleshooting',
      articles: 7
    }
  ];

  const popularArticles = [
    {
      id: 1,
      title: 'How to track my order?',
      category: 'Orders & Delivery',
      views: 1250,
      helpful: 95
    },
    {
      id: 2,
      title: 'Payment methods accepted',
      category: 'Payments & Billing',
      views: 980,
      helpful: 92
    },
    {
      id: 3,
      title: 'How to change delivery address?',
      category: 'Orders & Delivery',
      views: 875,
      helpful: 88
    },
    {
      id: 4,
      title: 'Return and refund policy',
      category: 'Products & Quality',
      views: 756,
      helpful: 90
    },
    {
      id: 5,
      title: 'Account security settings',
      category: 'Account & Profile',
      views: 642,
      helpful: 87
    }
  ];

  const contactOptions = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Available 24/7',
      action: 'Start Chat'
    },
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Call our customer service',
      availability: 'Mon-Sun 8AM-10PM',
      action: 'Call Now'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'Send us an email',
      availability: 'Response within 24 hours',
      action: 'Send Email'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
  };

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
            Help <span className="text-green-600">Center</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Find answers to your questions and get the help you need. Our comprehensive support center 
            is here to assist you with orders, payments, account issues, and more.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-200 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                      <IconComponent className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-500">{category.articles} articles</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                    <span>View Articles</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Popular Articles
          </h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            {popularArticles.map((article, index) => (
              <div
                key={article.id}
                className={`p-6 cursor-pointer hover:bg-green-50 transition-colors ${
                  index !== popularArticles.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        {article.category}
                      </span>
                      <span>{article.views} views</span>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{article.helpful}% helpful</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Still Need Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-2">{option.description}</p>
                  <p className="text-sm text-gray-500 mb-6">{option.availability}</p>
                  <button className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-semibold w-full">
                    {option.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/faqs')}
              className="text-left p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            >
              <QuestionMarkCircleIcon className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">FAQs</h3>
              <p className="text-sm text-gray-600">Frequently asked questions</p>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="text-left p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            >
              <EnvelopeIcon className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-sm text-gray-600">Get in touch with support</p>
            </button>
            <button
              onClick={() => navigate('/delivery-partner')}
              className="text-left p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            >
              <TruckIcon className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Info</h3>
              <p className="text-sm text-gray-600">Delivery partner information</p>
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="text-left p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            >
              <ClockIcon className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Order Status</h3>
              <p className="text-sm text-gray-600">Track your orders</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;