
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Flame, MessageSquare, ThumbsUp, Heart } from 'lucide-react';
import { RESTAURANTS } from '../constants';
import { useApp } from '../context/AppContext';
import { Review } from '../types';
import ReviewModal from '../components/ReviewModal';
import { api } from '../services/api';
import CartModal from '../components/CartModal';

const DishDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, showToast, cartCount, isFavoriteDish, toggleFavoriteDish, requireAuth } = useApp();
  
  // Find Dish and Parent Restaurant
  const { dish, restaurant } = useMemo(() => {
    for (const r of RESTAURANTS) {
        const d = r.menu.find(m => m.id === id);
        if (d) return { dish: d, restaurant: r };
    }
    return { dish: null, restaurant: null };
  }, [id]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
      window.scrollTo(0,0);
      if (dish && dish.reviews) {
          // FIX: Use a copy of the reviews array to prevent duplicate rendering
          // because api.submitReview mutates the source array.
          setReviews([...dish.reviews]);
      }
  }, [dish]);

  if (!dish || !restaurant) return <div className="p-8 text-center">未找到菜品</div>;

  // Review Sorting Logic
  const { topReviews, otherReviews, totalReviews } = useMemo(() => {
      // 1. Sort all by likes desc to find candidates for top 3
      const allSortedByLikes = [...reviews].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      
      // 2. Extract Top 3 (must have at least 1 like to be "Premium")
      const top = allSortedByLikes.filter(r => (r.likes || 0) > 0).slice(0, 3);
      const topIds = new Set(top.map(r => r.id));

      // 3. The rest are chronological
      const others = reviews
        .filter(r => !topIds.has(r.id))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { topReviews: top, otherReviews: others, totalReviews: reviews.length };
  }, [reviews]);

  // Review Count Display Logic
  const getReviewCountDisplay = (count: number) => {
      if (count < 100) return count;
      return `${Math.floor(count / 100) * 100}+`;
  };

  const handleLike = async (reviewId: string) => {
      requireAuth(async () => {
        if (likedReviews.has(reviewId)) return;
        
        // Optimistic Update
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));
        setLikedReviews(prev => new Set(prev).add(reviewId));
        
        await api.likeReview(reviewId);
      });
  };

  const handleSubmitReview = async (data: Omit<Review, 'id' | 'date' | 'likes'>) => {
      try {
          const newReview = await api.submitReview(dish.id, data);
          setReviews(prev => [newReview, ...prev]);
          showToast('评价发布成功！');
          setIsReviewModalOpen(false);
      } catch {
          showToast('评价失败', 'error');
      }
  };

  const isFav = isFavoriteDish(dish.id);

  return (
    <div className="bg-white min-h-screen pb-40">
       {/* Hero Image */}
       <div className="relative h-64 w-full">
         <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
         <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 z-20"
         >
             <ArrowLeft size={20} />
         </button>
         <button 
            onClick={() => toggleFavoriteDish(dish.id)}
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 z-20"
         >
             <Heart size={20} className={isFav ? 'fill-red-500 text-red-500' : 'text-white'} />
         </button>
       </div>

       {/* Dish Info */}
       <div className="px-5 py-6 -mt-6 bg-white rounded-t-3xl relative z-10 shadow-sm min-h-screen">
          <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-900 w-3/4">{dish.name}</h1>
              <span className="text-2xl font-bold text-gray-900">{dish.price} MOP</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
               <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                    {restaurant.name}
               </span>
               <div className="flex items-center">
                   <Flame size={14} className="mr-1 text-orange-500" />
                   {dish.calories} kcal
               </div>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {dish.description}
          </p>

          <div className="h-px bg-gray-100 w-full mb-6"></div>

          {/* Reviews Section */}
          <div className="pb-8">
              <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center space-x-2">
                       <h2 className="font-bold text-lg">精选评价</h2>
                       <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                           {getReviewCountDisplay(totalReviews)}
                       </span>
                   </div>
                   <div className="flex items-center space-x-1">
                       <Star size={16} className="text-yellow-400 fill-yellow-400" />
                       <span className="font-bold text-lg">{dish.rating}</span>
                       <span className="text-xs text-gray-400">/ 5.0</span>
                   </div>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                   {/* Top Reviews */}
                   {topReviews.map(review => (
                       <div key={review.id} className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 relative">
                           <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center">
                               <Flame size={10} className="mr-0.5" /> 优质评论
                           </div>
                           <ReviewItem review={review} onLike={() => handleLike(review.id)} isLiked={likedReviews.has(review.id)} />
                       </div>
                   ))}

                   {/* Other Reviews */}
                   {otherReviews.map(review => (
                       <div key={review.id} className="pb-4 border-b border-gray-50 last:border-0">
                            <ReviewItem review={review} onLike={() => handleLike(review.id)} isLiked={likedReviews.has(review.id)} />
                       </div>
                   ))}

                   {reviews.length === 0 && (
                       <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-xl">
                           还没有人评价这道菜，来做第一个吃螃蟹的人吧！🦀
                       </div>
                   )}
              </div>
          </div>
       </div>

       {/* Footer Actions - Positioned ABOVE BottomNav (bottom-16) */}
       <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 flex items-center space-x-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
           <button 
              onClick={() => requireAuth(() => setIsReviewModalOpen(true))}
              className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl flex justify-center items-center hover:bg-gray-50 active:scale-95 transition-transform"
           >
               <MessageSquare size={18} className="mr-2" />
               写评价
           </button>
           <button 
              onClick={() => addToCart(dish, restaurant.id, restaurant.name)}
              className="flex-1 bg-yellow-400 text-black font-bold py-3 rounded-xl shadow-lg hover:bg-yellow-500 active:scale-95 transition-transform flex justify-center items-center"
           >
               加入购物车 (+{dish.price} MOP)
           </button>
       </div>
        
        {/* Cart Trigger - Positioned ABOVE Footer Actions */}
        {cartCount > 0 && (
            <div 
                onClick={() => setIsCartModalOpen(true)}
                className="fixed bottom-40 right-4 bg-black text-white p-3 rounded-full shadow-2xl z-40 flex items-center justify-center border-2 border-white cursor-pointer active:scale-90 transition-transform"
            >
                <div className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full text-[10px] flex items-center justify-center">
                    {cartCount}
                </div>
               <span className="text-xs font-bold">🛒</span>
            </div>
        )}

       <ReviewModal 
           isOpen={isReviewModalOpen}
           onClose={() => setIsReviewModalOpen(false)}
           onSubmit={handleSubmitReview}
           restaurantName={dish.name}
       />
       <CartModal 
           isOpen={isCartModalOpen}
           onClose={() => setIsCartModalOpen(false)}
       />
    </div>
  );
};

const ReviewItem: React.FC<{ review: Review, onLike: () => void, isLiked: boolean }> = ({ review, onLike, isLiked }) => (
    <div className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">
                    {review.userName.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{review.userName}</p>
                    <div className="flex items-center text-[10px] text-gray-400 space-x-2">
                        <span>{review.date}</span>
                        <div className="flex space-x-1">
                             <span className="bg-gray-50 px-1 rounded">色 {review.dimensions.appearance}</span>
                             <span className="bg-gray-50 px-1 rounded">香 {review.dimensions.aroma}</span>
                             <span className="bg-gray-50 px-1 rounded">味 {review.dimensions.taste}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end">
                 <div className="flex items-center text-yellow-500">
                    <Star size={12} className="fill-current mr-0.5" />
                    <span className="font-bold text-sm">{review.rating}</span>
                 </div>
            </div>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed mb-3">
            {review.comment}
        </p>

        {/* Display Images in Dish Detail */}
        {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
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

        <div className="flex justify-end">
            <button 
                onClick={onLike}
                className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-50'}`}
            >
                <ThumbsUp size={14} className={isLiked ? "fill-current" : ""} />
                <span>{review.likes || 0}</span>
                <span>{isLiked ? '已点亮' : '点亮'}</span>
            </button>
        </div>
    </div>
);

export default DishDetail;
