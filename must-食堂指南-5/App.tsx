
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import DishDetail from './pages/DishDetail';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Toast from './components/Toast';
import { useApp } from './context/AppContext';

// Component to handle Auth redirects
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isLoadingSession } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingSession && !userProfile) {
        // Allow access to login/register without redirect loop
        if (location.pathname !== '/login' && location.pathname !== '/register') {
            navigate('/login');
        }
    }
  }, [userProfile, isLoadingSession, location, navigate]);

  if (isLoadingSession) {
      return <div className="flex h-screen items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div></div>;
  }

  // If not logged in and not on auth pages, show nothing (effect handles redirect)
  if (!userProfile && location.pathname !== '/login' && location.pathname !== '/register') {
      return null;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { toast, hideToast, userProfile } = useApp();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={hideToast} 
      />
      <AuthGuard>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/dish/:id" element={<DishDetail />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
      
      {/* Hide Bottom Nav on Auth pages */}
      {!isAuthPage && userProfile && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
