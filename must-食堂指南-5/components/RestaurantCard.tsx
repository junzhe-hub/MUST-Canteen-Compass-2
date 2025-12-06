
import React, { useMemo } from 'react';
import { Star, MapPin, Wallet, Heart } from 'lucide-react';
import { Restaurant } from '../types';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface Props {
  data: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const { isFavoriteRestaurant, toggleFavoriteRestaurant } = useApp();
  const isFav = isFavoriteRestaurant(data.id);

  const avgPrice = useMemo(() => {
    if (!data.menu || data.menu.length === 0) return 0;
    const total = data.menu.reduce((sum, item) => sum + item.price, 0);
    return (total / data.menu.length).toFixed(1);
  }, [data.menu]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteRestaurant(data.id);
  };

  return (
    <div 
      onClick={() => navigate(`/restaurant/${data.id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4 cursor-pointer active:scale-[0.98] transition-transform duration-100 relative"
    >
      <div className="relative h-40 w-full">
        <img 
          src={data.image} 
          alt={data.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
             <h3 className="text-lg font-bold text-white line-clamp-1">{data.name}</h3>
        </div>
        
        {/* Favorite Button */}
        <button 
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors"
        >
            <Heart 
                size={18} 
                className={`${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
        </button>
      </div>
      <div className="p-4 pt-3">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center text-sm text-gray-600">
                 <MapPin size={14} className="mr-1" />
                 <span className="line-clamp-1">{data.location}</span>
            </div>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                <Star size={14} className="text-orange-500 fill-orange-500 mr-1" />
                <span className="font-bold text-gray-900">{data.rating}</span>
            </div>
        </div>
        
        {/* Mini Rating Bars */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-[10px] text-gray-500">
            <div className="flex flex-col">
                <span>色</span>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div className="bg-orange-400 h-1.5 rounded-full" style={{width: `${(data.ratingBreakdown.appearance/5)*100}%`}}></div>
                </div>
            </div>
            <div className="flex flex-col">
                <span>香</span>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div className="bg-orange-400 h-1.5 rounded-full" style={{width: `${(data.ratingBreakdown.aroma/5)*100}%`}}></div>
                </div>
            </div>
             <div className="flex flex-col">
                <span>味</span>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div className="bg-orange-400 h-1.5 rounded-full" style={{width: `${(data.ratingBreakdown.taste/5)*100}%`}}></div>
                </div>
            </div>
        </div>

        <div className="flex justify-between items-end mt-3">
            <div className="flex flex-wrap gap-1 flex-1 mr-2">
            <span className="text-xs px-2 py-1 bg-black text-white rounded-md">
                {data.cuisineType}
            </span>
            {data.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                {tag}
                </span>
            ))}
            </div>
            <div className="flex items-center text-xs font-bold text-gray-500 whitespace-nowrap">
                <Wallet size={12} className="mr-1" />
                人均 {avgPrice} MOP
            </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
