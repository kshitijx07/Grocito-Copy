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
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'All': '🛒',
      'vegetables': '🥬',
      'fruits': '🍎',
      'dairy': '🥛',
      'meat': '🥩',
      'bakery': '🍞',
      'snacks': '🍿',
      'beverages': '🥤',
      'frozen': '🧊',
      'pantry': '🥫',
    };
    return emojiMap[category?.toLowerCase()] || '📦';
  };

  return (
    <div className="card mb-8">
      <div className="card-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">🔍</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Find Your Groceries</h3>
            <p className="text-sm text-gray-600">Search and filter through our fresh products</p>
          </div>
        </div>
      </div>
      
      <div className="card-body space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search for fresh vegetables, fruits, dairy products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-14 pr-12 py-4 text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center group"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 rounded-xl flex items-center justify-center transition-all duration-200 transform group-hover:scale-110 shadow-soft">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories:</h4>
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => {
              const colors = [
                'from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 border-blue-200',
                'from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 border-green-200',
                'from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-purple-200',
                'from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 text-orange-700 border-orange-200',
                'from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 border-red-200',
              ];
              const colorClass = colors[index % colors.length];
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-soft-lg border flex items-center space-x-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500 shadow-soft-lg'
                      : `bg-gradient-to-r ${colorClass}`
                  }`}
                >
                  <span>{getCategoryEmoji(category)}</span>
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white font-bold">{resultsCount}</span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold">
                Showing {resultsCount} of {totalCount} products
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {selectedCategory !== 'All' && (
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-xl text-sm font-medium border border-green-200">
                    {getCategoryEmoji(selectedCategory)} {selectedCategory}
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-xl text-sm font-medium border border-blue-200">
                    🔍 "{searchQuery}"
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
              }}
              className="bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-soft-lg"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;