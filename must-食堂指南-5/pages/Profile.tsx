
import React, { useState, useEffect, useMemo } from 'react';
import { Settings, CreditCard, Heart, LogOut, ChevronRight, BarChart3, MessageSquare, ArrowLeft, Trash2, Edit3, Loader2, User as UserIcon } from 'lucide-react';
import { RESTAURANTS, USER_STATS } from '../constants';
import { api } from '../services/api';
import { Review, Restaurant, Dish } from '../types';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { showToast, favorites, addToCart, userProfile, logout, requireAuth } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<'main' | 'reviews' | 'favorites'>('main');
  const [myReviews, setMyReviews] = useState<{ review: Review, targetName: string }[]>([]);
  const [statsCount, setStatsCount] = useState({ reviews: 0, likes: 0 });

  // Load basic stats
  useEffect(() => {
    if (userProfile && !userProfile.isGuest) {
        // Initial fetch to get review count
        api.getUserReviews(userProfile.id).then(res => {
            setStatsCount({
                reviews: res.length,
                likes: res.reduce((sum, item) => sum + (item.review.likes || 0), 0)
            });
            setMyReviews(res);
        });
    }
  }, [view, userProfile]);

  // Favorites Data Retrieval
  const favoriteItems = useMemo(() => {
      const favRestaurants: Restaurant[] = RESTAURANTS.filter(r => favorites.restaurants.includes(r.id));
      const favDishes: { dish: Dish, stallId: string, stallName: string }[] = [];
      
      RESTAURANTS.forEach(r => {
          r.menu.forEach(d => {
              if (favorites.dishes.includes(d.id)) {
                  favDishes.push({ dish: d, stallId: r.id, stallName: r.name });
              }
          });
      });
      return { restaurants: favRestaurants, dishes: favDishes };
  }, [favorites]);

  const handleMenuClick = (action: () => void) => {
    // For protected items like Favorites or Settings, check auth
    // Note: Favorites view is technically accessible via state if empty, but adding requires auth
    action();
  };

  const menuItems = [
    { icon: <CreditCard size={20} />, label: '支付方式', action: () => showToast('暂未开放', 'info'), protected: true },
    { icon: <Heart size={20} />, label: '我的收藏', action: () => requireAuth(() => setView('favorites')), protected: true },
    { icon: <Settings size={20} />, label: '设置', action: () => requireAuth(() => navigate('/settings')), protected: true },
  ];

  // --- Reviews View Logic ---
  const [appendId, setAppendId] = useState<string | null>(null);
  const [appendText, setAppendText] = useState('');

  const handleAppend = async (id: string) => {
      if (!appendText.trim()) return;
      await api.appendReview(id, appendText);
      showToast('追评成功');
      setAppendId(null);
      setAppendText('');
      // Refresh
      if (userProfile) {
        const updated = await api.getUserReviews(userProfile.id);
        setMyReviews(updated);
      }
  };

  const handleDelete = async (id: string) => {
      // Optimistic Update: Remove from UI immediately for instant feedback
      setMyReviews(prev => prev.filter(item => item.review.id !== id));
      setStatsCount(prev => ({...prev, reviews: Math.max(0, prev.reviews - 1)}));
      
      showToast('删除成功');
      
      // Then perform API call
      await api.deleteReview(id);
  };

  // --- Favorites View Component ---
  const FavoritesView = () => {
      const [favTab, setFavTab] = useState<'stalls' | 'dishes'>('stalls');

      return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center space-x-3">
                <button onClick={() => setView('main')} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">我的收藏</h1>
            </div>

            <div className="p-4">
                <div className="flex bg-white rounded-lg p-1 mb-4 border border-gray-100">
                    <button 
                        onClick={() => setFavTab('stalls')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${favTab === 'stalls' ? 'bg-black text-white' : 'text-gray-500'}`}
                    >
                        档口 ({favoriteItems.restaurants.length})
                    </button>
                    <button 
                        onClick={() => setFavTab('dishes')}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${favTab === 'dishes' ? 'bg-black text-white' : 'text-gray-500'}`}
                    >
                        菜品 ({favoriteItems.dishes.length})
                    </button>
                </div>

                <div className="space-y-4">
                    {favTab === 'stalls' ? (
                        favoriteItems.restaurants.length > 0 ? (
                            favoriteItems.restaurants.map(r => (
                                <RestaurantCard key={r.id} data={r} />
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-10">
                                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                                <p>您还没有收藏任何档口</p>
                            </div>
                        )
                    ) : (
                        favoriteItems.dishes.length > 0 ? (
                            favoriteItems.dishes.map(item => (
                                <div key={item.dish.id} onClick={() => navigate(`/restaurant/${item.stallId}`)} className="cursor-pointer">
                                    <div className="bg-white p-2 px-3 rounded-t-lg border-b border-gray-50 flex justify-between items-center text-xs text-gray-500">
                                        <span>来自 <span className="font-bold text-black">{item.stallName}</span></span>
                                        <span>进店 →</span>
                                    </div>
                                    <DishCard dish={item.dish} onAdd={() => addToCart(item.dish, item.stallId, item.stallName)} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-10">
                                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                                <p>您还没有收藏任何菜品</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
      );
  };

  if (view === 'favorites') {
      return <FavoritesView />;
  }

  if (view === 'reviews') {
      return (
          <div className="bg-gray-50 min-h-screen pb-24">
              <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center space-x-3">
                  <button onClick={() => setView('main')} className="p-1 hover:bg-gray-100 rounded-full">
                      <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-lg font-bold">我的历史评价</h1>
              </div>

              <div className="p-4 space-y-4">
                  {myReviews.length === 0 ? (
                      <div className="text-center text-gray-400 py-20">
                          <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                          <p>您还没有发表过评价</p>
                      </div>
                  ) : (
                      myReviews.map(({ review, targetName }) => (
                          <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-2">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-gray-900">{targetName}</h3>
                                  <span className="text-xs text-gray-400">{review.date}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                                  <span className="bg-yellow-100 text-yellow-800 px-1.5 rounded font-bold">
                                      {review.rating}分
                                  </span>
                                  <span>色 {review.dimensions.appearance}</span>
                                  <span>香 {review.dimensions.aroma}</span>
                                  <span>味 {review.dimensions.taste}</span>
                              </div>
                              
                              <p className="text-sm text-gray-700 whitespace-pre-line mb-3 bg-gray-50 p-3 rounded-lg">
                                  {review.comment}
                              </p>

                              {review.images && review.images.length > 0 && (
                                  <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                                      {review.images.map((img, idx) => (
                                          <img key={idx} src={img} alt="review" className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
                                      ))}
                                  </div>
                              )}

                              {/* Append Input Mode */}
                              {appendId === review.id ? (
                                  <div className="mt-3 animate-in fade-in">
                                      <textarea
                                          value={appendText}
                                          onChange={e => setAppendText(e.target.value)}
                                          placeholder="输入追加内容..."
                                          className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 mb-2"
                                          autoFocus
                                      />
                                      <div className="flex justify-end space-x-2">
                                          <button 
                                            onClick={() => setAppendId(null)}
                                            className="px-3 py-1 text-xs text-gray-500"
                                          >
                                              取消
                                          </button>
                                          <button 
                                            onClick={() => handleAppend(review.id)}
                                            className="px-3 py-1 text-xs bg-black text-white rounded-md"
                                          >
                                              提交
                                          </button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="flex justify-end space-x-3 pt-2 border-t border-gray-50">
                                      <button 
                                        onClick={() => {
                                            setAppendId(review.id);
                                            setAppendText('');
                                        }}
                                        className="flex items-center text-xs text-gray-500 hover:text-black transition-colors"
                                      >
                                          <Edit3 size={14} className="mr-1" />
                                          追加评价
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(review.id)}
                                        className="flex items-center text-xs text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                          <Trash2 size={14} className="mr-1" />
                                          删除
                                      </button>
                                  </div>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </div>
      );
  }

  // --- Main Profile View ---
  if (!userProfile) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white p-6 pb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-md ${userProfile.isGuest ? 'bg-gray-200' : 'bg-yellow-200'}`}>
            {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                <div className={`text-2xl font-bold ${userProfile.isGuest ? 'text-gray-500' : 'text-yellow-800'}`}>
                  {userProfile.isGuest ? <UserIcon size={32}/> : userProfile.userName.charAt(0)}
                </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{userProfile.userName}</h2>
            {userProfile.isGuest ? (
                <button 
                    onClick={logout} 
                    className="text-yellow-600 font-bold text-sm mt-1"
                >
                    点击注册/登录
                </button>
            ) : (
                <p className="text-gray-500 text-sm">{userProfile.major} • {userProfile.grade}</p>
            )}
          </div>
        </div>
        
        {/* Stats - Only show for real users */}
        {!userProfile.isGuest && (
            <div className="flex mt-6 bg-gray-50 p-4 rounded-xl">
                <div 
                    className="flex-1 text-center border-r border-gray-200 cursor-pointer active:bg-gray-100 transition-colors rounded-l-lg"
                    onClick={() => setView('reviews')}
                >
                    <div className="font-bold text-lg">{statsCount.reviews}</div>
                    <div className="text-xs text-gray-500 flex justify-center items-center">
                        评价 <ChevronRight size={10} className="ml-0.5" />
                    </div>
                </div>
                <div className="flex-1 text-center">
                    <div className="font-bold text-lg">{statsCount.likes}</div>
                    <div className="text-xs text-gray-500">获赞</div>
                </div>
            </div>
        )}
      </div>

      {/* Taste Profile - Guest sees teaser */}
      <div className="mt-4 mx-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <BarChart3 size={16} className="mr-2" />
              口味 DNA
          </h3>
          <div className="bg-white p-4 rounded-xl shadow-sm">
             {userProfile.isGuest ? (
                <div className="text-center text-gray-400 py-4 text-xs">
                    登录后即可分析您的饮食偏好
                </div>
             ) : (
                <>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {USER_STATS.favoriteCuisines.map(c => (
                            <span key={c} className="px-3 py-1 bg-yellow-50 text-yellow-800 text-xs font-bold rounded-full border border-yellow-100">
                                {c} 爱好者
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {USER_STATS.frequentTags.map(t => (
                            <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {t}
                            </span>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3">
                        基于您的常点菜品和浏览记录。
                    </p>
                </>
             )}
          </div>
      </div>

      {/* Menu */}
      <div className="mt-6 bg-white mx-4 rounded-xl shadow-sm overflow-hidden">
        {menuItems.map((item, idx) => (
            <div 
                key={idx} 
                onClick={item.action}
                className="flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
            >
                <div className="flex items-center space-x-3 text-gray-700">
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
            </div>
        ))}
         <div 
            onClick={logout}
            className="flex items-center justify-between p-4 text-red-500 active:bg-red-50 cursor-pointer"
        >
            <div className="flex items-center space-x-3">
                <LogOut size={20} />
                <span className="font-medium text-sm">{userProfile.isGuest ? '返回登录页' : '退出登录'}</span>
            </div>
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-gray-400">
        v1.6.0 • 基于 Gemini 开发
      </div>
    </div>
  );
};

export default Profile;
