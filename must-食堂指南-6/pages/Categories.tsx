
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed, ChevronRight, Search, Filter, ChevronDown } from 'lucide-react';
import { RESTAURANTS } from '../constants';
import DishCard from '../components/DishCard';
import { useApp } from '../context/AppContext';
import { Dish } from '../types';

// 1. Definition of the Hierarchy
interface CategoryGroup {
  id: string;
  name: string;
  description: string;
  gradient: string;
  subCategories: string[]; // Matches 'cuisineType' in constants
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'chinese',
    name: '中华风味',
    description: '川鲁粤苏，澳葡特色',
    gradient: 'from-red-500 to-orange-600',
    subCategories: ['中式', '粤菜', '广式', '澳门菜']
  },
  {
    id: 'asian',
    name: '日韩东南亚',
    description: '清新爽口，亚洲精选',
    gradient: 'from-pink-500 to-rose-600',
    subCategories: ['韩式', '日式', '泰式', '异国风味', '铁板烧']
  },
  {
    id: 'western',
    name: '西式简餐',
    description: '意面扒餐，轻食沙拉',
    gradient: 'from-emerald-500 to-teal-600',
    subCategories: ['西餐', '意式']
  }
];

// Helper for sub-category visuals
const SUB_CATEGORY_COLORS: Record<string, string> = {
  '川菜': 'bg-red-100 text-red-800 border-red-200',
  '粤菜': 'bg-orange-100 text-orange-800 border-orange-200',
  '广式': 'bg-orange-100 text-orange-800 border-orange-200',
  '中式': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '澳门菜': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  '韩式': 'bg-pink-100 text-pink-800 border-pink-200',
  '日式': 'bg-blue-100 text-blue-800 border-blue-200',
  '泰式': 'bg-lime-100 text-lime-800 border-lime-200',
  '西餐': 'bg-green-100 text-green-800 border-green-200',
  '意式': 'bg-green-100 text-green-800 border-green-200',
  '异国风味': 'bg-purple-100 text-purple-800 border-purple-200',
  '铁板烧': 'bg-gray-100 text-gray-800 border-gray-200',
};

const Categories: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  // URL Params State
  const query = searchParams.get('q') || '';
  const groupId = searchParams.get('group');
  const categoryId = searchParams.get('category'); // e.g., '川菜'

  // Local Filter State (Level 3)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Clear tags when category changes
  useEffect(() => {
    setSelectedTags([]);
  }, [categoryId]);

  // --- Logic Helpers ---

  // 1. Get Current Group Data
  const currentGroup = useMemo(() => 
    CATEGORY_GROUPS.find(g => g.id === groupId), 
  [groupId]);

  // 2. Get Dishes for current view
  const { displayedDishes, availableFilters } = useMemo(() => {
    let dishes: { dish: Dish; stallName: string; stallId: string }[] = [];

    // Case A: Global Search (Highest Priority)
    if (query) {
      const lowerQ = query.toLowerCase();
      dishes = RESTAURANTS.flatMap(r => 
        r.menu
          .filter(d => 
            d.name.toLowerCase().includes(lowerQ) || 
            r.name.toLowerCase().includes(lowerQ) ||
            r.cuisineType.toLowerCase().includes(lowerQ)
          )
          .map(d => ({ ...d, dish: d, stallName: r.name, stallId: r.id }))
      );
    }
    // Case B: Specific Cuisine Selected (Level 3)
    else if (categoryId) {
      dishes = RESTAURANTS
        .filter(r => r.cuisineType === categoryId)
        .flatMap(r => r.menu.map(d => ({ dish: d, stallName: r.name, stallId: r.id, tags: r.tags })));
    }
    // Case C: Group Selected (Level 2) - Show all dishes in that group (Optional, or just show sub-cats)
    // We strictly follow the hierarchy: Level 2 shows Sub-Cats, not dishes directly.
    
    // Calculate Filters based on dishes in the current category
    const filters = new Set<string>();
    if (categoryId) {
        dishes.forEach(item => {
            filters.add(item.dish.category); // e.g., 面食, 米饭
            // Add stall tags (e.g., 辣味) if relevant to the dish
            const restaurant = RESTAURANTS.find(r => r.id === item.stallId);
            restaurant?.tags.forEach(t => filters.add(t));
        });
    }

    // Apply Local Filters (Level 3 only)
    let finalDishes = dishes;
    if (selectedTags.length > 0) {
        finalDishes = dishes.filter(item => {
            const restaurant = RESTAURANTS.find(r => r.id === item.stallId);
            const allItemTags = [
                item.dish.category,
                ...(restaurant?.tags || [])
            ];
            // Match ANY selected tag
            return selectedTags.some(tag => allItemTags.includes(tag));
        });
    }

    return { 
        displayedDishes: finalDishes, 
        availableFilters: Array.from(filters) 
    };
  }, [query, categoryId, groupId, selectedTags]);


  // --- Navigation Handlers ---

  const goBack = () => {
    if (query) {
      navigate('/categories');
    } else if (categoryId) {
      // Go back to Group view
      const group = CATEGORY_GROUPS.find(g => g.subCategories.includes(categoryId));
      navigate(`/categories?group=${group?.id}`);
    } else if (groupId) {
      // Go back to Root
      navigate('/categories');
    } else {
      navigate('/');
    }
  };

  const handleGroupClick = (gid: string) => {
    navigate(`/categories?group=${gid}`);
  };

  const handleSubCategoryClick = (sub: string) => {
    navigate(`/categories?group=${groupId}&category=${encodeURIComponent(sub)}`);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // --- Render Views ---

  // View: Search Results
  if (query) {
    return (
      <div className="bg-gray-50 min-h-screen pb-24">
        <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center space-x-3">
          <button onClick={() => navigate('/categories')} className="text-gray-700 p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">搜索: "{query}"</h1>
        </div>
        <div className="p-4 space-y-4">
            {displayedDishes.length > 0 ? (
                displayedDishes.map((item, idx) => (
                    <div key={idx} onClick={() => navigate(`/restaurant/${item.stallId}`)}>
                        <DishCard dish={item.dish} onAdd={(d) => addToCart(d, item.stallId, item.stallName)} />
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-400 mt-10">未找到相关菜品</div>
            )}
        </div>
      </div>
    );
  }

  // View: Level 3 - Dish List (Specific Cuisine)
  if (categoryId) {
    return (
      <div className="bg-gray-50 min-h-screen pb-24">
        {/* Header */}
        <div className="bg-white sticky top-0 z-40 shadow-sm">
            <div className="p-4 flex items-center space-x-3">
                <button onClick={goBack} className="text-gray-700 p-1 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">{categoryId}</h1>
            </div>
            
            {/* Filters Bar */}
            {availableFilters.length > 0 && (
                <div className="px-4 pb-3 flex space-x-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center text-gray-400 mr-1">
                        <Filter size={14} />
                    </div>
                    {availableFilters.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                                selectedTags.includes(tag)
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-600 border-gray-200'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Content */}
        <div className="p-4">
            <div className="flex justify-between items-end mb-4">
                <span className="text-sm text-gray-500">
                    {selectedTags.length > 0 ? `筛选出 ${displayedDishes.length} 道菜` : '全部菜品'}
                </span>
            </div>

            <div className="space-y-4">
                {displayedDishes.length > 0 ? (
                    displayedDishes.map((item, idx) => (
                        <div key={idx} onClick={() => navigate(`/restaurant/${item.stallId}`)} className="cursor-pointer">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <span className="text-[10px] text-gray-400">{item.stallName}</span>
                            </div>
                            <DishCard dish={item.dish} onAdd={(d) => addToCart(d, item.stallId, item.stallName)} />
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <UtensilsCrossed size={48} className="mb-4 opacity-20" />
                        <p>该分类下暂无菜品</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // View: Level 2 - Sub-Categories (Within a Group)
  if (groupId && currentGroup) {
    return (
      <div className="bg-gray-50 min-h-screen pb-24">
        {/* Hero Header */}
        <div className={`relative h-48 bg-gradient-to-br ${currentGroup.gradient} p-6 text-white flex flex-col justify-end`}>
            <button 
                onClick={goBack}
                className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold mb-1">{currentGroup.name}</h1>
            <p className="text-white/80">{currentGroup.description}</p>
            
            {/* Decorative Icon */}
            <UtensilsCrossed className="absolute top-6 right-6 text-white/10" size={120} />
        </div>

        {/* Sub-Category Grid */}
        <div className="p-6 -mt-6 rounded-t-3xl bg-gray-50 min-h-[50vh]">
            <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">选择菜系</h2>
            <div className="grid grid-cols-2 gap-4">
                {currentGroup.subCategories.map((sub) => (
                    <div 
                        key={sub}
                        onClick={() => handleSubCategoryClick(sub)}
                        className={`h-24 rounded-xl border flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm relative overflow-hidden ${SUB_CATEGORY_COLORS[sub] || 'bg-white border-gray-200'}`}
                    >
                         {/* Simple visual pattern */}
                         <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-current opacity-10 rounded-full"></div>
                         <span className="font-bold text-lg z-10">{sub}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  // View: Level 1 - Root Groups
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
       <div className="bg-white p-6 pb-4 sticky top-0 z-10 border-b border-gray-100">
         <h1 className="text-2xl font-bold text-gray-900 mb-1">美食分类</h1>
         <p className="text-gray-500 text-sm">探索不同风味的校园美食</p>
       </div>

       <div className="p-4 space-y-4">
          {CATEGORY_GROUPS.map((group) => (
            <div 
              key={group.id}
              onClick={() => handleGroupClick(group.id)}
              className={`h-32 rounded-2xl relative overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-all bg-gradient-to-r ${group.gradient}`}
            >
              <div className="absolute inset-0 p-6 flex flex-col justify-center text-white z-10">
                <h2 className="text-2xl font-bold mb-1">{group.name}</h2>
                <p className="text-sm text-white/80 flex items-center">
                    {group.description}
                    <ChevronRight size={16} className="ml-1" />
                </p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 skew-x-12 transform origin-bottom-right"></div>
            </div>
          ))}
       </div>
    </div>
  );
};

export default Categories;
