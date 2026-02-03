'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  url: string;
  store: string;
  rating?: number;
  reviews?: number;
  deal?: boolean;
}

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  stores: string[];
}

const STORES = [
  { id: 'amazon', name: 'Amazon', icon: '📦', color: '#FF9900' },
  { id: 'target', name: 'Target', icon: '🎯', color: '#CC0000' },
  { id: 'walmart', name: 'Walmart', icon: '🏪', color: '#0071DC' },
  { id: 'etsy', name: 'Etsy', icon: '🎨', color: '#F56400' },
  { id: 'bestbuy', name: 'Best Buy', icon: '🔌', color: '#0046BE' },
];

export default function GiftSearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    stores: STORES.map(s => s.id),
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters,
        }),
      });
      
      const data = await response.json();
      setResults(data.products || []);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleStore = (storeId: string) => {
    setFilters(prev => ({
      ...prev,
      stores: prev.stores.includes(storeId)
        ? prev.stores.filter(s => s !== storeId)
        : [...prev.stores, storeId],
    }));
  };

  const exampleSearches = [
    "Gift for 10 year old who loves dinosaurs under $50",
    "Birthday present for mom who likes gardening",
    "Tech gadget for dad under $100",
    "Cozy gift for college student",
    "Unique anniversary gift for wife",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D4F5F]">🔍 AI Gift Finder</h1>
          <p className="text-[#5A6C7D] mt-1">
            Describe what you're looking for and we'll find the best options
          </p>
        </div>
        <Link 
          href="/app"
          className="text-[#5A6C7D] hover:text-[#3D4F5F] transition"
        >
          ← Back
        </Link>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the gift you're looking for..."
            className="w-full px-5 py-4 pr-32 text-lg border-2 border-gray-200 rounded-xl focus:border-[#D64045] focus:ring-2 focus:ring-[#D64045]/20 outline-none transition"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[#D64045] text-white rounded-lg font-medium hover:bg-[#B83539] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Store Filters */}
        <div className="mt-4">
          <div className="text-sm text-[#5A6C7D] mb-2">Search in:</div>
          <div className="flex flex-wrap gap-2">
            {STORES.map((store) => (
              <button
                key={store.id}
                onClick={() => toggleStore(store.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                  filters.stores.includes(store.id)
                    ? 'bg-[#3D4F5F] text-white'
                    : 'bg-gray-100 text-[#5A6C7D] hover:bg-gray-200'
                }`}
              >
                <span>{store.icon}</span>
                {store.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mt-4 flex items-center gap-4">
          <div className="text-sm text-[#5A6C7D]">Budget:</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#D64045] outline-none"
            />
            <span className="text-[#5A6C7D]">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#D64045] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Example Searches (show when no results) */}
      {!searched && (
        <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF3E0] rounded-2xl p-6 border border-[#F4C430]/20">
          <h2 className="font-semibold text-[#3D4F5F] mb-3">💡 Try searching for...</h2>
          <div className="flex flex-wrap gap-2">
            {exampleSearches.map((example, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(example);
                }}
                className="px-4 py-2 bg-white rounded-full text-sm text-[#5A6C7D] hover:text-[#3D4F5F] hover:shadow-md transition"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <div className="font-medium text-[#3D4F5F] mb-2">AI Suggestions</div>
              <ul className="space-y-1 text-[#5A6C7D]">
                {suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#D64045]">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-[#D64045]"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🎁</div>
          </div>
          <p className="mt-4 text-[#5A6C7D]">Searching across retailers...</p>
          <p className="text-sm text-[#5A6C7D]/70">Finding the best gifts for you</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#3D4F5F]">
              Found {results.length} gifts
            </h2>
            <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-[#5A6C7D] focus:outline-none">
              <option>Sort: Best Match</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain p-4"
                  />
                  {product.deal && (
                    <div className="absolute top-2 left-2 bg-[#D64045] text-white text-xs font-bold px-2 py-1 rounded-full">
                      DEAL
                    </div>
                  )}
                  <div 
                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: STORES.find(s => s.id === product.store)?.color || '#666' }}
                  >
                    {STORES.find(s => s.id === product.store)?.icon} {STORES.find(s => s.id === product.store)?.name}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-[#3D4F5F] line-clamp-2 min-h-[3rem] group-hover:text-[#D64045] transition">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-bold text-[#3D4F5F]">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-[#5A6C7D] line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="text-[#5A6C7D]">
                        {product.rating.toFixed(1)}
                        {product.reviews && ` (${product.reviews.toLocaleString()})`}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-[#3D4F5F] text-white text-center rounded-lg font-medium hover:bg-[#4A5D6E] transition text-sm"
                    >
                      View on {STORES.find(s => s.id === product.store)?.name}
                    </a>
                    <button
                      className="px-3 py-2 bg-[#D64045] text-white rounded-lg hover:bg-[#B83539] transition"
                      title="Save to gift ideas"
                    >
                      💝
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searched ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-[#3D4F5F] mb-2">No results found</h3>
          <p className="text-[#5A6C7D]">
            Try different keywords or adjust your filters
          </p>
        </div>
      ) : null}
    </div>
  );
}
