
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Flame, ThumbsUp, Medal, DollarSign, Star } from 'lucide-react';
import { RESTAURANTS } from '../constants';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMetric = (searchParams.get('metric') as 'rating' | 'popularity' | 'price') || 'rating';
  
  const [activeTab, setActiveTab] = useState<'stalls' | 'dishes'>('stalls');
  const [metric, setMetric] = useState<'rating' | 'popularity' | 'price'>(initialMetric);

  // Helper to calculate average price for a stall
  const getStallAvgPrice = (stall: any) => {
    if (!stall.menu || stall.menu.length === 0) return 0;
    const total = stall.menu.reduce((sum: number, dish: any) => sum + dish.price, 0);
    return total / stall.menu.length;
  };

  // Helper to calculate popularity (reviews with rating > 4.0)
  const getPopularityScore = (reviews: any[]) => {
    if (!reviews) return 0;
    return reviews.filter((r: any) => r.rating > 4.0).length;
  };

  // Helper to get metric value safely for sorting/display
  const getMetricValue = (item: any, type: 'stall' | 'dish') => {
    if (type === 'stall') {
      if (metric === 'rating') return item.rating;
      if (metric === 'price') return getStallAvgPrice(item);
      if (metric === 'popularity') return getPopularityScore(item.reviews);
    } else {
      // For dishes
      if (metric === 'rating') return item.rating;
      if (metric === 'price') return item.price;
      if (metric === 'popularity') return getPopularityScore(item.reviews);
    }
    return 0;
  };

  const getSortedData = (type: 'stall' | 'dish') => {
    let data;
    if (type === 'stall') {
        data = [...RESTAURANTS];
    } else {
        data = RESTAURANTS.flatMap(r => r.menu.map(d => ({ ...d, stallName: r.name, stallId: r.id })));
    }

    return data.sort((a, b) => {
        const valA = getMetricValue(a, type);
        const valB = getMetricValue(b, type);
        
        // Price: Lower is better (Ascending)
        if (metric === 'price') {
            return valA - valB;
        }
        // Others: Higher is better (Descending)
        return valB - valA;
    });
  };

  const renderRankBadge = (index: number) => {
    if (index === 0) return <Medal size={24} className="text-yellow-500" />;
    if (index === 1) return <Medal size={24} className="text-gray-400" />;
    if (index === 2) return <Medal size={24} className="text-orange-700" />;
    return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
  };

  // Logic to determine what string to display for the value
  const getDisplayValue = (item: any, type: 'stall' | 'dish') => {
      // Rule: For popularity, we sort by popularity score, but DISPLAY the rating.
      if (metric === 'popularity') {
          return item.rating.toFixed(1);
      }
      
      const val = getMetricValue(item, type);
      if (metric === 'price') return `${val.toFixed(1)} MOP`;
      return val.toFixed(1);
  };

  // Logic to determine the sub-label (small text below value)
  const getDisplayLabel = () => {
      if (metric === 'popularity') return '评分'; // Show "Rating" label when sorting by popularity
      if (metric === 'price') {
          // Rule: Hide "Average Price" for dishes
          if (activeTab === 'dishes') return '';
          return '平均价格';
      }
      return '评分';
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-black text-white p-6 pb-12 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
             <h1 className="text-2xl font-bold flex items-center">
                <Trophy className="text-yellow-400 mr-2" />
                美食名人堂
            </h1>
            <p className="text-white/70 text-sm mt-1">发现校园传说级美食。</p>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={120} />
        </div>
      </div>

      {/* Controls */}
      <div className="mx-4 -mt-8 relative z-20 bg-white rounded-xl shadow-md p-2">
        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
            <button 
                onClick={() => setActiveTab('stalls')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'stalls' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
            >
                档口
            </button>
            <button 
                onClick={() => setActiveTab('dishes')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'dishes' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
            >
                菜品
            </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center px-1 overflow-x-auto no-scrollbar space-x-2">
            {[
                { id: 'rating', label: '评分', icon: <ThumbsUp size={12} /> },
                { id: 'popularity', label: '人气', icon: <Flame size={12} /> },
                { id: 'price', label: '价格', icon: <DollarSign size={12} /> },
            ].map((m) => (
                <button
                    key={m.id}
                    onClick={() => setMetric(m.id as any)}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border flex-1 justify-center transition-colors ${
                        metric === m.id 
                            ? 'bg-yellow-50 border-yellow-400 text-yellow-700' 
                            : 'bg-white border-gray-200 text-gray-600'
                    }`}
                >
                    {m.icon}
                    <span>{m.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-4 px-4 space-y-3">
        {activeTab === 'stalls' ? (
            getSortedData('stall').map((stall: any, idx: number) => (
                <div 
                    key={stall.id}
                    onClick={() => navigate(`/restaurant/${stall.id}`)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer active:scale-[0.99] transition-transform"
                >
                    <div className="mr-4 flex flex-col items-center justify-center w-8">
                        {renderRankBadge(idx)}
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                        <img src={stall.image} className="w-full h-full object-cover" alt={stall.name}/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{stall.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{stall.cuisineType}</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                        <div className="font-bold text-lg text-yellow-600 flex justify-end items-center">
                            {metric === 'popularity' && <Star size={14} className="mr-1 fill-yellow-600" />}
                            {getDisplayValue(stall, 'stall')}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                            {getDisplayLabel()}
                        </div>
                    </div>
                </div>
            ))
        ) : (
            getSortedData('dish').map((item: any, idx: number) => (
                <div 
                    key={`${item.stallId}-${item.id}`}
                    onClick={() => navigate(`/restaurant/${item.stallId}`)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center cursor-pointer active:scale-[0.99] transition-transform"
                >
                    <div className="mr-4 flex flex-col items-center justify-center w-8">
                        {renderRankBadge(idx)}
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name}/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500 truncate">在 {item.stallName}</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                        <div className="font-bold text-lg text-yellow-600 flex justify-end items-center">
                            {metric === 'popularity' && <Star size={14} className="mr-1 fill-yellow-600" />}
                            {getDisplayValue(item, 'dish')}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                            {getDisplayLabel()}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
      
      {/* Legend / Info */}
      <div className="mt-8 px-8 text-center text-[10px] text-gray-400 pb-4 leading-relaxed">
          {metric === 'popularity' && "人气排名：根据获得4.0分以上好评的数量排序，显示当前评分。"}
          {metric === 'price' && "价格排名：按价格从低到高排序。"}
          {metric === 'rating' && "评分排名：根据综合评价分数排序。"}
          <br/>榜单每周一更新。
      </div>
    </div>
  );
};

export default Leaderboard;
