import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  TagIcon, 
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const SearchAndFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  resultsCount,
  totalCount 
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const getCategoryIcon = (category) => {
    // Using professional Heroicons instead of emojis
    return <TagIcon className="w-4 h-4" />;
  };

  const getCategoryColors = (category, index) => {
    const colorSets = [
      'from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 border-emerald-200',
      'from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 border-blue-200',
      'from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-purple-200',
      'from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 text-orange-700 border-orange-200',
      'from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 text-rose-700 border-rose-200',
      'from-indigo-100 to-blue-100 hover:from-indigo-200 hover:to-blue-200 text-indigo-700 border-indigo-200',
    ];
    return colorSets[index % colorSets.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 lg:mb-8 animate-fade-in-up">
      {/* Header - Mobile Optimized */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <MagnifyingGlassIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Find Products</h3>
              <p className="text-sm text-gray-600 hidden sm:block">Search and filter through our product catalog</p>
            </div>
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition-all duration-200"
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4 lg:space-y-6">
        {/* Enhanced Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <MagnifyingGlassIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
            </div>
          </div>
          <input
            type="text"
            placeholder="Search vegetables, fruits, dairy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11 lg:pl-14 pr-10 lg:pr-12 py-3 lg:py-4 text-sm lg:text-base focus-nature"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 lg:pr-4 flex items-center group"
            >
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 rounded-lg flex items-center justify-center transition-all duration-200 transform group-hover:scale-110 shadow-soft">
                <XMarkIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
              </div>
            </button>
          )}
        </div>

        {/* Category Filter - Responsive */}
        <div className={`${showMobileFilters ? 'block' : 'hidden md:block'} space-y-3 lg:space-y-4`}>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-gray-700">Categories</h4>
            <span className="text-xs text-gray-500">({categories.length - 1} available)</span>
          </div>
          
          {/* Desktop Categories */}
          <div className="hidden md:flex flex-wrap gap-2 lg:gap-3">
            {categories.map((category, index) => {
              const colorClass = getCategoryColors(category, index);
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 border flex items-center space-x-2 text-sm lg:text-base ${
                    selectedCategory === category
                      ? 'bg-green-500 text-white border-green-500 shadow-sm'
                      : `bg-white ${colorClass} hover:shadow-sm`
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Categories - Compact Grid */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            {categories.map((category, index) => {
              const colorClass = getCategoryColors(category, index);
              
              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 border flex items-center justify-center space-x-2 text-sm ${
                    selectedCategory === category
                      ? 'bg-green-500 text-white border-green-500'
                      : `bg-white ${colorClass} hover:shadow-sm`
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span className="truncate">{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Summary - Professional */}
        <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm lg:text-base">{resultsCount}</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium text-sm lg:text-base">
                  {resultsCount} of {totalCount} products
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {selectedCategory !== 'All' && (
                    <span className="bg-white text-green-700 px-2 py-1 rounded-lg text-xs font-medium border border-green-200 flex items-center space-x-1">
                      {getCategoryIcon(selectedCategory)}
                      <span>{selectedCategory}</span>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-white text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-200 flex items-center space-x-1">
                      <MagnifyingGlassIcon className="w-3 h-3" />
                      <span className="max-w-20 truncate">"{searchQuery}"</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setShowMobileFilters(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 lg:px-4 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;