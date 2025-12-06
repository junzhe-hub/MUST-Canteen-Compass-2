
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Share2, PenLine, ShoppingBag, Loader2, ChevronUp, Wallet, Heart } from 'lucide-react';
import { RESTAURANTS } from '../constants';
import DishCard from '../components/DishCard';
import { Dish, Review } from '../types';
import { useApp } from '../context/AppContext';
import ReviewModal from '../components/ReviewModal';
import CartModal from '../components/CartModal';
import { api } from '../services/api';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = RESTAURANTS.find(r => r.id === id);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  
  // Use Global State
  const { addToCart, cart, cartTotal, cartCount, checkout, isOrdering, showToast, isFavoriteRestaurant, toggleFavoriteRestaurant, requireAuth } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (restaurant) {
      // FIX: Use a copy of the reviews array to prevent duplicate rendering
      // because api.submitReview mutates the source array.
      setReviews([...restaurant.reviews]);
    }
  }, [restaurant]);

  // Calculate Average Price
  const averagePrice = useMemo(() => {
    if (!restaurant || restaurant.menu.length === 0) return 0;
    const total = restaurant.menu.reduce((sum, dish) => sum + dish.price, 0);
    return (total / restaurant.menu.length).toFixed(1);
  }, [restaurant]);

  if (!restaurant) {
    return <div className="p-8 text-center">未找到档口</div>;
  }

  const handleAddDish = (dish: Dish) => {
    addToCart(dish, restaurant.id, restaurant.name);
  };

  const handleSubmitReview = async (data: Omit<Review, 'id' | 'date'>) => {
    try {
      const newReview = await api.submitReview(restaurant.id, data);
      setReviews(prev => [newReview, ...prev]);
      showToast('评价发布成功！', 'success');
      setIsReviewModalOpen(false);
      setActiveTab('reviews'); // Switch to reviews tab to see the new review
    } catch (error) {
      showToast('发布评价失败。', 'error');
    }
  };

  const hasCartItems = cart.length > 0;
  const isFav = isFavoriteRestaurant(restaurant.id);

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header Image Area */}
      <div className="relative h-48 w-full">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
          <button 
            onClick={() => navigate(-1)}
            className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex space-x-2">
            <button 
                onClick={() => toggleFavoriteRestaurant(restaurant.id)}
                className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <Heart size={24} className={isFav ? 'fill-red-500 text-red-500' : 'text-white'} />
            </button>
            <button className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-5 py-5 -mt-6 relative bg-white rounded-t-3xl shadow-sm">
        <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 w-3/4">{restaurant.name}</h1>
            <div className="flex flex-col items-end">
                 <div className="flex items-center bg-black text-white px-2 py-1 rounded-lg">
                    <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-bold">{restaurant.rating}</span>
                </div>
                <span className="text-xs text-gray-400 mt-1">{reviews.length} 条评价</span>
            </div>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4 space-x-2">
            <span>{restaurant.location}</span>
            <span>•</span>
            <span>{restaurant.cuisineType}</span>
            <span>•</span>
            <div className="flex items-center text-gray-900 font-medium">
                <Wallet size={14} className="mr-1 text-gray-400" />
                人均 {averagePrice} MOP
            </div>
        </div>

        {/* 3-Dimension Rating Bars */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-xs uppercase text-gray-400 mb-3 tracking-wider">指南评分</h3>
            <div className="space-y-3">
                <div className="flex items-center">
                    <span className="text-xs font-bold w-20">色</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full mx-3">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: `${(restaurant.ratingBreakdown.appearance/5)*100}%`}}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{restaurant.ratingBreakdown.appearance}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs font-bold w-20">香</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full mx-3">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: `${(restaurant.ratingBreakdown.aroma/5)*100}%`}}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{restaurant.ratingBreakdown.aroma}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs font-bold w-20">味</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full mx-3">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: `${(restaurant.ratingBreakdown.taste/5)*100}%`}}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{restaurant.ratingBreakdown.taste}</span>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 mb-4 sticky top-0 bg-white z-10 pt-2">
            <div className="flex space-x-8">
                <button 
                    onClick={() => setActiveTab('menu')}
                    className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'menu' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                    菜单
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'reviews' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                    评价
                </button>
            </div>
        </div>

        {/* Content */}
        {activeTab === 'menu' ? (
             <div className="space-y-1">
                {restaurant.menu.map(dish => (
                    <DishCard key={dish.id} dish={dish} onAdd={handleAddDish} />
                ))}
            </div>
        ) : (
            <div className="space-y-6">
                 {reviews.length === 0 ? (
                     <div className="text-center py-10 text-gray-400 text-sm">
                         暂无评价，快来抢沙发！
                     </div>
                 ) : (
                     reviews.map(review => (
                         <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4">
                             <div className="flex justify-between items-start mb-2">
                                 <div className="flex items-center">
                                     <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">
                                         {review.userName.charAt(0)}
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">{review.userName}</p>
                                         <p className="text-[10px] text-gray-400">{review.date}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                                     <Star size={10} className="text-orange-500 fill-orange-500 mr-1" />
                                     <span className="text-xs font-bold">{review.rating}</span>
                                 </div>
                             </div>
                             <div className="flex space-x-2 mb-2">
                                 <span className="text-[10px] bg-gray-50 px-1.5 rounded text-gray-500">色: {review.dimensions.appearance}</span>
                                 <span className="text-[10px] bg-gray-50 px-1.5 rounded text-gray-500">香: {review.dimensions.aroma}</span>
                                 <span className="text-[10px] bg-gray-50 px-1.5 rounded text-gray-500">味: {review.dimensions.taste}</span>
                             </div>
                             <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                             
                             {/* Display Images */}
                             {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                                    {review.images.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={img} 
                                            alt="review" 
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0" 
                                        />
                                    ))}
                                </div>
                             )}
                         </div>
                     ))
                 )}
            </div>
        )}
      </div>

      {/* Floating Action Bar (Cart or Review) */}
      <div className="fixed bottom-20 left-4 right-4 z-40">
        {hasCartItems ? (
          <div className="bg-black text-white p-2 pl-4 pr-2 rounded-xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-5">
             <div 
                className="flex items-center space-x-3 flex-1 cursor-pointer"
                onClick={() => setIsCartModalOpen(true)}
             >
                <div className="relative">
                    <div className="bg-yellow-400 text-black w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                        {cartCount}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-black">
                        <ChevronUp size={10} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg">{cartTotal.toFixed(2)} MOP</span>
                    <span className="text-[10px] text-gray-400">点击查看明细</span>
                </div>
             </div>
             
             <button 
                onClick={checkout}
                disabled={isOrdering}
                className="bg-white text-black px-6 py-3 rounded-lg font-bold text-sm flex items-center hover:bg-gray-100 disabled:opacity-70 transition-colors ml-4"
             >
                {isOrdering ? (
                    <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        下单中...
                    </>
                ) : (
                    <>
                        去结算
                        <ArrowLeft size={16} className="ml-2 rotate-180" />
                    </>
                )}
             </button>
          </div>
        ) : (
          <button 
            onClick={() => requireAuth(() => setIsReviewModalOpen(true))}
            className="w-full bg-white border border-gray-200 text-black p-4 rounded-xl shadow-lg flex justify-center items-center hover:bg-gray-50 transition-colors"
          >
            <PenLine size={18} className="mr-2" />
            <span className="font-bold">写评价</span>
          </button>
        )}
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        restaurantName={restaurant.name}
      />

      <CartModal 
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </div>
  );
};

export default RestaurantDetail;
