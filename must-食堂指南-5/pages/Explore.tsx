
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, UtensilsCrossed, Store } from 'lucide-react';
import { RESTAURANTS } from '../constants';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import { Restaurant, Dish } from '../types';

// Mock backend search service
const searchService = (query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return { stalls: [], dishes: [] };

  const matchedStalls = RESTAURANTS.filter(r => 
    r.name.toLowerCase().includes(q) || 
    r.cuisineType.toLowerCase().includes(q) ||
    r.tags.some(tag => tag.toLowerCase().includes(q))
  );

  const matchedDishes: { dish: Dish; stallName: string; stallId: string }[] = [];
  
  RESTAURANTS.forEach(r => {
    r.menu.forEach(d => {
      if (d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) {
        matchedDishes.push({
          dish: d,
          stallName: r.name,
          stallId: r.id
        });
      }
    });
  });

  return { stalls: matchedStalls, dishes: matchedDishes };
};

const Explore: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchText, setSearchText] = useState(query);
  const [results, setResults] = useState<{ stalls: Restaurant[], dishes: { dish: Dish; stallName: string; stallId: string }[] }>({ stalls: [], dishes: [] });

  useEffect(() => {
    setSearchText(query);
    setResults(searchService(query));
  }, [query]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigate(`/explore?q=${encodeURIComponent(searchText)}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Search Header */}
      <div className="bg-white p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="text-gray-500">
                <ArrowLeft size={24} />
            </button>
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleSearch}
                    autoFocus
                    className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="搜索食堂..."
                />
            </div>
        </div>
      </div>

      <div className="p-4">
        {!query ? (
             <div className="text-center mt-10 text-gray-400">
                 <Search size={48} className="mx-auto mb-4 opacity-20" />
                 <p>输入关键词搜索档口<br/>或美味菜品。</p>
                 <div className="mt-8 flex flex-wrap justify-center gap-2">
                     {['面条', '辣', '米饭', '素食', '牛肉'].map(tag => (
                         <button 
                            key={tag}
                            onClick={() => navigate(`/explore?q=${tag}`)}
                            className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600"
                         >
                             {tag}
                         </button>
                     ))}
                 </div>
             </div>
        ) : (
            <>
                {/* Results Summary */}
                <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">
                    找到 {results.stalls.length} 个档口 & {results.dishes.length} 道菜品
                </p>

                {/* Stalls Section */}
                {results.stalls.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-3">
                            <Store size={18} className="text-black" />
                            <h2 className="font-bold text-lg text-gray-900">档口</h2>
                        </div>
                        {results.stalls.map(r => (
                            <RestaurantCard key={r.id} data={r} />
                        ))}
                    </div>
                )}

                {/* Dishes Section */}
                {results.dishes.length > 0 && (
                    <div>
                         <div className="flex items-center space-x-2 mb-3">
                            <UtensilsCrossed size={18} className="text-black" />
                            <h2 className="font-bold text-lg text-gray-900">菜品</h2>
                        </div>
                        {results.dishes.map((item, idx) => (
                            <div key={idx} onClick={() => navigate(`/restaurant/${item.stallId}`)} className="cursor-pointer">
                                <div className="bg-white p-3 rounded-t-lg border-b border-gray-50 flex justify-between items-center text-xs text-gray-500">
                                    <span>来自 <span className="font-bold text-black">{item.stallName}</span></span>
                                    <span>进店 →</span>
                                </div>
                                <DishCard dish={item.dish} onAdd={() => {}} />
                            </div>
                        ))}
                    </div>
                )}

                {results.stalls.length === 0 && results.dishes.length === 0 && (
                    <div className="text-center mt-20 text-gray-500">
                        <p>未找到关于 "{query}" 的结果</p>
                        <p className="text-xs mt-2">试试 "米饭", "鸡肉", 或 "川菜"</p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default Explore;
