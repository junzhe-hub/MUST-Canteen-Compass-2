
import React, { useState, useMemo, useRef } from 'react';
import { MapPin, Bell, Search, Trophy, Sparkles, Flame, X, MessageSquareText, Calendar, Info, Star, ShieldAlert, BadgePercent, LayoutGrid, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RESTAURANTS } from '../constants';
import RestaurantCard from '../components/RestaurantCard';

// Mock Notifications Data
const NOTIFICATIONS = [
  { id: 1, type: 'update', title: '系统更新 v1.3.0', content: '新增了“历史评价”管理功能，现在可以删除或追加评价了！', date: '10分钟前' },
  { id: 2, type: 'new', title: '绿意沙拉吧 上新', content: '冬季限定“暖心南瓜浓汤”上线，欢迎品尝。', date: '2小时前' },
  { id: 3, type: 'event', title: '食堂满意度调查', content: '参与调查问卷，有机会获得免单券哦。', date: '昨天' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-time Search Logic
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQ = searchQuery.toLowerCase();
    return RESTAURANTS.filter(r => 
      r.name.toLowerCase().includes(lowerQ) || 
      r.cuisineType.toLowerCase().includes(lowerQ) ||
      r.tags.some(tag => tag.toLowerCase().includes(lowerQ)) ||
      // Search in menu items to increase recall
      r.menu.some(dish => 
        dish.name.toLowerCase().includes(lowerQ) || 
        dish.category.toLowerCase().includes(lowerQ) ||
        dish.description.toLowerCase().includes(lowerQ)
      )
    );
  }, [searchQuery]);

  // Recommendation Engine Logic (New: Based on Positive Review Count)
  const recommendations = useMemo(() => {
    const allDishes = RESTAURANTS.flatMap(r =>
      r.menu.map(d => {
        // Calculate number of positive reviews (Rating >= 4.0)
        // Note: In a real app, we would filter by date === today here.
        // For this mock, we treat existing data as "current/today's stats".
        const positiveReviews = d.reviews ? d.reviews.filter(rev => rev.rating >= 4.0).length : 0;
        
        return { 
          ...d, 
          stallName: r.name, 
          stallId: r.id, 
          cuisine: r.cuisineType, 
          positiveCount: positiveReviews 
        };
      })
    );

    // Sort by positive review count descending
    return allDishes
      .sort((a, b) => b.positiveCount - a.positiveCount)
      .slice(0, 10); // Show top 10
  }, []);

  const handleCancelSearch = () => {
    setIsSearchFocused(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  return (
    // Keep base background consistent to prevent flashing
    // Updated: Removed 'h-screen overflow-hidden' to allow scrolling in search results
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Dark Overlay when focused - Removed transition to prevent "flash" */}
      {isSearchFocused && (
        <div 
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleCancelSearch}
        ></div>
      )}

      {/* Header & Search Bar Area */}
      <div className={`bg-white sticky top-0 px-4 py-3 shadow-sm z-50 ${isSearchFocused ? 'pb-4' : 'pb-4'}`}>
        {/* Top Info Row */}
        {!isSearchFocused && (
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-1">
                  <MapPin size={18} className="text-yellow-500" />
                  <span className="font-bold text-gray-800 text-base">MUST 食堂指南</span>
              </div>
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell size={20} className="text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
        )}
        
        {/* Search Bar */}
        <div className="flex items-center space-x-2">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className={`h-5 w-5 ${isSearchFocused ? 'text-yellow-500' : 'text-gray-400'}`} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg leading-5 placeholder-gray-500 focus:outline-none sm:text-sm ${
                        isSearchFocused 
                        ? 'bg-white border-yellow-400 ring-2 ring-yellow-100' 
                        : 'bg-gray-100 border-gray-200 focus:bg-white focus:border-yellow-500'
                    }`}
                    placeholder="搜索面条、辣味、档口..."
                />
            </div>
            {isSearchFocused && (
                <button 
                    onClick={handleCancelSearch}
                    className="text-sm font-bold text-gray-600 px-2 whitespace-nowrap"
                >
                    取消
                </button>
            )}
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>
           <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
              <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
                <h3 className="font-bold text-lg flex items-center">
                  <Bell size={18} className="mr-2 text-yellow-500" />
                  消息中心
                </h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-200 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {NOTIFICATIONS.map(notif => (
                  <div key={notif.id} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'update' ? 'bg-blue-100 text-blue-600' :
                      notif.type === 'new' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {notif.type === 'update' && <Info size={20} />}
                      {notif.type === 'new' && <Sparkles size={20} />}
                      {notif.type === 'event' && <Calendar size={20} />}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                         <h4 className="font-bold text-sm text-gray-800">{notif.title}</h4>
                         <span className="text-[10px] text-gray-400">{notif.date}</span>
                       </div>
                       <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 text-center text-xs text-gray-400">
                暂无更多消息
              </div>
           </div>
        </div>
      )}

      {/* Real-time Search Results Overlay */}
      {isSearchFocused ? (
          <div className="relative z-40 bg-gray-50 min-h-screen overflow-y-auto px-4 py-4 pb-32">
              {searchQuery.trim() === '' ? (
                  <div className="text-center mt-10 text-gray-400">
                      <p className="text-sm">输入关键词寻找美食...</p>
                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                           {['川菜', '面食', '辣味', '牛肉'].map(tag => (
                               <button 
                                  key={tag}
                                  onClick={() => setSearchQuery(tag)}
                                  className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-200"
                               >
                                   {tag}
                               </button>
                           ))}
                      </div>
                  </div>
              ) : (
                  <>
                    <p className="text-xs font-bold text-gray-500 mb-3">
                        找到 {filteredRestaurants.length} 个相关档口
                    </p>
                    {filteredRestaurants.length > 0 ? (
                        filteredRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} data={restaurant} />
                        ))
                    ) : (
                        <div className="text-center mt-10 text-gray-500">
                            <p>没有找到相关餐厅</p>
                        </div>
                    )}
                  </>
              )}
          </div>
      ) : (
        /* Normal Home Content */
        <>
            {/* Quick Access Grid Removed */}

            {/* Recommended Section (Updated: Improved Slider Logic) */}
            {recommendations.length > 0 && (
                <div className="mt-6 px-4 mb-8">
                    <div className="flex items-center space-x-2 mb-3">
                        <Sparkles size={18} className="text-yellow-500" />
                        <h2 className="text-lg font-bold text-gray-900">为您推荐 (今日热门)</h2>
                    </div>
                    {/* Slider Container: snap-x for snapping effect, overflow-x-auto for scrolling */}
                    <div className="w-full overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory flex space-x-4">
                        {recommendations.map((dish, idx) => (
                            <div 
                                key={idx}
                                onClick={() => navigate(`/restaurant/${dish.stallId}`)}
                                className="snap-start min-w-[160px] w-[160px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                            >
                                <div className="h-28 bg-gray-200 relative">
                                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                                    {dish.positiveCount > 0 && (
                                        <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center">
                                            <Flame size={10} className="mr-0.5" /> 
                                            {dish.positiveCount}人好评
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1">{dish.name}</h4>
                                    <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">{dish.stallName}</p>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-xs font-bold text-gray-900">{dish.price} MOP</span>
                                        <div className="flex-1"></div>
                                        <div className="flex items-center">
                                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] ml-0.5 font-bold">{dish.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Listings Title */}
            <div className="px-4 mb-3">
                <div className="flex items-center space-x-2">
                    <Store size={18} className="text-yellow-500" />
                    <h2 className="text-lg font-bold text-gray-900">所有档口</h2>
                </div>
            </div>

            {/* Restaurant List */}
            <div className="px-4">
                {RESTAURANTS.map(restaurant => (
                <RestaurantCard key={restaurant.id} data={restaurant} />
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default Home;
