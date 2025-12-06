
import React, { useState, useMemo } from 'react';
import { Plus, Star, Quote, Heart } from 'lucide-react';
import { Dish } from '../types';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface Props {
  dish: Dish;
  onAdd: (dish: Dish) => void;
}

const DishCard: React.FC<Props> = ({ dish, onAdd }) => {
  const navigate = useNavigate();
  const [isPressed, setIsPressed] = useState(false);
  const { isFavoriteDish, toggleFavoriteDish } = useApp();
  const isFav = isFavoriteDish(dish.id);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPressed(true);
    onAdd(dish);
    setTimeout(() => setIsPressed(false), 150);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteDish(dish.id);
  }

  // God Comment Logic
  const godReview = useMemo(() => {
    if (!dish.reviews || dish.reviews.length === 0) return null;
    // Find review with max likes
    const sorted = [...dish.reviews].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const best = sorted[0];
    // Threshold for God Comment: e.g., more than 5 likes
    if (best && (best.likes || 0) > 5) {
        return best;
    }
    return null;
  }, [dish.reviews]);

  return (
    <div 
        onClick={() => navigate(`/dish/${dish.id}`)}
        className="flex bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-3 active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
        {dish.isPopular && (
            <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg z-10">
                人气
            </div>
        )}
        {/* Favorite Icon */}
        <button 
            onClick={handleFavoriteClick}
            className="absolute top-1 right-1 p-1.5 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors z-10"
        >
            <Heart size={12} className={`${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
      </div>
      
      <div className="flex-1 ml-3 flex flex-col justify-between min-h-[6rem]">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-800 line-clamp-1 text-sm">{dish.name}</h4>
          </div>
          
          {/* Rating */}
          <div className="flex items-center mt-1 mb-2">
             <div className="flex items-center space-x-0.5">
                 <Star size={10} className="text-yellow-400 fill-yellow-400" />
                 <span className="text-[10px] font-bold text-gray-700">{dish.rating}</span>
             </div>
             <span className="mx-1.5 text-gray-300 text-[8px]">|</span>
             <span className="text-[10px] text-gray-400">{dish.calories} kcal</span>
          </div>

          {/* Description or God Comment */}
          {godReview ? (
             <div className="bg-orange-50 p-1.5 rounded-md relative mt-1">
                <div className="flex items-start">
                    <Quote size={8} className="text-orange-400 mr-1 flex-shrink-0 mt-0.5 fill-orange-400" />
                    <p className="text-[10px] text-orange-800 font-medium line-clamp-2 leading-tight">
                        {godReview.comment}
                    </p>
                </div>
             </div>
          ) : (
             <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{dish.description}</p>
          )}
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <span className="text-lg font-bold text-gray-900 leading-none">{dish.price.toFixed(1)} MOP</span>
          
          <button 
            onClick={handleAddClick}
            className={`bg-yellow-400 hover:bg-yellow-500 text-black p-1.5 rounded-full shadow-sm transition-all duration-100 transform ${isPressed ? 'scale-75 bg-yellow-600' : 'scale-100'}`}
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
