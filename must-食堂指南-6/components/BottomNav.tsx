
import React from 'react';
import { Home, LayoutGrid, User, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-around items-center z-50 h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => navigate('/')}
        className={`flex flex-col items-center space-y-1 ${isActive('/') ? 'text-yellow-500' : 'text-gray-400'}`}
      >
        <Home size={24} fill={isActive('/') ? "currentColor" : "none"} />
        <span className="text-[10px] font-medium">首页</span>
      </button>

      <button 
        onClick={() => navigate('/categories')}
        className={`flex flex-col items-center space-y-1 ${isActive('/categories') ? 'text-yellow-500' : 'text-gray-400'}`}
      >
        <LayoutGrid size={24} fill={isActive('/categories') ? "currentColor" : "none"} />
        <span className="text-[10px] font-medium">分类</span>
      </button>

      <button 
        onClick={() => navigate('/leaderboard')}
        className={`flex flex-col items-center space-y-1 ${isActive('/leaderboard') ? 'text-yellow-500' : 'text-gray-400'}`}
      >
        <Trophy size={24} fill={isActive('/leaderboard') ? "currentColor" : "none"} />
        <span className="text-[10px] font-medium">榜单</span>
      </button>

      <button 
        onClick={() => navigate('/profile')}
        className={`flex flex-col items-center space-y-1 ${isActive('/profile') ? 'text-yellow-500' : 'text-gray-400'}`}
      >
        <User size={24} fill={isActive('/profile') ? "currentColor" : "none"} />
        <span className="text-[10px] font-medium">我的</span>
      </button>
    </div>
  );
};

export default BottomNav;
