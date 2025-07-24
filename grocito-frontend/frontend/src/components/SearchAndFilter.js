import React from 'react';

const SearchAndFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  resultsCount,
  totalCount 
}) => {
  return (
    <div className="mb-10 space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative max-w-lg mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search for delicious products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-14 pr-12 py-4 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-blue-400 transition-all duration-300 text-lg shadow-lg hover:shadow-xl bg-white"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center group"
          >
            <div className="w-8 h-8 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Enhanced Category Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white animate-pulse'
                : 'bg-white text-blue-600 border-2 border-blue-200 hover:border-yellow-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Enhanced Results Count */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{resultsCount}</span>
          </div>
          <p className="text-gray-700 font-medium">
            Showing <span className="font-bold text-blue-600">{resultsCount}</span> of <span className="font-bold text-blue-600">{totalCount}</span> products
            {selectedCategory !== 'All' && <span className="bg-yellow-100 text-blue-700 px-2 py-1 rounded-full ml-2 text-sm font-bold">in {selectedCategory}</span>}
            {searchQuery && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2 text-sm font-bold">matching "{searchQuery}"</span>}
          </p>
        </div>
        
        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;